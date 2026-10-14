#pragma once
#include "VCPlatform.h"
class CompatCamera {
 struct Impl;std::unique_ptr<Impl> impl;
 public:
 CompatCamera();~CompatCamera();
 void open(std::wstring const& deviceId,unsigned index);
 void close() noexcept;
 void pause();void resume();void requestPhoto();
 std::shared_ptr<Image> poll(bool& isPhoto);
 std::wstring description()const;
 unsigned deviceCount()const;
};
