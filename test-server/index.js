const net = require("net");
const { deviceList, openLighting } = require("./mock.js");
const PORT = require("../PORT.js")


const server = net.createServer((socket) => {
  socket.setEncoding('utf8');

  socket.on("data", (data) => {
    deviceList.id = 0;
    console.log(`server accept data is ${data}`);
    const dataObj = JSON.parse(data);
    console.log("dataObj=================", dataObj);
    if (dataObj.route == "Device.list") {
      deviceList.id = dataObj.id;
      let data =JSON.stringify(deviceList) ;
      console.log("server send data is :",data)
      socket.write(data);
    } else if(dataObj.route == "Device.control") {
      openLighting.id = dataObj.id;
      socket.write(JSON.stringify(openLighting));
    }
  });
  socket.on("close", () => {
    console.log("Server: connection is closed!");
  });
});
server.on( "listening", (e) =>  {
  console.error("error is :",e)
} )  
server.listen(PORT.testServerport, "localhost", () => {
  console.log("Server is ready! port is :" ,PORT.testServerport);
});
