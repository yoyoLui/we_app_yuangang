var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_open_getPhoneNumber: true,//默认显示授权按钮
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    wx.hideLoading();
    var that = this;
   
    if (app.user_info_data.mobile == '' || app.user_info_data.mobile == undefined) {
      //授权
      that.setData({
        is_open_getPhoneNumber: true
      });
    } else {
      that.setData({
        is_open_getPhoneNumber: false
      });
    }
    if (app.user_info_data.is_new == 0) {//营运车使用普通button
      that.setData({
        is_open_getPhoneNumber: false
      });
    }
  },

  //普通button
  //点击form事件
  buttonClick: function (e) {//有手机号
    console.log('获取formId=' + e.detail.formId);
    app.formData.formId = e.detail.formId;
    //埋点
    if (app.user_info_data.is_new == 0) { //营运车
      app.defaultActivity('E8uTF9 ');
      wx.showModal({
        title: '提示',
        content: app.toast.not_access,
      });
      return;
    } else {                              //私家车
      app.defaultActivity('Jv8mGH');
      //调用领取接口
      app.decryptedData(function () {
        app.receiveCard(function (res) {
          if (res.ret == 0) {//新用户并且成功领取
            wx.redirectTo({
              url: '../one_cardReceived/one_cardReceived',
            })
          } else {
            wx.hideLoading();
            console.log('ret!=0 打印' + JSON.stringify(res));
            if (res.ret != undefined) {
              wx.showModal({
                title: '提示',
                content: res.msg,
                showCancel: false
              })
            } else {
              wx.showModal({
                title: '提示',
                content: '服务器错误',
                showCancel: false
              })
            }
          }
        });
      });
    }
   
   
  },

  //授权butttn
  //点击form提交事件
  getFormId: function (e) {
    //埋点
    if (app.user_info_data.is_new == 0) { //营运车(不会出现)
      app.defaultActivity('E8uTF9 ');
    } else {                              //私家车
      app.defaultActivity('Jv8mGH');
    }
    console.log('获取formId=' + e.detail.formId);
    app.formData.formId = e.detail.formId;
    //埋点-点击领取人数
    app.defaultActivity('Jv8mGH');

  },
  //点击领取按钮——授权登录
  getPhoneNumber: function (e) {//没有手机号
    //埋点-弹出授权弹框
    app.defaultActivity('mo9Y3N');
    var that = this;

    if (e.detail.encryptedData && e.detail.iv) {//用户授权
      wx.showLoading({
        title: '授权中',
      })
      //埋点-点击允许授权人数
      app.defaultActivity('zYww9i');
      app.user_info_data.encryptedData = e.detail.encryptedData;
      app.user_info_data.iv = e.detail.iv;
      wx.login({  //失败重新登录
        success: function (res) {
          console.log('授权点击-登录成功');
          console.log(JSON.stringify(res.code));
          app.login_data.code = res.code;
          app.decryptedData_getMobile(function () {
            if (!app.getPhoneNum.is_auth) {//解密手机号失败
              wx.redirectTo({
                url: '../one_phoneInput/one_phoneInput',
              })
            } else {
              app.decryptedData(function () {
                //解密成功，调用领取接口
                app.receiveCard(function (res) {
                  if (res.ret == 0) {//新用户并且成功领取
                    wx.redirectTo({
                      url: '../one_cardReceived/one_cardReceived',
                    })
                  } else {
                    if (res.ret != undefined) {
                      wx.showModal({
                        title: '提示',
                        content: res.msg,
                        showCancel: false
                      })
                    } else {
                      wx.showModal({
                        title: '提示',
                        content: '服务器错误',
                        showCancel: false
                      })
                    }
                  }
                });
              });
            }
          });
        },
        fail: function (res) {
          console.log('重新登录失败');
        }
      });
    } else {//没有授权,用户需要手动登录
      //埋点-点击拒绝授权人数
      app.defaultActivity('cbQcE2');
      wx.redirectTo({
        url: '../one_phoneInput/one_phoneInput',
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.hideLoading();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //隐藏转发按钮
    wx.hideShareMenu()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})