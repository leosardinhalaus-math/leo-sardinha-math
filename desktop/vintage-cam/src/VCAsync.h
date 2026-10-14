#pragma once
#include "VCPlatform.h"
#include <chrono>
template<class Operation>
decltype(auto) waitCameraOperation(Operation const& operation,std::wstring_view stage,unsigned milliseconds=12000) {
 if(operation.wait_for(std::chrono::milliseconds(milliseconds))==winrt::Windows::Foundation::AsyncStatus::Started){
  operation.Cancel();throw winrt::hresult_error(HRESULT_FROM_WIN32(ERROR_TIMEOUT),winrt::hstring(L"A câmera não respondeu: "+std::wstring(stage)));
 }
 return operation.get();
}
