const twilio = require('twilio');

const sendSmsOtp = async (phone, otp) => {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  try {
    await client.messages.create({
      body: `Your CivicVoice verification code is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone, // Make sure phone number includes country code, e.g., +91
    });
    console.log(`SMS OTP sent to ${phone}`);
  } catch (error) {
    console.error('Error sending SMS OTP:', error);
  }
};

// We will add email functionality later if needed.
// For now, this service structure is ready.

module.exports = { sendSmsOtp };