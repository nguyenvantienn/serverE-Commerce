const nodemailer = require('nodemailer')
const asyncHandler = require('express-async-handler')

const sendMail = asyncHandler(async({email , html}) => {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // true for port 465 and false for other ports
            auth: {
              user: process.env.EMAIL_NAME,
              pass: process.env.PASSWORD_APP_EMAIL,
            },
        });
            // send mail with defined transport object
        const info = await transporter.sendMail({
            from: '"Ecommerce-Project" <no-relply@ecommerce.com>', // sender address
            to: email, // list of receivers
            subject: "Forgot Password ✔", // Subject line
            text: "Forgot Password. DO you want reset YourPassword?", // plain text body
            html: html, // html body
        });
        
        console.log("Message sent: %s", info.messageId);

        console.log("Preview URL : %s", nodemailer.getTestMessageUrl(info));
        return info
    }
)


module.exports ={
    sendMail
}