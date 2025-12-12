const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json()); // JSON data ကို လက်ခံရန်
app.use(express.urlencoded({ extended: true })); // Form data ကို လက်ခံရန်

// Static Files (Frontend UI)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin.html', express.static(path.join(__dirname, 'admin.html')));
app.use('/reader.html', express.static(path.join(__dirname, 'reader.html')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // ပုံများကို တိုက်ရိုက်ခေါ်ခွင့်ပြုရန် (Local Development အတွက်)

// --- MongoDB Setup ---

// ⚠️ သင်၏ ကိုယ်ပိုင် MongoDB Atlas URL ဖြင့် အစားထိုးပါ
const DB_URI = 'mongodb+srv://thurizathu123_db_user:sLZmJMadWNiUj3gz@manhwazone.3ib0i7h.mongodb.net/?appName=ManhwaZone';

mongoose.connect(DB_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- Mongoose Schema & Model ---

const ChapterSchema = new mongoose.Schema({
    chapterNumber: { type: Number, required: true },
    imageUrls: [String], // ပုံများ၏ Path များ
    uploadDate: { type: Date, default: Date.now }
});

const ManhwaSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String, // ⬅️ NEW: အကျဉ်းချုပ် ဖော်ပြချက် ထပ်တိုး
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
        // Unique ဖြစ်သော file name ကို အသုံးပြုရန်
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// -------------------- API Routes --------------------

// 1. Home Page အတွက် Hot/Latest List
app.get('/api/manhwas/home', async (req, res) => {
    try {
        const hotManhwas = await Manhwa.find({ isHot: true })
            .select('title coverImageUrl')
            .limit(5);

        const latestManhwas = await Manhwa.find()
            .sort({ lastUpdated: -1 })
            .select('title coverImageUrl lastUpdated')
            .limit(10);

        res.json({ hotManhwas, latestManhwas });
    } catch (error) {
        res.status(500).send('Error fetching home data');
    }
});

// 2. Chapter Content ကို ပြန်ပေးခြင်း (Signed URL ဖြင့်သာ ပုံကို ခေါ်နိုင်စေရန်)
app.get('/api/chapter/:manhwaId/:chapterNumber', async (req, res) => {
    try {
        const { manhwaId, chapterNumber } = req.params;
        const manhwa = await Manhwa.findById(manhwaId);

        if (!manhwa) return res.status(404).json({ message: 'Manhwa not found' });

        const chapter = manhwa.chapters.find(c => c.chapterNumber === parseInt(chapterNumber));
        if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

        // နောက် Chapter နံပါတ်ကို ရှာဖွေခြင်း
        const nextChapter = manhwa.chapters.find(c => c.chapterNumber === parseInt(chapterNumber) + 1);
        const prevChapter = manhwa.chapters.find(c => c.chapterNumber === parseInt(chapterNumber) - 1);
        
        // ပုံကို တိုက်ရိုက် URL မဟုတ်ဘဲ Server မှ တစ်ဆင့် ပေးပို့ရန်
        const imageUrls = chapter.imageUrls.map(url => `/uploads/${path.basename(url)}`);

        res.json({
            chapterNumber: chapter.chapterNumber,
            imageUrls: imageUrls,
            nextChapter: nextChapter ? nextChapter.chapterNumber : null,
            prevChapter: prevChapter ? prevChapter.chapterNumber : null,
            manhwaTitle: manhwa.title
        });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching chapter content', error: error.message });
    }
});

// 5. Manhwa Details (Intro စာသားနှင့် Chapter စာရင်းများ) ကို ပြန်ပေးခြင်း ⬅️ NEW
app.get('/api/manhwa/details/:manhwaId', async (req, res) => {
    try {
        const { manhwaId } = req.params;
        const manhwa = await Manhwa.findById(manhwaId)
                                     .select('title genres description chapters'); 

        if (!manhwa) return res.status(404).send('Manhwa not found');

        const chapterList = manhwa.chapters.map(c => ({
            chapterNumber: c.chapterNumber,
        })).sort((a, b) => a.chapterNumber - b.chapterNumber);

        res.json({
            title: manhwa.title,
            genres: manhwa.genres,
            description: manhwa.description,
            chapterList: chapterList,
        });
    } catch (error) {
        res.status(500).send('Error fetching details');
    }
});

// -------------------- Admin Routes --------------------

// 1. Manhwa အသစ် ထည့်သွင်းခြင်း
app.post('/api/admin/manhwa/add', upload.single('coverImage'), async (req, res) => {
    try {
        // ⬅️ description ကို ထပ်ယူပါ ⬅️
        const { title, genres, isHot, description } = req.body;
        
        const genresArray = genres ? genres.split(',').map(g => g.trim()) : [];
        
        const coverPath = req.file ? path.join('uploads', req.file.filename) : null;

        const newManhwa = new Manhwa({
            title: title,
            description: description, // ⬅️ description ကို ထည့်သွင်းပါ ⬅️
            isHot: isHot === 'on',
            genres: genresArray,
            coverImageUrl: coverPath,
            chapters: [],
            lastUpdated: new Date()
        });

        const savedManhwa = await newManhwa.save();
        res.status(201).json({ 
            message: `Manhwa အသစ် အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ။ ID: ${savedManhwa._id}`, 
            manhwaId: savedManhwa._id 
        });

    } catch (error) {
        console.error('Manhwa Creation Error:', error);
        res.status(500).json({ message: 'Manhwa ထည့်သွင်းရာတွင် အမှားဖြစ်ပွားပါသည်', error: error.message });
    }
});

// 2. Chapter အသစ် ထည့်သွင်းခြင်း
app.post('/api/admin/chapter/add', upload.array('chapterImages', 50), async (req, res) => { 
    try {
        const { manhwaId, chapterNumber } = req.body;
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Chapter ပုံများ ထည့်သွင်းရန် လိုအပ်ပါသည်။' });
        }

        const imagePaths = req.files.map(file => path.join('uploads', file.filename));

        const manhwa = await Manhwa.findById(manhwaId);
        if (!manhwa) {
            return res.status(404).json({ message: 'ထို Manhwa ID ကို ရှာမတွေ့ပါ' });
        }

        manhwa.chapters.push({
            chapterNumber: parseInt(chapterNumber),
            imageUrls: imagePaths,
            uploadDate: new Date()
        });
        
        manhwa.lastUpdated = new Date(); 

        await manhwa.save();

        res.status(201).json({ message: `Chapter ${chapterNumber} ကို အောင်မြင်စွာ တင်ပြီးပါပြီ။` });

    } catch (error) {
        console.error('Chapter Upload Error:', error);
        res.status(500).json({ message: 'Chapter တင်ရာတွင် အမှားဖြစ်ပွားပါသည်', error: error.message });
    }
});

// 3. Manhwa တစ်ခုလုံးကို ဖျက်ပစ်ခြင်း
app.delete('/api/admin/manhwa/delete/:manhwaId', async (req, res) => {
    try {
        const { manhwaId } = req.params;

        const result = await Manhwa.findByIdAndDelete(manhwaId);

        if (!result) {
            return res.status(404).json({ message: 'ဖျက်ပစ်ရန် Manhwa ID ကို ရှာမတွေ့ပါ' });
        }

        // 💡 ဤနေရာတွင် ပုံဟောင်းများကို Server မှလည်း ဖျက်ပစ်ရန် Logic ထပ်ထည့်နိုင်သည်

        res.status(200).json({ message: `Manhwa ID ${manhwaId} ကို အောင်မြင်စွာ ဖျက်ပစ်ပြီးပါပြီ။` });

    } catch (error) {
        console.error('Manhwa Delete Error:', error);
        res.status(500).json({ message: 'ဖျက်ပစ်ရာတွင် အမှားဖြစ်ပွားပါသည်', error: error.message });
    }
});

// 4. Admin အတွက် Manhwa ID နှင့် ခေါင်းစဉ်များ စာရင်း ပြန်ပေးခြင်း ⬅️ NEW
app.get('/api/admin/manhwas', async (req, res) => {
    try {
        const manhwas = await Manhwa.find({})
                                      .select('_id title lastUpdated'); 

        res.json(manhwas);
    } catch (error) {
        res.status(500).send('Error fetching admin list');
    }
});


// Server Start
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});