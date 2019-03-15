//index.js
const app = getApp()

Page({
  data: {
    //当前角度
    angle: '--',
    //当前图像坐标
    directions: [0, 0, 0, 0, 0],
    //当前地理位置信息
    nowLatitude: '未知',
    nowLongitude: '未知',
    nowAltitude: '未知',
    nowSpeed: '未知'
  },

  //生成指南针
  createCompass: function (direction) {
    //指南针中心点坐标
    var center_x = 150
    var center_y = 150

    // 获取指南针HTML对象
    var context = wx.createCanvasContext('compass')

    //根据角度旋转图片坐标
    context.translate(center_x, center_y);
    context.rotate(-direction / 180 * Math.PI);
    context.translate(-center_x, -center_y);
    //描画指南针表盘
    context.drawImage('../../images/compass.png', 0, 0, center_x * 2, center_y * 2)

    //恢复坐标系
    context.translate(center_x, center_y);
    context.rotate(direction / 180 * Math.PI);
    context.translate(-center_x, -center_y);

    //描画指针
    context.beginPath()
    context.setLineWidth(1)
    context.setStrokeStyle('black')
    context.lineTo(140, 112)
    context.lineTo(150, 60)
    context.lineTo(160, 112)
    context.closePath()
    context.stroke()

    context.draw()
  },

  

  //事件处理函数
  onLoad: function () {
    var that = this;
    //获取当前用户位置信息函数
    function getNowUserLocation(){
      wx.getLocation({
        altitude: 'true',
        success: function (res) {
          //获取当前经纬度
          const nowLatitude = res.latitude.toFixed(3) + '°'
          const nowLongitude = res.longitude.toFixed(3) + '°'
          //获取当前高度
          const nowAltitude = res.altitude
          //获取当前速度
          const nowSpeed = res.speed

          that.setData({ nowLatitude: nowLatitude })
          that.setData({ nowLongitude: nowLongitude })
          that.setData({ nowAltitude: nowAltitude })
          that.setData({ nowSpeed: nowSpeed })
        },
      });
    }

    wx.onCompassChange(function (res) {

      //在数组尾部添加新数据
      that.data.directions.push(res.direction);
      if (that.data.directions.length > 5) {
        //从数组头部删除一个数据
        that.data.directions.shift();
      }
      //数组元素求和
      var total = that.data.directions.reduce(function (prev, v) { return prev + v })
      //求平均值
      var average = total / that.data.directions.length

      that.createCompass(average);
      //保留1位小数
      var direction = average.toFixed(1) + '°';
      //获取当前位置信息
      that.setData({ angle: direction });
    });

    //获取用户授权信息
    wx.getSetting({
      success(res) {
        //如果用户未授权获取地理位置信息，则提示授权
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              //监听用户加速度变化
              wx.onAccelerometerChange(function(res){
                getNowUserLocation()
              })
            }
          })
        }
        //如果用户已授权，则执行获取位置信息
        else {
          wx.onAccelerometerChange(function(res){
            getNowUserLocation()
          })
        }
      }
    })
  }
})