const { createConnection } = require("net");

module.exports = class TCPClient {
  OnDataCB = undefined;
  constructor(port , host ) {
    console.log("tcpClient connect port is :", port);
    this.isConnection = false;
    this.client = createConnection(port, host).on("reconnect", (_) => {
      this.isConnection = true;
    });
    this.client.on("data", (data) => {
      console.log("tcpClient forward accept data:", data.toString());
      if (this.OnDataCB) this.OnDataCB(data.toString());
    });
    this.client.on("error",e=>{
      console.error("tcp cliend error",e);  //tcpClient connection error
    })
  }
  onConnect(cb) {
    if (this.client)
      this.client.on("connect", () => {
        cb();
        this.isConnection = true;
      });
  }
  setOnDataCB(cb) {
    this.OnDataCB = cb;
  }
  onClose(cb) {
    if (this.client)
      this.client.on("close", () => {
        cb();
        this.isConnection = true;
      });
  }
  close() {
    if (this.client) {
      this.client.end();
      this.isConnection = true;
    }
  }
  send(data) {
    console.log("tcpClient forward send data:", data);
    if (this.client) this.client.write(data);
  }
  getConnectStatus() {
    return this.isConnection;
  }
};
