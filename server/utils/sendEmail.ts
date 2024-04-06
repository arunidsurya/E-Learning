require("dotenv").config();
import nodemailer, { Transporter } from "nodemailer";
import ejs from "ejs";
import path from "path";

interface EmailOptions {
  email: string;
  subject: string;
  template: string;
  data: { [key: string]: any };
}

const sendMail = async (options: EmailOptions): Promise<void> => {
  // console.log("send mailer");
  const transporter: Transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const { email, subject, template, data } = options;
  // console.log(data);

  //   const templatePath = path.join(__dirname, "../mails", template);

  //   const html: string = await ejs.renderFile(templatePath, data);
  // console.log("send mailer 2");
  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject,
    html: `<p> Enter <b>${data.activationCode}</b> in the app to verify your email address.</p>
            <p>This code will <b> Expires in one hour</b></P> `,
  };

  await transporter.sendMail(mailOptions);
};
export default sendMail;
