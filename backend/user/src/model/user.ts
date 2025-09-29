import mongoose,{Document,Schema, type SchemaTimestampsConfig} from "mongoose";

export interface IUser extends Document{
    name:String,
    email:String,
}

const schema: Schema<IUser> = new Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
},{timestamps:true,});


export const User = mongoose.model<IUser>("User",schema)

 