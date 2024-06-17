import mongoose from "mongoose";
import mailSender from "../utils/MailSender";

const otpSchema = new mongoose.Schema({
  otp: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 5 * 60,
  },
});

async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email from StudyBuudy",
      otp
    );
    console.log("Mail Sent Successfuly : ", mailResponse);
  } catch (error) {
    console.log("Error while Sending OTP", error);
    throw error;
  }
}

otpSchema.pre("save", async function (next) {
  await sendVerificationEmail(this.email, this.otp);
  next();
});
export default mongoose.model("Otp", otpSchema);
