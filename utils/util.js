function formatTime(date) {
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

module.exports = {
  formatTime: formatTime,
  showToast: showToast
}
