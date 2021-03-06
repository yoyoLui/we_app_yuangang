var app = getApp();
Page({
  data: {
    code_disabled: "true",//true为禁止点击“获取验证码”，‘’为允许点击“获取验证码”
    button_disabled: 'true',//true为禁止点击“确定”，‘’为允许点击“确定”
    codeable: false,
    code_success: '',
    mobile: "",
    from_type: 0,
    car_type_3: "",
    car_type_13: "",
    login_code: "获取验证码",
    sms_code: "",
    car_type: 0,
    isRightCode: false,
    button_text: '立即领取',
    isRightPhone: false,
    hasSendCode: false,
    input_disabled: '',//可输入手机号,验证码,
    code_focus: false,
  },

  onShow: function () {
    wx.hideLoading();
    wx.hideNavigationBarLoading();
    //隐藏转发按钮
    wx.hideShareMenu()
  },
  //页面加载
  onLoad: function (option) {
    //埋点-进入输入手机号页面人数
    app.defaultActivity('yWmlt1');
    var that = this;
    wx.showNavigationBarLoading();
    that.data.from_type = app.from_data.from_type;
    that.setData(that.data);
  },
  formSubmit: function (e) {
    app.user_info_data.form_id = e.detail.formId;
    this.login();
  },
  //获取验证码
  sendCode: function () {
    var that = this;
    var time = 60;
    if ((/^1[0-9][0-9]\d{8}$/.test(that.data.mobile) && that.data.code_disabled == '')) {
      that.setData({
        button_disabled: 'true',
        hasSendCode: false,
        code_success: ''
      })
      app.user_info_data.mobile = that.data.mobile;

      //发送验证码
      app.getSmsCode(that.data.mobile, function (res) {
        console.log('获取验证码返回res=' + JSON.stringify(res));
        if (res.ret == 0) {
          //发送成功
          that.setData({ hasSendCode: true, code_success: '' });
        } else {
          that.setData({ hasSendCode: false });
          time = 60;
          that.setData({ login_code: "重新发送" })
          if ((/^1[0-9][0-9]\d{8}$/.test(that.data.mobile))) {
            that.setData({ code_disabled: "", });
          }
          clearInterval(that.data.timer);
        }

      });
      //初始化60秒后重发
      that.setData({
        login_code: time + "秒后重发",
        code_disabled: "true",
      })
      //定时器
      that.setData({
        timer: setInterval(function () {
          time--;
          if (time == 0) {//倒计时时间到了
            that.setData({ login_code: "重新发送", code_success: '', hasSendCode: false })
            if ((/^1[0-9][0-9]\d{8}$/.test(that.data.mobile))) {
              that.setData({ code_disabled: "", });
            }
            clearInterval(that.data.timer);
          } else {
            that.setData({
              login_code: time + "秒后重发",
              code_disabled: "true",
            })
          }

        }, 1000)

      });

    }
  },

  //输入手机
  bindPhoneInput: function (e) {
    var that = this;
    that.data.mobile = e.detail.value.trim();
    var isRightPhone = (/^1[0-9][0-9]\d{8}$/.test(that.data.mobile));
    if (isRightPhone && !that.data.hasSendCode) {//正确的手机号码，并且没有发送过验证码，则将“获取验证码”置灰
      this.setData({ code_disabled: "", isRightPhone: true });
    } else {
      this.setData({ code_disabled: "true" });
    }

  },

  //输入验证码
  bindCodeInput: function (e) {
    var that = this;
    var sms_code = e.detail.value.trim();
    if (sms_code.length >= 6 && that.data.isRightPhone && that.data.hasSendCode) {
      //校验验证码
      app.checkSmsCode(that.data.mobile, sms_code, function (res) {
        if (res.ret != 0) {//验证失败
          that.setData({ button_disabled: 'true', input_disabled: '' });
          wx.showToast({
            title: '验证码错误',
          })
          return;
        }
        else {//验证成功,禁止输入，禁止获取
          that.data.sms_code = sms_code;
          that.setData({
            button_disabled: '',
            code_success: '验证成功',
            input_disabled: 'true',
            code_focus: false,
            login_code: "",
            code_disabled: 'true'
          });
          clearInterval(that.data.timer);

        }

      });
    }

  },
  //点击确定
  login: function (e) {
    var that = this;
    if (that.data.button_disabled == 'true') {
      return;
    }
    if (that.data.button_disabled == '') {//如果按钮激活
      //埋点-输入手机号等点击立即领取人数	
      app.defaultActivity('5GaIgB');
      // app.decryptedData(function () {
      app.user_info_data.mobile = that.data.mobile;
      app.receiveCard2(that.data.sms_code, function () {
        wx.redirectTo({
          url: '../one_cardReceived/one_cardReceived',
        })
      });
      // });


    }




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
  onReachBottom: function () {

  },

})


