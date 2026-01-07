const express = require("express");
const crypto = require("crypto");
const app = express();

const BOT_TOKEN = "8415890920: AAGsBG2fe6PXsrjjjy9eiYqDAOH0AsfHuik";

app.use(express.json());

// Endpoint Flutter will call
app.post("/telegram-login", (req, res) => {
  const data = req.body;
  console.log("Received from Flutter:", data);

  if (!verifyTelegram(data)) {
    return res.status(403).json({ success: false, error: "Invalid Telegram auth" });
  }

  // Telegram login verified ✅
  // You can now create a session, save user in DB, etc.
  return res.json({
    success: true,
    user: {
      id: data.id,
      first_name: data.first_name,
      last_name: data.last_name || null,
      username: data.username || null,
      photo_url: data.photo_url || null,
    },
  });
});

// ------------------- Telegram hash verification -------------------
function verifyTelegram(data) {
  const { hash, ...dataFields } = data;

  // Convert all fields to string
  for (const key in dataFields) {
    dataFields[key] = String(dataFields[key]);
  }

  // Create data check string
  const dataCheckString = Object.keys(dataFields)
    .sort()
    .map(k => `${k}=${dataFields[k]}`)
    .join("\n");

  const secretKey = crypto.createHash("sha256").update(BOT_TOKEN).digest();
  const calculatedHash = crypto.createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  return calculatedHash === hash;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
