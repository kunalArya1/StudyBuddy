import nodemailer from "nodemailer";

const mailSender = async (email, title, body) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      atuh: {
        user: process.env.MAIL_USER,
        password: process.env.MAIL_PASSWORD,
      },
    });

    let info = await transporter.sendMail({
      from: "StudyBuddy || Kunal Kumar Arya",
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });

    console.log(info);
    return info;
  } catch (error) {
    console.log(error.message);
  }
};

export default mailSender;
