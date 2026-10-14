#include "VCPlatform.h"
#include <wincodec.h>
#include <shlobj.h>
#include <shlwapi.h>
#include <chrono>
#include <sstream>
#include <iomanip>
static ComPtr<IWICImagingFactory> factory() {ComPtr<IWICImagingFactory> f;check(CoCreateInstance(CLSID_WICImagingFactory,nullptr,CLSCTX_INPROC_SERVER,IID_PPV_ARGS(&f)));return f;}
static Image readDecoder(IWICBitmapDecoder* decoder,unsigned maxSide) {
 auto f=factory();ComPtr<IWICBitmapFrameDecode> frame;check(decoder->GetFrame(0,&frame));
 ComPtr<IWICBitmapSource> src;check(frame.As(&src));
 // Apply EXIF orientation to imported JPEGs without discarding full-resolution pixels.
 ComPtr<IWICMetadataQueryReader> meta;
 if(SUCCEEDED(frame->GetMetadataQueryReader(&meta))) {
  PROPVARIANT v{};
  if(SUCCEEDED(meta->GetMetadataByName(L"/app1/ifd/{ushort=274}",&v))) {
   unsigned n=v.vt==VT_UI2?v.uiVal:1;
   WICBitmapTransformOptions transforms[]={WICBitmapTransformRotate0,WICBitmapTransformRotate0,WICBitmapTransformFlipHorizontal,WICBitmapTransformRotate180,WICBitmapTransformFlipVertical,
    WICBitmapTransformOptions(WICBitmapTransformRotate90|WICBitmapTransformFlipHorizontal),WICBitmapTransformRotate90,
    WICBitmapTransformOptions(WICBitmapTransformRotate270|WICBitmapTransformFlipHorizontal),WICBitmapTransformRotate270};
   if(n>1&&n<=8) {ComPtr<IWICBitmapFlipRotator> rot;check(f->CreateBitmapFlipRotator(&rot));check(rot->Initialize(src.Get(),transforms[n]));check(rot.As(&src));}
  }
  PropVariantClear(&v);
 }
 UINT width,height;check(src->GetSize(&width,&height));
 if(!width||!height||width>16384||height>16384)throw std::runtime_error("Foto acima do limite de 16384 pixels.");
 if(maxSide&&std::max(width,height)>maxSide) {
  double ratio=double(maxSide)/std::max(width,height);width=std::max(1u,unsigned(width*ratio));height=std::max(1u,unsigned(height*ratio));
  ComPtr<IWICBitmapScaler> scale;check(f->CreateBitmapScaler(&scale));check(scale->Initialize(src.Get(),width,height,WICBitmapInterpolationModeFant));check(scale.As(&src));
 }
 ComPtr<IWICFormatConverter> convert;check(f->CreateFormatConverter(&convert));
 check(convert->Initialize(src.Get(),GUID_WICPixelFormat32bppBGRA,WICBitmapDitherTypeNone,nullptr,0,WICBitmapPaletteTypeCustom));
 Image im{width,height,std::vector<uint8_t>(size_t(width)*height*4)};
 check(convert->CopyPixels(nullptr,width*4,UINT(im.bgra.size()),im.bgra.data()));return im;
}
Image decodeFile(std::filesystem::path const& p,unsigned maxSide) {
 auto f=factory();ComPtr<IWICBitmapDecoder> d;check(f->CreateDecoderFromFilename(p.c_str(),nullptr,GENERIC_READ,WICDecodeMetadataCacheOnDemand,&d));return readDecoder(d.Get(),maxSide);
}
Image decodeBytes(std::vector<uint8_t> const& b) {
 ComPtr<IStream> stream;stream.Attach(SHCreateMemStream(b.data(),UINT(b.size())));if(!stream)throw std::bad_alloc();
 auto f=factory();ComPtr<IWICBitmapDecoder> d;check(f->CreateDecoderFromStream(stream.Get(),nullptr,WICDecodeMetadataCacheOnLoad,&d));return readDecoder(d.Get(),0);
}
void savePng(Image const& im,std::filesystem::path const& path) {
 im.validate();auto f=factory();auto temp=path;temp+=L".part";
 try {
  ComPtr<IWICStream> stream;check(f->CreateStream(&stream));check(stream->InitializeFromFilename(temp.c_str(),GENERIC_WRITE));
  ComPtr<IWICBitmapEncoder> enc;check(f->CreateEncoder(GUID_ContainerFormatPng,nullptr,&enc));check(enc->Initialize(stream.Get(),WICBitmapEncoderNoCache));
  ComPtr<IWICBitmapFrameEncode> frame;ComPtr<IPropertyBag2> properties;check(enc->CreateNewFrame(&frame,&properties));check(frame->Initialize(properties.Get()));
  check(frame->SetSize(im.width,im.height));WICPixelFormatGUID format=GUID_WICPixelFormat32bppBGRA;check(frame->SetPixelFormat(&format));
  if(format!=GUID_WICPixelFormat32bppBGRA)throw std::runtime_error("PNG não aceitou BGRA.");
  check(frame->WritePixels(im.height,im.width*4,UINT(im.bgra.size()),const_cast<BYTE*>(im.bgra.data())));check(frame->Commit());check(enc->Commit());
  frame.Reset();enc.Reset();stream.Reset();std::filesystem::rename(temp,path);
 }catch(...) {std::error_code ec;std::filesystem::remove(temp,ec);throw;}
}
static std::filesystem::path known(REFKNOWNFOLDERID id) {PWSTR raw=nullptr;check(SHGetKnownFolderPath(id,KF_FLAG_CREATE,nullptr,&raw));std::filesystem::path p(raw);CoTaskMemFree(raw);return p;}
std::filesystem::path rollPath() {auto p=known(FOLDERID_LocalAppData)/L"VintageCam"/L"FilmRoll";std::filesystem::create_directories(p);return p;}
std::filesystem::path uniquePhotoPath(std::filesystem::path const& dir,std::wstring_view id) {
 SYSTEMTIME t;GetLocalTime(&t);std::wostringstream s;
 s<<L"VC_"<<t.wYear<<std::setfill(L'0')<<std::setw(2)<<t.wMonth<<std::setw(2)<<t.wDay<<L"_"<<std::setw(2)<<t.wHour<<std::setw(2)<<t.wMinute<<std::setw(2)<<t.wSecond<<L"_"<<id;
 for(unsigned n=1;;n++) {auto p=dir/(s.str()+L"_"+std::to_wstring(n)+L".png");if(!std::filesystem::exists(p))return p;}
}
void saveToPictures(std::filesystem::path const& source) {
 auto dir=known(FOLDERID_Pictures)/L"VintageCam";std::filesystem::create_directories(dir);
 auto target=uniquePhotoPath(dir,L"foto");std::filesystem::copy_file(source,target);
}
