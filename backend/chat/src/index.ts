import express from 'express'
import dotenv from 'dotenv'
import connectDb from './config/db.js';
import chatRoutes from './routes/chat.js'
import cors from 'cors'
import { app,server } from './config/socket.js';

dotenv.config();


app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended:true}))

connectDb();

app.use('/api/v1',chatRoutes);


server.listen(process.env.PORT,()=>{
    console.log(`server is running on port no ${process.env.PORT}`)
})