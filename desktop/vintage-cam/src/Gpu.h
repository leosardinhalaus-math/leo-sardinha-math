#pragma once
#include "Platform.h"
#include <d3d11.h>
#include <dxgi.h>
class Gpu {
 ComPtr<ID3D11Device> device;ComPtr<ID3D11DeviceContext> context;
 ComPtr<IDXGISwapChain> swap;ComPtr<ID3D11RenderTargetView> back;
 ComPtr<ID3D11VertexShader> vs;ComPtr<ID3D11PixelShader> ps;
 ComPtr<ID3D11Buffer> params;ComPtr<ID3D11SamplerState> sampler;
 ComPtr<ID3D11Texture2D> source;ComPtr<ID3D11ShaderResourceView> srv;
 unsigned sw=0,sh=0,ow=1,oh=1;
 void upload(Image const&);
 void draw(ID3D11RenderTargetView*,unsigned,unsigned,Film const&,uint32_t,unsigned,bool);
 public:
 void initialize(HWND window=nullptr,bool warp=false);
 void resize(unsigned,unsigned);
 void clear();
 void preview(Image const&,Film const&,uint32_t,unsigned,bool);
 Image develop(Image const&,Film const&,uint32_t,unsigned,bool);
};
