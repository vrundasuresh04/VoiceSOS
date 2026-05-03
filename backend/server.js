const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure directories exist
const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Data files
const alertsFile = path.join(dataDir, 'alerts.json');
const contactsFile = path.join(dataDir, 'contacts.json');

if (!fs.existsSync(alertsFile)) fs.writeFileSync(alertsFile, JSON.stringify([]));
if (!fs.existsSync(contactsFile)) fs.writeFileSync(contactsFile, JSON.stringify([]));

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: "ok", app: "VoiceSOS backend running" });
});

app.get('/api/alerts', (req, res) => {
  const alerts = JSON.parse(fs.readFileSync(alertsFile));
  res.json(alerts);
});

app.post('/api/alerts', (req, res) => {
  const alerts = JSON.parse(fs.readFileSync(alertsFile));
  const newAlert = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    status: req.body.status || "sent",
    triggerPhrase: req.body.triggerPhrase || "",
    confidence: req.body.confidence || 0,
    label: req.body.label || "Normal",
    reasons: req.body.reasons || [],
    location: req.body.location || null,
    audioUrl: req.body.audioUrl || null,
    contactName: req.body.contactName || "",
    contactPhone: req.body.contactPhone || ""
  };
  alerts.push(newAlert);
  fs.writeFileSync(alertsFile, JSON.stringify(alerts, null, 2));
  res.json(newAlert);
});

app.get('/api/contacts', (req, res) => {
  const contacts = JSON.parse(fs.readFileSync(contactsFile));
  res.json(contacts);
});

app.post('/api/contacts', (req, res) => {
  const contacts = JSON.parse(fs.readFileSync(contactsFile));
  const newContact = {
    id: Date.now().toString(),
    name: req.body.name,
    phone: req.body.phone,
    createdAt: new Date().toISOString()
  };
  contacts.push(newContact);
  fs.writeFileSync(contactsFile, JSON.stringify(contacts, null, 2));
  res.json(newContact);
});

app.post('/api/audio', upload.single('audio'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const audioUrl = `/uploads/${req.file.filename}`;
  res.json({ audioUrl });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
