const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); // Path module ကို ထည့်သွင်းရန်
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// 🟢 STATIC FILE CONFIGURATION (အရေးအကြီးဆုံး ပြင်ဆင်ချက်)
// public folder ကို serve လုပ်နေတာကိုတော့ ထားပါ
app.use(express.static(path.join(__dirname, 'public'))); 
// Uploaded Images များကို /uploads URL ကနေ ခေါ်ယူနိုင်ရန်
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

// 🟢 ROOT တွင်ရှိသော admin.html နှင့် index.html ကို တိုက်ရိုက် Serve လုပ်ရန်
app.get('/admin.html', (req, res) => {
    // admin.html သည် Root Folder (__dirname) တွင်ရှိသောကြောင့် တိုက်ရိုက်ခေါ်သည်
    res.sendFile(path.join(__dirname, 'admin.html')); 
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); 
});

// Home Page (Root URL)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); 
});


// --- MongoDB Setup ---

// Cloud ပေါ်ရောက်ရင် Process.env ထဲက MONGODB_URI ကို သုံးရန်
const DB_URI = process.env.MONGODB_URI || 'mongodb+srv://[YOUR_USERNAME]:[YOUR_PASSWORD]@[YOUR_CLUSTER].mongodb.net/manhwadb?retryWrites=true&w=majority';

mongoose.connect(DB_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- Mongoose Schema & Model ---
// (Schema များနှင့် Model များကို ဤနေရာတွင် အပြည့်အစုံ ထည့်ပါ)
// ... (Your Schema Definitions) ...
const Manhwa = mongoose.model('Manhwa', ManhwaSchema);


// --- Multer (File Upload Setup) ---
// ... (Your Multer Configuration) ...
const upload = multer({ storage: storage });

// -------------------- API Routes --------------------
// (API Routes များကို ဤနေရာတွင် အပြည့်အစုံ ထည့်ပါ)
// ... app.get('/api/manhwas/home', ... ) ...
// ... app.post('/api/admin/manhwa/add', ... ) ...


// 🟢 SERVER START CONFIGURATION
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
}

// Vercel ကနေ Import လုပ်ပြီး Run နိုင်ဖို့အတွက် app object ကို Export လုပ်ပေးခြင်း
module.exports = app; 
