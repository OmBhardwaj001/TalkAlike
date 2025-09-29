import { generateToken } from "../config/generateToken.js";
import { publishToQueue } from "../config/rabbitmq.js";
import TryCatch from "../config/tryCatch.js";
import { redisClient } from "../index.js";
import type { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { User } from "../model/user.js";

export const loginUser = TryCatch( async (req,res)=>{

    const {email} = req.body;
    
    const rateLimitKey  = `otp:ratelimit:${email}`
    const ratelimit = await redisClient.get(rateLimitKey)
    if(ratelimit){
        res.status(429).json({
            message:"too many request. Please  wait before  requesting the otp",
        });
        return; 
    }

    const otp = Math.floor(100000 + Math.random() * 90000).toString();

    const otpKey = `otp:${email}`
    await redisClient.set(otpKey,otp,{
        EX:300,
    });

    await redisClient.set(rateLimitKey,"true",{
        EX:60,
    });

    const message = {
        to:email,
        subject: "your otp code",
        body: `your OTP is ${otp}. It is valid for 5 minutes`,
    };

    await publishToQueue("send-otp",message);

    res.status(200).json({
        message:"OTP send to your mail "
    });
})


export const verifyUser = TryCatch(async(req,res)=>{
    const {email,otp:enteredOtp} = req.body;

    if(!email || !enteredOtp){
        res.status(400).json("email and otp required");
    }

    const otpKey = `otp:${email}`;
    const storedOtp = await redisClient.get(otpKey);

    if(!storedOtp || storedOtp != enteredOtp){
        res.status(400).json("invalid or expired otp");
        return;
    }
    
    await redisClient.del(otpKey);

    let user = await User.findOne({email});
    if(!user){
        const name = email.slice(0,8);
        user = await User.create({
            name,
            email
        })
    }

    const token = generateToken(user);

    res.json({message:"user verified", user, token});
});


export const myProfile = TryCatch(async(req:AuthenticatedRequest,res)=>{
    const user  = req.user;
     res.json(user);

})

export const updateName = TryCatch(async(req:AuthenticatedRequest,res)=>{
    const user = await User.findById(req.user?._id);

    if(!user){
        res.status(404).json({message:"please login"});
        return;
    }

    user.name = req.body.name;
    await user.save();

    const token = generateToken(user);

    res.json({message:"User updated", user, token});
});

export const getAllUsers = TryCatch(async(req:AuthenticatedRequest,res)=>{
    const users = await User.find();

    res.json(users);
});

export const getAUser = TryCatch(async(req:AuthenticatedRequest,res)=>{
    const user = await User.findById(req.params.id);

    res.json(user);
})