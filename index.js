const cors = require("cors");
const express = require("express");
require("dotenv").config();
const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running in port:${PORT}`);
});

// Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
  }),
  databaseURL:
    "https://infocomm-bangkok-default-rtdb.asia-southeast1.firebasedatabase.app",
});

// Serve frontend
app.use(express.static(path.join(__dirname, "frontend")));

// Folder uploads
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "_");
    cb(null, Date.now() + "_" + safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Static uploads folder
app.use("/uploads", express.static(uploadDir));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true }));

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

app.post("/submit-form", upload.single("photo"), async (req, res) => {
  try {
    const db = admin.database();
    const { name, comment } = req.body;
    const timestamp = admin.database.ServerValue.TIMESTAMP;

    let photoUrl = null;
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }

    const ref = db.ref("testguest");
    const newRef = await ref.push({ name, comment, photoUrl, timestamp });
    const newKey = newRef.key;

    res.status(200).json({
      success: true,
      key: newKey,
      name,
      comment,
      photoUrl,
    });
  } catch (error) {
    console.error("🔥 Error submitting data:", error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
});
