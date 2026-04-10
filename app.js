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
let latestVisibleCount = 6;
let isScrollingPaused = false;

function renderCards(containerId, cases, withRank = false, duplicate = false) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!cases || cases.length === 0) {
        if (!withRank) container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px; color: var(--text-muted);">事例がありません。</div>';
        return;
    }

    // 無限ループ用にデータを複製
    let renderList = duplicate ? [...cases, ...cases] : cases;

    container.innerHTML = renderList.map((c, idx) => {
        const displayImage = c.image_url || getRandomDefaultImage(c.id);
        const rankNum = (idx % cases.length) + 1;
        const rankHtml = withRank ? `<div class="rank-badge">${rankNum}位</div>` : "";
        return `
        <article class="card">
            ${rankHtml}
            <div style="height:110px; overflow:hidden;" class="responsive-img-h">
                <img src="${displayImage}" alt="${c.title}" style="width:100%; height:100%; object-fit:cover;">
            </div>
            <div class="card-body">
                <span class="card-tag" style="font-size:0.65rem; color:var(--primary); font-weight:800; display:block; margin-bottom:4px;">${c.category}</span>
                <h3 style="font-size:0.85rem; line-height:1.4; height:2.8em; overflow:hidden;"><a href="detail.html?id=${c.id}" style="text-decoration:none; color:inherit;">${c.title}</a></h3>
            </div>
        </article>
    `}).join('');
    if (window.lucide) lucide.createIcons();
}

function initInfiniteScroll(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    let speed = 0.6;
    let isMouseDown = false;
    let startX, scrollLeft;

    function step() {
        if (!isScrollingPaused && !isMouseDown) {
            container.scrollLeft += speed;
            if (container.scrollLeft >= container.scrollWidth / 2) {
                container.scrollLeft = 0;
            }
        }
        requestAnimationFrame(step);
    }
    container.addEventListener('mousedown', (e) => { isMouseDown = true; startX = e.pageX - container.offsetLeft; scrollLeft = container.scrollLeft; isScrollingPaused = true; });
    container.addEventListener('mouseup', () => { isMouseDown = false; isScrollingPaused = false; });
    container.addEventListener('touchstart', () => { isScrollingPaused = true; });
    container.addEventListener('touchend', () => { setTimeout(() => isScrollingPaused = false, 2000); });
    requestAnimationFrame(step);
}

async function fetchCases() {
    if (!window.medai || !window.medai.client) return [];
    try {
        const { data } = await window.medai.client.from('cases').select('*').eq('status', 'approved').order('created_at', { ascending: false });
        return data || [];
    } catch(e) { return []; }
}

document.addEventListener('DOMContentLoaded', async () => {
    allCases = await fetchCases();
    const isMobile = window.innerWidth <= 768;

    // Ranking (Always infinite loop)
    const featured = document.getElementById('featured-grid');
    if (featured) {
        const top5 = [...allCases].sort((a,b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
        renderCards('featured-grid', top5, true, true);
        initInfiniteScroll('featured-grid');
    }
    
    // Latest Feed
    const latest = document.getElementById('latest-grid');
    if (latest) {
        // スマホなら無限ループ、PCなら通常のグリッド
        renderCards('latest-grid', allCases.slice(0, 8), false, isMobile);
        if (isMobile) initInfiniteScroll('latest-grid');
    }
});
