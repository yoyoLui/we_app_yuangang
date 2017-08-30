// pages/inputPhone/inputPhone.js
var phoneNum;
var plateNum;
var result;
var isMobile = "";
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  onLoad: function (options) {
    plateNum = options.plateNum;
    isMobile = options.isMobile;
  },
  onReady: function () {
    if (isMobile == "false") {
      wx.showToast({
        title: '未绑定手机号',
      })
    }
  },
  bindKeyInput: function (e) {
    phoneNum = e.detail.value;
    if (phoneNum != null && phoneNum.length == 11) {
      result = (/^1[3|4|7|5|8][0-9]\d{4,8}$/.test(phoneNum));
      console.log(result);
    }
  },
  collect: function () {
    if (phoneNum == null || !result) {
      wx.showToast({
        title: '请先输入正确的手机号',
        duration: 2000
      })
      return;
    }
    wx.showToast({
      title: '正在请求',
      icon: 'loading'
    })
    decodeEncrypt_data(phoneNum)
  }
})

//解密Encrypt_data
function decodeEncrypt_data(mobile) {
  console.log('decodeEncrypt_data url=' + app.server_api_2.applet_activity);
  var mCode = wx.getStorageSync('code');
  console.log("mCode:" + mCode + "plateNum:" + plateNum + "is_auth:0" + "mobile:" + mobile);
  wx.request({
    url: app.server_api_2.applet_activity,
    method: "GET",
    data: {
      code: mCode,
      car_num: plateNum,
      is_auth: 0,
      mobile: mobile
    },
    success: function (res) {
      console.log(res)
      //发送推送
      if (res.data.ret == 0) {
        sendPush(mobile);
      } else if (res.data.ret != 0) {
        wx.showToast({
          title: res.data.msg,
        })
      } else {
        wx.showToast({
          title: '数据异常,请重试',
        })
      }
    },
    fail: function (e) {
      console.log(e);
      wx.showToast({
        title: '领取失败,请重试',
      })
    }
  })
}

function sendPush(mobile) {
  var txt = mobile + ":" + plateNum;
  wx.request({
    method: "GET",
    url: 'https://api.ejiayou.com/activity/api/app/push_msg/send?regIds=1104a897929ca8090f1&msgContent=' + txt + '&contentType=ejiayou://stationList&url=&msgType=2&type=2&carNum=&isVip=1',
    success: function (res) {
      console.log(res)
      wx.redirectTo({
        url: '../two_success/two_success',
      })
    },
    fail: function (res) {
      console.log(res)
    }
  })
}