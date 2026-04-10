// MedAI HUB - Logic
const DEFAULT_IMAGES = ["01.png", "02.png", "03.png", "04.png"];

function getIndexFromId(id) {
    if (!id) return 0;
    let hash = 0;
    const str = String(id);
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
}

function getRandomDefaultImage(id) {
    const index = getIndexFromId(id);
    return DEFAULT_IMAGES[index % DEFAULT_IMAGES.length];
}

let allCases = [];
let latestVisibleCount = 4;

function renderCards(containerId, cases, withRank = false) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!cases || cases.length === 0) {
        if (!withRank) container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px; color: var(--text-muted); font-weight: bold;">事例がありません。</div>';
        return;
    }

    container.innerHTML = cases.map((c, idx) => {
        const displayImage = c.image_url || getRandomDefaultImage(c.id);
        const hospitalDisplay = c.show_hospital ? c.hospital_name : "（非公開）";
        const rankHtml = withRank ? `<div class="rank-badge">${idx + 1}位</div>` : "";
        
        return `
        <article class="card">
            ${rankHtml}
            <div style="overflow: hidden; height: 180px;">
                <img src="${displayImage}" alt="${c.title}" class="card-img" style="width:100%; height:100%; object-fit:cover;">
            </div>
            <div class="card-body">
                <span style="font-size:0.7rem; color:var(--primary); font-weight:800; margin-bottom:8px; display:block;">${c.category}</span>
                <h3><a href="detail.html?id=${c.id}" style="color:inherit; text-decoration:none;">${c.title}</a></h3>
            </div>
            <div class="card-footer">
                <div style="display:flex; align-items:center; gap:6px;">
                    <i data-lucide="building" style="width:14px"></i>
                    ${hospitalDisplay}
                </div>
            </div>
        </article>
    `}).join('');
    
    if (window.lucide) {
        lucide.createIcons();
    }
}

async function fetchCases() {
    if (!window.medai || !window.medai.client) return [];
    const { data, error } = await window.medai.client
        .from('cases')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
    return error ? [] : data;
}

document.addEventListener('DOMContentLoaded', async () => {
    allCases = await fetchCases();
    
    // Ranking (Top 5 by views)
    const featured = document.getElementById('featured-grid');
    if (featured) {
        const top5 = [...allCases].sort((a,b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
        renderCards('featured-grid', top5, true);
    }
    
    // Latest (First 4)
    const latestGrid = document.getElementById('latest-grid');
    if (latestGrid) {
        renderCards('latest-grid', allCases.slice(0, latestVisibleCount));
    }

    // Load More Logic
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        if (allCases.length <= latestVisibleCount) loadMoreBtn.style.display = 'none';
        loadMoreBtn.addEventListener('click', () => {
            latestVisibleCount += 4;
            renderCards('latest-grid', allCases.slice(0, latestVisibleCount));
            if (latestVisibleCount >= allCases.length) loadMoreBtn.style.display = 'none';
        });
    }
});
