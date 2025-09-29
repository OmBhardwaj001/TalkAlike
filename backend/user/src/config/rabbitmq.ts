import ampq from "amqplib"

let channel:ampq.Channel;

export const connectRabbitMQ = async()=>{
    try {
        const connection = await ampq.connect({
            protocol:"amqp",
            hostname: process.env.RABBITMQ_HOST,
            port : 5672,
            username: process.env.RABBITMQ_USERNAME,
            password:process.env.RABBITMQ_PASSWORD
        });

        channel = await connection.createChannel();

        console.log("🐰 connected to rabbitMQ")
        
    } catch (error) {
        console.log("failed to connnect to rabbitMQ",error)
        
    }
}


export const publishToQueue = async(queueName: string, message: any)=>{
    if(!channel){
        console.log("rabbitMQ channel is not initialized");
        return;
    }

    await channel.assertQueue(queueName,{durable:true});

    channel.sendToQueue(queueName,Buffer.from(JSON.stringify(message)),{persistent:true});

}
