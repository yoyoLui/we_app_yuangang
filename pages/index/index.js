var app = getApp();
var utilPlugins = require('../../utils/utilPlugins');
var weApi = require('../../utils/weApi');
Page({
  data: {
    is_index: false,
    is_activity: false,
    is_activity2: false,
    is_activity_zhuhai: false,
    show_bk: true,
    show_mycard: false,
    nocard: true,
    success: false,
    audting: false,
    bk_checked_image: "https://img.ejiayou.com/experience_app_img/card_orange@2x.png",
    mycard_checked_image: "https://img.ejiayou.com/experience_app_img/mine_grey@2x.png",
    navigate_url: "",
    check_login: {
      hasLogin: false,
      hasGetLocation: false,
      hasGetUserInfo: false
    }
  },

  onLoad: function (options) {
    console.log('options=' + JSON.stringify(options));
    //开关
    //options.from_source = 0;//200元卡
    //options.from_source = 1;//输入车牌号领取礼物
    //options.from_source = 2;//客服小号
    var that = this;
    //有from_source进入活动，没有from_source进入首页
    if (undefined != options && undefined != options.from_source) {
      that.data.is_index = false;
      app.is_index = false;
      if (options.from_source == 0) {
        that.data.is_activity = true;
        // 页面初始化 options为页面跳转所带来的参数
        if (undefined != options && undefined != options.from_user_id) {
          app.from_data.from_user_id = options.from_user_id;
        }
        if (undefined != options && undefined != options.from_type) {
          app.from_data.from_type = options.from_type;
          console.log('获取option的from_type form_type=' + app.from_data.from_type);
        }
        if (undefined != options && undefined != options.from_city_id) {
          app.from_data.from_city_id = options.from_city_id;
        }
        //来源,0=分享 1=公众号支付完成模板消息 2=支付完成 3=服务通知 4=图文消息(批量推送等)
        if (undefined != options && undefined != options.channel_no) {
          app.from_data.channel_no = options.channel_no;
        }
        if (undefined != options && undefined != options.from_source) {
          app.from_data.from_source = options.from_source;
        }
        that.toActivity_card();
        return;
      }

      if (options.from_source == 1) {
        that.data.is_activity2 = true;
        // 页面初始化 options为页面跳转所带来的参数
        if (undefined != options && undefined != options.from_source) {
          app.from_data.from_source = options.from_source;
        }

        if (options.push_id) {
          app.push_id = options.push_id;
          that.goQuestionnaireActivity();
        } else {
          that.toActivity_card2();
          return;
        }
      }
      //客服小号
      if (options.from_source == 2) {
        app.from_data.from_source = options.from_source;
        that.toActivity_customerService();
        return;
      }

    }

    //进入首页
    else {
      that.data.is_index = true;
      app.is_index = true;
    }
    if (app.from_data.from_source == -1) {
      that.data.is_index = true;
      app.is_index = true;
    } else {
      that.data.is_index = false;
      app.is_index = false;
    }
    that.setData(that.data);
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    var that = this;
    if (that.data.is_index) {
      that.toIndex();
    }
    wx.hideLoading();

  },
  onHide: function () {
    // 页面隐藏
  },

  onUnload: function () {
    // 页面关闭
  },
  toApply: function () {
    var that = this;

    if (that.data.audting) {
      wx.showModal({
        showCancel: false,
        title: '温馨提示',
        content: '您的资料正在审核中'
      })
      return;
    }
    if (that.data.success) {
      wx.showModal({
        showCancel: false,
        title: '温馨提示',
        content: '您的专属油卡已激活成功，我们会有专属客服与您联系，请保持手机畅通'
      })
      return;
    }

    wx.showLoading({
      title: '加载中',
    })
    wx.navigateTo({
      url: "../app_apply/app_apply"
    })
  },
  bk: function () {
    var that = this;
    that.data.show_bk = true;
    that.data.show_mycard = false;
    that.data.bk_checked_image = "https://img.ejiayou.com/experience_app_img/card_orange@2x.png";
    that.data.mycard_checked_image = "https://img.ejiayou.com/experience_app_img/mine_grey@2x.png";
    that.setData(that.data);
  },
  my: function () {
    var that = this;
    that.data.show_bk = false;
    that.data.show_mycard = true;
    that.data.bk_checked_image = "https://img.ejiayou.com/experience_app_img/card_grey@2x.png";
    that.data.mycard_checked_image = "https://img.ejiayou.com/experience_app_img/mine_orange@2x.png";
    that.setData(that.data);
  },

  //首页
  toIndex: function () {
    wx.showNavigationBarLoading();
    wx.hideLoading();
    var that = this;

    //获取用户数据
    wx.login({
      success: function (login_data) {
        app.login_data = login_data;
        app.checkSession(function () {
          wx.getUserInfo({
            success: function (user_info_data) {
              wx.request({
                method: "POST",
                url: app.server_api.get_user_info,
                data: {
                  encrypt_data: user_info_data.encryptedData,
                  code: app.login_data.code,
                  iv: user_info_data.iv
                },
                success: function (res) {
                  res = res.data;
                  app.app_data = res.data;

                  //获取用户数据
                  wx.request({
                    method: "POST",
                    url: app.server_api.get_app_data,
                    data: {
                      union_id: res.data.union_id
                    },
                    success: function (res) {
                      res = res.data.data;
                      wx.hideLoading();
                      wx.hideNavigationBarLoading();
                      //没有卡
                      if (res.status == 0) {
                        that.data.nocard = true;
                        that.data.audting = false;
                        that.data.success = false;
                      }
                      //审核中
                      if (res.status == 1) {
                        that.data.nocard = false;
                        that.data.audting = true;
                        that.data.success = false;
                      }
                      //审核通过
                      if (res.status == 2) {
                        that.data.nocard = false;
                        that.data.audting = false;
                        that.data.success = true;
                      }
                      that.setData(that.data);
                    }
                  })


                },
                fail: function (res) {
                  wx.showModal({
                    showCancel: false,
                    title: '错误',
                    content: "获取用户信息错误"
                  })
                }
              });

            }
          })
        });
      }
    });
  },
  //问卷调查
  goQuestionnaireActivity:function() {
    console.log('有进入问卷调查活动事件toActivity');
    var that = this;
    //获取登录信息
    wx.login({
      success: function (login_data) {
        console.log('login is' + JSON.stringify(login_data));
        app.login_data = login_data;
        that.data.check_login.hasLogin = true;
      }
    });

    wx.getUserInfo({//首先跟微信拿user_info_data,然后decryptedData跟后端获取用户完整信息
      success: function (user_info_data) {
        app.user_info_data = user_info_data;
        that.data.check_login.hasGetUserInfo = true;
      },
      fail: function (res) {
        wx.hideLoading();
        weApi.openSettingSuccess(function () {
          wx.getUserInfo({//首先跟微信拿user_info_data,然后decryptedData跟后端获取用户完整信息
            success: function (user_info_data) {
              app.user_info_data = user_info_data;
              that.data.check_login.hasGetUserInfo = true;
            },
          });
        });
      }
    })
    var _timer = setInterval(function () {
      if (that.data.check_login.hasLogin && that.data.check_login.hasGetUserInfo) {
        clearInterval(_timer);
        console.log('进入问卷调查成功');
        that.getQuestionnaire(that);
      }
    }, 10);
  },

  //进入红包活动
  toActivity_card: function () {
    console.log('有进入活动事件toActivity');

    var that = this;
    //获取登录信息
    wx.login({
      success: function (login_data) {
        console.log('login is' + JSON.stringify(login_data));
        app.login_data = login_data;
        that.data.check_login.hasLogin = true;
        that.setData(that.data);
      }
    });


    wx.getUserInfo({//首先跟微信拿user_info_data,然后decryptedData跟后端获取用户完整信息
      success: function (user_info_data) {
        app.user_info_data = user_info_data;

        that.data.check_login.hasGetUserInfo = true;
        that.setData(that.data);
      },
      fail: function (res) {
        wx.hideLoading();
        weApi.openSettingSuccess(function () {
          wx.getUserInfo({//首先跟微信拿user_info_data,然后decryptedData跟后端获取用户完整信息
            success: function (user_info_data) {
              app.user_info_data = user_info_data;
              that.data.check_login.hasGetUserInfo = true;
              that.setData(that.data);
            },
          });
        });
      }
    })

    var _timer = setInterval(function () {
      if (that.data.check_login.hasLogin && that.data.check_login.hasGetUserInfo) {
        clearInterval(_timer);
        console.log('进入initController条件成功');
        that.initController();
      }
    }, 10);
  },

  //初始化页面
  initController: function () {
    wx.showLoading({
      title: '加载中'
    })
    console.log('有进入initController事件');
    var that = this;
    app.decryptedData(function () {
      app.initView(function (res) {
        app.user_info_data.is_new = res.data.is_new;
        app.toast.is_repeat = res.data.is_repeat;
        app.user_info_data.user_id = res.data.user_id;
        app.user_info_data._k = res.data._k;
        app.toast.not_access = res.data.content;
        console.log('跳转页面之前 app.user_info_data=' + JSON.stringify(app.user_info_data));

        //输入手机号页面
        if (res.type == 1) {
          app.toast.old_user_not_access_msg = res.msg;
          wx.redirectTo({
            url: "../one_getCard/one_getCard"
          })
        }
        if (res.type == 2) {
          wx.redirectTo({
            url: "../one_cardReceived/one_cardReceived"
          })
        }
      });

    });
  },

  //进入输入油枪页面
  toActivity_card2: function () {
    console.log('有进入活动事件toActivity2');
    wx.redirectTo({
      url: '../two_inputPlatNum/two_inputPlatNum',
    })
  },
  //进入活动3
  toActivity_customerService: function () {
    console.log('有进入活动事件toActivity');
    var that = this;
    //获取登录信息
    wx.login({
      success: function (login_data) {
        console.log('login is' + JSON.stringify(login_data));
        app.login_data = login_data;
        that.data.check_login.hasLogin = true;
        that.setData(that.data);
      }
    });

    wx.getUserInfo({//首先跟微信拿user_info_data,然后decryptedData跟后端获取用户完整信息
      success: function (user_info_data) {
        app.user_info_data = user_info_data;
        console.log('success打印user_info_data,打印that.data.check_login.hasGetUserInfo=' + that.data.check_login.hasGetUserInfo);
        that.data.check_login.hasGetUserInfo = true;
        that.setData(that.data);
      },
      fail: function (res) {
        wx.hideLoading();
        weApi.openSettingSuccess(function () {
          wx.getUserInfo({//首先跟微信拿user_info_data,然后decryptedData跟后端获取用户完整信息
            success: function (user_info_data) {
              app.user_info_data = user_info_data;
              console.log('fail打印user_info_data');
              that.data.check_login.hasGetUserInfo = true;
              that.setData(that.data);
            },
          });
        });
      }
    })

    var _timer = setInterval(function () {
      if (that.data.check_login.hasLogin && that.data.check_login.hasGetUserInfo) {
        clearInterval(_timer);
        console.log('进入initController条件成功');
        that.initController3();
      }
    }, 10);
  },

  //活动3初始化页面
  initController3: function () {
    wx.showLoading({
      title: '加载中'
    })
    console.log('有进入initController事件');
    var that = this;
    app.decryptedData_3(function () {
      app.initView_3(function (res) {
        app.user_info_data.is_new = res.data.is_new;
        app.toast.is_repeat = res.data.is_repeat;
        app.user_info_data.user_id = res.data.user_id;
        app.user_info_data._k = res.data._k;
        app.toast.not_access = res.data.content;
        //埋点-进入页面人数 zXtCFA
        app.defaultActivity_3('zXtCFA');
        console.log('跳转页面之前 app.user_info_data=' + JSON.stringify(app.user_info_data));
        //输入手机号页面
        if (res.type == 1) {
          app.toast.old_user_not_access_msg = res.msg;
          wx.redirectTo({
            url: "../three_getCard/three_getCard"
          })
        }
        if (res.type == 2) {
          wx.redirectTo({
            url: "../three_cardReceived/three_cardReceived"
          })
        }
      });

    });
  },
  //获取问卷接口
  getQuestionnaire: function(that) {
    var that = that
    wx.request({
      method: 'POST',
      url: app.server_api_2.questionnaire_activity,
      data: {
        encrypt_data: app.user_info_data.encryptedData,
        code: app.login_data.code,
        iv: app.user_info_data.iv,
        push_id: app.push_id
      },
      success: function (res) {
        console.log("/activity/gift/service/mini_apps/comment_info/get");
        console.log(res);
        if (res && res.data.ret != 0) {
          app.showToast(res.data.msg, that, 2000);
          return;
        }
        app.questionnaire_data = res;
        app.questionnaire_data = res;
        app.user_info_data.union_id = res.data.data.union_id;
        app.user_info_data.open_id = res.data.data.open_id;
        if (undefined != res && res.data.data.type == 1 && res.data.ret == 0) {
          console.log('有进入问卷页面');
          wx.redirectTo({
            url: '../two_questionnaire/two_questionnaire',
          })
        }
        if (undefined != res && res.data.data.type == 2 && res.data.ret == 0) {
          console.log('有进入问卷页面结果');
          app.questionnaire_success_data = res
          wx.redirectTo({
            url: '../two_questionnaire_result/two_questionnaire_result',
          })
        }
      },
      fail: function () {
        wx.showLoading({
          title: '数据加载失败',
        })
      }
    })
  }
})