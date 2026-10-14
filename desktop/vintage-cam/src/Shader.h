#pragma once
inline constexpr char ShaderSource[]=R"HLSL(
Texture2D image : register(t0);
SamplerState linearSampler : register(s0);
cbuffer FilmParams : register(b0) {
 float4 p0; // temperature, saturation, grain, vignette
 float4 p1; // RGB bias, bloom
 float4 p2; // curve 0..3
 float4 p3; // curve4, chroma, scanlines, stamp
 float4 p4; // source width,height,output width,height
 uint4 p5; // seed,mirror,date YYYYMMDD,unused
};
struct Vertex {float4 pos:SV_POSITION; float2 uv:TEXCOORD0;};
Vertex VS(uint id:SV_VertexID) {
 Vertex o; o.uv=float2((id<<1)&2,id&2);o.pos=float4(o.uv*float2(2,-2)+float2(-1,1),0,1);return o;
}
uint hash(uint2 q) {
 uint n=q.x*1973u+q.y*9277u+p5.x*26699u;n=(n^(n>>16))*2246822519u;
 n=(n^(n>>13))*3266489917u;return n^(n>>16);
}
float tone(float x) {
 x=saturate(x)*4;uint k=min((uint)x,3);float a[5]={p2.x,p2.y,p2.z,p2.w,p3.x};return lerp(a[k],a[k+1],x-k);
}
bool digitPixel(uint digit,uint x,uint y) {
 // Five columns, seven rows. Each row occupies five bits (fits in two words).
 uint top[10]={0x239ace2e,0x8421184,0x1041062e,0x217043e,0x5f928c2,0x21f421f,0x231f420e,0x1082083f,0x2317462e,0x217c62e};
 uint bottom[10]={14,14,31,30,2,30,14,8,14,14};
 uint row=y==6?bottom[digit]:((top[digit]>>(y*5))&31);
 return ((row>>(4-x))&1)!=0;
}
float4 PS(Vertex input):SV_TARGET {
 float2 uv=input.uv;
 float a=p4.x/p4.y,b=p4.z/p4.w;
 if(b<a) uv.y=(uv.y-.5)*(a/b)+.5; else uv.x=(uv.x-.5)*(b/a)+.5;
 if(any(uv<0)||any(uv>1))return float4(.035,.032,.028,1);
 float2 original=uv;
 if(p5.y!=0)uv.x=1-uv.x;
 float shift=p3.y;
 float3 c=image.Sample(linearSampler,uv).rgb;
 c.r=image.Sample(linearSampler,uv+float2(shift,0)).r;
 c.b=image.Sample(linearSampler,uv-float2(shift,0)).b;
 if(p1.w>0) {
  float3 glow=0;
  [unroll] for(int j=-1;j<=1;j++) [unroll] for(int i=-1;i<=1;i++)
   glow+=max(image.Sample(linearSampler,uv+float2(i,j)*.006).rgb-.68,0);
  c+=glow*(p1.w/9);
 }
 float l=dot(c,float3(.2126,.7152,.0722));
 c=lerp(l.xxx,c,p0.y)+p1.rgb+float3(p0.x*.12,0,-p0.x*.12);
 c=float3(tone(c.r),tone(c.g),tone(c.b));
 c*=1-p0.w*saturate(dot(original-.5,original-.5)*2);
 float noise=(hash((uint2)(original*1600))&65535u)/65535.0-.5;
 c+=noise*p0.z;
 c*=1-p3.z*(.5+.5*cos(original.y*900*3.14159265));
 if(p3.w>0) {
  // DD MM YY; normalized to native photo so timestamp appears in preview AND export.
  float2 q=(original-float2(.60,.918))/float2(.006,.009);
  if(q.x>=0 && q.x<47 && q.y>=0 && q.y<7) {
   uint cell=(uint)q.x/6,xx=(uint)q.x%6,yy=(uint)q.y;
   uint dd=p5.z%100,mm=(p5.z/100)%100,yr=(p5.z/10000)%100;
   uint digits[8]={dd/10,dd%10,10,mm/10,mm%10,10,yr/10,yr%10};
   if(xx<5 && cell<8 && digits[cell]<10 && digitPixel(digits[cell],xx,yy))c=float3(.83,.31,.075);
  }
 }
 return float4(saturate(c),1);
}
)HLSL";
