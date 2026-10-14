#include "VCFilm.h"
#include <iostream>
#include <set>
#include <cmath>
#include <algorithm>
static void require(bool ok,char const* why){if(!ok)throw std::runtime_error(why);}
int main(){try{
 require(Films.size()==9,"Expected nine films");std::set<std::wstring_view> ids;
 Image fixed{23,19,std::vector<uint8_t>(23*19*4)};
 for(unsigned y=0;y<fixed.height;y++)for(unsigned x=0;x<fixed.width;x++){
  auto i=(size_t(y)*fixed.width+x)*4;fixed.bgra[i]=uint8_t(x*11);fixed.bgra[i+1]=uint8_t(y*13);fixed.bgra[i+2]=uint8_t((x+y)*6);fixed.bgra[i+3]=255;
 }
 require(grainHash(0,0,1979)==373741827u,"Integer grain sequence changed");
 require(referenceDevelop(fixed,Films[0],1979).bgra==fixed.bgra,"Neutral modifies source");
 for(auto const& f:Films){
  require(ids.insert(f.id).second,"Duplicate id");require(std::is_sorted(f.curve.begin(),f.curve.end()),"Tone curve must be monotonic");
  auto once=referenceDevelop(fixed,f,1979);
  for(int i=0;i<20;i++)require(referenceDevelop(fixed,f,1979).bgra==once.bgra,"Reference is not deterministic");
  if(f.grain>0)require(referenceDevelop(fixed,f,1980).bgra!=once.bgra,"Grain ignores seed");
 }
 bool rejected=false;try{Image bad{1,1,{}};bad.validate();}catch(std::runtime_error const&){rejected=true;}
 require(rejected,"Invalid buffers accepted");
 std::cout<<"PASS: 9 data definitions, neutral identity, grain golden vector, fixed-image reference determinism and input validation.\n";
 std::cout<<"NOTE: This portable reference does not implement bloom, chroma, scanlines or timestamp. Run GpuTests on Windows to validate the actual production pipeline.\n";return 0;
 }catch(std::exception const& e){std::cerr<<"FAIL: "<<e.what()<<'\n';return 1;}}
