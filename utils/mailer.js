import dotenv from 'dotenv'
dotenv.config()
import nodemailer from "nodemailer"
import ejs from "ejs"
import path from 'path'


const transporter = nodemailer.createTransport({
     host: "smtp.gmail.com",
  port: 465, // secure SMTP port
  secure: true,
    auth: {
        user: process.env.USER_EMAIL ,
        pass: process.env.USER_PASS ,
    } ,
})

export const sendEmail = async ({to , name , code }) => {
  try {

    const templatePath = path.join(process.cwd() , 'views' , "mail.ejs")
    const html = await ejs.renderFile(templatePath , { name , code })

    await transporter.sendMail({
      from: process.env.USER_EMAIL,
      to,
      subject:'Password Reset code',
      html
    });

    console.log(`Password reset email sent to ${to}`);
    
  } catch (err) {
    console.error("Email sending error:", err);
    throw new Error("Email could not be sent");
  }
};

transporter.verify(function(error, success) {
   if (error) {
        console.error("Transporter error:", error);
   } else {
        console.log("Server is ready to take messages");
   }
});