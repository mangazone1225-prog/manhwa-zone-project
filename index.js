// index.js (Project Root ထဲမှ ဖိုင်အသစ်)
// Vercel ကို server.js ကို Import လုပ်ပြီး Export လုပ်ခိုင်းရန်

const app = require('./server'); // server.js မှ app ကို ဆွဲယူ
module.exports = app;
