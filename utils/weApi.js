
//打开设置页，wx.openSetting基础库 1.1.0 开始支持，低版本需做兼容处理
function openSettingSuccess(fn) {
  if (wx.openSetting) {
    openSettingLoop(function(){
        fn();
    });
  } else {
    wx.showModal({
      title: '提示',
      content: '请前往设置-打开用户信息，并重试',
      showCancel: false
    })
  }
}
function openSettingLoop(fun) {
  wx.showToast({
    title: '请允许授权',
  })
  wx.openSetting({
    success: (res) => {
      if (res.authSetting['scope.userInfo']) {
        console.log('成功打开用户信息，getSetting res=' + JSON.stringify(res));
        fun();
      } else {
        console.log('拒绝授权用户信息,重新打开设置页');
        openSettingLoop(fun);
      }
    }
  })
}

module.exports = {
  openSettingSuccess: openSettingSuccess,       //打开设置页面
}