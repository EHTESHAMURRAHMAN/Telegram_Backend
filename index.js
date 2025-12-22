
const express = require("express");
const crypto = require("crypto");
const app = express();

const BOT_TOKEN = "8415890920:AAGsBG2fe6PXsrjjjy9eiYqDAOH0AsfHuik"; // baad me ENV me daalna

function verifyTelegram(data) {
    const { hash, auth_date, ...rest } = data;

    // Validate auth_date (24 hours max)
    const authDate = Number(auth_date);
    const now = Math.floor(Date.now() / 1000);
    if (!authDate || now - authDate > 86400) {
        return false;
    }

    // Secret key
    const secretKey = crypto
        .createHash("sha256")
        .update(BOT_TOKEN)
        .digest();

    // Data check string
    const dataCheckString = Object.keys(rest)
        .sort()
        .map(key => `${key}=${rest[key]}`)
        .join("\n");

    // Hash calculation
    const calculatedHash = crypto
        .createHmac("sha256", secretKey)
        .update(dataCheckString)
        .digest("hex");

    return calculatedHash === hash;
}

// Telegram login route
app.get("/telegram-login", (req, res) => {
    const data = { ...req.query }; // copy query params

    if (!verifyTelegram(data)) {
        console.log("❌ Invalid Login", data);
        return res.status(403).send("Invalid Login");
    }

    console.log("✅ Telegram Login Success", data);

    // Redirect for Flutter / WebView deep-link
    return res.redirect("myapp://telegram-success");
});

// Start server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});