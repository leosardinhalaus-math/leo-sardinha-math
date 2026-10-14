#include "VCFilm.h"
#include <algorithm>
#include <cmath>
Image referenceDevelop(Image const& in,Film const& f,uint32_t seed) {
 in.validate(); Image out=in;
 for(unsigned y=0;y<in.height;y++) for(unsigned x=0;x<in.width;x++) {
  auto sample=[&](int xx,int yy,int c){xx=std::clamp(xx,0,int(in.width)-1);yy=std::clamp(yy,0,int(in.height)-1);return in.bgra[(size_t(yy)*in.width+xx)*4+c]/255.f;};
  float rgb[3]={sample(x,y,2),sample(x,y,1),sample(x,y,0)};
  float l=.2126f*rgb[0]+.7152f*rgb[1]+.0722f*rgb[2];
  float u=(x+.5f)/in.width,v=(y+.5f)/in.height;
  float noise=(grainHash(unsigned(u*1600),unsigned(v*1600),seed)&65535u)/65535.f-.5f;
  float vig=1.f-f.vignette*std::clamp(((u-.5f)*(u-.5f)+(v-.5f)*(v-.5f))*2.f,0.f,1.f);
  for(int c=0;c<3;c++) {
   float t=std::clamp(l+(rgb[c]-l)*f.saturation+f.bias[c]+(c==0?f.temperature*.12f:c==2?-f.temperature*.12f:0),0.f,1.f);
   float z=t*4; int k=std::min(int(z),3); t=f.curve[k]+(f.curve[k+1]-f.curve[k])*(z-k);
   out.bgra[(size_t(y)*in.width+x)*4+(2-c)]=uint8_t(std::round(std::clamp(t*vig+noise*f.grain,0.f,1.f)*255));
  }
  out.bgra[(size_t(y)*in.width+x)*4+3]=255;
 }
 return out;
}
