// public/index.js

const API_BASE_URL = 'http://localhost:3000/api';

// Home Page Manhwa Data များကို ဆွဲယူပြသသော Function
const loadHomeManhwas = async () => {
    const hotContainer = document.getElementById('hot-manhwa-grid');
    const latestContainer = document.getElementById('latest-manhwa-grid');
    
    hotContainer.innerHTML = '<p>Hot Manhwa စာရင်း ဆွဲယူနေပါသည်...</p>';
    latestContainer.innerHTML = '<p>Latest Manhwa စာရင်း ဆွဲယူနေပါသည်...</p>';

    try {
        const response = await fetch(`${API_BASE_URL}/manhwas/home`);
        if (!response.ok) {
            throw new Error('API မှ Data ဆွဲယူရာတွင် Error ဖြစ်ပွားပါသည်');
        }
        
        const data = await response.json();
        
        // Hot Manhwas ပြသခြင်း
        if (data.hotManhwas && data.hotManhwas.length > 0) {
            hotContainer.innerHTML = data.hotManhwas.map(manhwa => createManhwaCard(manhwa)).join('');
        } else {
            hotContainer.innerHTML = '<p>Hot Manhwa စာရင်း မရှိသေးပါ။</p>';
        }

        // Latest Manhwas ပြသခြင်း
        if (data.latestManhwas && data.latestManhwas.length > 0) {
            latestContainer.innerHTML = data.latestManhwas.map(manhwa => createManhwaCard(manhwa)).join('');
        } else {
            latestContainer.innerHTML = '<p>Latest Manhwa စာရင်း မရှိသေးပါ။</p>';
        }

    } catch (error) {
        hotContainer.innerHTML = `<p style="color: red;">Error Loading Hot Manhwas: ${error.message}</p>`;
        latestContainer.innerHTML = `<p style="color: red;">Error Loading Latest Manhwas: ${error.message}</p>`;
        console.error('Home Page Load Error:', error);
    }
};

// Manhwa Card HTML Structure ကို ဖန်တီးသော Helper Function
const createManhwaCard = (manhwa) => {
    
    // ပုံ path ကို /uploads/filename.jpg ပုံစံဖြင့် ပြင်ခြင်း
    const coverPath = manhwa.coverImageUrl.replace('uploads/', '/uploads/');
    
    // Home Page မှ နှိပ်လျှင် Details Panel (Chapter စာရင်း) သို့သာ ရောက်စေရန် chapter နံပါတ်ကို ဖြုတ်ထားသည်။
    return `
        <a href="reader.html?id=${manhwa._id}" class="manhwa-card"> 
            <img src="${coverPath}" alt="${manhwa.title} Cover">
            <div class="manhwa-card-info">
                <h3>${manhwa.title}</h3>
                <p style="font-size: 0.85em; color: #999;">
                    ${manhwa.lastUpdated ? new Date(manhwa.lastUpdated).toLocaleDateString() : ''}
                </p>
            </div>
        </a>
    `;
};

// Page စတင် load လျှင် Data စတင် ဆွဲယူရန်
loadHomeManhwas();