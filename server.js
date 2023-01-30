const path = require('path')
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utlis/messages')
const {getUser,UserJoin,userLeave,getRoomUsers} = require('./utlis/users')
const app = express();
const PORT = 3000 || process.env.PORT ;
const server = http.createServer(app)
const io = socketio(server);

const botName = 'Dev Bot'


// create user


// Run when client is connected
io.on('connection',socket=>{
    socket.on('joinRoom',({username,room})=>{
        const user = UserJoin(socket.id,username,room)
        socket.join(user.room)
        socket.emit('message',formatMessage(botName,'welcome Dev chat'))
        socket.broadcast.to(user.room).emit('message',formatMessage(botName,` ${user.username} has joined the chat`))
        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getRoomUsers(user.room)
        })
    })
    
    //listen for chat message
    socket.on('chatMessage',msg=>{
        const user = getUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg))
    })
    
    socket.on('disconnect',()=>{
        const user = userLeave(socket.id);
           if(user){

               io.to(user.room).emit('message',formatMessage(botName,` ${user.username} has left the chat`))
               io.to(user.room).emit('roomUsers',{
                room:user.room,
                users:getRoomUsers(user.room)
            })
           } 
    })

    
})
app.use(express.static(path.join(__dirname,'public')))
server.listen(PORT,()=>console.log(`server running on port ${PORT}`))