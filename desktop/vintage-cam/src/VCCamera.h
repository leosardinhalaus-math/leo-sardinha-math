#pragma once
#include "VCPlatform.h"
#include <functional>
#include <mutex>
#include <condition_variable>
#include <deque>
#include <thread>
#include <atomic>
struct CameraStatus {std::wstring text;bool ready=false,flashSupported=false;unsigned count=0,index=0;bool captureError=false,front=false,compatible=false;};
class Camera {
 enum class Kind {Switch,Photo,Pause,Resume,Compatible};
 struct Command {Kind kind;unsigned index=0;bool flag=false;};
 std::mutex mutex;std::condition_variable cv;std::deque<Command> commands;bool ending=false;
 std::thread worker;
 winrt::apartment_context uiContext;std::atomic<bool> finished{false};
 std::function<void(std::shared_ptr<Image>)> onFrame,onPhoto;
 std::function<void(CameraStatus)> onStatus;
 void run();void enqueue(Command);
 public:
 Camera(std::function<void(std::shared_ptr<Image>)>,std::function<void(std::shared_ptr<Image>)>,std::function<void(CameraStatus)>);
 ~Camera();
 void requestStop();
 bool isStopped()const{return finished.load();}
 void switchDevice(unsigned i){enqueue({Kind::Switch,i});}
 void useCompatible(unsigned i){enqueue({Kind::Compatible,i});}
 void photo(bool flash){enqueue({Kind::Photo,0,flash});}
 void pause(){enqueue({Kind::Pause});}
 void resume(){enqueue({Kind::Resume});}
};

std::filesystem::path cameraLogPath();
void cameraLog(std::wstring_view) noexcept;
