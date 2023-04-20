var ws = require("nodejs-websocket");
module.exports = class websocketServer {
  isConnect = false;
  textCB = undefined;
  constructor(port ) {
    this.server = ws
      .createServer((socket) => {
        this.socket = socket;

        socket.on("text", (data) => {
          console.log("websocket forward accept data:", data);
          this.textCB(data);
        });
      })
      .listen(port, () => {
        console.log("服务已经开启");
        this.isConnect = true;
      }).on("error",err=>{
        console.error("websocketServer.js is error :",err)
      });

    this.server.on("connection", (stream) => {
      console.log("someone connected!");
    });
  }
  setOnDataCB(cb) {
    this.textCB = cb;
  }
  send(data) {
    console.log("websocket forward send data:", data);
    if (this.socket) this.socket.sendText(data);
  }
  onclose(cb) {
    if (this.socket)
      this.socket.on("close", (_) => {
        cb();
        this.isConnect = false;
      });
  }
  onError(cb) {
    if (this.socket)
      this.socket.on("error", (_) => {
        cb();
        this.isConnect = false;
      });
  }
  getConnectStatus() {
    return this.isConnect;
  }
};
