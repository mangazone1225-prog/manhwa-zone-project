const API_BASE_URL = 'http://localhost:3000/api/admin';
const messageDisplay = document.getElementById('message');

// Helper function to show success/error messages
function showMessage(msg, type) {
    messageDisplay.textContent = msg;
    messageDisplay.className = type === 'success' ? 'success' : 'error';
    messageDisplay.style.display = 'block';
    setTimeout(() => {
        messageDisplay.style.display = 'none';
    }, 5000);
}

// 1. Manhwa Form Submission
document.getElementById('add-manhwa-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    try {
        const response = await fetch(`${API_BASE_URL}/manhwa/add`, {
            method: 'POST',
            body: formData, 
        });

        const data = await response.json();
        
        if (response.ok) {
            showMessage(`Manhwa ဖန်တီးမှု အောင်မြင်သည်။ ID: ${data.manhwaId}`, 'success');
            document.getElementById('manhwa-id').value = data.manhwaId;
            form.reset();
            loadManhwaAdminList(); // ⬅️ NEW: စာရင်းကို ချက်ချင်း refresh လုပ်ရန်
        } else {
            throw new Error(data.message || 'Manhwa ဖန်တီးမှု မအောင်မြင်ပါ');
        }

    } catch (error) {
        showMessage(`Error: ${error.message}`, 'error');
    }
});

// 2. Chapter Form Submission
document.getElementById('add-chapter-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    try {
        const response = await fetch(`${API_BASE_URL}/chapter/add`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        
        if (response.ok) {
            showMessage(`Chapter ${formData.get('chapterNumber')} အောင်မြင်စွာ တင်ပြီးပါပြီ။`, 'success');
            form.reset();
            // Chapter ထပ်တင်လျှင် details page မှာ chapter list အသစ်ပေါ်ရန်အတွက် loadManhwaAdminList ကို ခေါ်
            loadManhwaAdminList(); 
        } else {
            throw new Error(data.message || 'Chapter တင်မှု မအောင်မြင်ပါ');
        }

    } catch (error) {
        showMessage(`Error: ${error.message}`, 'error');
    }
});

// 3. Manhwa Delete Submission
document.getElementById('delete-manhwa-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const manhwaId = document.getElementById('delete-manhwa-id').value.trim();

    if (!confirm(`Manhwa ID: ${manhwaId} ကို အပြီးအပိုင် ဖျက်ပစ်မှာ သေချာပါသလား။`)) {
        return; 
    }

    try {
        const response = await fetch(`${API_BASE_URL}/manhwa/delete/${manhwaId}`, {
            method: 'DELETE',
        });

        const data = await response.json();
        
        if (response.ok) {
            showMessage(`Manhwa ID ${manhwaId} ကို အောင်မြင်စွာ ဖျက်ပစ်ပြီးပါပြီ။`, 'success');
            e.target.reset();
            loadManhwaAdminList(); // ⬅️ NEW: စာရင်းကို ချက်ချင်း refresh လုပ်ရန်
        } else {
            throw new Error(data.message || 'ဖျက်ပစ်မှု မအောင်မြင်ပါ');
        }

    } catch (error) {
        showMessage(`Error: ${error.message}`, 'error');
    }
});

// 4. Manhwa စာရင်းနှင့် ID များ ဆွဲယူခြင်း ⬅️ NEW FUNCTION ⬅️
async function loadManhwaAdminList() {
    const container = document.getElementById('manhwa-list-container');
    container.innerHTML = '<p>စာရင်းဆွဲယူနေပါသည်...</p>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/manhwas`);
        const data = await response.json();
        
        if (data.length === 0) {
            container.innerHTML = '<p style="color: yellow;">လက်ရှိ Manhwa တစ်ခုမှ မရှိသေးပါ။</p>';
            return;
        }

        let html = '<table><tr><th>Title</th><th>Last Updated</th><th>ID</th></tr>';
        data.forEach(manhwa => {
            const date = new Date(manhwa.lastUpdated).toLocaleDateString();
            html += `
                <tr>
                    <td>${manhwa.title}</td>
                    <td>${date}</td>
                    <td onclick="copyToClipboard('${manhwa._id}')" style="cursor: pointer; color: var(--secondary-accent);">
                        ${manhwa._id.substring(0, 10)}... (Click to Copy)
                    </td>
                </tr>
            `;
        });
        html += '</table>';
        container.innerHTML = html;

    } catch (error) {
        container.innerHTML = `<p style="color: red;">စာရင်းဆွဲယူရာတွင် Error: ${error.message}</p>`;
    }
}

// ID ကူးယူရန် Helper Function
function copyToClipboard(text) {
    // navigator.clipboard ကို Browser က ခွင့်မပြုပါက alert ဖြင့်သာ ပြသသည်
    if (navigator.clipboard) {
         navigator.clipboard.writeText(text);
         showMessage('Manhwa ID ကူးယူပြီးပါပြီ: ' + text, 'success');
    } else {
        alert('Manhwa ID ကူးယူပြီးပါပြီ: ' + text);
    }
}

// Page ဖွင့်တာနဲ့ စတင်ခေါ်ဆိုရန်
loadManhwaAdminList();