// pages/two_questionnaire_result/two_questionnaire_result.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    results: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...',
    })
    var that = this
    wx.hideLoading();
    var data = app.questionnaire_success_data;
    var array = data.data.data.list;
    if(undefined != array && array.length > 0) {
      for (var i = 0; i < array.length;i++) {
        var imgUrl = array[i].img_url;
        if (imgUrl) {
          array[i].showImage = true
        } else {
          array[i].showImage = false
        }
      }
    }
    console.log(data)
    that.setData({
      results: array
    })
    wx.hideLoading()
  }
})