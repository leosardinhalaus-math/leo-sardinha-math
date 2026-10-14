#include "VCCamera.h"
#include "VCCompatCamera.h"
#include "VCCameraPixels.h"
#include "VCAsync.h"
#include <winrt/Windows.Devices.Enumeration.h>
#include <winrt/Windows.Media.Capture.h>
#include <winrt/Windows.Media.Capture.Frames.h>
#include <winrt/Windows.Media.Devices.h>
#include <winrt/Windows.Media.MediaProperties.h>
#include <winrt/Windows.Graphics.Imaging.h>
#include <winrt/Windows.Storage.Streams.h>
#include <fstream>
#include <sstream>
#include <iomanip>
#include <chrono>
using namespace winrt;
using namespace winrt::Windows::Devices::Enumeration;
using namespace winrt::Windows::Media::Capture;
using namespace winrt::Windows::Media::Capture::Frames;
using namespace winrt::Windows::Media::MediaProperties;
using namespace winrt::Windows::Graphics::Imaging;
using namespace winrt::Windows::Storage::Streams;
std::filesystem::path cameraLogPath(){return rollPath().parent_path()/L"camera-log.txt";}
void cameraLog(std::wstring_view text)noexcept {
 try{static std::mutex m;std::lock_guard<std::mutex> lock(m);SYSTEMTIME t;GetLocalTime(&t);
  std::ofstream out(cameraLogPath(),std::ios::app);out<<t.wYear<<'-'<<t.wMonth<<'-'<<t.wDay<<' '<<t.wHour<<':'<<t.wMinute<<':'<<t.wSecond<<" | "<<to_string(text)<<'\n';
 }catch(...){}
}
static std::wstring failureText() {
 try{throw;}catch(hresult_error const& e){std::wostringstream s;s<<L"0x"<<std::hex<<std::uppercase<<std::setw(8)<<std::setfill(L'0')<<uint32_t(e.code())<<L" · "<<e.message().c_str();return s.str();}
 catch(std::exception const& e){return std::wstring(to_hstring(e.what()));}catch(...){return L"Falha desconhecida.";}
}
static std::shared_ptr<Image> bitmapImage(SoftwareBitmap const& input) {
 auto bmp=input;
 if(bmp.BitmapPixelFormat()!=BitmapPixelFormat::Bgra8)bmp=SoftwareBitmap::Convert(input,BitmapPixelFormat::Bgra8,BitmapAlphaMode::Ignore);
 auto im=std::make_shared<Image>();im->width=unsigned(bmp.PixelWidth());im->height=unsigned(bmp.PixelHeight());
 if(!im->width||!im->height||im->width>16384||im->height>16384)throw std::runtime_error("Quadro da câmera com dimensões inválidas.");
 im->bgra.resize(size_t(im->width)*im->height*4);Buffer buffer(uint32_t(im->bgra.size()));bmp.CopyToBuffer(buffer);
 auto data=DataReader::FromBuffer(buffer);data.ReadBytes(im->bgra);data.Close();return im;
}
Camera::Camera(std::function<void(std::shared_ptr<Image>)> f,std::function<void(std::shared_ptr<Image>)> p,std::function<void(CameraStatus)> s):onFrame(std::move(f)),onPhoto(std::move(p)),onStatus(std::move(s)) {
 commands.push_back({Kind::Switch,0});worker=std::thread([this]{run();});
}
void Camera::requestStop() {{std::lock_guard<std::mutex> lock(mutex);ending=true;commands.clear();}cv.notify_one();}
Camera::~Camera() {requestStop();if(worker.joinable())worker.join();}
void Camera::enqueue(Command c) {{std::lock_guard<std::mutex> lock(mutex);if(ending)return;commands.push_back(c);}cv.notify_one();}
static winrt::Windows::Foundation::IAsyncAction initializeOnUi(MediaCapture capture,MediaCaptureInitializationSettings settings,apartment_context ui) {
 auto cancellation=co_await get_cancellation_token();cancellation.enable_propagation();
 co_await ui;if(cancellation())throw hresult_canceled();co_await capture.InitializeAsync(settings);
}
void Camera::run() {
 init_apartment(apartment_type::multi_threaded);cameraLog(L"=== Vintage Cam 1.1: abertura de câmera ===");
 MediaCapture capture{nullptr};MediaFrameReader reader{nullptr};event_token token{},failToken{};
 bool subscribed=false,started=false,failedSubscribed=false;std::unique_ptr<CompatCamera> compatible;
 CameraStatus state;std::wstring deviceId,stage;bool paused=false;
 auto publish=[&]{onStatus(state);};
 auto close=[&]{
  if(capture&&failedSubscribed){capture.Failed(failToken);failedSubscribed=false;}
  if(reader){if(started){try{waitCameraOperation(reader.StopAsync(),L"parar visor",3000);}catch(...){cameraLog(L"Parada do leitor: "+failureText());}started=false;}if(subscribed){reader.FrameArrived(token);subscribed=false;}reader.Close();reader=nullptr;}
  if(capture){capture.Close();capture=nullptr;}compatible.reset();state.ready=false;state.compatible=false;
 };
 auto reportFailure=[&](std::wstring const& detail,bool shot=false){
  cameraLog(stage+L": "+detail);state.ready=false;state.captureError=shot;state.flashSupported=false;
  state.text=L"Câmera indisponível. Clique ABRIR CÂMERA ou VER ERRO.";
  if(detail.find(L"0x80070005")!=std::wstring::npos)state.text=L"Câmera bloqueada. Libere o acesso na engrenagem e tente novamente.";
  publish();
 };
 auto openCompatible=[&]{
  close();stage=L"Media Foundation: abertura";state.text=L"Abrindo câmera em modo compatível…";publish();cameraLog(stage);
  compatible=std::make_unique<CompatCamera>();compatible->open(deviceId,state.index);
  state.ready=true;state.compatible=true;state.flashSupported=false;state.count=state.count?state.count:compatible->deviceCount();state.text=compatible->description();
  if(paused)compatible->pause();cameraLog(state.text);publish();
 };
 try{
  for(;;){
   Command c{Kind::Resume};bool hasCommand=false;
   {std::unique_lock<std::mutex> lock(mutex);
    if(!compatible)cv.wait(lock,[&]{return ending||!commands.empty();});
    if(ending)break;if(!commands.empty()){c=commands.front();commands.pop_front();hasCommand=true;}
   }
   if(!hasCommand){
    try{bool photo=false;auto frame=compatible->poll(photo);if(frame){if(photo)onPhoto(frame);else onFrame(frame);}}
    catch(...){auto detail=failureText();compatible.reset();reportFailure(detail,true);}
    if(paused){std::unique_lock<std::mutex> lock(mutex);cv.wait_for(lock,std::chrono::milliseconds(20),[&]{return ending||!commands.empty();});}continue;
   }
   try{
    state.captureError=false;
    if(c.kind==Kind::Switch||c.kind==Kind::Compatible){
     close();paused=false;state.text=L"Abrindo câmera…";publish();stage=L"Enumerar câmeras";
     auto devices=waitCameraOperation(DeviceInformation::FindAllAsync(DeviceClass::VideoCapture),L"listar câmeras");state.count=devices.Size();state.index=state.count?c.index%state.count:c.index;deviceId.clear();
     cameraLog(L"Dispositivos encontrados: "+std::to_wstring(state.count));
     for(auto const& dev:devices)cameraLog(L"Câmera: "+std::wstring(dev.Name()));
     if(state.count){auto dev=devices.GetAt(state.index);deviceId=dev.Id();auto location=dev.EnclosureLocation();state.front=location&&location.Panel()==Panel::Front;cameraLog(L"Selecionada: "+std::wstring(dev.Name()));}
     if(c.kind==Kind::Compatible||!state.count){openCompatible();continue;}
     try{
      stage=L"MediaCapture: inicialização";capture=MediaCapture();MediaCaptureInitializationSettings settings;
      settings.VideoDeviceId(deviceId);settings.StreamingCaptureMode(StreamingCaptureMode::Video);settings.MemoryPreference(MediaCaptureMemoryPreference::Cpu);settings.SharingMode(MediaCaptureSharingMode::ExclusiveControl);
      // The operating system checks desktop camera permission at initialization. No UWP pre-check.
      try{auto groups=waitCameraOperation(MediaFrameSourceGroup::FindAllAsync(),L"grupos RGB");bool matched=false;
       for(auto const& group:groups){for(auto const& info:group.SourceInfos()){
        auto dev=info.DeviceInformation();if(dev&&info.SourceKind()==MediaFrameSourceKind::Color&&_wcsicmp(dev.Id().c_str(),deviceId.c_str())==0){settings.SourceGroup(group);matched=true;break;}
       }if(matched)break;}
       cameraLog(matched?L"Grupo de câmera RGB selecionado.":L"Grupo RGB não informado pelo driver; usando ID do dispositivo.");
      }catch(...){cameraLog(L"Grupo de câmera opcional: "+failureText());}
      waitCameraOperation(initializeOnUi(capture,settings,uiContext),L"inicialização do dispositivo");auto controller=capture.VideoDeviceController();stage=L"MediaCapture: fluxo RGB";
      MediaFrameSource source{nullptr};
      for(auto const& item:capture.FrameSources()){
       auto s=item.Value();if(s.Info().SourceKind()!=MediaFrameSourceKind::Color)continue;
       if(s.Info().MediaStreamType()==MediaStreamType::VideoPreview){source=s;break;}if(!source)source=s;
      }
      if(!source)throw std::runtime_error("O driver não expõe fluxo RGB para MediaFrameReader.");
      std::vector<MediaFrameFormat> formats;for(auto const& fmt:source.SupportedFormats())if(fmt.VideoFormat())formats.push_back(fmt);
      auto score=[](MediaFrameFormat const& fmt){auto v=fmt.VideoFormat();auto r=fmt.FrameRate();return previewScore({0,v.Width(),v.Height(),r.Denominator()?double(r.Numerator())/r.Denominator():0});};
      std::sort(formats.begin(),formats.end(),[&](auto const& a,auto const& b){return score(a)>score(b);});
      for(auto const& fmt:formats){try{waitCameraOperation(source.SetFormatAsync(fmt),L"formato do visor",5000);break;}catch(...){cameraLog(L"Formato de visor recusado: "+failureText());}}
      auto current=source.CurrentFormat().VideoFormat();if(!current||!current.Width()||!current.Height())throw std::runtime_error("Dimensões do visor não disponíveis.");
      double ratio=std::min(1.0,1280.0/std::max(current.Width(),current.Height()));BitmapSize size{std::max(1u,unsigned(current.Width()*ratio)),std::max(1u,unsigned(current.Height()*ratio))};
      stage=L"MediaCapture: leitor de quadros";
      try{reader=waitCameraOperation(capture.CreateFrameReaderAsync(source,MediaEncodingSubtypes::Bgra8(),size),L"leitor RGB reduzido");}
      catch(...){cameraLog(L"Leitor com redução recusado: "+failureText());
       try{reader=waitCameraOperation(capture.CreateFrameReaderAsync(source,MediaEncodingSubtypes::Bgra8()),L"leitor BGRA");}
       catch(...){cameraLog(L"Conversão BGRA recusada: "+failureText());reader=waitCameraOperation(capture.CreateFrameReaderAsync(source),L"leitor nativo");}
      }
      reader.AcquisitionMode(MediaFrameReaderAcquisitionMode::Realtime);
      auto logged=std::make_shared<std::atomic<bool>>(false),first=std::make_shared<std::atomic<bool>>(false);
      token=reader.FrameArrived([sink=onFrame,logged,first](MediaFrameReader const& r,MediaFrameArrivedEventArgs const&){
       try{auto frame=r.TryAcquireLatestFrame();if(!frame)return;auto video=frame.VideoMediaFrame();
        if(!video||!video.SoftwareBitmap())throw std::runtime_error("O driver não retornou um quadro SoftwareBitmap.");
        auto im=bitmapImage(video.SoftwareBitmap());frame.Close();
        if(!first->exchange(true))cameraLog(L"Primeiro quadro RGB recebido: "+std::to_wstring(im->width)+L"×"+std::to_wstring(im->height));sink(im);
       }catch(...){if(!logged->exchange(true))cameraLog(L"Falha no primeiro quadro MediaCapture: "+failureText());}
      });subscribed=true;stage=L"MediaCapture: iniciar visor";
      if(waitCameraOperation(reader.StartAsync(),L"iniciar visor")!=MediaFrameReaderStartStatus::Success)throw std::runtime_error("O driver recusou iniciar o visor.");started=true;
      state.ready=true;state.compatible=false;state.flashSupported=false;
      try{state.flashSupported=controller.FlashControl().Supported();}catch(...){cameraLog(L"Flash opcional indisponível: "+failureText());}
      state.text=std::wstring(devices.GetAt(state.index).Name())+L" · "+std::to_wstring(current.Width())+L"×"+std::to_wstring(current.Height());
      failToken=capture.Failed([report=onStatus,snapshot=state](MediaCapture const&,MediaCaptureFailedEventArgs const& e){auto failed=snapshot;failed.ready=false;failed.captureError=true;cameraLog(L"Erro assíncrono: "+std::wstring(e.Message()));failed.text=L"Câmera interrompida. Clique ABRIR CÂMERA ou VER ERRO.";report(failed);});failedSubscribed=true;publish();
     }catch(...){cameraLog(stage+L": "+failureText());openCompatible();}
    }else if(c.kind==Kind::Photo){
     stage=L"Captura da fotografia";
     if(compatible){compatible->requestPhoto();continue;}
     if(!capture||!state.ready)throw std::runtime_error("Abra a câmera antes de fotografar.");
     bool restart=started;if(started){waitCameraOperation(reader.StopAsync(),L"parar visor",3000);started=false;}
     try{
      auto controller=capture.VideoDeviceController();
      try{std::vector<ImageEncodingProperties> photos;for(auto const& prop:controller.GetAvailableMediaStreamProperties(MediaStreamType::Photo)){auto ip=prop.try_as<ImageEncodingProperties>();if(ip&&ip.Width()&&ip.Height())photos.push_back(ip);}
       std::sort(photos.begin(),photos.end(),[](auto const& a,auto const& b){return uint64_t(a.Width())*a.Height()>uint64_t(b.Width())*b.Height();});
       for(auto const& f:photos){try{waitCameraOperation(controller.SetMediaStreamPropertiesAsync(MediaStreamType::Photo,f),L"resolução fotográfica",5000);break;}catch(...){cameraLog(L"Resolução fotográfica recusada: "+failureText());}}
      }catch(...){cameraLog(L"Configuração fotográfica opcional: "+failureText());}
      if(state.flashSupported){auto f=controller.FlashControl();f.Auto(false);f.Enabled(c.flag);}
      InMemoryRandomAccessStream stream;waitCameraOperation(capture.CapturePhotoToStreamAsync(ImageEncodingProperties::CreateJpeg(),stream),L"capturar foto",20000);
      if(state.flashSupported)controller.FlashControl().Enabled(false);
      if(stream.Size()>512ull*1024*1024)throw std::runtime_error("Foto muito grande.");
      DataReader data(stream.GetInputStreamAt(0));waitCameraOperation(data.LoadAsync(uint32_t(stream.Size())),L"ler foto");std::vector<uint8_t> bytes(size_t(stream.Size()));data.ReadBytes(bytes);
      auto image=std::make_shared<Image>(decodeBytes(bytes));data.Close();stream.Close();
      if(restart){if(waitCameraOperation(reader.StartAsync(),L"iniciar visor")!=MediaFrameReaderStartStatus::Success)throw std::runtime_error("Não foi possível retomar o visor após fotografar.");started=true;}onPhoto(image);
     }catch(...){if(restart&&!started){try{started=waitCameraOperation(reader.StartAsync(),L"iniciar visor")==MediaFrameReaderStartStatus::Success;}catch(...){}}throw;}
    }else if(c.kind==Kind::Pause){paused=true;if(compatible)compatible->pause();else if(reader&&started){waitCameraOperation(reader.StopAsync(),L"parar visor",3000);started=false;}}
    else if(c.kind==Kind::Resume){paused=false;if(compatible)compatible->resume();else if(reader&&!started){if(waitCameraOperation(reader.StartAsync(),L"iniciar visor")!=MediaFrameReaderStartStatus::Success)throw std::runtime_error("Não foi possível retomar o visor.");started=true;}}
   }catch(...){auto detail=failureText();if(c.kind==Kind::Switch||c.kind==Kind::Compatible){try{close();}catch(...){}}reportFailure(detail,c.kind==Kind::Photo);}
  }
 }catch(...){reportFailure(failureText(),true);}
 try{close();}catch(...){cameraLog(L"Encerramento: "+failureText());}cameraLog(L"Câmera encerrada.");uninit_apartment();finished.store(true);
}
