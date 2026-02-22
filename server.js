require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());


// 🔥 Twilio SMS Sender
const sendSMS = async (to, message) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const response = await axios.post(
      url,
      new URLSearchParams({
        From: process.env.TWILIO_PHONE,
        To: to,
        Body: message,
      }),
      {
        auth: {
          username: accountSid,
          password: authToken,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("✅ SMS SENT:", response.data.sid);
    return { success: true };
  } catch (error) {
    console.log("❌ TWILIO ERROR:", error.response?.data || error.message);
    return { success: false };
  }
};



// 🚨 BULK ALERT BROADCAST (Citizens)
app.post("/send-sms", async (req, res) => {

  const phones = req.body?.phones;
  const type = req.body?.type || "Emergency";
  const severity = req.body?.severity || "Medium";
  const area = req.body?.area || "Your Location";

  if (!phones || !Array.isArray(phones) || phones.length === 0) {
    return res.status(400).json({
      error: "Phones array is required"
    });
  }

  let message;

  if (severity.toLowerCase() === "high") {
    message = `🚨 CRITICAL ${type.toUpperCase()} ALERT
Area: ${area}
Evacuate immediately to nearest safe zone.
- Disaster OS`;
  } else {
    message = `🚨 ${type.toUpperCase()} ALERT
Area: ${area}
Stay alert and follow official instructions.
- Disaster OS`;
  }

  let successCount = 0;
  let failCount = 0;

  for (let phone of phones) {
    const result = await sendSMS(phone, message);
    if (result.success) successCount++;
    else failCount++;
  }

  res.json({
    message: "Citizen broadcast completed",
    sent: successCount,
    failed: failCount
  });
});


// 🚑 VOLUNTEER NOTIFICATION ROUTE
app.post("/notify-volunteers", async (req, res) => {

  const volunteers = req.body?.volunteers;
  const disasterType = req.body?.type || "Emergency";
  const area = req.body?.area || "Unknown Area";
  const instructions = req.body?.instructions || "Report to assigned zone immediately.";

  if (!volunteers || !Array.isArray(volunteers) || volunteers.length === 0) {
    return res.status(400).json({
      error: "Volunteers array is required"
    });
  }

  const message = `🚑 VOLUNTEER ALERT
Disaster: ${disasterType}
Area: ${area}
Instructions: ${instructions}
Respond ASAP.
- Disaster OS Command Center`;

  let successCount = 0;
  let failCount = 0;

  for (let phone of volunteers) {
    const result = await sendSMS(phone, message);
    if (result.success) successCount++;
    else failCount++;
  }

  res.json({
    message: "Volunteer notification completed",
    sent: successCount,
    failed: failCount
  });
});



// Health Check
app.get("/", (req, res) => {
  res.send("🚨 Disaster OS Communication Engine Running");
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});