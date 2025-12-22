
const express = require("express");
const crypto = require("crypto");
const path = require("path");
const app = express();

const BOT_TOKEN = process.env.BOT_TOKEN || "8415890920:AAGsBG2fe6PXsrjjjy9eiYqDAOH0AsfHuik";

function verifyTelegram(data) {
    const { hash, ...dataFields } = data;
    const authDate = Number(dataFields.auth_date);
    const now = Math.floor(Date.now() / 1000);

    if (!authDate || now - authDate > 86400) {
        console.log("❌ Auth date invalid or expired");
        return false;
    }

    const secretKey = crypto.createHash("sha256").update(BOT_TOKEN).digest();
    const dataCheckString = Object.keys(dataFields)
        .sort()
        .map(k => `${k}=${dataFields[k]}`)
        .join("\n");

    const calculatedHash = crypto.createHmac("sha256", secretKey)
        .update(dataCheckString)
        .digest("hex");

    const isValid = calculatedHash === hash;
    if (!isValid) {
        console.log("🔍 Verification failed:", {
            receivedHash: hash,
            calculatedHash,
            dataCheckString
        });
    } else {
        console.log("🔍 Verification passed! Data check string:", dataCheckString);
    }

    return isValid;
}

app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "telegram_login.html"));
});

app.get("/telegram-login", (req, res) => {
    const data = { ...req.query };
    console.log("📥 Received data:", data);

    if (!verifyTelegram(data)) {
        console.log("❌ Invalid Login", data);
        return res.status(403).json({ success: false, error: "Invalid Telegram auth" });
    }

    console.log("✅ Telegram Login Success", data);

    const user = {
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name || null,
        username: data.username || null,
        photo_url: data.photo_url || null,
        auth_date: data.auth_date
    };

    return res.json({
        success: true,
        message: "Telegram auth verified!",
        user
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit: http://localhost:3000/ (local) or https://your-app.onrender.com/ (Render)`);
});




// function verifyTelegram(data) {
//     const { hash, ...dataFields } = data;
//     const authDate = Number(dataFields.auth_date);
//     const now = Math.floor(Date.now() / 1000);

//     if (!authDate || now - authDate > 86400) {
//         console.log("❌ Auth date invalid or expired");
//         return false;
//     }

//     const secretKey = crypto.createHash("sha256").update(BOT_TOKEN).digest();
//     const dataCheckString = Object.keys(dataFields)
//         .sort()
//         .map(k => `${k}=${dataFields[k]}`)
//         .join("\n");

//     const calculatedHash = crypto.createHmac("sha256", secretKey)
//         .update(dataCheckString)
//         .digest("hex");

//     const isValid = calculatedHash === hash;
//     if (!isValid) {
//         console.log("🔍 Verification failed:", { receivedHash: hash, calculatedHash, dataCheckString });
//     }

//     return isValid;
// }

// // Serve static files
// app.use(express.static(__dirname));

// // Root route: Serve telegram_login.html automatically
// app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, "telegram_login.html"));
// });

// app.get("/telegram-login", (req, res) => {
//     const data = { ...req.query };
//     console.log("📥 Received data:", data);

//     if (!verifyTelegram(data)) {
//         console.log("❌ Invalid Login", data);
//         return res.status(403).send("Invalid Login");
//     }

//     console.log("✅ Telegram Login Success", data);
//     // For Flutter: Redirect to deep link with user data (or JSON response if testing)
//     const userData = JSON.stringify({ id: data.id, username: data.username, first_name: data.first_name });
//     return res.redirect(`myapp://telegram-success?data=${encodeURIComponent(userData)}`);
// });

// // Render uses dynamic port; fallback for local
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//     console.log(`Visit: https://telegram-backend-fnp0.onrender.com`); // Replace with your Render URL
// });