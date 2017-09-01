//获取最新时间，例如2017/11/04 11:02:30
function formatTime(date) {
  if (!date) {
    date = new Date();
  }
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//自定义toast  
function showToast(text, o, count) {
  text = text.replace("\"", "").replace("\"", "").replace("\'", "").replace("\'", "");
  var _this = o; count = parseInt(count) ? parseInt(count) : 3000;
  _this.setData({ toastText: text, isShowToast: true, });
  setTimeout(function () {
    _this.setData({ isShowToast: false });
  }, count);
}

//错误提示消息
function showErrorMsg(res){
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
}

/* 
 * 版本号比较方法 
 * 传入两个字符串，当前版本号：curV；比较版本号：reqV 
 * 调用方法举例：compare("1.1","1.2")，将返回false 
 */
function compareVersion(curV, reqV) {
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
module.exports = {
  formatTime: formatTime,       //获取最新时间
  showToast: showToast,         //自定义toast
  showErrorMsg: showErrorMsg,
  compareVersion: compareVersion
}
