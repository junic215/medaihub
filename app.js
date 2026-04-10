// MedAI HUB - Central App Logic
const DEFAULT_IMAGES = [
    "01.png",
    "02.png",
    "03.png",
    "04.png"
];

// UUIDから数字のインデックスを生成するヘルパー
function getIndexFromId(id) {
    if (!id) return 0;
    let hash = 0;
    const str = String(id);
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
}

function getRandomDefaultImage(index) {
    return DEFAULT_IMAGES[index % DEFAULT_IMAGES.length];
}

// Helper to render case cards
function renderCards(containerId, cases) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!cases || cases.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px; color: var(--text-muted);">まだ事例がありません。最初の事例を投稿してみませんか？</div>';
        return;
    }

    container.innerHTML = cases.map(c => {
        const displayImage = c.image_url || getRandomDefaultImage(getIndexFromId(c.id));
        const hospitalDisplay = c.show_hospital ? c.hospital_name : "（非公開）";
        
        return `
        <article class="card">
            <div style="position: relative; overflow: hidden; height: 200px;">
                <img src="${displayImage}" alt="${c.title}" class="card-img">
            </div>
            <div class="card-body">
                <span class="card-tag">${c.category}</span>
                <h3><a href="detail.html?id=${c.id}">${c.title}</a></h3>
            </div>
            <div class="card-footer">
                <div class="hospital-name">
                    <i data-lucide="building" style="width:16px"></i>
                    ${hospitalDisplay}
                </div>
                <div class="card-stats">
                    <span><i data-lucide="eye" style="width:14px"></i> ${c.views || 0}</span>
                </div>
            </div>
        </article>
    `}).join('');
    
    if (window.lucide) {
        lucide.createIcons();
    }
}

// Supabase Integration Logic
async function fetchCases() {
    if (!window.medai || !window.medai.client) {
        console.warn('Supabase not configured.');
        return [];
    }

    const { data, error } = await window.medai.client
        .from('cases')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching cases:', error);
        return [];
    }
    return data;
}

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    const cases = await fetchCases();
    
    // featured-grid (Likes rank)
    const featured = document.getElementById('featured-grid');
    if (featured) {
        renderCards('featured-grid', [...cases].sort((a,b) => (b.views||0) - (a.views||0)).slice(0, 3));
    }
    
    // latest-grid
    const latest = document.getElementById('latest-grid');
    if (latest) {
        renderCards('latest-grid', cases.slice(0, 6));
    }

    // all-cases-grid (list page)
    const all = document.getElementById('all-cases-grid');
    if (all) {
        renderCards('all-cases-grid', cases);
    }
});
