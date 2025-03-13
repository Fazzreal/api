const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const crypto = require("crypto"); // Untuk generate API Key
const config = require("./config");
const TokenModel = require("./models/TokenModel");

const app = express();
app.use(express.json());
app.use(cors());

// Koneksi ke MongoDB
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Terhubung!"))
.catch((err) => console.error("❌ Gagal Terhubung ke MongoDB:", err));

// ✅ **1. Endpoint Tambah Token + Generate API Key**
app.post("/add-token", async (req, res) => {
    const { token, key, secret } = req.body;

    // Validasi Secret Key sebelum menyimpan token
    if (secret !== config.secretKey) {
        return res.status(403).json({ error: "❌ Akses Ditolak! Secret Key salah." });
    }

    if (!token || !key) {
        return res.status(400).json({ error: "Token dan key harus diisi!" });
    }

    try {
        // Hapus token lama jika ada
        await TokenModel.deleteMany({});

        // Generate API Key unik
        const apiKey = crypto.randomBytes(16).toString("hex");

        const newToken = new TokenModel({ token, key, apiKey });
        await newToken.save();

        res.json({ message: "✅ Token berhasil ditambahkan!", apiKey });
    } catch (error) {
        res.status(500).json({ error: "❌ Gagal menyimpan token!" });
    }
});

// ✅ **2. Endpoint Cek Token Menggunakan API Key**
app.post("/check-token", async (req, res) => {
    const { apiKey } = req.body;

    if (!apiKey) {
        return res.status(400).json({ error: "API Key harus diisi!" });
    }

    try {
        const tokenData = await TokenModel.findOne({ apiKey });

        if (!tokenData) {
            return res.status(401).json({ error: "❌ API Key tidak valid!" });
        }

        res.json({ message: "✅ API Key valid!", token: tokenData.token });
    } catch (error) {
        res.status(500).json({ error: "❌ Gagal mengecek API Key!" });
    }
});

// ✅ **3. Endpoint Hapus Semua Token**
app.delete("/delete-token", async (req, res) => {
    try {
        await TokenModel.deleteMany({});
        res.json({ message: "✅ Semua token berhasil dihapus!" });
    } catch (error) {
        res.status(500).json({ error: "❌ Gagal menghapus token!" });
    }
});

// Jalankan API Server
app.listen(config.port, () => {
    console.log(`🚀 API berjalan di http://localhost:${config.port}`);
});
