const API_BASE_URL = 'http://localhost:3000/api';
const readerContainer = document.getElementById('reader-container');

// Chapter ပုံများကို ဆွဲယူပြသခြင်း
const loadChapter = async (manhwaId, chapterNum) => {
    try {
        const response = await fetch(`${API_BASE_URL}/chapter/${manhwaId}/${chapterNum}`);
        const data = await response.json();

        if (!response.ok) {
            readerContainer.innerHTML = `<p class="error-msg">${data.message || 'Chapter ကို ရှာမတွေ့ပါ'}</p>`;
            return;
        }

        const chapterImagesHtml = data.imageUrls.map(url => 
            `<img src="${url}" alt="Chapter ${chapterNum} Page" class="chapter-page">`
        ).join('');
        
        readerContainer.innerHTML = chapterImagesHtml;
        
        // Navigation Buttons ကို Update လုပ်ခြင်း
        updateNavigation(manhwaId, data.nextChapter, data.prevChapter);
        
        document.getElementById('chapter-title').textContent = `${data.manhwaTitle} - Chapter ${chapterNum}`;


    } catch (error) {
        readerContainer.innerHTML = '<p class="error-msg">Chapter Data ဆွဲယူရာတွင် အမှားဖြစ်ပွားပါသည်။</p>';
        console.error('Fetch Chapter Error:', error);
    }
};

// Next/Prev Button များကို Update လုပ်ခြင်း
const updateNavigation = (manhwaId, nextChapter, prevChapter) => {
    const nextButtonTop = document.getElementById('next-chapter');
    const prevButtonTop = document.getElementById('prev-chapter');
    const nextButtonBottom = document.getElementById('next-chapter-bottom'); // NEW ID
    const prevButtonBottom = document.getElementById('prev-chapter-bottom'); // NEW ID

    // Top and Bottom Navigation များကို တစ်ပြိုင်တည်း ပြောင်းလဲခြင်း
    
    // Next Button Logic
    if (nextChapter) {
        const nextHref = `reader.html?id=${manhwaId}&chapter=${nextChapter}`;
        nextButtonTop.href = nextHref;
        nextButtonBottom.href = nextHref;
        nextButtonTop.style.display = 'inline-block';
        nextButtonBottom.style.display = 'inline-block';
    } else {
        nextButtonTop.style.display = 'none';
        nextButtonBottom.style.display = 'none';
    }

    // Previous Button Logic
    if (prevChapter) {
        const prevHref = `reader.html?id=${manhwaId}&chapter=${prevChapter}`;
        prevButtonTop.href = prevHref;
        prevButtonBottom.href = prevHref;
        prevButtonTop.style.display = 'inline-block';
        prevButtonBottom.style.display = 'inline-block';
    } else {
        prevButtonTop.style.display = 'none';
        prevButtonBottom.style.display = 'none';
    }
};

// Details Panel ကို ဆွဲယူပြသခြင်း
const loadManhwaDetails = async (manhwaId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/manhwa/details/${manhwaId}`);
        if (!response.ok) throw new Error('Details not found');
        const data = await response.json();
        
        // UI တွင် Details များ ပြသခြင်း
        document.getElementById('details-title').textContent = data.title;
        document.getElementById('details-genres').textContent = `Genres: ${data.genres.join(', ')}`;
        document.getElementById('details-description').textContent = data.description || 'No description provided.';
        
        const listContainer = document.getElementById('chapter-list-container');
        listContainer.innerHTML = data.chapterList.map(c => `
            <a href="reader.html?id=${manhwaId}&chapter=${c.chapterNumber}" class="chapter-link-item">
                Chapter ${c.chapterNumber}
            </a>
        `).join('');
        
        // Read First / Read Last Button များ Update လုပ်ခြင်း
        if (data.chapterList.length > 0) {
             document.getElementById('read-first-btn').href = `reader.html?id=${manhwaId}&chapter=${data.chapterList[0].chapterNumber}`;
             document.getElementById('read-last-btn').href = `reader.html?id=${manhwaId}&chapter=${data.chapterList[data.chapterList.length - 1].chapterNumber}`;
        }


    } catch (error) {
        console.error('Error loading details:', error);
        // Error ဖြစ်ခဲ့လျှင် details panel ကို ဖျောက်ပြီး Error Message ပြရန်
        document.getElementById('manhwa-details-panel').innerHTML = '<p style="color: red;">Manhwa Details ကို ဆွဲယူ၍ မရပါ။</p>';
    }
};


// Initialization
const urlParams = new URLSearchParams(window.location.search);
const manhwaId = urlParams.get('id');
const chapterNum = urlParams.get('chapter');

if (manhwaId) {
    loadManhwaDetails(manhwaId); 

    if (chapterNum) {
        loadChapter(manhwaId, chapterNum);
        // Chapter content ပြနေချိန်မှာ Details Panel ကို ဖျောက်ထားပါ
        document.getElementById('manhwa-details-panel').style.display = 'none';
    } else {
        // Chapter Num မပါရင် Details Page ကိုသာ ပြသမည်
        document.getElementById('chapter-title').textContent = 'Manhwa Details';
        document.getElementById('reader-container').innerHTML = ''; // Chapter Container ကို ရှင်းထားပါ
        document.getElementById('reader-container').style.display = 'none';
        document.getElementById('prev-chapter').style.display = 'none';
        document.getElementById('next-chapter').style.display = 'none';
    }
} else {
    readerContainer.innerHTML = '<p class="error-msg">Manhwa ID မပါဝင်ပါ။</p>';
}