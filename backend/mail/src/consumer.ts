import amqp from "amqplib";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const startSendOtpConsumer = async () => {
  const MAX_RETRIES = 10;
  const RETRY_DELAY = 5000;

  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const connection = await amqp.connect({
        protocol: "amqp",
        hostname: process.env.RABBITMQ_HOST,
        port: 5672,
        username: process.env.RABBITMQ_USERNAME,
        password: process.env.RABBITMQ_PASSWORD,
      });

      const channel = await connection.createChannel();

      const queueName = "send-otp";

      channel.assertQueue(queueName, { durable: true });

      console.log(
        "🐰 Mail service consumer started , listening for otp mailes"
      );

      channel.consume(queueName, async (msg) => {
        if (msg) {
          try {
            const { to, subject, body } = JSON.parse(msg.content.toString());

            const transporter = nodemailer.createTransport({
              host: "smtp.resend.com",
              port: 587,
              secure: false,
              auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
              },
            });

            await transporter.sendMail({
              from: "TalkAlike <noreply@cryptdrive.in>",
              to,
              subject,
              text: body,
            });

            console.log(`OTP mail sent to ${to}`);
            channel.ack(msg);
          } catch (error) {
            console.log("failed to send otp", error);
          }
        }
      });

      break;
    } catch (error) {
      retries++;
      await new Promise((res) => setTimeout(res, RETRY_DELAY));
      console.log("failed to start rabbitmq consumer", error);
    }
  }

  if (retries === MAX_RETRIES) {
    process.exit(1);
  }
};
