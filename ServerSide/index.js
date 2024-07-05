const {createServer} = require('http');
const {Server} = require('socket.io');

const httpServer = createServer();
const io = new Server(httpServer,{
 cors:"",
});
io.on('connection',(socket)=>{
    console.log("socket is connected");
});
httpServer.listen(8080,()=>{
    console.log("Server is connected");
})