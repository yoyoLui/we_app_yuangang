var utilPlugins = require('../../utils/utilPlugins.js')
var app = getApp();
Page({
  data: {
    is_open_getPhoneNumber: false,//默认显示普通按钮
  },
  onLoad: function () {
    wx.hideLoading();
    var that = this;
    console.log('app.user_info_data='+JSON.stringify(app.user_info_data));
    // wx.getStorage({
    //   key: 'initview3_res',
    //   success: function(res) {
        
    //   },
    // })
    console.log('mobile=' + app.user_info_data.mobile);
    console.log('is_new=' + app.user_info_data.is_new);

    if (that.canShowGetPhoneButton()) {
      console.log('授权按钮');
      //授权按钮
      that.setData({
        is_open_getPhoneNumber: true
      });
    } else {
      console.log('普通按钮');
      that.setData({
        is_open_getPhoneNumber: false
      });
    }
  },
  //判断使用什么button
  canShowGetPhoneButton: function () {
    //bindgetphonenumber 从1.2.0 开始支持，但是在1.5.3以下版本中无法使用wx.canIUse进行检测，建议使用基础库版本进行判断。
    
    if (!app.util.compareVersion('1.2.0',app.SystemInfo.SDKVersion)&& app.user_info_data.is_new == 1) {
      if (app.user_info_data.mobile == '' || app.user_info_data.mobile == undefined) {
        return true;
      }
    }
    return false;
  },
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    //模拟加载
    setTimeout(function () {
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 1500);
    this.onLoad();
  },

  //普通button-直接领取
  //点击form事件
  buttonClick: function (e) {//普通按钮
    //埋点-点击按钮人数 rn8DYa 
    app.defaultActivity_3('rn8DYa');
    console.log('普通button获取formId=' + e.detail.formId);
    app.formData.formId = e.detail.formId;
    if (app.user_info_data.is_new == 0) { //营运车
    
      utilPlugins.showToast(app.toast.not_access, this, 2000);
 
      return;
    } else {                              //私家车
      
      //调用领取接口
      app.decryptedData_3(function () {
        if (app.user_info_data.mobile ) {//有手机号才可以调用领卡接口
          app.receiveCard_3(function (res) {
            if (res.ret == 0) {//新用户并且成功领取
           
              wx.redirectTo({
                url: '../three_cardReceived/three_cardReceived',
              })
            } else {
              wx.hideLoading();
              utilPlugins.showErrorMsg(res);
            }
          });
        } else {
          wx.redirectTo({//可能由于版本过低，导致不能弹出授权弹框，所以这里跳转到输入手机号页面
            url: '../three_phoneInput/three_phoneInput',
          })
        }
      });


    }
  },

  //授权butttn
  //点击form提交事件
  getFormId: function (e) {
    //埋点-点击按钮人数 rn8DYa 
    app.defaultActivity_3('rn8DYa');
    //埋点-出现授权框人数 yOL3pu
    app.defaultActivity_3('yOL3pu');
    console.log('授权button获取formId=' + e.detail.formId);
    app.formData.formId = e.detail.formId;
  },
  //点击领取按钮——授权登录
  getPhoneNumber: function (e) {//没有手机号
   
    var that = this;
    if (e.detail.encryptedData && e.detail.iv) {//用户授权
      wx.showLoading({
        title: '授权中',
      })
      //埋点-同意授权人数 qx6xFS 
      app.defaultActivity_3('qx6xFS');
      app.user_info_data.encryptedData = e.detail.encryptedData;
      app.user_info_data.iv = e.detail.iv;
      wx.login({  //失败重新登录
        success: function (res) {
          console.log('授权点击-登录成功');
          console.log(JSON.stringify(res.code));
          app.login_data.code = res.code;
          app.decryptedData_getMobile_3(function (res_getMobile) {
            if (app.getPhoneNum.is_auth == 1) {//解密手机号成功
              //更新过缓存，调用领取接口
              app.receiveCard_3(function (res) {
                if (res.ret == 0) {//新用户并且成功领取
                  
                  wx.redirectTo({
                    url: '../three_cardReceived/three_cardReceived',
                  })
                } else {//可能fail，也可能是success返回ret！=0
                  wx.hideLoading();
                  utilPlugins.showErrorMsg(res);
                  wx.redirectTo({
                    url: '../three_phoneInput/three_phoneInput',
                  })
                }
              });
            } else {//解密失败
              if (res_getMobile.ret != 0) {
                utilPlugins.showToast(res_getMobile.msg, this, 2000);
              }
              wx.redirectTo({
                url: '../three_phoneInput/three_phoneInput',
              })
            }
          });
        },
        fail: function (res) {
          console.log('重新登录失败');
        }
      });
    } else {//没有授权,用户需要手动登录
     
      wx.redirectTo({
        url: '../three_phoneInput/three_phoneInput',
      })
    }
  },

  onReady: function () {
    wx.hideLoading();
  },

  onShow: function () {
    
    wx.hideNavigationBarLoading();
  },

  onHide: function () { },

  onUnload: function () { },

  onReachBottom: function () { },

  onShareAppMessage: function (res) {
    if (res.from === 'menu') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '送您一张专属加油券，点此领取',
      path: '/pages/index/index?from_source=2',
      success: function (res) {
        wx.showToast({
          title: '转发成功',
        })
      },
      fail: function (res) {
        wx.showToast({
          title: '转发成功',
        })
      }
    }
   }
})