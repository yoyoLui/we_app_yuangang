// one_cardReceived.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isSuccess_notRepeat: true,
  },
 
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log('app.toast.is_repeat=' + JSON.stringify(app.toast.is_repeat));
    if (app.toast.is_repeat  == 1) {//老用户
      that.setData({
        isSuccess_notRepeat: false
      });
    }
    if (app.toast.is_repeat  == 0) {//新用户
      that.setData({
        isSuccess_notRepeat: true
      });
    };
 
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
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //隐藏转发按钮
    wx.hideShareMenu()
    wx.hideLoading();
    wx.hideNavigationBarLoading();
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