#include "VCGpu.h"
#include "VCShader.h"
#include <d3dcompiler.h>
#include <cstring>
#include <string>
struct alignas(16) Parameters {float p[5][4];uint32_t u[4];};
static ComPtr<ID3DBlob> compile(char const* entry,char const* target) {
 ComPtr<ID3DBlob> code,error;
 HRESULT hr=D3DCompile(ShaderSource,strlen(ShaderSource),"FilmShader",nullptr,nullptr,entry,target,D3DCOMPILE_OPTIMIZATION_LEVEL3,0,&code,&error);
 if(FAILED(hr))throw std::runtime_error(error?std::string((char*)error->GetBufferPointer(),error->GetBufferSize()):"Falha ao compilar shader.");
 return code;
}
void Gpu::initialize(HWND window,bool warp) {
 D3D_FEATURE_LEVEL requested[]={D3D_FEATURE_LEVEL_11_0};D3D_FEATURE_LEVEL level;
 UINT flags=D3D11_CREATE_DEVICE_BGRA_SUPPORT;
 HRESULT hr=D3D11CreateDevice(nullptr,warp?D3D_DRIVER_TYPE_WARP:D3D_DRIVER_TYPE_HARDWARE,nullptr,flags,requested,1,D3D11_SDK_VERSION,&device,&level,&context);
 if(FAILED(hr)&&!warp)hr=D3D11CreateDevice(nullptr,D3D_DRIVER_TYPE_WARP,nullptr,flags,requested,1,D3D11_SDK_VERSION,&device,&level,&context);
 check(hr);
 auto v=compile("VS","vs_5_0"),s=compile("PS","ps_5_0");
 check(device->CreateVertexShader(v->GetBufferPointer(),v->GetBufferSize(),nullptr,&vs));
 check(device->CreatePixelShader(s->GetBufferPointer(),s->GetBufferSize(),nullptr,&ps));
 D3D11_BUFFER_DESC bd{};bd.ByteWidth=sizeof(Parameters);bd.Usage=D3D11_USAGE_DEFAULT;bd.BindFlags=D3D11_BIND_CONSTANT_BUFFER;
 check(device->CreateBuffer(&bd,nullptr,&params));
 D3D11_SAMPLER_DESC sd{};sd.Filter=D3D11_FILTER_MIN_MAG_MIP_LINEAR;sd.AddressU=sd.AddressV=sd.AddressW=D3D11_TEXTURE_ADDRESS_CLAMP;sd.MaxLOD=D3D11_FLOAT32_MAX;
 check(device->CreateSamplerState(&sd,&sampler));
 if(window) {
  ComPtr<IDXGIDevice> dx;check(device.As(&dx));ComPtr<IDXGIAdapter> adapter;check(dx->GetAdapter(&adapter));
  ComPtr<IDXGIFactory> factory;check(adapter->GetParent(IID_PPV_ARGS(&factory)));
  DXGI_SWAP_CHAIN_DESC desc{};desc.BufferCount=2;desc.BufferDesc.Width=1;desc.BufferDesc.Height=1;
  desc.BufferDesc.Format=DXGI_FORMAT_B8G8R8A8_UNORM;desc.BufferUsage=DXGI_USAGE_RENDER_TARGET_OUTPUT;
  desc.OutputWindow=window;desc.SampleDesc.Count=1;desc.Windowed=TRUE;desc.SwapEffect=DXGI_SWAP_EFFECT_DISCARD;
  check(factory->CreateSwapChain(device.Get(),&desc,&swap));check(factory->MakeWindowAssociation(window,DXGI_MWA_NO_ALT_ENTER));
  resize(1,1);
 }
}
void Gpu::resize(unsigned w,unsigned h) {
 if(!swap||!w||!h)return;
 context->OMSetRenderTargets(0,nullptr,nullptr);back.Reset();
 check(swap->ResizeBuffers(0,w,h,DXGI_FORMAT_UNKNOWN,0));
 ComPtr<ID3D11Texture2D> tex;check(swap->GetBuffer(0,IID_PPV_ARGS(&tex)));
 check(device->CreateRenderTargetView(tex.Get(),nullptr,&back));ow=w;oh=h;clear();
}
void Gpu::clear() {
 if(!back||!swap)return;float color[4]={.035f,.032f,.028f,1.f};context->ClearRenderTargetView(back.Get(),color);check(swap->Present(0,0));
}
void Gpu::upload(Image const& im) {
 im.validate();
 if(sw!=im.width||sh!=im.height) {
  ID3D11ShaderResourceView* nil=nullptr;context->PSSetShaderResources(0,1,&nil);srv.Reset();source.Reset();
  D3D11_TEXTURE2D_DESC d{};d.Width=im.width;d.Height=im.height;d.MipLevels=d.ArraySize=1;d.Format=DXGI_FORMAT_B8G8R8A8_UNORM;
  d.SampleDesc.Count=1;d.Usage=D3D11_USAGE_DEFAULT;d.BindFlags=D3D11_BIND_SHADER_RESOURCE;
  check(device->CreateTexture2D(&d,nullptr,&source));check(device->CreateShaderResourceView(source.Get(),nullptr,&srv));sw=im.width;sh=im.height;
 }
 context->UpdateSubresource(source.Get(),0,nullptr,im.bgra.data(),im.width*4,0);
}
void Gpu::draw(ID3D11RenderTargetView* target,unsigned w,unsigned h,Film const& f,uint32_t seed,unsigned date,bool mirror) {
 Parameters p{};
 p.p[0][0]=f.temperature;p.p[0][1]=f.saturation;p.p[0][2]=f.grain;p.p[0][3]=f.vignette;
 for(int i=0;i<3;i++)p.p[1][i]=f.bias[i];p.p[1][3]=f.bloom;
 for(int i=0;i<4;i++)p.p[2][i]=f.curve[i];
 p.p[3][0]=f.curve[4];p.p[3][1]=f.chroma;p.p[3][2]=f.scanlines;p.p[3][3]=f.stamp?1.f:0.f;
 p.p[4][0]=float(sw);p.p[4][1]=float(sh);p.p[4][2]=float(w);p.p[4][3]=float(h);
 p.u[0]=seed;p.u[1]=mirror?1:0;p.u[2]=date;
 context->UpdateSubresource(params.Get(),0,nullptr,&p,0,0);
 context->OMSetRenderTargets(1,&target,nullptr);
 D3D11_VIEWPORT view{0,0,float(w),float(h),0,1};context->RSSetViewports(1,&view);
 context->IASetInputLayout(nullptr);context->IASetPrimitiveTopology(D3D11_PRIMITIVE_TOPOLOGY_TRIANGLELIST);
 context->VSSetShader(vs.Get(),nullptr,0);context->PSSetShader(ps.Get(),nullptr,0);
 auto cb=params.Get();auto sa=sampler.Get();auto sr=srv.Get();
 context->PSSetConstantBuffers(0,1,&cb);context->PSSetSamplers(0,1,&sa);context->PSSetShaderResources(0,1,&sr);context->Draw(3,0);
}
void Gpu::preview(Image const& im,Film const& f,uint32_t seed,unsigned date,bool mirror) {
 upload(im);draw(back.Get(),ow,oh,f,seed,date,mirror);check(swap->Present(0,0));
}
Image Gpu::develop(Image const& im,Film const& f,uint32_t seed,unsigned date,bool mirror) {
 upload(im);D3D11_TEXTURE2D_DESC d{};d.Width=im.width;d.Height=im.height;d.MipLevels=d.ArraySize=1;
 d.Format=DXGI_FORMAT_B8G8R8A8_UNORM;d.SampleDesc.Count=1;d.BindFlags=D3D11_BIND_RENDER_TARGET;
 ComPtr<ID3D11Texture2D> out;check(device->CreateTexture2D(&d,nullptr,&out));
 ComPtr<ID3D11RenderTargetView> target;check(device->CreateRenderTargetView(out.Get(),nullptr,&target));
 draw(target.Get(),im.width,im.height,f,seed,date,mirror);
 context->OMSetRenderTargets(0,nullptr,nullptr);
 d.BindFlags=0;d.Usage=D3D11_USAGE_STAGING;d.CPUAccessFlags=D3D11_CPU_ACCESS_READ;
 ComPtr<ID3D11Texture2D> staging;check(device->CreateTexture2D(&d,nullptr,&staging));context->CopyResource(staging.Get(),out.Get());
 D3D11_MAPPED_SUBRESOURCE mapped{};check(context->Map(staging.Get(),0,D3D11_MAP_READ,0,&mapped));
 Image result{im.width,im.height,std::vector<uint8_t>(size_t(im.width)*im.height*4)};
 for(unsigned y=0;y<im.height;y++)memcpy(result.bgra.data()+size_t(y)*im.width*4,(uint8_t*)mapped.pData+size_t(y)*mapped.RowPitch,im.width*4);
 context->Unmap(staging.Get(),0);return result;
}
