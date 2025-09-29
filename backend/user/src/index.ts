import express from 'express'
import dotenv from 'dotenv'
import connectDb from './config/db.js';
import {createClient} from 'redis'

import userRoutes from './routes/user.js';
import { connectRabbitMQ } from './config/rabbitmq.js';

dotenv.config();


const app = express();

const PORT = process.env.PORT;

connectDb();
connectRabbitMQ();

export const redisClient = createClient({
    url:process.env.REDIS_URL as string
})

redisClient.connect()
.then(()=> console.log("connected to redis")).catch(console.error)

app.use("/api/v1",userRoutes);

app.listen(PORT,()=>{
    console.log(`server is running on port no: ${PORT}`);
})