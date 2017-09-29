// pages/two_questionnaire_success/two_questionnaire_success.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideLoading();
  },
  submit:function() {
    console.log("我知道了");

    wx.showLoading({
      title: '加载中',
    })

    wx.reLaunch({
      url: '../two_questionnaire_result/two_questionnaire_result',
    })
  }
})