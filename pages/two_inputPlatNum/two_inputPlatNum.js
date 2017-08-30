// pages/inputPlatNum/inputPlatNum.js
var inputValue;
var encryptedData = null;
var code;
var isMobile = true;
// t车牌添加点的标志
var tag = false;
// 是否是删除点的标志
var isDel = true;
var app = getApp();
//给默认值
var txtInputV = "粤",numInputV;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    txtInput:false,
    numInput:false,
    numInputValue:"",
    getPhoneNumber: '',
    isShowToast: false,
    disabled: true
  },
  //首次加载要登录
  onLoad: function () {
    login(this);
  },
  //领取礼物点击事件
  collect_gifts: function (e) {
    console.log(inputValue)
    checkPlatNum(this);
    console.log(inputValue);
  },
  //文字输入框
  bindTxtInput: function(e) {
    txtInputV = e.detail.value;
    if(txtInputV.length == 1) {
      this.setData({
        numInput: true,
      })
    }
    inputValue = txtInputV + numInputV
    inputValue = inputValue.replace('·', '')
    var length = inputValue.length;
    //当输入合法就设置可以获取手机号权限,否则相反
    if (length >= 6) {
      //合法才有授权
      checkPlatNum(this);
    } else {
      this.setData({
        getPhoneNumber: ''
      })
    }
    checkBtnDisable(this);
  }, 
  // 数字输入框
  bindNumInput: function (e) {
    numInputV = e.detail.value;
    //第一个不能输入空格
    if(numInputV == " ") {
      this.setData({
        numInputValue: ""
      })
        return
    }
    //当输入框为空时，重置tag
    if (numInputV.length == 0) {
      tag = false;
      isDel = true;
      return
    }
    if (numInputV.length == 1 && !isDel) {
      isDel = true;
      tag = false;
      this.setData({
        numInputValue: ""
      })
      return
    }
    if (numInputV.length == 1 && !tag) {
        tag = true;
        isDel = false;
        this.setData({
          numInputValue: numInputV +"·"
        })
    }
    inputValue = txtInputV + numInputV
    inputValue = inputValue.replace('·', '')
    var length = inputValue.length;
    //当输入合法就设置可以获取手机号权限,否则相反
    if (length == 7) {
      //合法才有授权
      checkPlatNum(this);
    } else {
      this.setData({
        getPhoneNumber: ''
      })
    }
    checkBtnDisable(this);
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
      decodeEncrypt_data(e,this);
    }
  }
})
//检验车牌是否合法
function checkPlatNum(that) {
  var that = that
  if (inputValue != null && inputValue.length == 7) {
    var express = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/;
    var result = express.test(inputValue);
    console.log(result);
  }
  if (!result || result == undefined) {
    app.showToast("请先输入正确的车牌号", that, 2000);
    that.setData({
      getPhoneNumber: ''
    })
    return;
  } else {
    that.setData({
      getPhoneNumber: 'getPhoneNumber'
    })
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
function decodeEncrypt_data(res,that) {
  var that = that
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
        app.showToast("数据异常,请重试", that, 2000);
      }
    },
    fail: function () {
      app.showToast("数据异常,请重试", that, 2000);
    }
  })
}
function sendPush(mobile) {
  var txt = mobile + ":" + inputValue;
  wx.request({
    method: "POST",
    url: 'https://dev.ejiayou.com/activity/api/app/push_msg/send',
    data:{
      regIds: '100d8559097df1ac5e9',
      msgContent: txt,
      contentType:'ejiayou://stationList',
      msgType:'2',
      type:'2',
      carNum:'',
      isVip:'1'
    },
    success: function (res) {
      console.log(res)
      wx.reLaunch({
        url: '../two_success/two_success',
      })
    },
    fail: function (res) {
      console.log(res)
    }
  })
}
// 监听按钮的可选状态
function checkBtnDisable(that) {
  var that = that
  if (txtInputV.length == 1 && numInputV.length >= 6) {
    that.setData({
      disabled: ''
    })
  } else {
    that.setData({
      disabled: 'true'
    })
  }
}