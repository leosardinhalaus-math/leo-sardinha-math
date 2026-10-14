#pragma once
#ifndef NOMINMAX
#define NOMINMAX
#endif
#include <windows.h>
#include <wrl/client.h>
#include <winrt/base.h>
#include <winrt/Windows.Foundation.h>
#include <winrt/Windows.Foundation.Collections.h>
#include "Film.h"
#include <filesystem>
#include <memory>
using Microsoft::WRL::ComPtr;
inline void check(HRESULT hr) {winrt::check_hresult(hr);}
Image decodeFile(std::filesystem::path const&,unsigned maxSide=0);
Image decodeBytes(std::vector<uint8_t> const&);
void savePng(Image const&, std::filesystem::path const&);
std::filesystem::path rollPath();
std::filesystem::path uniquePhotoPath(std::filesystem::path const&,std::wstring_view);
void saveToPictures(std::filesystem::path const&);
