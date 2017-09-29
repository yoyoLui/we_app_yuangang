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
    } else {
      result = false;
    }
  },
  collect: function (e) {
    var formId = e.detail.formId;
    if (phoneNum == null || !result) {
      wx.showToast({
        title: '请先输入正确的手机号',
        duration: 2000
      })
      return;
    }
    wx.showLoading({
      title: '正在领取中...',
    })
    app.uploadCarNum('', plateNum, formId, phoneNum, 0)
  }
})
