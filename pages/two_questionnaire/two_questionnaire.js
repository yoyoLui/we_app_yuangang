// pages/two_questionnaire/two_questionnaire.js
//每一题的小题的id
var itemId;
//输入的其他意见
var inputText,inputId;
//记录选择了几个
var tempCount;
//临时数组（用来存储json）
var tempArr = [];
//选择题数据集合，输入数据集合
var array1 = [], array2 = [];
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    disabled:'false',
    inputEnable: false,
    isShow:false,
    // 选择数据源
    model:[],
    // 其他想说的数据源
    modelInput:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //埋点 点击消息进入问券 
    app.defaultActivity_3('eriXo0');
    wx.showLoading({
      title: '加载中...',
    })
    // 进入该页面就清除缓存
    array1 = [];
    array2 = [];
    wx.clearStorageSync();
    tempCount = 0;
    //获取数据
    var data = app.questionnaire_data;
    console.log(data);
    var array = data.data.data.list;
    console.log(array)
    for(var i = 0;i< array.length;i++) {
      //选择题
      if (array[i].item_type == 1) {
        array1 = array1.concat(array[i]);
      }
      //其他输入
      if (array[i].item_type == 2) {
        array2 = array2.concat(array[i]);
      }
    }
    if(undefined != array2 && array2.length > 0) {
      this.setData({
        isShow:true
      })
    } else {
      this.setData({
        isShow: false
      })
    }
    this.setData({
      model: array1,
      modelInput: array2
    })
    wx.hideLoading();
  },
  //每次点击都是先触发selectItemClick，再触发selectClick，所有在selectClick处理
  selectItemClick:function(event) {
    //防止点击选择，键盘弹起来
    this.setData({
      inputEnable: false
    })
    //每一题的小题的id
    itemId = event.currentTarget.id
  },
  selectClick: function (event) {
    //每一大题id
    var id = event.currentTarget.id;
    for(var i = 0;i < this.data.model.length;i++) {
      if(i == id) {
        var commet_title = this.data.model[i].commet_title;
        var items = this.data.model[i].items;
        for (var j = 0; j < items.length; j++) {
          if (j == itemId) {
            //存储到本地
            var quest = items[itemId].content;
            var title_id = this.data.model[id].id;
            var item_id = items[itemId].id;
            console.log(id + "==" + itemId + "==" + commet_title + "===" + quest);
            wx.setStorageSync("questionnaire" + id,quest);
            var tempData = {
              commet_title: commet_title,
              item_content: quest,
              title_id: title_id,
              item_id: item_id
            }
            for (var x = 0; x < tempArr.length; x++) {
              var tempId = tempArr[x].title_id;
              if (tempId == title_id) {
                tempArr.splice(x,1);
              }
            }
            tempArr.push(tempData);
            console.log(tempArr);
            this.data.model[i].items[j].selectImage = true;
            this.checkBtnState(array1.length);
          } else {
            this.data.model[i].items[j].selectImage = false;
          }
        }
      }
    }
    this.setData(this.data);
  },
  selectItemInputClick:function(event) {
    inputId = event.currentTarget.id;
    console.log(inputId);
  },
  //点击获取焦点
  clickInput:function() {
    this.setData({
      inputEnable: true
    })
  },
  otherInput:function (e) {
    inputText = e.detail.value;
    console.log(inputText);
  },
  submit: function() {
    var _self = this;
    console.log("提交");
    wx.showLoading({
      title: '加载中',
    })
    _self.submitQuestions(_self);
  },

  // 检查按钮的状态
  checkBtnState:function(count) {
    var that = this;
    for(var i = 0;i<count;i++) {
  var txt = wx.getStorageSync("questionnaire" + i);
  if (!txt) {
    tempCount += 1
  }
}
if (tempCount == 0) {
  that.setData({
    disabled: ""
  })
} else {
  that.setData({
    disabled: "false"
  })
}
// 重置
tempCount = 0;
},

//提交
submitQuestions : function(that) {
  console.log("进入submitQuestions");
  var _self = that;
  if (!inputText && array2.length == 1) {
    var tempData = {
      commet_title: array2[0].commet_title,
      item_content: "",
      title_id: array2[0].id,
      item_id: 0
    }
  } else {
    var tempData = {
      commet_title: array2[0].commet_title,
      item_content: inputText,
      title_id: array2[0].id,
      item_id: 0
    }
  }
  tempArr.push(tempData);
  console.log(tempArr)
  var json = JSON.stringify(tempArr);
  console.log(json);
  wx.request({
    method:"POST",
    url: app.server_api_2.questionnaire_activity_submit,
    data:{
      union_id:app.user_info_data.union_id,
      open_id: app.user_info_data.open_id,
      push_id: app.push_id,
      comments: json
    },
    success:function(res) {
      //埋点 易站礼品评论提交问券 
      app.defaultActivity_3('CSQf6Z');
      console.log(res)
      wx.hideLoading()
      app.questionnaire_success_data = res;
      wx.reLaunch({
        url: '../two_questionnaire_success/two_questionnaire_success',
      })
    },
    fail:function(res) {
      console.log(res)
      app.showToast(res.data.msg, _self, 2000);
      wx.hideLoading()
    }
  })
}
})
