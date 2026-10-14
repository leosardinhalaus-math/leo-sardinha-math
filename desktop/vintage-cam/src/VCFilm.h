#pragma once
#include <array>
#include <cstdint>
#include <string_view>
#include <vector>
#include <stdexcept>
struct Image {
    unsigned width=0,height=0;
    std::vector<uint8_t> bgra;
    void validate() const {
        if (!width || !height || width>16384 || height>16384 || bgra.size()!=size_t(width)*height*4)
            throw std::runtime_error("Imagem inválida ou maior que 16384 pixels.");
    }
};
struct Film {
    std::wstring_view id,name,description;
    float temperature, saturation, grain, vignette;
    std::array<float,3> bias;
    float bloom;
    std::array<float,5> curve;
    float chroma, scanlines;
    bool stamp;
};
inline const std::array<Film,9> Films{{
 {L"neutral",L"NEUTRO",L"Luz natural · cores fiéis",0,1,0,0,{0,0,0},0,{0,.25f,.5f,.75f,1},0,0,false},
 {L"eighties",L"NEGATIVO 80",L"Sombras lavadas · nostalgia",.12f,.77f,.035f,.22f,{.02f,.006f,-.01f},.06f,{.09f,.29f,.51f,.72f,.94f},.0008f,0,false},
 {L"instant",L"INSTANTÂNEO",L"Pastel suave · luz cremosa",.08f,.75f,.025f,.3f,{.025f,.012f,-.02f},.1f,{.06f,.27f,.56f,.81f,.96f},.0005f,0,false},
 {L"gold",L"OURO 135",L"Sol dourado · tons quentes",.27f,1.12f,.024f,.18f,{.018f,.009f,-.008f},.08f,{.025f,.2f,.53f,.81f,.99f},0,0,false},
 {L"mono",L"P&B ARENOSO",L"Prata · contraste e textura",0,0,.085f,.32f,{0,0,0},.025f,{.01f,.12f,.48f,.86f,1},0,0,false},
 {L"ccd",L"Y2K CCD",L"Digital 2000 · cor elétrica",-.09f,1.2f,.012f,.1f,{.009f,.018f,.025f},.025f,{.0f,.19f,.55f,.85f,1},.0004f,0,false},
 {L"neon",L"NEON 3D",L"Violeta · separação cromática",-.06f,1.25f,.028f,.32f,{.05f,-.025f,.075f},.19f,{.025f,.13f,.5f,.88f,1},.0045f,0,false},
 {L"expired",L"VENCIDO",L"Desvio de cor · memória viva",.15f,.85f,.058f,.38f,{.045f,.025f,-.03f},.13f,{.11f,.25f,.48f,.73f,.94f},.0015f,0,false},
 {L"vhs",L"VHS DATE",L"Fita analógica · data âmbar",.19f,.7f,.04f,.23f,{.03f,.007f,-.025f},.07f,{.055f,.22f,.49f,.75f,.95f},.0028f,.045f,true}
}};
inline uint32_t grainHash(uint32_t x,uint32_t y,uint32_t seed) {
 uint32_t n=x*1973u+y*9277u+seed*26699u; n=(n^(n>>16))*2246822519u;
 n=(n^(n>>13))*3266489917u; return n^(n>>16);
}
Image referenceDevelop(Image const&, Film const&, uint32_t seed);
