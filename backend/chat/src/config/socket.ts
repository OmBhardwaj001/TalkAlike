import {Server, Socket} from 'socket.io';
import http from 'http';
import express from 'express';
import { Chat } from '../models/chat.js';

const app = express();

const server = http.createServer(app);

const io = new Server(server,{
    cors:{
        origin:"*",
        methods:['GET','POST'],
    }
})

const userSocketMap : Record<string,string> = {};

export const getReceiverSocketId =(receiverId:string) : string | undefined => {
    return userSocketMap[receiverId];

}

io.on("connection",(socket:Socket)=>{
    console.log("user connected ",socket.id);  

    const userId = socket.handshake.query.userId as string | undefined;

    if(userId && userId !== "undefined"){
        userSocketMap[userId] = socket.id;
        console.log(`User ${userId} mapped to socket ${socket.id}`);
    }

    io.emit("getOnlineUser", Object.keys(userSocketMap));  

    if(userId){
        socket.join(userId)
    }

    socket.on("typing",(data)=>{
        console.log(`User ${data.userId} is typing in chat ${data.chatId}`);
        socket.to(data.chatId).emit("userTyping",{
            chatId: data.chatId,
            userId: data.userId
        })
    })

    socket.on("stopTyping",(data)=>{
        console.log(`user ${data.userId} stopped typing in chat ${data.chatId}`)
        socket.to(data.chatId).emit("userStoppedTyping",{
            chatId: data.chatId,
            userId: data.userId
        })
    })

    socket.on("joinChat",(chatId)=>{
        socket.join(chatId);
        console.log(`user ${userId} joined chat room ${chatId}`);
    })

    socket.on("leaveChat",(chatId)=>{
        socket.leave(chatId);
        console.log(`user ${userId} left the chat room ${chatId}`);
    })



    socket.on("disconnect",()=>{
         console.log("user disconnected", socket.id);

          if(userId){
        delete userSocketMap[userId]
        console.log(`User ${userId} removed from  online users`)
        io.emit("getOnlineUser",Object.keys(userSocketMap))
    }

    });

   

    socket.on("connect_error",(error)=>{
        console.log("socket connection error",error);
    });


    
});


export {app, server, io};


