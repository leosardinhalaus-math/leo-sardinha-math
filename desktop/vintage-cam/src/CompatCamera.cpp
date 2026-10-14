#include "VCCompatCamera.h"
#include "VCCameraPixels.h"
#include <mfapi.h>
#include <mfidl.h>
#include <mfreadwrite.h>
#include <mferror.h>
#include <wrl/implements.h>
#include <mutex>
#include <condition_variable>
#include <chrono>
#include <sstream>
using namespace Microsoft::WRL;
namespace {
constexpr DWORD VideoStream=static_cast<DWORD>(MF_SOURCE_READER_FIRST_VIDEO_STREAM);
constexpr DWORD AllStreams=static_cast<DWORD>(MF_SOURCE_READER_ALL_STREAMS);
struct AsyncState {
 std::mutex mutex;std::condition_variable cv;ComPtr<IMFSample> sample;
 HRESULT status=S_OK;DWORD flags=0;bool delivered=false,flushed=false,active=true;
};
class Sink final:public RuntimeClass<RuntimeClassFlags<ClassicCom>,IMFSourceReaderCallback> {
 std::shared_ptr<AsyncState> state;
 public:
 explicit Sink(std::shared_ptr<AsyncState> s):state(std::move(s)){}
 HRESULT STDMETHODCALLTYPE OnReadSample(HRESULT hr,DWORD,DWORD flags,LONGLONG,IMFSample* sample)override {
  {std::lock_guard<std::mutex> lock(state->mutex);if(!state->active)return S_OK;state->status=hr;state->flags=flags;state->sample=sample;state->delivered=true;}state->cv.notify_all();return S_OK;
 }
 HRESULT STDMETHODCALLTYPE OnFlush(DWORD)override {
  {std::lock_guard<std::mutex> lock(state->mutex);state->sample.Reset();state->delivered=false;state->flushed=true;}state->cv.notify_all();return S_OK;
 }
 HRESULT STDMETHODCALLTYPE OnEvent(DWORD,IMFMediaEvent* e)override {
  HRESULT status=S_OK;if(e)e->GetStatus(&status);
  if(FAILED(status)){std::lock_guard<std::mutex> lock(state->mutex);state->status=status;state->delivered=true;state->cv.notify_all();}return S_OK;
 }
};
std::wstring attribute(IMFAttributes* a,GUID const& key) {
 WCHAR* value=nullptr;UINT32 length=0;check(a->GetAllocatedString(key,&value,&length));std::wstring result(value,length);CoTaskMemFree(value);return result;
}
}
struct CompatCamera::Impl {
 ComPtr<IMFMediaSource> source;ComPtr<IMFSourceReader> reader;ComPtr<Sink> sink;
 std::shared_ptr<AsyncState> state;
 std::vector<CameraMode> modes;unsigned previewIndex=0,w=0,h=0,count=0;LONG stride=0;
 bool startup=false,pending=false,paused=false,photo=false;int settle=0;std::wstring name;
 uint64_t waitingSince=0;
 void flush() {
  if(!reader)return;
  {std::lock_guard<std::mutex> lock(state->mutex);state->flushed=false;}
  check(reader->Flush(VideoStream));
  std::unique_lock<std::mutex> lock(state->mutex);
  if(!state->cv.wait_for(lock,std::chrono::seconds(3),[&]{return state->flushed;}))throw std::runtime_error("O driver não respondeu à troca de resolução.");
  state->sample.Reset();state->delivered=false;state->status=S_OK;pending=false;
 }
 void dimensions() {
  ComPtr<IMFMediaType> type;check(reader->GetCurrentMediaType(VideoStream,&type));
  check(MFGetAttributeSize(type.Get(),MF_MT_FRAME_SIZE,&w,&h));UINT32 raw=0;
  if(SUCCEEDED(type->GetUINT32(MF_MT_DEFAULT_STRIDE,&raw)))stride=static_cast<LONG>(raw);
  else check(MFGetStrideForBitmapInfoHeader(MFVideoFormat_RGB32.Data1,w,&stride));
 }
 void configure(unsigned index,bool first=false) {
  if(!first)flush();
  ComPtr<IMFMediaType> native;check(reader->GetNativeMediaType(VideoStream,index,&native));
  check(reader->SetCurrentMediaType(VideoStream,nullptr,native.Get()));
  ComPtr<IMFMediaType> rgb;check(MFCreateMediaType(&rgb));check(rgb->SetGUID(MF_MT_MAJOR_TYPE,MFMediaType_Video));check(rgb->SetGUID(MF_MT_SUBTYPE,MFVideoFormat_RGB32));
  check(reader->SetCurrentMediaType(VideoStream,nullptr,rgb.Get()));dimensions();waitingSince=GetTickCount64();
 }
 Image pixels(IMFSample* sample) {
  ComPtr<IMFMediaBuffer> buffer;check(sample->ConvertToContiguousBuffer(&buffer));
  ComPtr<IMF2DBuffer2> two;
  if(SUCCEEDED(buffer.As(&two))) {
   BYTE* top=nullptr;BYTE* base=nullptr;DWORD length=0;LONG pitch=0;
   if(SUCCEEDED(two->Lock2DSize(MF2DBuffer_LockFlags_Read,&top,&pitch,&base,&length))) {
    try{auto im=copyCameraRows(base,length,w,h,pitch,int64_t(top-base));two->Unlock2D();return im;}catch(...){two->Unlock2D();throw;}
   }
  }
  BYTE* base=nullptr;DWORD capacity=0,length=0;check(buffer->Lock(&base,&capacity,&length));
  try {
   auto bytes=length?length:capacity;int64_t top=stride<0?int64_t(-int64_t(stride))*(h-1):0;
   auto im=copyCameraRows(base,bytes,w,h,stride,top);buffer->Unlock();return im;
  }catch(...){buffer->Unlock();throw;}
 }
};
CompatCamera::CompatCamera():impl(std::make_unique<Impl>()){}
CompatCamera::~CompatCamera(){close();}
void CompatCamera::close()noexcept {
 auto& p=*impl;
 if(p.state){std::lock_guard<std::mutex> lock(p.state->mutex);p.state->active=false;}
 if(p.reader)p.reader->Flush(AllStreams);
 if(p.source)p.source->Shutdown();
 p.reader.Reset();p.source.Reset();p.sink.Reset();p.state.reset();p.pending=false;p.photo=false;p.paused=false;p.modes.clear();p.count=0;
 if(p.startup){MFShutdown();p.startup=false;}
}
void CompatCamera::open(std::wstring const& deviceId,unsigned index) {
 close();auto& p=*impl;check(MFStartup(MF_VERSION));p.startup=true;
 ComPtr<IMFAttributes> attributes;check(MFCreateAttributes(&attributes,1));check(attributes->SetGUID(MF_DEVSOURCE_ATTRIBUTE_SOURCE_TYPE,MF_DEVSOURCE_ATTRIBUTE_SOURCE_TYPE_VIDCAP_GUID));
 IMFActivate** devices=nullptr;UINT32 count=0;check(MFEnumDeviceSources(attributes.Get(),&devices,&count));
 struct Cleanup {IMFActivate** d;UINT32 n;~Cleanup(){for(UINT32 i=0;i<n;i++)d[i]->Release();CoTaskMemFree(d);}} cleanup{devices,count};
 if(!count)throw std::runtime_error("O Windows não encontrou uma webcam. Conecte a câmera e clique ABRIR CÂMERA.");
 p.count=count;unsigned chosen=std::min(index,count-1);
 for(unsigned i=0;i<count;i++){auto id=attribute(devices[i],MF_DEVSOURCE_ATTRIBUTE_SOURCE_TYPE_VIDCAP_SYMBOLIC_LINK);if(_wcsicmp(id.c_str(),deviceId.c_str())==0){chosen=i;break;}}
 p.name=attribute(devices[chosen],MF_DEVSOURCE_ATTRIBUTE_FRIENDLY_NAME);check(devices[chosen]->ActivateObject(IID_PPV_ARGS(&p.source)));
 p.state=std::make_shared<AsyncState>();p.sink=Make<Sink>(p.state);if(!p.sink)throw std::bad_alloc();
 ComPtr<IMFAttributes> options;check(MFCreateAttributes(&options,3));check(options->SetUnknown(MF_SOURCE_READER_ASYNC_CALLBACK,p.sink.Get()));
 check(options->SetUINT32(MF_SOURCE_READER_ENABLE_VIDEO_PROCESSING,TRUE));
 check(MFCreateSourceReaderFromMediaSource(p.source.Get(),options.Get(),&p.reader));
 check(p.reader->SetStreamSelection(AllStreams,FALSE));check(p.reader->SetStreamSelection(VideoStream,TRUE));
 for(unsigned n=0;;n++) {
  ComPtr<IMFMediaType> type;HRESULT hr=p.reader->GetNativeMediaType(VideoStream,n,&type);
  if(hr==MF_E_NO_MORE_TYPES)break;check(hr);UINT32 w=0,h=0,num=0,den=1;
  if(FAILED(MFGetAttributeSize(type.Get(),MF_MT_FRAME_SIZE,&w,&h))||!w||!h)continue;
  MFGetAttributeRatio(type.Get(),MF_MT_FRAME_RATE,&num,&den);p.modes.push_back({n,w,h,den?double(num)/den:0});
 }
 if(p.modes.empty())throw std::runtime_error("O driver da webcam não anunciou formatos de vídeo.");
 std::sort(p.modes.begin(),p.modes.end(),[](auto const& a,auto const& b){return previewScore(a)>previewScore(b);});
 bool opened=false;HRESULT last=E_FAIL;
 for(auto const& m:p.modes){try{p.configure(m.index,true);p.previewIndex=m.index;opened=true;break;}catch(winrt::hresult_error const& e){last=e.code();}}
 if(!opened)check(last);
}
void CompatCamera::pause(){auto& p=*impl;if(p.reader&&!p.paused){p.flush();p.paused=true;}}
void CompatCamera::resume(){auto& p=*impl;p.paused=false;p.waitingSince=GetTickCount64();}
void CompatCamera::requestPhoto() {
 auto& p=*impl;if(!p.reader)throw std::runtime_error("Abra uma câmera antes de fotografar.");
 std::vector<CameraMode> largest=p.modes;
 std::sort(largest.begin(),largest.end(),[](auto const& a,auto const& b){auto aa=uint64_t(a.width)*a.height,bb=uint64_t(b.width)*b.height;return aa==bb?a.fps>b.fps:aa>bb;});
 bool changed=false;
 for(auto const& m:largest){try{p.configure(m.index);changed=true;break;}catch(winrt::hresult_error const&){}}
 if(!changed){p.configure(p.previewIndex);throw std::runtime_error("O driver não aceitou uma captura na resolução nativa.");}
 p.photo=true;p.settle=2;p.paused=false;
}
std::shared_ptr<Image> CompatCamera::poll(bool& isPhoto) {
 auto& p=*impl;isPhoto=false;if(!p.reader||p.paused)return {};
 if(!p.pending){check(p.reader->ReadSample(VideoStream,0,nullptr,nullptr,nullptr,nullptr));p.pending=true;}
 ComPtr<IMFSample> sample;HRESULT status;DWORD flags;
 {std::unique_lock<std::mutex> lock(p.state->mutex);
  if(!p.state->cv.wait_for(lock,std::chrono::milliseconds(20),[&]{return p.state->delivered;})) {
   if(GetTickCount64()-p.waitingSince>10000)throw std::runtime_error("A webcam foi aberta, mas o driver não enviou imagens. Feche outros apps de câmera e tente novamente.");return {};
  }
  status=p.state->status;flags=p.state->flags;sample=std::move(p.state->sample);p.state->delivered=false;p.pending=false;
 }
 check(status);if(flags&MF_SOURCE_READERF_ENDOFSTREAM)throw std::runtime_error("A câmera foi desconectada.");
 if(flags&MF_SOURCE_READERF_CURRENTMEDIATYPECHANGED)p.dimensions();
 if(!sample)return {};
 p.waitingSince=GetTickCount64();
 if(p.photo&&p.settle-->0)return {};
 auto im=std::make_shared<Image>(p.pixels(sample.Get()));
 if(p.photo){isPhoto=true;p.photo=false;p.configure(p.previewIndex);}return im;
}
std::wstring CompatCamera::description()const {
 auto const& p=*impl;return p.name+L" · "+std::to_wstring(p.w)+L"×"+std::to_wstring(p.h)+L" · modo compatível";
}

unsigned CompatCamera::deviceCount()const{return impl->count;}
