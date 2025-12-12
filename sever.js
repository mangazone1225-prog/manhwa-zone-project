const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// 🛑 ပြင်ဆင်ထားသော အပိုင်း: Static File များနှင့် Uploads များကို စနစ်တကျ ချိတ်ဆက်ခြင်း
// Frontend Files (CSS, JS, Images) များကို public/ ထဲကနေ Serve လုပ်ရန်
app.use(express.static(path.join(__dirname, 'public'))); 
// Uploaded Images များကို /uploads URL ကနေ ခေါ်ယူနိုင်ရန်
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

// 🛑 Admin Page ကို URL ဖြင့် တိုက်ရိုက် ခေါ်ဆိုနိုင်ရန် Route ထည့်သွင်းခြင်း
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// --- MongoDB Setup ---

// Cloud ပေါ်ရောက်ရင် Process.env ထဲက MONGODB_URI ကို သုံးရန်
const DB_URI = process.env.MONGODB_URI || 'mongodb+srv://[YOUR_USERNAME]:[YOUR_PASSWORD]@[YOUR_CLUSTER].mongodb.net/manhwadb?retryWrites=true&w=majority';

mongoose.connect(DB_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- Mongoose Schema & Model ---

const ChapterSchema = new mongoose.Schema({
    chapterNumber: { type: Number, required: true },
    imageUrls: [String],
    uploadDate: { type Date, default: Date.now }
});

const ManhwaSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String, 
    isHot: { type: Boolean, default: false },
    genres: [String],
    coverImageUrl: String,
    chapters: [ChapterSchema],
    lastUpdated: { type: Date, default: Date.now }
});

const Manhwa = mongoose.model('Manhwa', ManhwaSchema);

// --- Multer (File Upload Setup) ---

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// -------------------- API Routes (Existing) --------------------

app.get('/api/manhwas/home', async (req, res) => { /* ... (Existing Code) ... */ });
app.get('/api/chapter/:manhwaId/:chapterNumber', async (req, res) => { /* ... (Existing Code) ... */ });
app.get('/api/manhwa/details/:manhwaId', async (req, res) => { /* ... (Existing Code) ... */ });
app.get('/api/admin/manhwas', async (req, res) => { /* ... (Existing Code) ... */ });
app.post('/api/admin/manhwa/add', upload.single('coverImage'), async (req, res) => { /* ... (Existing Code) ... */ });
app.post('/api/admin/chapter/add', upload.array('chapterImages', 50), async (req, res) => { /* ... (Existing Code) ... */ });
app.delete('/api/admin/manhwa/delete/:manhwaId', async (req, res) => { /* ... (Existing Code) ... */ });


// 🛑 ပြင်ဆင်ထားသော အပိုင်း: Local မှာ Run တာနဲ့ Cloud မှာ Run တာကို ခွဲထုတ်ခြင်း
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
}

// Vercel ကနေ Import လုပ်ပြီး Run နိုင်ဖို့အတွက် app object ကို Export လုပ်ပေးခြင်း
module.exports = app; 
    
