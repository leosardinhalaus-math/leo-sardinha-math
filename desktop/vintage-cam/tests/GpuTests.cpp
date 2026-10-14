#include "VCGpu.h"
#include <iostream>
#include <algorithm>
#include <cmath>
static void require(bool ok,char const* why){if(!ok)throw std::runtime_error(why);}
static void exercise(bool warp){
 Gpu gpu;gpu.initialize(nullptr,warp);
 Image fixed{137,91,std::vector<uint8_t>(137*91*4)};
 for(unsigned y=0;y<fixed.height;y++)for(unsigned x=0;x<fixed.width;x++){
  size_t i=(size_t(y)*fixed.width+x)*4;
  fixed.bgra[i]=uint8_t(x*255/(fixed.width-1));fixed.bgra[i+1]=uint8_t(y*255/(fixed.height-1));fixed.bgra[i+2]=uint8_t((x*7+y*13)%256);fixed.bgra[i+3]=255;
 }
 auto neutral=gpu.develop(fixed,Films[0],1979,20261014,false);
 for(size_t i=0;i<fixed.bgra.size();i++)require(std::abs(int(neutral.bgra[i])-fixed.bgra[i])<=1,"Neutral not identity within 1 LSB");
 for(auto const& film:Films){
  auto first=gpu.develop(fixed,film,1979,20261014,false);
  require(first.width==fixed.width&&first.height==fixed.height,"Full resolution lost");
  for(int n=0;n<8;n++)require(gpu.develop(fixed,film,1979,20261014,false).bgra==first.bgra,"Production shader is not deterministic");
  if(film.id!=L"neutral")require(first.bgra!=neutral.bgra,"Film has no effect");
  if(film.grain>0)require(gpu.develop(fixed,film,1980,20261014,false).bgra!=first.bgra,"Production grain ignores seed");
 }
 // Larger image ensures every date digit is sampled.
 Image stamp{800,600,std::vector<uint8_t>(800*600*4,128)};for(size_t i=3;i<stamp.bgra.size();i+=4)stamp.bgra[i]=255;
 auto a=gpu.develop(stamp,Films[8],1979,20261014,false),b=gpu.develop(stamp,Films[8],1979,20261015,false);
 require(a.bgra!=b.bgra,"VHS ignores supplied date");
 auto mirrored=gpu.develop(fixed,Films[0],1979,20261014,true);
 for(unsigned y=0;y<fixed.height;y++)for(unsigned x=0;x<fixed.width;x++)for(int c=0;c<4;c++)
  require(std::abs(int(mirrored.bgra[(size_t(y)*fixed.width+x)*4+c])-fixed.bgra[(size_t(y)*fixed.width+fixed.width-1-x)*4+c])<=1,"Mirror output differs from preview convention");
 // Resize textures in the same context; this also detects resource hazards.
 Image tall{31,79,std::vector<uint8_t>(31*79*4,255)};
 require(gpu.develop(tall,Films[3],1979,20261014,false).bgra.size()==tall.bgra.size(),"Portrait resize failed");
 auto path=std::filesystem::temp_directory_path()/(L"VintageCam_test_"+std::to_wstring(GetCurrentProcessId())+L".png");
 try{savePng(a,path);require(decodeFile(path).bgra==a.bgra,"PNG roundtrip modifies pixels");std::filesystem::remove(path);}catch(...){std::error_code ec;std::filesystem::remove(path,ec);throw;}
 std::cout<<"PASS: "<<(warp?"WARP":"hardware/fallback")<<" production shader: nine fixed-image stocks, repeatability, neutral identity, grain, date, mirror, resolution, portrait and PNG roundtrip.\n";
}
int main(){winrt::init_apartment(winrt::apartment_type::multi_threaded);int result=0;
 try{exercise(true);exercise(false);}
 catch(winrt::hresult_error const& e){std::wcerr<<L"FAIL: "<<e.message().c_str()<<L'\n';result=1;}
 catch(std::exception const& e){std::cerr<<"FAIL: "<<e.what()<<'\n';result=1;}
 winrt::uninit_apartment();return result;
}
