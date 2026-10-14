#include "VCAsync.h"
#include <iostream>
#include <thread>
using namespace winrt;
static winrt::Windows::Foundation::IAsyncAction delay(std::chrono::milliseconds duration){
 auto token=co_await get_cancellation_token();token.enable_propagation();co_await resume_after(duration);
}
int main(){init_apartment(apartment_type::multi_threaded);int code=0;
 try{
  auto quick=delay(std::chrono::milliseconds(1));waitCameraOperation(quick,L"quick",1000);
  auto slow=delay(std::chrono::seconds(60));bool timedOut=false;auto start=std::chrono::steady_clock::now();
  try{waitCameraOperation(slow,L"test driver timeout",20);}catch(hresult_error const& e){timedOut=e.code()==HRESULT_FROM_WIN32(ERROR_TIMEOUT);}
  if(!timedOut||std::chrono::steady_clock::now()-start>std::chrono::seconds(2))throw std::runtime_error("Camera timeout was not bounded");
  auto deadline=std::chrono::steady_clock::now()+std::chrono::seconds(2);
  while(slow.Status()==winrt::Windows::Foundation::AsyncStatus::Started&&std::chrono::steady_clock::now()<deadline)std::this_thread::sleep_for(std::chrono::milliseconds(5));
  if(slow.Status()==winrt::Windows::Foundation::AsyncStatus::Started)throw std::runtime_error("Async cancellation did not propagate");
  std::cout<<"PASS: camera asynchronous completion, bounded driver timeout and cancellation propagation.\n";
 }catch(hresult_error const& e){std::wcerr<<L"FAIL: "<<e.message().c_str()<<L'\n';code=1;}
 catch(std::exception const& e){std::cerr<<"FAIL: "<<e.what()<<'\n';code=1;}
 uninit_apartment();return code;
}
