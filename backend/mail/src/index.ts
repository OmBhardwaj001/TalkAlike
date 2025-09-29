import express from 'express'
import dotenv from 'dotenv'
import { startSendOtpConsumer } from './consumer.js';

dotenv.config();

startSendOtpConsumer();

const app = express();

app.use(express.json());


app.listen(process.env.PORT,()=>{
    console.log(`server is running on port no: ${process.env.PORT}`)
})