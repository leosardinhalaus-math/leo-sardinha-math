#include "VCGpu.h"
#include "VCCamera.h"
#include "VCShare.h"
#include <windowsx.h>
#include <shobjidl.h>
#include <shellapi.h>
#include <winrt/Windows.Devices.Haptics.h>
#include <algorithm>
#include <map>
#include <cmath>
#include <fstream>
#include <atomic>
#include <sstream>
#include <iomanip>
constexpr UINT JobMessage=WM_APP+1,StatusMessage=WM_APP+2;
constexpr COLORREF Background=RGB(18,19,19),Cream=RGB(239,229,207),Muted=RGB(159,157,149),Amber=RGB(213,159,91);
struct JobResult {
 enum class Kind {Imported,Shot,Saved,Error};Kind kind;
 std::shared_ptr<Image> full,preview;std::wstring text;
};
static std::wstring exceptionText() {
 try {throw;}catch(winrt::hresult_error const& e){return std::wstring(e.message());}
 catch(std::exception const& e){return std::wstring(winrt::to_hstring(e.what()));}
 catch(...){return L"Falha inesperada.";}
}
static winrt::fire_and_forget haptic() {
 try {using namespace winrt::Windows::Devices::Haptics;auto device=co_await VibrationDevice::GetDefaultAsync();
  if(device){auto controller=device.SimpleHapticsController();for(auto f:controller.SupportedFeedback())if(f.Waveform()==KnownSimpleHapticsControllerWaveforms::Click()){controller.SendHapticFeedback(f);break;}}
 }catch(...){/* Hardware haptic is optional on Windows. */}
}
static unsigned today(){SYSTEMTIME t;GetLocalTime(&t);return t.wYear*10000+t.wMonth*100+t.wDay;}
template<class T> static void deliver(HWND window,UINT message,T* value) {if(!PostMessageW(window,message,0,LPARAM(value)))delete value;}
class App {
 HWND window=nullptr,view=nullptr;Gpu gpu;std::unique_ptr<Camera> camera;Share share;
 std::mutex frameMutex;std::shared_ptr<Image> latestFrame,currentFrame,importFull,importPreview;
 std::thread ioWorker;std::atomic<bool> ioDone{true};bool closing=false;
 CameraStatus cameraStatus;
 enum class Page {Camera,Develop,Roll,Photo};Page page=Page::Camera;
 unsigned selected=3,pendingFilm=3,pendingDate=0;
 bool flash=false,mirror=false,pendingMirror=false,busy=false,dirty=true,dragging=false,shutterHeld=false,minimized=false;
 bool rendering=true;
 double carousel=3,dragStartCarousel=3;int dragStartX=0;
 uint64_t lastFrameTick=0,animationUntil=0,lastFpsTick=0;unsigned fpsCounter=0;double fps=0;
 float scale=1;std::wstring notice=L"Tudo fica neste dispositivo.";
 std::vector<std::filesystem::path> photos;std::map<size_t,Image> thumbnails;size_t rollPage=0;int rollSelection=-1;
 std::filesystem::path viewedPhoto;
 RECT logicalRect(int x,int y,int w,int h) const {return {int(x*scale),int(y*scale),int((x+w)*scale),int((y+h)*scale)};}
 bool inside(int x,int y,int l,int t,int w,int h) const {return x>=l&&y>=t&&x<l+w&&y<t+h;}
 void invalidate(){InvalidateRect(window,nullptr,FALSE);}
 void stopIo(){if(ioWorker.joinable())ioWorker.join();}
 void startIo(std::function<void()> f){stopIo();ioDone=false;ioWorker=std::thread([this,f=std::move(f)]{winrt::init_apartment(winrt::apartment_type::multi_threaded);f();winrt::uninit_apartment();ioDone=true;});}
 void setFilm(unsigned n){n=std::min(n,unsigned(Films.size()-1));if(selected!=n){selected=n;dirty=true;haptic();}invalidate();}
 void settings(){ShellExecuteW(window,L"open",L"ms-settings:privacy-webcam",nullptr,nullptr,SW_SHOWNORMAL);}
 void refreshRoll(){
  photos.clear();thumbnails.clear();rollSelection=-1;
  for(auto const& f:std::filesystem::directory_iterator(rollPath()))if(f.is_regular_file()&&f.path().extension()==L".png")photos.push_back(f.path());
  std::sort(photos.begin(),photos.end(),std::greater<std::filesystem::path>());
  size_t pages=(photos.size()+11)/12;rollPage=pages?std::min(rollPage,pages-1):0;invalidate();
 }
 void showRoll(){if(busy)return;camera->pause();page=Page::Roll;ShowWindow(view,SW_HIDE);refreshRoll();}
 void leaveRoll(){
  page=importFull?Page::Develop:Page::Camera;ShowWindow(view,SW_SHOW);dirty=true;
  if(page==Page::Camera){currentFrame.reset();{std::lock_guard<std::mutex> lock(frameMutex);latestFrame.reset();}gpu.clear();camera->resume();}else {currentFrame=importPreview;}
  invalidate();
 }
 void openImport(){
  if(busy||closing||page==Page::Roll||page==Page::Photo)return;ComPtr<IFileOpenDialog> dialog;check(CoCreateInstance(CLSID_FileOpenDialog,nullptr,CLSCTX_INPROC_SERVER,IID_PPV_ARGS(&dialog)));
  COMDLG_FILTERSPEC filters[]={{L"Fotografias",L"*.jpg;*.jpeg;*.png;*.bmp;*.tif;*.tiff;*.heic;*.heif"},{L"Todos os arquivos",L"*.*"}};
  check(dialog->SetFileTypes(2,filters));check(dialog->SetOptions(FOS_FILEMUSTEXIST|FOS_FORCEFILESYSTEM));check(dialog->SetTitle(L"Importar e revelar uma fotografia"));
  HRESULT hr=dialog->Show(window);if(hr==HRESULT_FROM_WIN32(ERROR_CANCELLED))return;check(hr);
  ComPtr<IShellItem> item;check(dialog->GetResult(&item));PWSTR value=nullptr;check(item->GetDisplayName(SIGDN_FILESYSPATH,&value));std::filesystem::path path(value);CoTaskMemFree(value);
  busy=true;notice=L"Abrindo fotografia em resolução original…";camera->pause();invalidate();
  HWND target=window;startIo([target,path]{
   auto result=new JobResult{JobResult::Kind::Imported};
   try {result->full=std::make_shared<Image>(decodeFile(path));result->preview=std::make_shared<Image>(decodeFile(path,1280));}
   catch(...){result->kind=JobResult::Kind::Error;result->text=L"Não foi possível importar: "+exceptionText();}
   deliver(target,JobMessage,result);
  });
 }
 void exportImage(std::shared_ptr<Image> full){
  HWND target=window;unsigned film=pendingFilm,date=pendingDate;bool flip=pendingMirror;
  startIo([target,full,film,date,flip]{
   auto result=new JobResult{JobResult::Kind::Saved};
   try {Gpu exportGpu;exportGpu.initialize();auto rendered=exportGpu.develop(*full,Films[film],1979,date,flip);
    auto dest=uniquePhotoPath(rollPath(),Films[film].id);savePng(rendered,dest);
    result->text=L"Revelada · "+std::to_wstring(full->width)+L"×"+std::to_wstring(full->height)+L" · "+std::wstring(Films[film].name);
   }catch(...){result->kind=JobResult::Kind::Error;result->text=L"Falha ao revelar: "+exceptionText();}
   deliver(target,JobMessage,result);
  });
 }
 void shutter(){
  if(busy||page==Page::Roll||page==Page::Photo)return;
  if(page==Page::Camera&&(!cameraStatus.ready||!currentFrame)){notice=L"Aguarde a câmera ou importe uma foto.";invalidate();return;}
  busy=true;pendingFilm=selected;pendingMirror=page==Page::Camera&&mirror;pendingDate=today();
  notice=L"Revelando em resolução original…";animationUntil=GetTickCount64()+180;haptic();invalidate();
  if(page==Page::Develop)exportImage(importFull);else camera->photo(flash&&cameraStatus.flashSupported);
 }
 void backToCamera(){if(busy)return;importFull.reset();importPreview.reset();currentFrame.reset();{std::lock_guard<std::mutex> lock(frameMutex);latestFrame.reset();}gpu.clear();page=Page::Camera;camera->resume();dirty=true;notice=L"Tudo fica neste dispositivo.";invalidate();}
 void rollAction(int action){
  if(rollSelection<0||size_t(rollSelection)>=photos.size()) {notice=L"Selecione uma fotografia.";invalidate();return;}
  auto path=photos[size_t(rollSelection)];
  if(action==0)share.show(window,path);
  if(action==1){saveToPictures(path);notice=L"Salva em Imagens / VintageCam.";invalidate();}
  if(action==2&&MessageBoxW(window,L"Excluir esta foto do rolo? As cópias em Imagens serão mantidas.",L"Excluir fotografia",MB_YESNO|MB_ICONQUESTION)==IDYES){std::filesystem::remove(path);notice=L"Foto excluída do rolo.";refreshRoll();}
 }
 void text(HDC dc,std::wstring_view value,int x,int y,int w,int h,int size,COLORREF color,UINT flags=DT_LEFT|DT_VCENTER|DT_SINGLELINE,bool bold=false){
  auto font=CreateFontW(-int(size*scale),0,0,0,bold?FW_SEMIBOLD:FW_NORMAL,FALSE,FALSE,FALSE,DEFAULT_CHARSET,OUT_DEFAULT_PRECIS,CLIP_DEFAULT_PRECIS,CLEARTYPE_QUALITY,DEFAULT_PITCH,L"Segoe UI");
  auto old=SelectObject(dc,font);SetTextColor(dc,color);SetBkMode(dc,TRANSPARENT);auto r=logicalRect(x,y,w,h);DrawTextW(dc,value.data(),int(value.size()),&r,flags);SelectObject(dc,old);DeleteObject(font);
 }
 void rounded(HDC dc,int x,int y,int w,int h,COLORREF fill,COLORREF stroke,int radius=12){
  auto brush=CreateSolidBrush(fill);auto pen=CreatePen(PS_SOLID,std::max(1,int(scale)),stroke);auto ob=SelectObject(dc,brush);auto op=SelectObject(dc,pen);
  auto r=logicalRect(x,y,w,h);RoundRect(dc,r.left,r.top,r.right,r.bottom,int(radius*scale),int(radius*scale));SelectObject(dc,ob);SelectObject(dc,op);DeleteObject(brush);DeleteObject(pen);
 }
 void button(HDC dc,std::wstring_view name,int x,int y,int w,bool enabled=true){rounded(dc,x,y,w,38,RGB(31,33,32),RGB(57,58,54));text(dc,name,x,y,w,38,12,enabled?Cream:RGB(90,90,86),DT_CENTER|DT_VCENTER|DT_SINGLELINE);}
 void drawThumb(HDC dc,Image const& im,int x,int y,int w,int h){
  double r=std::min(double(w)/im.width,double(h)/im.height);int iw=int(im.width*r),ih=int(im.height*r);
  BITMAPINFO info{};info.bmiHeader.biSize=sizeof(BITMAPINFOHEADER);info.bmiHeader.biWidth=LONG(im.width);info.bmiHeader.biHeight=-LONG(im.height);info.bmiHeader.biPlanes=1;info.bmiHeader.biBitCount=32;info.bmiHeader.biCompression=BI_RGB;
  auto dest=logicalRect(x+(w-iw)/2,y+(h-ih)/2,iw,ih);SetStretchBltMode(dc,HALFTONE);
  StretchDIBits(dc,dest.left,dest.top,dest.right-dest.left,dest.bottom-dest.top,0,0,im.width,im.height,im.bgra.data(),&info,DIB_RGB_COLORS,SRCCOPY);
 }
 void paint(){
  PAINTSTRUCT ps;auto screen=BeginPaint(window,&ps);RECT client;GetClientRect(window,&client);
  auto dc=CreateCompatibleDC(screen);auto bitmap=CreateCompatibleBitmap(screen,client.right,client.bottom);auto old=SelectObject(dc,bitmap);
  auto background=CreateSolidBrush(Background);FillRect(dc,&client,background);DeleteObject(background);
  text(dc,L"VINTAGE CAM",24,10,300,30,21,Cream,DT_LEFT|DT_VCENTER|DT_SINGLELINE,true);
  text(dc,L"NOVE FILMES. SUAS MEMÓRIAS.",24,41,420,20,10,Muted);
  if(page==Page::Roll) {
   button(dc,L"‹ VOLTAR",24,73,100);text(dc,L"ROLO DE FILME",142,73,250,38,17,Cream,DT_LEFT|DT_VCENTER|DT_SINGLELINE,true);
   if(photos.empty()){text(dc,L"Seu primeiro filme começa aqui.",24,280,432,40,19,Cream,DT_CENTER|DT_SINGLELINE);text(dc,L"Fotografe ou importe uma imagem.",24,325,432,30,13,Muted,DT_CENTER|DT_SINGLELINE);}
   for(size_t cell=0;cell<12;cell++) {
    size_t n=rollPage*12+cell;if(n>=photos.size())break;int x=24+int(cell%3)*146,y=130+int(cell/3)*132;
    rounded(dc,x,y,138,120,RGB(26,27,26),int(n)==rollSelection?Amber:RGB(47,48,44));
    try {auto found=thumbnails.find(n);if(found==thumbnails.end())found=thumbnails.emplace(n,decodeFile(photos[n],240)).first;drawThumb(dc,found->second,x+5,y+5,128,100);}
    catch(...){text(dc,L"Arquivo ilegível",x,y,138,100,10,Muted,DT_CENTER|DT_SINGLELINE);}
    text(dc,std::to_wstring(n+1),x,y+104,138,15,10,Muted,DT_CENTER|DT_SINGLELINE);
   }
   button(dc,L"‹",24,664,52);button(dc,L"›",404,664,52);
   text(dc,std::to_wstring(photos.size())+L" fotos · página "+std::to_wstring(rollPage+1),84,664,312,38,12,Muted,DT_CENTER|DT_SINGLELINE);
   button(dc,L"COMPARTILHAR",24,718,140,rollSelection>=0);button(dc,L"SALVAR EM IMAGENS",170,718,174,rollSelection>=0);button(dc,L"EXCLUIR",350,718,106,rollSelection>=0);
   text(dc,notice,24,775,432,42,12,Amber,DT_LEFT|DT_WORDBREAK);
  }else if(page==Page::Photo) {
   button(dc,L"‹ ROLO",24,73,110);button(dc,L"COMPARTILHAR",300,73,156);
   text(dc,viewedPhoto.filename().wstring(),24,710,432,50,12,Muted,DT_LEFT|DT_WORDBREAK);
  }else {
   if(page==Page::Develop)button(dc,L"‹ CÂMERA",24,73,135,!busy);
   else button(dc,cameraStatus.flashSupported?(flash?L"FLASH LIGADO":L"FLASH DESLIG."):L"FLASH N/D",24,73,135,cameraStatus.flashSupported&&!busy);
   button(dc,L"TROCAR CÂMERA",291,73,165,page==Page::Camera&&cameraStatus.count>1&&!busy);
   auto status=page==Page::Develop?L"IMPORTADA · PRONTA PARA REVELAR":cameraStatus.text;
   text(dc,status,24,536,432,37,11,Muted,DT_LEFT|DT_WORDBREAK);
   if(page==Page::Camera){std::wostringstream s;s<<std::fixed<<std::setprecision(0)<<fps<<L" FPS · "<<(mirror?L"ESPELHADA":L"ORIGINAL");text(dc,s.str(),24,575,210,22,10,Muted);}
   else text(dc,L"Escolha um filme abaixo para visualizar.",24,575,432,22,11,Muted);
   // Carousel cards follow pointer while dragging and ease to the selected center.
   for(unsigned n=0;n<Films.size();n++) {
    int x=int(240+(double(n)-carousel)*128-59);if(x+118<0||x>480)continue;
    bool active=n==selected;auto const& f=Films[n];
    rounded(dc,x,606,118,76,active?RGB(56,50,39):RGB(28,30,29),active?Amber:RGB(53,54,49));
    rounded(dc,x+47,616,24,15,active?Amber:RGB(103,103,90),active?Amber:RGB(103,103,90),4);
    text(dc,f.name,x+4,640,110,25,10,active?Cream:Muted,DT_CENTER|DT_SINGLELINE|DT_VCENTER,true);
   }
   text(dc,Films[selected].description,24,689,432,24,12,Muted,DT_CENTER|DT_SINGLELINE|DT_VCENTER);
   button(dc,L"IMPORTAR",24,739,125,!busy);button(dc,L"ROLO",331,739,125,!busy);
   int shrink=(shutterHeld||GetTickCount64()<animationUntil)?5:0;
   auto r=logicalRect(202+shrink,721+shrink,76-shrink*2,76-shrink*2);
   auto brush=CreateSolidBrush(busy?RGB(100,96,83):Cream);auto pen=CreatePen(PS_SOLID,std::max(1,int(3*scale)),Amber);
   auto ob=SelectObject(dc,brush);auto op=SelectObject(dc,pen);Ellipse(dc,r.left,r.top,r.right,r.bottom);SelectObject(dc,ob);SelectObject(dc,op);DeleteObject(brush);DeleteObject(pen);
   text(dc,busy?L"REVELANDO…":page==Page::Develop?L"REVELAR":L"FOTOGRAFAR",149,798,182,20,10,Muted,DT_CENTER|DT_SINGLELINE);
   text(dc,notice,24,822,370,33,11,Amber,DT_LEFT|DT_WORDBREAK);
   text(dc,L"⚙",420,815,36,36,19,Muted,DT_CENTER|DT_SINGLELINE);
  }
  BitBlt(screen,0,0,client.right,client.bottom,dc,0,0,SRCCOPY);SelectObject(dc,old);DeleteObject(bitmap);DeleteDC(dc);EndPaint(window,&ps);
 }
 void tick(){
  uint64_t now=GetTickCount64();if(minimized||!rendering)return;
  if(!dragging&&std::abs(carousel-selected)>.003){carousel+=(selected-carousel)*.24;invalidate();}
  else if(!dragging&&carousel!=selected){carousel=selected;invalidate();}
  if(animationUntil&&now>=animationUntil){animationUntil=0;invalidate();}
  bool newFrame=false;
  if(page==Page::Camera){std::lock_guard<std::mutex> lock(frameMutex);if(latestFrame){currentFrame=std::move(latestFrame);newFrame=true;lastFrameTick=now;}}
  if((page==Page::Camera||page==Page::Develop||page==Page::Photo)&&currentFrame&&(newFrame||dirty)) {
   try {gpu.preview(*currentFrame,page==Page::Photo?Films[0]:Films[selected],1979,today(),page==Page::Camera&&mirror);dirty=false;if(newFrame)fpsCounter++;}
   catch(...){rendering=false;notice=L"Renderização interrompida: "+exceptionText()+L" Reabra o aplicativo.";invalidate();}
  }
  if(now-lastFpsTick>=1000){fps=double(fpsCounter)*1000/(now-lastFpsTick);fpsCounter=0;lastFpsTick=now;
   if(page==Page::Camera&&cameraStatus.ready&&lastFrameTick&&now-lastFrameTick>5000)notice=L"Sem quadros. Feche outros apps e tente Trocar câmera.";
   invalidate();}
 }
 void down(int x,int y){
  if(closing)return;
  if(page==Page::Camera||page==Page::Develop) {
   if(inside(x,y,0,606,480,76)&&!busy){dragging=true;dragStartX=x;dragStartCarousel=carousel;SetCapture(window);return;}
   if(inside(x,y,196,715,88,88)&&!busy){shutterHeld=true;SetCapture(window);invalidate();}
  }
 }
 void up(int x,int y){
  if(closing)return;
  if(dragging){bool moved=std::abs(x-dragStartX)>8;dragging=false;ReleaseCapture();
   unsigned n=unsigned(std::clamp(std::round(carousel),0.0,double(Films.size()-1)));
   if(!moved)n=unsigned(std::clamp(std::round(carousel+(x-240)/128.0),0.0,double(Films.size()-1)));setFilm(n);return;
  }
  if(shutterHeld){shutterHeld=false;ReleaseCapture();invalidate();if(inside(x,y,196,715,88,88))shutter();return;}
  if(page==Page::Roll) {
   if(inside(x,y,24,73,100,38)){leaveRoll();return;}
   if(inside(x,y,24,664,52,38)){if(rollPage)rollPage--;rollSelection=-1;thumbnails.clear();invalidate();return;}
   if(inside(x,y,404,664,52,38)){if((rollPage+1)*12<photos.size())rollPage++;rollSelection=-1;thumbnails.clear();invalidate();return;}
   for(unsigned cell=0;cell<12;cell++)if(inside(x,y,24+int(cell%3)*146,130+int(cell/3)*132,138,120)){size_t n=rollPage*12+cell;if(n<photos.size())rollSelection=int(n);invalidate();return;}
   if(inside(x,y,24,718,140,38))rollAction(0);
   if(inside(x,y,170,718,174,38))rollAction(1);
   if(inside(x,y,350,718,106,38))rollAction(2);return;
  }
  if(page==Page::Photo){if(inside(x,y,24,73,110,38)){page=Page::Roll;ShowWindow(view,SW_HIDE);invalidate();}if(inside(x,y,300,73,156,38))share.show(window,viewedPhoto);return;}
  if(inside(x,y,420,815,36,36)){settings();return;}if(busy)return;
  if(inside(x,y,24,73,135,38)){if(page==Page::Develop)backToCamera();else if(cameraStatus.flashSupported){flash=!flash;invalidate();}}
  if(inside(x,y,291,73,165,38)&&page==Page::Camera){
   currentFrame.reset();gpu.clear();{std::lock_guard<std::mutex> lock(frameMutex);latestFrame.reset();}lastFrameTick=0;cameraStatus.ready=false;
   if(cameraStatus.count>1){camera->switchDevice((cameraStatus.index+1)%cameraStatus.count);}
   else camera->switchDevice(cameraStatus.index);invalidate();
  }
  if(inside(x,y,24,739,125,38))openImport();
  if(inside(x,y,331,739,125,38))showRoll();
 }
 void processJob(JobResult* pointer){
  std::unique_ptr<JobResult> result(pointer);if(closing)return;stopIo();
  if(result->kind==JobResult::Kind::Imported){importFull=result->full;importPreview=result->preview;currentFrame=importPreview;page=Page::Develop;busy=false;dirty=true;notice=L"O original será preservado. Revele quantas versões quiser.";}
  if(result->kind==JobResult::Kind::Shot){exportImage(result->full);}
  if(result->kind==JobResult::Kind::Saved){busy=false;notice=result->text;}
  if(result->kind==JobResult::Kind::Error){busy=false;notice=result->text;if(page==Page::Camera)camera->resume();MessageBoxW(window,notice.c_str(),L"Vintage Cam",MB_OK|MB_ICONWARNING);}
  invalidate();
 }
 LRESULT message(UINT msg,WPARAM wp,LPARAM lp){
  try {
   switch(msg) {
    case WM_CREATE:{
     view=CreateWindowExW(0,L"STATIC",L"",WS_CHILD|WS_VISIBLE|SS_BLACKRECT,0,0,1,1,window,nullptr,GetModuleHandleW(nullptr),nullptr);
     gpu.initialize(view);RECT r;GetClientRect(window,&r);layout(r.right,r.bottom);
     camera=std::make_unique<Camera>([this](std::shared_ptr<Image> f){std::lock_guard<std::mutex> lock(frameMutex);latestFrame=std::move(f);},
      [this](std::shared_ptr<Image> f){auto job=new JobResult{JobResult::Kind::Shot};job->full=std::move(f);deliver(window,JobMessage,job);},
      [this](CameraStatus s){deliver(window,StatusMessage,new CameraStatus(std::move(s)));});
     lastFpsTick=GetTickCount64();SetTimer(window,1,16,nullptr);return 0;
    }
    case WM_SIZE:minimized=wp==SIZE_MINIMIZED;if(camera){if(minimized)camera->pause();else if(page==Page::Camera)camera->resume();}if(!minimized)layout(LOWORD(lp),HIWORD(lp));return 0;
    case WM_DPICHANGED:{auto r=reinterpret_cast<RECT*>(lp);SetWindowPos(window,nullptr,r->left,r->top,r->right-r->left,r->bottom-r->top,SWP_NOZORDER|SWP_NOACTIVATE);return 0;}
    case WM_ERASEBKGND:return 1;
    case WM_PAINT:paint();return 0;
    case WM_TIMER:if(wp==2){if((!camera||camera->isStopped())&&ioDone.load())DestroyWindow(window);}else if(!closing)tick();return 0;
    case WM_LBUTTONDOWN:down(int(GET_X_LPARAM(lp)/scale),int(GET_Y_LPARAM(lp)/scale));return 0;
    case WM_MOUSEMOVE:if(dragging){int x=int(GET_X_LPARAM(lp)/scale);carousel=std::clamp(dragStartCarousel-(x-dragStartX)/128.0,0.0,double(Films.size()-1));setFilm(unsigned(std::round(carousel)));}return 0;
    case WM_LBUTTONUP:up(int(GET_X_LPARAM(lp)/scale),int(GET_Y_LPARAM(lp)/scale));return 0;
    case WM_CAPTURECHANGED:dragging=false;shutterHeld=false;invalidate();return 0;
    case WM_MOUSEWHEEL:if(!busy){int step=GET_WHEEL_DELTA_WPARAM(wp)>0?-1:1;if(page==Page::Roll){if(step<0&&rollPage)rollPage--;if(step>0&&(rollPage+1)*12<photos.size())rollPage++;rollSelection=-1;thumbnails.clear();invalidate();}
     else if(page!=Page::Photo)setFilm(unsigned(std::clamp(int(selected)+step,0,int(Films.size()-1))));}return 0;
    case WM_LBUTTONDBLCLK:if(page==Page::Roll&&rollSelection>=0&&
     inside(int(GET_X_LPARAM(lp)/scale),int(GET_Y_LPARAM(lp)/scale),24+(rollSelection%12%3)*146,130+(rollSelection%12/3)*132,138,120)){viewedPhoto=photos[size_t(rollSelection)];currentFrame=std::make_shared<Image>(decodeFile(viewedPhoto,1280));page=Page::Photo;dirty=true;ShowWindow(view,SW_SHOW);invalidate();}return 0;
    case WM_KEYDOWN:
     if(closing)return 0;
     if(wp==VK_SPACE)shutter();if(wp==VK_LEFT&&!busy&&(page==Page::Camera||page==Page::Develop))setFilm(selected?selected-1:0);if(wp==VK_RIGHT&&!busy&&(page==Page::Camera||page==Page::Develop))setFilm(std::min(selected+1,unsigned(Films.size()-1)));
     if(wp=='I')openImport();if(wp=='R')showRoll();if(wp==VK_ESCAPE&&!busy){if(page==Page::Roll)leaveRoll();else if(page==Page::Develop)backToCamera();else if(page==Page::Photo){page=Page::Roll;ShowWindow(view,SW_HIDE);invalidate();}}return 0;
    case JobMessage:processJob(reinterpret_cast<JobResult*>(lp));return 0;
    case StatusMessage:{std::unique_ptr<CameraStatus> s(reinterpret_cast<CameraStatus*>(lp));cameraStatus=*s;mirror=s->front;if(s->ready&&!lastFrameTick)lastFrameTick=GetTickCount64();if(s->captureError){busy=false;notice=s->text;}invalidate();return 0;}
    case WM_CLOSE:if(!closing){closing=true;notice=L"Encerrando câmera…";busy=true;KillTimer(window,1);if(camera)camera->requestStop();SetTimer(window,2,50,nullptr);invalidate();}return 0;
    case WM_DESTROY:KillTimer(window,1);KillTimer(window,2);camera.reset();stopIo();
     // Drain heap-owned worker messages after all producers have joined.
     {MSG m;while(PeekMessageW(&m,window,JobMessage,StatusMessage,PM_REMOVE)){if(m.message==JobMessage)delete reinterpret_cast<JobResult*>(m.lParam);else delete reinterpret_cast<CameraStatus*>(m.lParam);}}
     PostQuitMessage(0);return 0;
   }
  }catch(...){notice=exceptionText();busy=false;invalidate();if(msg==WM_CREATE){MessageBoxW(window,notice.c_str(),L"Não foi possível iniciar",MB_OK|MB_ICONERROR);return -1;}MessageBoxW(window,notice.c_str(),L"Vintage Cam",MB_OK|MB_ICONWARNING);}
  return DefWindowProcW(window,msg,wp,lp);
 }
 void layout(unsigned w,unsigned h){if(!w||!h)return;scale=std::min(w/480.f,h/864.f);if(view){auto r=logicalRect(24,126,432,398);MoveWindow(view,r.left,r.top,r.right-r.left,r.bottom-r.top,TRUE);gpu.resize(r.right-r.left,r.bottom-r.top);}dirty=true;invalidate();}
 static LRESULT CALLBACK procedure(HWND hwnd,UINT msg,WPARAM wp,LPARAM lp){
  auto app=reinterpret_cast<App*>(GetWindowLongPtrW(hwnd,GWLP_USERDATA));
  if(msg==WM_NCCREATE){app=reinterpret_cast<App*>(reinterpret_cast<CREATESTRUCTW*>(lp)->lpCreateParams);app->window=hwnd;SetWindowLongPtrW(hwnd,GWLP_USERDATA,LONG_PTR(app));}
  return app?app->message(msg,wp,lp):DefWindowProcW(hwnd,msg,wp,lp);
 }
 public:
 int run(HINSTANCE instance){
  SetProcessDpiAwarenessContext(DPI_AWARENESS_CONTEXT_PER_MONITOR_AWARE_V2);
  WNDCLASSEXW wc{sizeof(wc)};wc.style=CS_DBLCLKS;wc.lpfnWndProc=procedure;wc.hInstance=instance;wc.hCursor=LoadCursorW(nullptr,IDC_ARROW);wc.hIcon=LoadIconW(nullptr,IDI_APPLICATION);wc.lpszClassName=L"VintageCam.Native";RegisterClassExW(&wc);
  RECT work;SystemParametersInfoW(SPI_GETWORKAREA,0,&work,0);UINT dpi=GetDpiForSystem();
  double r=std::min(double(dpi)/96.0,double(work.bottom-work.top-72)/864.0);int width=int(480*r),height=int(864*r);
  DWORD style=WS_OVERLAPPED|WS_CAPTION|WS_SYSMENU|WS_MINIMIZEBOX|WS_CLIPCHILDREN;RECT rect{0,0,width,height};AdjustWindowRectExForDpi(&rect,style,FALSE,0,dpi);
  auto hwnd=CreateWindowExW(0,wc.lpszClassName,L"Vintage Cam — câmera de filme",style,CW_USEDEFAULT,CW_USEDEFAULT,rect.right-rect.left,rect.bottom-rect.top,nullptr,nullptr,instance,this);
  if(!hwnd)return 1;ShowWindow(hwnd,SW_SHOW);UpdateWindow(hwnd);
  MSG msg;while(GetMessageW(&msg,nullptr,0,0)>0){TranslateMessage(&msg);DispatchMessageW(&msg);}return int(msg.wParam);
 }
};
int WINAPI wWinMain(HINSTANCE instance,HINSTANCE,PWSTR,int){
 HANDLE instanceGuard=CreateMutexW(nullptr,FALSE,L"Local\\LeoSardinha.VintageCam");
 if(instanceGuard&&GetLastError()==ERROR_ALREADY_EXISTS){auto existing=FindWindowW(L"VintageCam.Native",nullptr);if(existing){ShowWindow(existing,SW_RESTORE);SetForegroundWindow(existing);}CloseHandle(instanceGuard);return 0;}
 winrt::init_apartment(winrt::apartment_type::single_threaded);
 int result=1;try {App app;result=app.run(instance);}catch(...){auto text=exceptionText();MessageBoxW(nullptr,text.c_str(),L"Vintage Cam",MB_OK|MB_ICONERROR);}
 winrt::uninit_apartment();if(instanceGuard)CloseHandle(instanceGuard);return result;
}
