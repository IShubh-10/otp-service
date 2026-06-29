require("dotenv").config();

const express = require("express");
const cors = require("cors");

const mysql = require("mysql2/promise");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

// =========================================
// Configuration
// =========================================

const WEBENGAGE_API = process.env.WEBENGAGE_API;
const WEBENGAGE_API_KEY = process.env.WEBENGAGE_API_KEY;

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;
const MAX_ATTEMPTS = 5;

app.use(cors({
    origin: true,
    credentials: false,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// =========================================
// MySQL Connection Pool
// =========================================

const pool = mysql.createPool({

    host: process.env.DB_HOST,

    port: process.env.DB_PORT || 3306,

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,

    database: process.env.DB_NAME,

    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0

});

// =========================================
// Helpers
// =========================================

function generateOTP() {

    return Math.floor(
        100000 + Math.random() * 900000
    ).toString();

}

function hashOTP(otp) {

    return crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

}

async function sendOTP(
    mobile,
    otp
) {

    const payload = {

        ttl: 60,

        overrideData: {

            context: {

                token: {
                    name: "shubham",
                    otp
                }

            },

            phone: "+91" + mobile

        },

        userId: mobile

    };

    const response = await fetch(
        WEBENGAGE_API,
        {
            method: "POST",
            headers: {
                Authorization:
                    `Bearer ${WEBENGAGE_API_KEY}`,
                "Content-Type":
                    "application/json"
            },
            body: JSON.stringify(payload)
        }
    );

    const body =
        await response.text();

    if (!response.ok) {
        throw new Error(body);
    }

    return JSON.parse(body);

}

// =========================================
// Generate OTP
// =========================================

app.post("/generate-otp", async (req, res) => {

    try {

        const { mobile } = req.body;

        if (!mobile) {
            return res.status(400).json({
                success: false,
                message: "Mobile is required"
            });
        }

        if (!/^\d{10}$/.test(mobile)) {
            return res.status(400).json({
                success: false,
                message: "Invalid mobile number"
            });
        }

        const now = new Date();

        // Check resend cooldown
        const [existing] = await pool.execute(
            `
            SELECT last_sent_at
            FROM otp_store
            WHERE mobile = ?
            `,
            [mobile]
        );

        if (
            existing.length > 0 &&
            now - existing[0].last_sent_at < RESEND_COOLDOWN_MS
        ) {

            return res.status(429).json({
                success: false,
                message:
                    "Please wait before requesting another OTP."
            });

        }

        const otp = generateOTP();

        const otpHash = hashOTP(otp);

        const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MS);

        // Send SMS first
        const webengageResponse =
            await sendOTP(
                mobile,
                otp
            );

        // Store OTP only if SMS succeeds
        await pool.execute(
            `
            INSERT INTO otp_store
            (
                mobile,
                otp,
                otp_hash,
                expires_at,
                attempts,
                last_sent_at
            )
            VALUES
            (
                ?,
                ?,
                ?,
                ?,
                0,
                ?
            )
            ON DUPLICATE KEY UPDATE

                otp_hash = VALUES(otp_hash),

                expires_at = VALUES(expires_at),

                attempts = 0,

                last_sent_at =
                    VALUES(last_sent_at)
            `,
            [
                mobile,
                process.env.NODE_ENV === "production" ? null : otp,
                otpHash,
                expiresAt,
                now
            ]
        );

        return res.json({

            success: true,

            message:
                "OTP sent successfully",

            webengage:
                webengageResponse

        });

    } catch (error) {

        // console.error("Generate OTP Error:",error.message);
        console.error("Generate OTP Error:");
    console.error(error);
    console.error(error.stack);

    return res.status(500).json({
        success: false,
        message: error.message
    });

        return res.status(500).json({

            success: false,

            message:
                "Unable to generate OTP",

            error: error.message

        });

    }

});


// =========================================
// Validate OTP
// =========================================

app.post("/validate-otp", async (req, res) => {

    try {

        const { mobile, otp } = req.body;

        if (!mobile || !otp) {

            return res.status(400).json({
                success: false,
                message: "Mobile and OTP are required"
            });

        }

        const [rows] = await pool.execute(
            `
            SELECT *
            FROM otp_store
            WHERE mobile = ?
            `,
            [mobile]
        );

        if (rows.length === 0) {

            return res.status(400).json({
                success: false,
                message: "Verification failed"
            });

        }

        const record = rows[0];

        // Expired OTP
        if (Date.now() > record.expires_at) {

            await pool.execute(
                `
                DELETE FROM otp_store
                WHERE mobile = ?
                `,
                [mobile]
            );

            return res.status(400).json({
                success: false,
                message: "OTP Expired"
            });

        }

        // Maximum attempts reached
        if (record.attempts >= MAX_ATTEMPTS) {

            await pool.execute(
                `
                DELETE FROM otp_store
                WHERE mobile = ?
                `,
                [mobile]
            );

            return res.status(400).json({
                success: false,
                message: "Verification failed"
            });

        }

        // Invalid OTP
        if (record.otp_hash !== hashOTP(otp)) {

            await pool.execute(
                `
                UPDATE otp_store
                SET attempts = attempts + 1
                WHERE mobile = ?
                `,
                [mobile]
            );

            return res.status(400).json({
                success: false,
                message: "Verification failed"
            });

        }

        // OTP Verified
        await pool.execute(
            `
            DELETE FROM otp_store
            WHERE mobile = ?
            `,
            [mobile]
        );

        return res.json({

            success: true,

            message: "OTP Verified"

        });

    } catch (error) {

        console.error(
            "Validate OTP Error:",
            error.message
        );

        return res.status(500).json({

            success: false,

            message: "Internal Server Error"

        });

    }

});

// =========================================
// Health Check
// =========================================

app.get("/health", async (req, res) => {

    try {

        await pool.query("SELECT 1");

        res.json({

            status: "UP",

            database: "Connected"

        });

    } catch (err) {

        res.status(500).json({

            status: "DOWN",

            database: "Disconnected"

        });

    }

});

// =========================================
// Cleanup Expired OTPs
// =========================================

setInterval(async () => {

    try {

        const [result] = await pool.execute(
            `
            DELETE FROM otp_store
            WHERE expires_at < ?
            `,
            [Date.now()]
        );

        if (result.affectedRows > 0) {

            console.log(
                `Cleaned ${result.affectedRows} expired OTP(s)`
            );

        }

    } catch (err) {

        console.error(
            "Cleanup Error:",
            err.message
        );

    }

}, 10 * 60 * 1000);

// =========================================
// Start Server
// =========================================

(async () => {

    try {

        await pool.query("SELECT 1");

        console.log("✅ MySQL Connected");

        app.listen(PORT, () => {

            console.log(
                `🚀 Server running on http://localhost:${PORT}`
            );

        });

    } catch (err) {

        console.error(
            "Unable to connect to MySQL",
            err.message
        );

        process.exit(1);

    }

})();