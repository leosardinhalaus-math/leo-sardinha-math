#include "Share.h"
#include <shobjidl.h>
#include <winrt/Windows.Storage.h>
#include <winrt/Windows.Foundation.Collections.h>
using namespace winrt;
using namespace Windows::ApplicationModel::DataTransfer;
static fire_and_forget provide(DataRequestedEventArgs args,std::filesystem::path path) {
 auto request=args.Request();auto deferral=request.GetDeferral();
 try {
  auto file=co_await Windows::Storage::StorageFile::GetFileFromPathAsync(path.wstring());
  auto items=single_threaded_vector<Windows::Storage::IStorageItem>();items.Append(file);
  request.Data().Properties().Title(L"Foto · Vintage Cam");request.Data().Properties().Description(L"Revelada no dispositivo.");request.Data().SetStorageItems(items);
 }catch(...){request.FailWithDisplayText(L"Não foi possível compartilhar a foto. Verifique se o arquivo ainda existe.");}
 deferral.Complete();
}
Share::~Share(){if(manager)manager.DataRequested(token);}
void Share::show(HWND window,std::filesystem::path const& file) {
 auto interop=get_activation_factory<DataTransferManager,IDataTransferManagerInterop>();
 if(!manager) {
  owner=window;check(interop->GetForWindow(owner,guid_of<DataTransferManager>(),put_abi(manager)));
  token=manager.DataRequested([this](DataTransferManager const&,DataRequestedEventArgs const& args){provide(args,path);});
 }
 path=file;check(interop->ShowShareUIForWindow(owner));
}
