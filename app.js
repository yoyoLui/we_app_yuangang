var server = 'https://yifenshe.top';
//var server = 'https://dev.ejiayou.com';
App({
  login_data: null,
  user_info_data: {
    // city_id: 0,
    // is_show: 0,
    // is_repeat: 0
  },
  from_data: {
    // from_user_id: 0,
    // from_city_id: 0,
    from_source: -1,
    // channel_no: ''
  },
  group_data: {
    // open_gid: '',
  },
  check_login: {
    hasLogin: false,
    hasGetLocation: false,
    hasGetUserInfo: false
  },
  toast: {
    is_repeat: 0,
    not_access: ''
  },
  getPhoneNum: {
    is_auth: 0
  },
  formData: {
    formId: ''
  },
  SystemInfo: {},
  // server: server,
  onLaunch: function (option) {
    console.log('onlaunch option is ' + JSON.stringify(option));

    //
    // try {
    //   this.SystemInfo = wx.getSystemInfoSync()
    //   console.log(JSON.stringify(this.SystemInfo));
    //   //如果为6.5.2，return false
    //   if (this.util.compareVersion('6.5.2', this.SystemInfo.version)) {
    //     wx.showModal({
    //       title: '提示',
    //       content: '微信版本过低，请更新微信版本',
    //       showCancel: false
    //     })
    //     return;
    //   }
    // } catch (e) {
    //   // Do something when catch error
    // }
    var that = this;
    that.SystemInfo = wx.getSystemInfoSync();
    wx.showLoading({
      title: '加载中',
    })
  },
  onShow: function () { },
  onHide: function () { },
  onError: function (res) {
    console.log('app报错' + JSON.stringify(res));
  },
  //接口api
  server_api: (function (protocol) {
    return {
      defaultActivity: protocol + '/activity/experience/service/mini_apps/access_log/add',//埋点
      get_user_info: protocol + "/activity/experience/service/mini_apps/user_info/get",//获取用户信息
      get_mobile: protocol + "/activity/experience/service/mini_apps/mobile/get",//解密接口
      get_sms_code: protocol + "/activity/experience/service/mini_apps/verification_code/get",//获取验证码
      sms_code_check: protocol + "/activity/experience/service/mini_apps/verification_code/check",//校验验证码
      init_view: protocol + "/activity/experience/service/mini_apps/view/init",//判断进入页面
      receiveCard: protocol + "/activity/experience/service/mini_apps/user_one/receive",//领取优惠券
      receiveCard2: protocol + "/activity/experience/service/mini_apps/user_two/receive",//在输入手机号页面领取优惠券

      get_app_data: protocol + "/activity/experience_1/service/mini_apps/experience_app/serach",//获取首页信息
      create_app_data: protocol + "/activity/experience_1/service/mini_apps/experience_app/add",//提交申请资料
      behaviour: protocol + "/activity/default",//行为记录
    }
  })(server),
  server_api_2: (function (protocol) {
    return {
      applet_activity: protocol + '/activity/experience/service/mini_apps/applet_activity/add'
    }
  })(server),
  //工具类
  util: {
    //检查手机
    checkMobile: function checkMobile(phone) {
      if (!(/^1[0-9][0-9]\d{8}$/.test(phone))) {
        wx.showToast({
          title: "请输入正确的手机号",
          duration: 1000
        })
        return false;
      }
      return true;
    },

    //是否在数组内
    inArray: function (car_type, _arr) {
      var len = _arr.length;
      for (var i = 0; i < len; i++) {
        if (car_type == _arr[i]) {
          return true;
        }
      }
      return false;
    },
    //提示异常信息
    showErrorMsg: function (res) {
      wx.hideLoading();
      if (res.ret == undefined) {
        wx.showModal({
          title: '提示',
          content: '服务器错误',
          showCancel: false
        })
      } else {
        wx.showModal({
          title: '提示',
          content: res.msg,
          showCancel: false
        })
      }
    },

    //比较版本
    compareVersion: function (curV, reqV) {
      if (curV && reqV) {
        //将两个版本号拆成数字  
        var arr1 = curV.split('.'),
          arr2 = reqV.split('.');
        var minLength = Math.min(arr1.length, arr2.length),
          position = 0,
          diff = 0;
        //依次比较版本号每一位大小，当对比得出结果后跳出循环（后文有简单介绍）  
        while (position < minLength && ((diff = parseInt(arr1[position]) - parseInt(arr2[position])) == 0)) {
          position++;
        }
        diff = (diff != 0) ? diff : (arr1.length - arr2.length);
        //若curV大于reqV，则返回true  
        return diff > 0;
      } else {
        //输入为空  
        console.log("版本号不能为空");
        return false;
      }
    }
  },
  //检查登录code是否过期
  checkSession: function (fn) {
    var that = this;
    wx.checkSession({
      success: function () {
        //session 未过期，并且在本生命周期一直有效
        if (fn) {
          fn()
        }
      },
      fail: function () {
        //登录态过期
        wx.login({
          success: function (login_data) {
            that.login_data.code = login_data.code;
            if (fn) {
              fn();
            }
          }
        });
      }
    })
  },

  //获取验证码
  getSmsCode: function (mobile, fn) {
    var that = this;
    wx.request({
      method: "POST",
      url: that.server_api.get_sms_code,
      data: {
        mobile: mobile,
        open_gid: that.group_data.open_gid,
        city_id: that.user_info_data.city_id
      },
      success: function (res) {
        wx.hideLoading();
        res = res.data;
        if (res.ret == 0) {
          wx.showToast({
            title: '获取验证码成功',
            icon: 'success',
            duration: 1000
          })
        } else {
          that.util.showErrorMsg(res);
        }
        if (fn) {
          fn(res)
        }
      },
      fail: function (res) {
        console.log('验证码失败');
        console.log(res);
        wx.showModal({
          title: '提示',
          content: res,
          showCancel: false
        })
      }
    })
  },

  //校验验证码
  checkSmsCode: function (mobile, sms_code, fn) {
    var that = this;
    wx.showLoading({
      title: '验证中',
    })
    wx.request({
      method: "POST",
      url: that.server_api.sms_code_check,
      data: {
        mobile: mobile,
        sms_code: sms_code,
        open_gid: that.group_data.open_gid,
        city_id: that.user_info_data.city_id
      },
      success: function (res) {
        console.log('校验验证码成功返回:');
        console.log(res);
        res = res.data;
        wx.hideLoading();
        if (fn) {
          fn(res)
        }
        if (res.ret != 0) {
          wx.showToast({
            title: "验证码错误",
            image: '',
            duration: 1000
          })
        }

      },
      fail: function (res) {
        console.log('校验验证码失败');
        console.log(res);
      }
    })
  },

  //埋点
  defaultActivity: function (channel_no) {
    var that = this;
    console.log('掉起埋点 channel_no is ' + channel_no + "," + that.server_api.defaultActivity);
    wx.request({
      method: "GET",
      url: that.server_api.defaultActivity,
      data: {
        channel_no: channel_no,
        openid: that.user_info_data.union_id,
      },
      success: function (res) {
        console.log('埋点成功 ');
      },
      fail: function (res) {
        console.log('埋点失败' + JSON.stringify(res));
      }
    })
  },
  //************************************小程序分割线*************************************** */

  //根据encryptedData、code获取用户账号信息
  decryptedData: function (fn) {
    console.log('进入解密接口');
    var that = this;
    wx.getStorage({
      key: 'user_info_data',
      success: function (res) {
        if (res) {
          console.log('getStorage=' + JSON.stringify(res));
          that.user_info_data.user_id = res.data.user_id;
          that.user_info_data.union_id = res.data.union_id;
          that.user_info_data.open_id = res.data.open_id;
          that.user_info_data.mobile = res.data.mobile;
          if (fn) {
            fn();
          }
        }
      },
      fail: function (failRes) {
        //首次进入请求数据
        wx.request({
          method: "POST",
          url: that.server_api.get_user_info,
          data: {
            encrypt_data: that.user_info_data.encryptedData,
            code: that.login_data.code,
            iv: that.user_info_data.iv,
          },
          success: function (res) {
            res = res.data;
            console.log('没有拿到storage，重新请求，解密出的信息' + JSON.stringify(res));
            //正常
            if (res.ret == 0) {
              that.user_info_data.user_id = res.data.user_id;
              that.user_info_data.union_id = res.data.union_id;
              that.user_info_data.open_id = res.data.open_id;
              that.user_info_data.mobile = res.data.mobile;
              wx.setStorage({
                key: "user_info_data",
                data: res.data,
                complete: function () {
                  if (fn) {
                    fn();
                  }
                }
              })

            } else {
              that.util.showErrorMsg(res);
            }
          },
          fail: function (res) {
            console.log('获取用户信息错误');
            console.log(res);
          }
        });
      }
    })

  },
  //解密手机
  decryptedData_getMobile: function (fn) {
    var that = this;
    wx.request({
      method: "POST",
      url: that.server_api.get_mobile,
      data: {
        encrypt_data: that.user_info_data.encryptedData,
        code: that.login_data.code,
        iv: that.user_info_data.iv,
      },
      success: function (res) {
        res = res.data;
        if (res.ret == 0) {
          console.log('解密手机号 res=' + JSON.stringify(res));
          that.user_info_data.mobile = res.data.mobile;
          that.user_info_data._k = res.data._k;
          that.getPhoneNum.is_auth = 1;
          //更新缓存
          wx.getStorage({
            key: 'user_info_data',
            success: function (stg_data) {
              var stg;
              stg = stg_data.data;
              if (res.data.mobile) {
                stg.mobile = res.data.mobile;
              }
              wx.setStorage({
                key: 'user_info_data',
                data: stg,
                complete: function () {
                  if (fn) {
                    fn(res);
                  }
                }
              })
            },
            fail: function () {
              if (fn) {
                fn(res);
              }
            }
          })
        } else {//解密失败
          that.getPhoneNum.is_auth = 0;
          if (fn) {
            fn(res);
          }
        }
      },
      fail: function (res) {
        console.log('解密手机号错误');
        console.log(JSON.stringify(res));
        that.getPhoneNum.is_auth = 0;
        if (fn) {
          fn();
        }
      }
    });
  },
  //从缓存拿数据
  getStorage_user_info_data: function (fn) {
    var options;
    wx.getStorage({
      key: 'user_info_data',
      success: function (res) {
        options = res.data;
        if (fn) {
          fn(options);
        }
      },
      fail: function () {//缓存中没有数据
        options = {
          user_id: that.user_info_data.user_id,
          open_id: that.user_info_data.open_id,
          union_id: that.user_info_data.union_id,
          mobile: that.user_info_data.mobile,
        };
        if (fn) {
          fn(options);
        }
      }
    })
  },
  //判断进入哪个页面
  initView: function (fn) {
    var that = this;
    console.log('进入初始化页面接口 url=' + JSON.stringify(that.server_api.init_view));
    that.getStorage_user_info_data(function (options) {
      console.log('初始化页面的接口，options=' + JSON.stringify(options));
      wx.request({
        method: "POST",
        url: that.server_api.init_view,
        data: options,
        success: function (res) {
          console.log('初始返回res=' + JSON.stringify(res.data));
          res = res.data;
          //在跳转页面的时候，user_info_data.mobile会丢失，所以这里从缓存里面重新再拿一次
          wx.getStorage({
            key: 'user_info_data',
            success: function (stg_data) {
              if (stg_data) {
                console.log('getStorage=' + JSON.stringify(stg_data.data));
                that.user_info_data.user_id = stg_data.data.user_id;
                that.user_info_data.union_id = stg_data.data.union_id;
                that.user_info_data.open_id = stg_data.data.open_id;
                that.user_info_data.mobile = stg_data.data.mobile;
              }
            },
            complete: function () {
              if (res.ret == 0) {
                if (fn) {
                  fn(res);
                }
              } else {
                that.util.showErrorMsg(res);
              }
            }
          })
        },
        fail: function (res) {
          console.log('初始化页面接口失败');
          console.log(res);
        }
      });
    });
  },

  //领卡的接口
  receiveCard: function (fn) {
    wx.showLoading({
      title: '领取中',
    })
    var that = this;
    var options = {
      user_id: that.user_info_data.user_id,
      open_id: that.user_info_data.open_id,
      union_id: that.user_info_data.union_id,
      mobile: that.user_info_data.mobile,
      _k: that.user_info_data._k,
      nick_name: that.user_info_data.userInfo.nickName,
      avatar_url: that.user_info_data.userInfo.avatarUrl,
      form_id: that.formData.formId
    };
    console.log('进入领卡的接口，options=' + JSON.stringify(options));
    wx.request({
      method: "POST",
      url: that.server_api.receiveCard,
      data: options,
      success: function (res) {
        res = res.data;
        console.log('领卡返回res=' + JSON.stringify(res));
        if (fn) {
          fn(res);
        }

      },
      fail: function (res) {
        wx.hideLoading();
        console.log('领卡接口失败');
        console.log(res);
        if (fn) {
          fn(res);
        }
      }
    });
  },
  //领卡的接口2
  receiveCard2: function (code, fn) {
    wx.showLoading({
      title: '领取中',
    })
    var that = this;
    var options = {
      user_id: that.user_info_data.user_id,
      open_id: that.user_info_data.open_id,
      union_id: that.user_info_data.union_id,
      mobile: that.user_info_data.mobile,
      _k: that.user_info_data._k,
      nick_name: that.user_info_data.userInfo.nickName,
      avatar_url: that.user_info_data.userInfo.avatarUrl,
      form_id: that.formData.formId,
      is_auth: that.getPhoneNum.is_auth,
      sms_code: code
    };
    console.log('进入领卡2的接口，options=' + JSON.stringify(options));
    wx.request({
      method: "POST",
      url: that.server_api.receiveCard2,
      data: options,
      success: function (res) {
        res = res.data;
        console.log('领卡返回res=' + JSON.stringify(res));
        //更新缓存中的mobile
        wx.getStorage({
          key: 'user_info_data',
          success: function (stg_data) {
            var stg;
            stg = stg_data.data;
            if (that.user_info_data.mobile) {
              stg.mobile = that.user_info_data.mobile;//重置缓存中的手机号
            }
            wx.setStorage({
              key: 'user_info_data',
              data: stg,
              complete: function () {
                if (res.ret == 0) {
                  if (fn) {
                    fn(res);
                  }
                } else {
                  that.util.showErrorMsg(res);

                }
              }
            })
          },
          fail: function () {
            if (fn) {
              fn(res);
            }
          }
        })
      },
      fail: function (res) {
        console.log('领卡接口2失败');
        console.log(res);
      }
    });
  },

  //自定义toast  
  showToast: function (text, o, count) {
    text = String(text);
    // text = text.replace("\"", "").replace("\"", "").replace("\'", "").replace("\'", "");
    var _this = o; count = parseInt(count) ? parseInt(count) : 3000;
    _this.setData({ toastText: text, isShowToast: true, });
    setTimeout(function () {
      _this.setData({ isShowToast: false });
    }, count);
  }

})

