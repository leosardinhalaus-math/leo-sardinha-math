#pragma once
#include "VCPlatform.h"
#include <gdiplus.h>
#include <initializer_list>
#include <cmath>

// Native vectors: independent of fonts, anti-aliased at the current window DPI.
enum class Icon {None,Camera,Back,Next,Flash,FlashOff,Flip,Import,Roll,Share,Save,Delete,Settings,Retry,Error,Slr,Compact,Instant,Film,TwinLens,Digital,Stereo,Expired,Vhs};
namespace icons {
inline Gdiplus::Color color(COLORREF c,BYTE alpha=255){return {alpha,GetRValue(c),GetGValue(c),GetBValue(c)};}
inline void draw(HDC dc,Icon icon,float x,float y,float size,COLORREF ink,COLORREF accent){
 using namespace Gdiplus;
 if(icon==Icon::None)return;
 Graphics g(dc);g.SetSmoothingMode(SmoothingModeAntiAlias);g.SetPixelOffsetMode(PixelOffsetModeHighQuality);
 g.TranslateTransform(x,y);g.ScaleTransform(size/24.f,size/24.f);
 Pen p(color(ink),1.65f),a(color(accent),1.65f);p.SetStartCap(LineCapRound);p.SetEndCap(LineCapRound);p.SetLineJoin(LineJoinRound);a.SetStartCap(LineCapRound);a.SetEndCap(LineCapRound);a.SetLineJoin(LineJoinRound);
 SolidBrush tint(color(accent,40)),solid(color(accent));
 auto line=[&](float x1,float y1,float x2,float y2,Pen* pen=nullptr){g.DrawLine(pen?pen:&p,x1,y1,x2,y2);};
 auto path=[&](std::initializer_list<PointF> pts,Pen* pen=nullptr){if(pts.size()>1)g.DrawLines(pen?pen:&p,pts.begin(),INT(pts.size()));};
 auto circle=[&](float cx,float cy,float radius,Pen* pen=nullptr){g.DrawEllipse(pen?pen:&p,cx-radius,cy-radius,radius*2,radius*2);};
 auto box=[&](float bx,float by,float w,float h,float r=2.f,bool fill=false){GraphicsPath b;b.AddArc(bx,by,r*2,r*2,180.f,90.f);b.AddArc(bx+w-r*2,by,r*2,r*2,270.f,90.f);b.AddArc(bx+w-r*2,by+h-r*2,r*2,r*2,0.f,90.f);b.AddArc(bx,by+h-r*2,r*2,r*2,90.f,90.f);b.CloseFigure();if(fill)g.FillPath(&tint,&b);g.DrawPath(&p,&b);};
 auto body=[&](){box(2,7,20,14,2,true);circle(12,14,4,&a);circle(12,14,2);line(4.5f,10,6,10);};
 switch(icon){
 case Icon::Back:path({{14.5f,5},{7.5f,12},{14.5f,19}});break;
 case Icon::Next:path({{9.5f,5},{16.5f,12},{9.5f,19}});break;
 case Icon::Flash:case Icon::FlashOff:
  path({{13.5f,2},{5,13},{11,13},{10.5f,22},{19,10},{13,10},{13.5f,2}},&a);
  if(icon==Icon::FlashOff){Pen cut(Color(255,31,33,32),4);line(3,3,21,21,&cut);line(3,3,21,21);}break;
 case Icon::Camera:case Icon::Slr:body();path({{7,7},{8.5f,3.5f},{15.5f,3.5f},{17,7}});break;
 case Icon::Compact:body();box(4,4,6,3,1);box(17,9,2,2,.5f);break;
 case Icon::Instant:box(5,2,14,15,2,true);circle(12,8,3,&a);line(8,13,16,13);path({{6,17},{4,22},{20,22},{18,17}});line(7,19,17,19,&a);break;
 case Icon::Film:case Icon::Expired:box(6,4,12,17,2,true);box(8,1,8,3,1);line(6,8,18,8,&a);line(6,17,18,17,&a);line(9,11,15,11);line(9,14,13,14);if(icon==Icon::Expired){path({{17,2},{21,6},{18,10}},&a);}break;
 case Icon::TwinLens:box(6,3,12,19,2,true);circle(12,8,3,&a);circle(12,16,3.5f);line(8,1,16,1);break;
 case Icon::Digital:box(2,6,20,14,2,true);box(4,9,7,8,1);circle(16,13,3,&a);line(16,18,19,18);box(5,3,6,3,1);break;
 case Icon::Stereo:box(1,6,22,14,2,true);circle(7,13,3.7f,&a);circle(17,13,3.7f);line(10,3,14,3,&a);line(12,2,12,4,&a);break;
 case Icon::Vhs:box(3,6,14,13,2,true);path({{17,10},{22,7},{22,19},{17,16}});box(6,2,8,4,1);line(6,10,10,10,&a);circle(13,15,1.5f,&a);break;
 case Icon::Flip:box(7,8,10,8,2);circle(12,12,2,&a);g.DrawArc(&p,2.f,2.f,20.f,20.f,200.f,100.f);g.DrawArc(&p,2.f,2.f,20.f,20.f,20.f,100.f);path({{15,1},{18,3.5f},{14,5}});path({{9,23},{6,20.5f},{10,19}});break;
 case Icon::Import:box(2,3,20,18,2);circle(7,8,1.4f);path({{4,18},{9,12},{13,16}},&a);line(17,10,17,18,&a);path({{14,13},{17,10},{20,13}},&a);break;
 case Icon::Roll:box(4,2,16,20,2,true);line(8,3,8,21);line(16,3,16,21);for(float by:{6.f,12.f,18.f}){line(5.5f,by,6,by);line(18,by,18.5f,by);}line(9,9,15,9,&a);line(9,15,15,15,&a);break;
 case Icon::Share:circle(5,12,2.5f);circle(18,5,2.5f,&a);circle(18,19,2.5f,&a);line(7.3f,10.7f,15.7f,6.3f);line(7.3f,13.3f,15.7f,17.7f);break;
 case Icon::Save:path({{5,14},{5,21},{19,21},{19,14}});line(12,2,12,15,&a);path({{7.5f,10.5f},{12,15},{16.5f,10.5f}},&a);break;
 case Icon::Delete:path({{6,7},{7,21},{17,21},{18,7}});line(3,6,21,6);path({{9,6},{9,3},{15,3},{15,6}});line(10,10,10,17);line(14,10,14,17);break;
 case Icon::Settings:{GraphicsPath gear;for(int i=0;i<32;i++){float angle=float(i)*3.14159265f/16.f;float radius=(i%4==1||i%4==2)?10.f:8.f;PointF point(12+std::cos(angle)*radius,12+std::sin(angle)*radius);if(i==0)gear.StartFigure();else {float prev=float(i-1)*3.14159265f/16.f;float pr=((i-1)%4==1||(i-1)%4==2)?10.f:8.f;gear.AddLine(PointF(12+std::cos(prev)*pr,12+std::sin(prev)*pr),point);}}gear.CloseFigure();g.DrawPath(&p,&gear);circle(12,12,3.2f,&a);break;}
 case Icon::Retry:g.DrawArc(&p,3.f,3.f,18.f,18.f,40.f,290.f);path({{15,2},{20,3},{19,8}},&a);break;
 case Icon::Error:box(5,2,14,20,2);line(9,7,15,7);line(12,10,12,15,&a);g.FillEllipse(&solid,11.2f,17.f,1.6f,1.6f);break;
 default:break;
 }
}
inline void film(HDC dc,Film const& f,float x,float y,float size,COLORREF ink){
 constexpr Icon glyphs[]{Icon::Slr,Icon::Compact,Icon::Instant,Icon::Film,Icon::TwinLens,Icon::Digital,Icon::Stereo,Icon::Expired,Icon::Vhs};
 auto tint=RGB((f.iconTint>>16)&255,(f.iconTint>>8)&255,f.iconTint&255);
 draw(dc,glyphs[static_cast<unsigned>(f.glyph)],x,y,size,ink,tint);
}
}
