const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();


app.use(cors());

app.use(express.json());

app.post("/", async (req, res) => {
  let ip = req.body.ip;
  if (!ip && req.body.message) {
    const strippedMessage = req.body.message.replace(/<[^>]+>/g, "").trim();
    const ipv4ExtractRegex = /(\d{1,3}\.){3}\d{1,3}/;
    const match = strippedMessage.match(ipv4ExtractRegex);
    if (match) {
      ip = match[0];
    }
  }

  if (!ip) {
    console.log("No IP provided in payload:", req.body);
    return res.status(400).json({ message: "No IP provided" });
  }

  const ipv4Regex = /^(25[0-5]|2[0-4]\d|[01]?\d\d?)(\.(25[0-5]|2[0-4]\d|[01]?\d\d?)){3}$/;
  if (!ipv4Regex.test(ip)) {
    console.log("Invalid IP format, payload:", req.body);
    return res.status(400).json({ message: "Invalid IP format" });
  }

  try {
    const endpoint = `https://api.blacklistchecker.com/check/${ip}`;

    const response = await axios.get(endpoint, {
      auth: {
        username: "key_bNDcVCEXHzYPXkURObzsibLBh",
        password: ""
      }
    });

    const detectedLists = response.data.blacklists.filter(item => item.detected === true);
    const detectedCount = detectedLists.length;

    let message;
    if (detectedCount > 0) {
      message = `Very possibly scam, detected on ${detectedCount} site${detectedCount > 1 ? 's' : ''}`;
    } else {
      message = "its not a scam ip";
    }

    const webhookUrl = "https://ping.telex.im/v1/webhooks/019529a6-d113-7f62-a6e4-14819439b4ec";
    const webhookData = {
      event_name: "Email-spam-checker",
      message: message,
      status: "success",
      username: "email-spam-checker"
    };

    await axios.post(webhookUrl, webhookData, {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });

    console.log("Webhook sent with message:", message);
    res.status(200).json({ message: message, blacklists: detectedLists });
  } catch (error) {
    console.error("Error checking email-spam-checker:", error.message);
    res.status(500).json({ message: "Error processing the IP" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
