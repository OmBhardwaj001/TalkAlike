import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const connectDb = async()=>{
    const url = process.env.MONGO_URI

    if(!url){
        throw new Error('MONGO_URI is not defined in env')
    }

    try {

        await mongoose.connect(url,{
            dbName:"TalkAlike",
        })
        console.log("connected to db");
        
    } catch (error) {
        console.error("failed to connect to mongodb",error)
        process.exit(1);
    }
}

export default connectDb;