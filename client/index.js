const HOST = "localhost";
const PORT = "3800";
var net = require("net");
class TrainingBox {
  deviceList = [];
  connectionStatus = false;
  onDeviceChangeList = {};
  constructor() {
    this.connection = new TrainingBoxConnection();
    this.connection.eventCallback = this.__eventCallback__;
  }
  __getDeviceList__(successFN, failFN) {
    let getResponse = (data) => {
      try {
        this.deviceList = JSON.parse(data).data;
        this.deviceList.forEach((item) => {
          this[item.name] = new TainingBoxSubplate(
            item.name,
            item.type,
            item.detailsInfo,
            item.inputType,
            item.outputType,
            item.controlRange
          );
          this[item.name].controlMes = (
            senMSG,
            controlResponse,
            controlFailFN
          ) => {
            this.connection.send(
              "Device.control",
              senMSG,
              controlResponse,
              controlFailFN
            );
          };
        });
        successFN();
      } catch (error) {
        failFN(error);
        console.error("deviceList init error:", error);
      }
    };
    let getDeviceListFailFN = (e) => {
      failFN(e);
      console.error("deviceList init error:", e);
    };
    this.connection.send("Device.list", "{}", getResponse, getDeviceListFailFN);
  }
  init() {
    this.__getDeviceList__(
      () => {},
      () => {}
    );
  }
  getDeviceList() {
    return this.deviceList.map((item) => {
      return item.name;
    });
  }
  __eventCallback__(data) {
    let dataObje = JSON.parse(data);
    if ((dataObje.route = "Device.removeDevice")) {
      if (this[data.name]) delete this[data.name];
      if (this.onDeviceChangeList[data.name]) {
        this.onDeviceChangeList[data.name][1]();
      }
    }
    if ((dataObje.route = "Device.addDevice")) {
      this[dataObje.data.name] = new TainingBoxSubplate(
        item.name,
        item.type,
        item.detailsInfo,
        item.inputType,
        item.outputType,
        item.controlRange
      );
      this[item.name].controlMes = (senMSG, controlResponse, controlFailFN) => {
        this.connection.send(
          "Device.control",
          senMSG,
          controlResponse,
          controlFailFN
        );
      };
      if (this.onDeviceChangeList[data.name]) {
        this.onDeviceChangeList[data.name][0](dataObje.data);
      }
    }

    if ((dataObje.route = "Device.deviceChange")) {
      this.onDeviceChangeList[data.name][2](dataObje.data.value);
    }
  }
  getDeviceByName(name) {
    if (!name || !this[name]) {
      return false;
    }
    return this[name];
  }
  onDeviceChangeByName(name, addcb, rmcb, changecb) {
    this.onDeviceChangeList[name] = [addcb, rmcb, changecb];
  }
}

//连接类
class TrainingBoxConnection {
  isConnect = false;
  requestId = 0;
  requestList = {};
  eventCallback = undefined;
  constructor() {
    this.client = net.createConnection(PORT, HOST);
    this.client.on("error", (e) => {
      console.error("tcp连接错误：", e);
    });
    this.client.on("close", (_) => {
      console.error("tcp连接close：", e);
      this.isConnect = false;
    });
    this.client.on("connect", (_) => {
      this.isConnect = true;
    });
    this.client.on("data", (data) => {
      try {
        let dataObj = JSON.parse(data);
        if (this.requestList[dataObj.id]) {
          this.requestList[dataObj.id](data);
        }
        if (this.eventCallback) {
          this.eventCallback(data);
        }
      } catch (e) {
        console.error("解析服务端数据出错： ", e);
      }
    });
  }
  setEventCallBack(FN) {
    this.eventCallback = FN;
  }
  send(route, sendMessage, resposeCB, failFN) {
    new Promise((req, res) => {
      let requstId = this.requestId++;
      let overTimeId = setTimeout((_) => {
        failFN("request overTime!");
        res(false);
        delete this.requestList[requstId];
      }, 5000);
      let successFN = (data) => {
        req(true);
        resposeCB(data);
        clearTimeout(overTimeId);
      };

      let message = {
        type: "method",
        id: requstId,
        route: route,
        code: 200,
        data: sendMessage,
      };
      this.client.write(JSON.stringify(message), (e) => {
        if (e) failFN(e);
      });
      this.requestList[requstId] = successFN;
    }).catch((e) => {
      console.error("eeeeeeeeeeeee=", e);
    });
  }
}

//子板类
class TainingBoxSubplate {
  constructor(
    name,
    type,
    detailsInfo,
    inputType = undefined,
    outputType = undefined,
    controlRange = undefined
  ) {
    this.name = name;
    this.type = type;
    this.detailsInfo = detailsInfo;
    this.inputType = inputType;
    this.outputType = outputType;
    this.controlRange = controlRange;
  }
  Type = ["输入板子", "输出板子", "输入输出混合板子"];
  IOType = ["无输入", "bool", "int", "string"];
  controlMes = undefined;

  getDeviceInfo() {
    let result = {};
    result["name"] = this.name;
    result["type"] = this.Type[this.type];
    result["detailsInfo"] = this.detailsInfo;
    result["inputType"] = this.IOType[this.inputType];
    result["outputType"] = this.IOType[this.outputType];
    if (this.type == 1) {
      if (this.controlRange.length == 2) {
        result[
          "controlRange"
        ] = `输入范围为${this.controlRange[0]} - ${this.controlRange[1]}`;
      } else {
        result["controlRange"] = `输入取值可以是： `;
        this.controlRange.forEach((i) => {
          result["controlRange"] + i + ",";
        });
      }
    } else {
      result["controlRange"] = "无输入";
    }
  }
  deviceControl(value, responseFN, failFN) {
    if (this.type === 1) {
      console.error("输入类型子板不能控制");
      return;
    }
    let data = { name: this.name, outputType: this.outputType, value: value };
    this.ControlMes(data, responseFN, failFN);
  }
}

module.exports = new TrainingBox();