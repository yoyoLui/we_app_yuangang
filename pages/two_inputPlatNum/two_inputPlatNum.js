// pages/inputPlatNum/inputPlatNum.js
var inputValue;
var encryptedData = null;
var code;
var isMobile = true;
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    getPhoneNumber: '',
    isShowToast: false,
  },
  //首次加载要登录
  onLoad: function () {
    login(this);
  },
  //领取礼物点击事件
  collect_gifts: function (e) {
    checkPlatNum(this);
    console.log(inputValue);
  },
  //输入框输入监听事件
  bindKeyInput: function (e) {
    inputValue = e.detail.value;
    inputValue = inputValue.replace(/\s+/g, "");
    var length = inputValue.length;
    //当输入合法就设置可以获取手机号权限,否则相反
    if (length == 7) {
      //合法才有授权
      checkPlatNum(this);
      this.setData({
        getPhoneNumber: 'getPhoneNumber'
      })
    } else {
      this.setData({
        getPhoneNumber: ''
      })
    }
  },
  //授权点击监听
  getPhoneNumber: function (e) {
    encryptedData = e.detail.encryptedData;
    var mobile = e.detail.mobile;
    if (mobile != undefined) {
      //手机号是否合法
      isMobile = (/^1[3|4|7|5|8][0-9]\d{4,8}$/.test(mobile));
    }
    console.log(e);
    if (encryptedData == "" || encryptedData == undefined || !isMobile) {
      wx.navigateTo({
        url: '../two_inputPhone/two_inputPhone?plateNum=' + inputValue + '&isMobile=' + isMobile,
      })
    } else {
      wx.showToast({
        title: '正在请求',
        icon: 'loading',
        duration: 3000
      })
      decodeEncrypt_data(e);
    }
  }
})
//检验车牌是否合法
function checkPlatNum(that) {
  if (inputValue != null && inputValue.length == 7) {
    var express = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/;
    var result = express.test(inputValue);
    console.log(result);
  }
  if (!result || result == undefined) {
    app.showToast("请先输入正确的车牌号", that, 2000);
    return;
  }
}

//登录
function login(that) {
  var that = that
  wx.login({
    success: function (res) {
      console.log(res.code)
      code = res.code;
      //存储code
      wx.setStorageSync('code', code)
    },
    fail: function () {
      app.showToast("登录失败,请重试", this, 2000);
    }
  })
}

//解密Encrypt_data
function decodeEncrypt_data(res) {
  console.log('decodeEncrypt_data url=' + app.server_api_2.applet_activity);
  wx.request({
    url: app.server_api_2.applet_activity,
    method: "GET",
    data: {
      encrypt_data: encryptedData,
      code: code,
      iv: res.detail.iv,
      car_num: inputValue,
      is_auth: 1
    },
    success: function (res) {
      console.log(res)
      //发送推送
      if (res.data.ret == 0) {
        var mobile = res.data.mobile;
        if (mobile == "" || mobile == undefined) {
          wx.navigateTo({
            url: '../two_inputPhone/two_inputPhone?plateNum=' + inputValue + '&isMobile=noMobile',
          })
          return;
        }
        sendPush(mobile);
      } else {
        app.showToast("数据异常,请重试", this, 2000);
      }
    },
    fail: function () {
      app.showToast("数据异常,请重试", this, 2000);
    }
  })
}

function sendPush(mobile) {
  var txt = mobile + ":" + inputValue;
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