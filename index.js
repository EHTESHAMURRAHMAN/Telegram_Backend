
const express = require("express");
const crypto = require("crypto");
const app = express();

const BOT_TOKEN = "8415890920:AAGsBG2fe6PXsrjjjy9eiYqDAOH0AsfHuik"; // baad me ENV me daalna
function verifyTelegram(data) {
    const { hash, auth_date, ...rest } = data;
    const authDate = Number(auth_date);
    const now = Math.floor(Date.now() / 1000);
    if (!authDate || now - authDate > 86400) return false;
    const secretKey = crypto.createHash("sha256").update(BOT_TOKEN).digest();
    const dataCheckString = Object.keys(rest).sort().map(k => `${k}=${rest[k]}`).join("\n");
    const calculatedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
    return calculatedHash === hash;
}

// Serve static files (HTML)
app.use(express.static(__dirname)); // serves telegram_login.html

app.get("/telegram-login", (req, res) => {
    const data = { ...req.query };
    if (!verifyTelegram(data)) {
        console.log("❌ Invalid Login", data);
        return res.status(403).send("Invalid Login");
    }
    console.log("✅ Telegram Login Success", data);
    return res.redirect("myapp://telegram-success");
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
