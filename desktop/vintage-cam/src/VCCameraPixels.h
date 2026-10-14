#pragma once
#include "VCFilm.h"
#include <algorithm>
#include <cstring>
#include <cmath>
struct CameraMode {unsigned index,width,height;double fps;};
inline double previewScore(CameraMode const& m) {
 const double area=double(m.width)*m.height;
 return (m.fps>=29.8?1e9:0)+(m.width<=1280&&m.height<=960?1e8:0)-std::abs(area-1280.0*720)+std::min(m.fps,60.0)*100;
}
inline Image copyCameraRows(uint8_t const* base,size_t capacity,unsigned width,unsigned height,int64_t stride,int64_t topOffset) {
 if(!base||!width||!height||width>16384||height>16384||std::abs(stride)<int64_t(width)*4)throw std::runtime_error("Dimensões ou stride da câmera inválidos.");
 Image im{width,height,std::vector<uint8_t>(size_t(width)*height*4)};
 for(unsigned y=0;y<height;y++) {
  const int64_t offset=topOffset+int64_t(y)*stride;
  if(offset<0||uint64_t(offset)+uint64_t(width)*4>capacity)throw std::runtime_error("Quadro da câmera fora dos limites do buffer.");
  std::memcpy(im.bgra.data()+size_t(y)*width*4,base+offset,size_t(width)*4);
 }
 for(size_t i=3;i<im.bgra.size();i+=4)im.bgra[i]=255;
 return im;
}
