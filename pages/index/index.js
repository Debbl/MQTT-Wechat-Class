//index.js
//获取应用实例
const app = getApp();
const mqtt = require("../../utils/mqtt.min.js");
const util = require("../../utils/util");
var client // 连接
Page({
  data: {
    status: "未连接",
    time: null,
    imgUrl: "../../images/run.png", // 当前设备运行状态图片地址
    run: 0,
    runtext: "扫码上课"
  },

  // 页面加载时执行
  onLoad: function () {
    var that = this;
    console.log("页面加载完成");
    client = app.globalData.client;
    // 时间
    setInterval(() => {
      var date = util.formatTime(new Date());
      this.setData({
        time: date
      })
    }, 1000);
    // 设备连接
    client.on("connect", ()=> {
      console.log("设备连接成功");
      this.setData({
        status: "已连接"
      })
    });
    // 消息
    client.on("message", (topic, payload)=> {
      console.log("有消息")
      console.log(topic + " : " + payload);
      // 设备状态
      if (topic == "/a1bjOQPBECS/Server/user/status") {
        var status = JSON.parse(payload.toString()).status;
        if (status == 1) {
          that.setData({
            imgUrl: "../../images/pause.png",
            run: 1,
            runtext: "正在上课"
          })
        } else if (status == 0) {
          that.setData({
            imgUrl: "../../images/run.png",
            run: 0,
            runtext: "扫码上课"
          })
        }
      }
    })
    // 断开连接
    client.on("disconnect", ()=> {
      this.setData({
        status: "未连接"
      })
    })
  },
  scan2class () {
    var that = this;
    if (this.data.run == 0){
      wx.scanCode({
        onlyFromCamera: true,
        success(res) {
          console.log("扫码结果：" + res.result);
          that.statusPublish(res.result);
        }
      })
    } else if (this.data.run == 1) {
      that.statusPublish(0);
    }
  },
  // 数据上传 设备状态信息
  statusPublish (e) {
    console.log("上传设备状态数据")
    var topic = "/a1bjOQPBECS/Server/user/status";
    var status = {
      "status": e
    };
    status = JSON.stringify(status);
    client.publish(topic, status);
  },
  // test () {
  //   console.log("ok");
  //   var topic = "/a1bjOQPBECS/Server/user/status";
  //   var status = {
  //     "status": 1
  //   };
  //   status = JSON.stringify(status);
  //   client.publish(topic, status);
  // }
  // test () {
  //   this.setData({
  //     imgUrl: "../../images/pause.png"
  //   }) 
  // }
  // test() {
  //   console.log("ok");
  //   var that = this;
  //   this.data.client = app.globalData.client;
  //   this.data.client.on('connect', function () {
  //     console.log("连接成功！");
  //   });
  //   this.data.client.on("message", (topic, payload)=> {
  //     console.log("有消息")
  //     console.log(topic);
  //     console.log(payload.toString());
  //   });
  // }
})
