#include "VCCameraPixels.h"
#include <iostream>
static void require(bool ok,char const* why){if(!ok)throw std::runtime_error(why);}
int main(){try{
 // Two rows, two pixels per row; padding is deliberately not a pixel.
 uint8_t padded[]={1,2,3,0,4,5,6,0,90,90,90,90,7,8,9,0,10,11,12,0,91,91,91,91};
 auto top=copyCameraRows(padded,sizeof(padded),2,2,12,0);
 require(top.bgra==std::vector<uint8_t>({1,2,3,255,4,5,6,255,7,8,9,255,10,11,12,255}),"Padded top-down rows are incorrect");
 auto bottom=copyCameraRows(padded,sizeof(padded),2,2,-12,12);
 require(bottom.bgra==std::vector<uint8_t>({7,8,9,255,10,11,12,255,1,2,3,255,4,5,6,255}),"Negative pitch is incorrect");
 bool rejected=false;try{copyCameraRows(padded,8,2,2,12,0);}catch(std::runtime_error const&){rejected=true;}
 require(rejected,"Short buffer accepted");rejected=false;
 try{copyCameraRows(padded,sizeof(padded),2,2,-12,0);}catch(std::runtime_error const&){rejected=true;}
 require(rejected,"Negative out-of-bounds row accepted");
 require(previewScore({0,1280,720,29.97})>previewScore({1,640,480,15}),"29.97 FPS is ranked below slow video");
 require(previewScore({0,1280,720,30})>previewScore({1,3840,2160,30}),"Preview prefers 4K over bounded 720p");
 require(previewScore({0,1920,1080,30})>previewScore({1,640,480,15}),"Frame rate priority lost");
 std::cout<<"PASS: camera padded rows, negative pitch, buffer bounds, alpha and 29.97 FPS format selection.\n";return 0;
 }catch(std::exception const& e){std::cerr<<"FAIL: "<<e.what()<<'\n';return 1;}}
