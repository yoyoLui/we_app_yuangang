// pages/inputPlatNum/inputPlatNum.js
var weApi = require('../../utils/weApi');
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
//手机号或者车牌号
var mobile, carNum, formId;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    txtInput:false,
    numInput: false,
    numInputValue:"",
    numInputText:"粤",
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
    //formId
    console.log("formId")
    console.log(e.detail.formId)
    formId = e.detail.formId;
    console.log(inputValue)
    checkPlatNum(this);
    console.log(inputValue);
    //有手机号直接调用接口，不用授权传0
    if(mobile) {
      wx.showLoading({
        title: '正在领取中...',
      })
      app.uploadCarNum('', inputValue, formId, mobile, 0)
    }
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
      //取消授权
      wx.navigateTo({
        url: '../two_inputPhone/two_inputPhone?plateNum=' + inputValue + '&isMobile=' + isMobile,
      })
    } else {
      //允许授权
      wx.showToast({
        title: '正在请求',
        icon: 'loading',
        duration: 3000
      })
      // 发送推送模板任务
      wx.login({
        success:function(res) {
          app.login_data = res;
          wx.showLoading({
            title: '正在领取中...',
          })
          app.uploadCarNum(e, inputValue, formId, mobile, 1)
        }
      })
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
  } else if (undefined != mobile && mobile != "") {
    that.setData({
      getPhoneNumber: ''
    })
  } else {
    that.setData({
      getPhoneNumber: 'getPhoneNumber'
    })
  }
}

//登录
function login(that){
  var that = that
  wx.login({
    success:function(res) {
     code = res.code;
     app.login_data = res;
      app.checkSession(function() {
        wx.getUserInfo({
          success:function(user_info) {
            getPhoneAndCarNum(user_info, that);
          },
          fail: function (res) {
            wx.hideLoading();
            weApi.openSettingSuccess(function () {
              wx.getUserInfo({//首先跟微信拿user_info_data,然后decryptedData跟后端获取用户完整信息
                success: function (user_info_data) {
                  app.user_info_data = user_info_data;
                  getPhoneAndCarNum(user_info_data, that);
                },
              });
            });
          }
        })
      })
    },
    fail:function() {
      wx.hideLoading()
    }
  })
}
//获取手机号，车牌号
function getPhoneAndCarNum(user_info,that) {
  wx.showLoading({
    title: '获取数据',
  })
  var that = that
     wx.request({
       url: app.server_api_2.questionnaire_activity_get_phone,
        data:{
          code: code,
          iv: user_info.iv,
          encrypt_data: user_info.encryptedData
        },
        success:function(res) {
          console.log(res)
          var ret = res.data.ret;
          //成功
          if (ret != undefined && ret == 0) {
            wx.hideLoading()
            that.setData({
              numInput: true,
            })
            carNum = res.data.data.car_num;
            mobile = res.data.data.mobile;
            app.user_info_data.open_id = res.data.data.open_id;
            app.user_info_data.union_id = res.data.data.union_id;
            console.log(mobile + "====" + carNum);
            //设置默认是车牌号
            setCarNum(that);
            if (mobile) {
              that.setData({
                getPhoneNumber: ''
              })
            } else {
              that.setData({
                getPhoneNumber: 'getPhoneNumber'
              })
            }
          } else {
            //失败
            app.showToast(res.data.msg, that, 2000);
            console.log("获取手机号与车牌：" + res)
            wx.hideLoading()
            that.setData({
              numInput: true,
            })
          }
        },
        fail:function(res) {
          app.showToast(res.data.msg, that, 2000);
          console.log("获取手机号与车牌：" + res)
          wx.hideLoading()
          that.setData({
            numInput: true,
          })
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
//拆分设置车牌
function setCarNum(that) {
  var that = that
  if (carNum) {
    //设置输入框的文字
    inputValue = carNum;
    var carNumTxt = carNum.substring(0, 1);
    if (carNumTxt) {
      that.setData({
        numInputText: carNumTxt,
      })
    }
    var carNumChar = carNum.substring(1, 2);
    var carNumNum = carNum.substring(2, carNum.length);
    if (carNumChar) {
      that.setData({
        numInputValue: carNumChar + "·" + carNumNum,
      })
    }
   var carNumber = carNumChar + "·" + carNumNum;
   if (undefined != carNumber && carNumber.length == 7) {
     that.setData({
       disabled:""
     })
    } else {
     that.setData({
       disabled: "true"
     })
    }
  }
}