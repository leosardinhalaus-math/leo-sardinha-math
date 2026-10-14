#include "VCCamera.h"
#include <winrt/Windows.Devices.Enumeration.h>
#include <winrt/Windows.Media.Capture.h>
#include <winrt/Windows.Media.Capture.Frames.h>
#include <winrt/Windows.Media.Devices.h>
#include <winrt/Windows.Media.MediaProperties.h>
#include <winrt/Windows.Graphics.Imaging.h>
#include <winrt/Windows.Storage.Streams.h>
#include <winrt/Windows.Foundation.Collections.h>
#include <cstring>
#include <algorithm>
using namespace winrt;
using namespace winrt::Windows::Devices::Enumeration;
using namespace winrt::Windows::Media::Capture;
using namespace winrt::Windows::Media::Capture::Frames;
using namespace winrt::Windows::Media::MediaProperties;
using namespace winrt::Windows::Graphics::Imaging;
using namespace winrt::Windows::Storage::Streams;
struct __declspec(uuid("5B0D3235-4DBA-4D44-865E-8F1D0E4FD04D")) MemoryAccess : IUnknown {
 virtual HRESULT __stdcall GetBuffer(BYTE** value,UINT32* capacity)=0;
};
static std::shared_ptr<Image> bitmapImage(SoftwareBitmap const& input) {
 auto bmp=input;
 if(bmp.BitmapPixelFormat()!=BitmapPixelFormat::Bgra8)bmp=SoftwareBitmap::Convert(input,BitmapPixelFormat::Bgra8,BitmapAlphaMode::Ignore);
 auto lock=bmp.LockBuffer(BitmapBufferAccessMode::Read);auto plane=lock.GetPlaneDescription(0);
 auto reference=lock.CreateReference();auto bytes=reference.as<MemoryAccess>();BYTE* data=nullptr;UINT32 capacity=0;check(bytes->GetBuffer(&data,&capacity));
 auto im=std::make_shared<Image>();im->width=unsigned(bmp.PixelWidth());im->height=unsigned(bmp.PixelHeight());im->bgra.resize(size_t(im->width)*im->height*4);
 for(unsigned y=0;y<im->height;y++) {
  int64_t offset=int64_t(plane.StartIndex)+int64_t(y)*plane.Stride;
  if(offset<0||uint64_t(offset)+im->width*4>capacity)throw std::runtime_error("Stride de câmera inválido.");
  memcpy(im->bgra.data()+size_t(y)*im->width*4,data+offset,im->width*4);
 }
 return im;
}
Camera::Camera(std::function<void(std::shared_ptr<Image>)> f,std::function<void(std::shared_ptr<Image>)> p,std::function<void(CameraStatus)> s):onFrame(std::move(f)),onPhoto(std::move(p)),onStatus(std::move(s)) {
 commands.push_back({Kind::Switch,0});worker=std::thread([this]{run();});
}
void Camera::requestStop() {{std::lock_guard<std::mutex> lock(mutex);ending=true;commands.clear();}cv.notify_one();}
Camera::~Camera() {requestStop();if(worker.joinable())worker.join();}
void Camera::enqueue(Command c) {{std::lock_guard<std::mutex> lock(mutex);if(ending)return;commands.push_back(c);}cv.notify_one();}
static winrt::Windows::Foundation::IAsyncAction initializeOnUi(MediaCapture capture,MediaCaptureInitializationSettings settings,apartment_context ui) {
 co_await ui;co_await capture.InitializeAsync(settings);
}
void Camera::run() {
 init_apartment(apartment_type::multi_threaded);
 MediaCapture capture{nullptr};MediaFrameReader reader{nullptr};event_token token{},failToken{};bool subscribed=false,started=false,failedSubscribed=false;
 CameraStatus state;
 auto publish=[&]{onStatus(state);};
 auto close=[&]{
  if(capture&&failedSubscribed){capture.Failed(failToken);failedSubscribed=false;}
  if(reader) {if(subscribed){reader.FrameArrived(token);subscribed=false;}if(started){try{reader.StopAsync().get();}catch(...){}started=false;}reader.Close();reader=nullptr;}
  if(capture){capture.Close();capture=nullptr;}state.ready=false;
 };
 try {
  auto devices=DeviceInformation::FindAllAsync(DeviceClass::VideoCapture).get();state.count=devices.Size();
  for(;;) {
   Command c;
   {std::unique_lock<std::mutex> lock(mutex);cv.wait(lock,[&]{return ending||!commands.empty();});if(ending)break;c=commands.front();commands.pop_front();}
   try {
    state.captureError=false;
    if(c.kind==Kind::Switch) {
     close();state.text=L"Abrindo câmera…";publish();
     if(!state.count)throw std::runtime_error("Nenhuma webcam encontrada. Conecte uma câmera e reabra o aplicativo.");
     state.index=c.index%state.count;auto device=devices.GetAt(state.index);
     auto location=device.EnclosureLocation();state.front=location&&location.Panel()==Panel::Front;
     auto access=DeviceAccessInformation::CreateFromId(device.Id()).CurrentStatus();
     if(access==DeviceAccessStatus::DeniedBySystem||access==DeviceAccessStatus::DeniedByUser)throw hresult_access_denied();
     capture=MediaCapture();MediaCaptureInitializationSettings settings;
     settings.VideoDeviceId(device.Id());settings.StreamingCaptureMode(StreamingCaptureMode::Video);
     settings.MemoryPreference(MediaCaptureMemoryPreference::Cpu);settings.SharingMode(MediaCaptureSharingMode::ExclusiveControl);
     initializeOnUi(capture,settings,uiContext).get();
     auto controller=capture.VideoDeviceController();
     // Negotiate largest PHOTO stream independently of preview. No screenshot capture fallback.
     ImageEncodingProperties largest{nullptr};
     std::vector<ImageEncodingProperties> photoFormats;
     for(auto const& prop:controller.GetAvailableMediaStreamProperties(MediaStreamType::Photo)) {
      auto ip=prop.try_as<ImageEncodingProperties>();if(ip&&ip.Width()&&ip.Height())photoFormats.push_back(ip);
     }
     std::sort(photoFormats.begin(),photoFormats.end(),[](auto const& a,auto const& b){return uint64_t(a.Width())*a.Height()>uint64_t(b.Width())*b.Height();});
     MediaFrameSource source{nullptr};
     for(auto const& item:capture.FrameSources()) {
      auto s=item.Value();if(s.Info().SourceKind()!=MediaFrameSourceKind::Color)continue;
      if(s.Info().MediaStreamType()==MediaStreamType::VideoPreview){source=s;break;}
      if(s.Info().MediaStreamType()==MediaStreamType::VideoRecord)source=s;
     }
     if(!source)throw std::runtime_error("O driver não expõe um fluxo de câmera compatível com MediaFrameReader.");
     MediaFrameFormat chosen{nullptr};double score=-1e30;
     for(auto const& fmt:source.SupportedFormats()) {
      auto v=fmt.VideoFormat();if(!v)continue;
      auto rate=fmt.FrameRate();double fps=rate.Denominator()?double(rate.Numerator())/rate.Denominator():0;
      double area=double(v.Width())*v.Height();
      double value=(fps>=30?1e9:0)+(v.Width()<=1280&&v.Height()<=960?1e8:0)-std::abs(area-1280.0*720)+std::min(fps,60.0)*100;
      if(value>score){score=value;chosen=fmt;}
     }
     if(chosen)source.SetFormatAsync(chosen).get();
     for(auto const& photoFormat:photoFormats) {
      try{controller.SetMediaStreamPropertiesAsync(MediaStreamType::Photo,photoFormat).get();largest=photoFormat;break;}
      catch(hresult_error const&){/* Try the next native photo format compatible with preview. */}
     }
     if(!photoFormats.empty()&&!largest)throw std::runtime_error("O driver não aceitou os formatos fotográficos disponíveis.");
     auto current=source.CurrentFormat().VideoFormat();
     double ratio=std::min(1.0,1280.0/std::max(current.Width(),current.Height()));
     BitmapSize size{std::max(1u,unsigned(current.Width()*ratio)),std::max(1u,unsigned(current.Height()*ratio))};
     reader=capture.CreateFrameReaderAsync(source,MediaEncodingSubtypes::Bgra8(),size).get();
     reader.AcquisitionMode(MediaFrameReaderAcquisitionMode::Realtime);
     token=reader.FrameArrived([sink=onFrame](MediaFrameReader const& r,MediaFrameArrivedEventArgs const&) {
      try {auto frame=r.TryAcquireLatestFrame();if(!frame)return;auto video=frame.VideoMediaFrame();
       if(video&&video.SoftwareBitmap())sink(bitmapImage(video.SoftwareBitmap()));frame.Close();
      }catch(...) {/* A late/invalid frame is discarded; the UI watchdog reports missing frames. */}
     });subscribed=true;
     if(reader.StartAsync().get()!=MediaFrameReaderStartStatus::Success)throw std::runtime_error("Não foi possível iniciar o visor. Feche outros aplicativos de câmera.");started=true;
     state.ready=true;state.flashSupported=controller.FlashControl().Supported();
     state.text=std::wstring(device.Name())+L" · "+std::to_wstring(current.Width())+L"×"+std::to_wstring(current.Height());
     if(largest)state.text+=L" · foto "+std::to_wstring(largest.Width())+L"×"+std::to_wstring(largest.Height());
     failToken=capture.Failed([report=onStatus,snapshot=state](MediaCapture const&,MediaCaptureFailedEventArgs const& e) {
      auto failed=snapshot;failed.ready=false;failed.captureError=true;failed.text=L"Câmera desconectada ou indisponível: "+std::wstring(e.Message());report(failed);
     });failedSubscribed=true;publish();
    }else if(c.kind==Kind::Photo) {
     if(!capture||!state.ready)throw std::runtime_error("A câmera ainda não está pronta.");
     auto flash=capture.VideoDeviceController().FlashControl();
     if(flash.Supported()){flash.Auto(false);flash.Enabled(c.flag);}
     auto stream=InMemoryRandomAccessStream();
     capture.CapturePhotoToStreamAsync(ImageEncodingProperties::CreateJpeg(),stream).get();
     if(flash.Supported())flash.Enabled(false);
     auto input=stream.GetInputStreamAt(0);DataReader data(input);
     if(stream.Size()>512ull*1024*1024)throw std::runtime_error("Foto muito grande.");
     data.LoadAsync(uint32_t(stream.Size())).get();std::vector<uint8_t> bytes(size_t(stream.Size()));data.ReadBytes(bytes);
     auto im=std::make_shared<Image>(decodeBytes(bytes));data.Close();stream.Close();onPhoto(im);
    }else if(c.kind==Kind::Pause) {
     if(reader&&started){reader.StopAsync().get();started=false;}
    }else if(c.kind==Kind::Resume) {
     if(reader&&!started){if(reader.StartAsync().get()!=MediaFrameReaderStartStatus::Success)throw std::runtime_error("Não foi possível retomar o visor.");started=true;}
    }
   }catch(hresult_error const& e) {
    if(c.kind==Kind::Switch)close();state.captureError=c.kind==Kind::Photo;
    state.text=e.code()==E_ACCESSDENIED?L"Câmera bloqueada. Abra Configurações e permita o acesso para aplicativos desktop.":L"Erro de câmera: "+std::wstring(e.message());publish();
   }catch(std::exception const& e) {
    if(c.kind==Kind::Switch)close();state.captureError=c.kind==Kind::Photo;
    state.text=L"Câmera: "+std::wstring(to_hstring(e.what()));publish();
   }
  }
 }catch(hresult_error const& e){state.text=L"Não foi possível listar câmeras: "+std::wstring(e.message());publish();}
 catch(std::exception const& e){state.text=L"Câmera: "+std::wstring(to_hstring(e.what()));publish();}
 try{close();}catch(...){}uninit_apartment();finished.store(true);
}
