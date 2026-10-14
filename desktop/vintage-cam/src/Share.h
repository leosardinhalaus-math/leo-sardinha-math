#pragma once
#include "Platform.h"
#include <winrt/Windows.ApplicationModel.DataTransfer.h>
class Share {
 winrt::Windows::ApplicationModel::DataTransfer::DataTransferManager manager{nullptr};
 winrt::event_token token{};std::filesystem::path path;HWND owner=nullptr;
 public:
 ~Share();void show(HWND,std::filesystem::path const&);
};
