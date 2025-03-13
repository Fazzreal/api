const mongoose = require("mongoose");

// Skema untuk menyimpan Token, Key, dan API Key
const TokenSchema = new mongoose.Schema({
    token: { type: String, required: true },
    key: { type: String, required: true },
    apiKey: { type: String, unique: true, required: true }, // API Key unik untuk validasi
}, { timestamps: true });

module.exports = mongoose.model("Token", TokenSchema);
