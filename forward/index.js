const TCPClient = require("./tcpClient");
const websocketServer = require("./websocketServer");
const PORT = require("../PORT.js")
class Forward {
  constructor() {
    this.TCPClient = new TCPClient(PORT.testServerport);
    this.websocketServer = new websocketServer(PORT.websocketPort);
  }
  init() {
    this.handleWebsocketConnect();
    this.handleTCPClientConnect();
  }
  handleWebsocketConnect() {
    this.websocketServer.setOnDataCB((data) => {
      console.log("websocketServer accept data is :", data);
      if (this.TCPClient.getConnectStatus) {
        this.TCPClient.send(data);
      } else {
        try {
          let obj = JSON.parse(data);
          obj.code = 500;
          this.websocketServer.send(JSON.stringify(obj));
        } catch (error) {
          console.error("handleWebsocketConnect throw error is", error);
        }
      }
    });
  }
  handleTCPClientConnect() {
    this.TCPClient.setOnDataCB((data) => {
      console.log("TCPClient accept data is :", data);
      if (this.websocketServer.getConnectStatus) {
        this.websocketServer.send(data);
      } else {
        try {
          let obj = JSON.parse(data);
          obj.code = 500;
          this.TCPClient.send(JSON.stringify(obj));
        } catch (error) {
          console.error("handleWebsocketConnect throw error is", error);
        }
      }
    });
  }
}
let forward = new Forward();
forward.init();
