//app.js

// mqtt sha1
const mqtt = require("./utils/mqtt")
const crypto = require("./utils/hex_hmac_sha1")

// 域名
const host = "wxs://productKey.iot-as-mqtt.cn-shanghai.aliyuncs.com";
// 设备身份三元组 + 区域
const deviceConfig = {
  productKey: "a1bjOQPBECS",
  deviceName: "Server",
  deviceSecret: "11822c7a95a1c7f08e0caa31e99ee08e",
  regionId: "cn-shanghai"
};

// 连接参数初始化
function initMqttOptions(deviceConfig) {
  const params = {
    productKey: deviceConfig.productKey,
    deviceName: deviceConfig.deviceName,
    timestamp: Date.now(),
    clientId: Math.random().toString(36).substr(2),
  }
  //CONNECT参数
  const options = {
    keepalive: 60, //60s
    clean: true, //cleanSession不保持持久会话
    protocolVersion: 4 //MQTT v3.1.1
  }
  //1.生成clientId，username，password
  options.password = signHmacSha1(params, deviceConfig.deviceSecret);
  options.clientId = `${params.clientId}|securemode=2,signmethod=hmacsha1,timestamp=${params.timestamp}|`;
  options.username = `${params.deviceName}&${params.productKey}`;

  return options;
};

// 生成基于HmacSha1的password
function signHmacSha1(params, deviceSecret) {
  let keys = Object.keys(params).sort();
  // 按字典序排序
  keys = keys.sort();
  const list = [];
  keys.map((key) => {
    list.push(`${key}${params[key]}`);
  });
  const contentStr = list.join('');
  return crypto.hex_hmac_sha1(deviceSecret, contentStr);
}

App({
  globalData: {
    client: mqtt.connect(host, initMqttOptions(deviceConfig))
  }
})