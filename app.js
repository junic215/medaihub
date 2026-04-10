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

function renderCards(containerId, cases, withRank = false) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!cases || cases.length === 0) {
        if (!withRank) container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px; color: var(--text-muted);">事例がありません。</div>';
        return;
    }
    let renderList = withRank ? [...cases, ...cases] : cases;
    container.innerHTML = renderList.map((c, idx) => {
        const displayImage = c.image_url || getRandomDefaultImage(c.id);
        const rankNum = (idx % cases.length) + 1;
        const rankHtml = withRank ? `<div class="rank-badge">${rankNum}位</div>` : "";
        return `
        <article class="card">
            ${rankHtml}
            <div style="height:180px; overflow:hidden;">
                <img src="${displayImage}" alt="${c.title}" style="width:100%; height:100%; object-fit:cover;">
            </div>
            <div class="card-body">
                <span class="card-tag" style="font-size:0.7rem; color:var(--primary); font-weight:800;">${c.category}</span>
                <h3><a href="detail.html?id=${c.id}" style="text-decoration:none; color:inherit;">${c.title}</a></h3>
            </div>
        </article>
    `}).join('');
    if (window.lucide) lucide.createIcons();
}

// 左右ボタンでの移動
window.moveRank = (direction) => {
    const container = document.getElementById('featured-grid');
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    pauseAutoScroll();
};

function pauseAutoScroll() {
    isScrollingPaused = true;
    setTimeout(() => { isScrollingPaused = false; }, 3000); // 3秒後に再開
}

// 無限ループ ＆ ドラッグ対応スクロール
function initInfiniteScroll(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let scrollSpeed = 0.8;
    let isMouseDown = false;
    let startX, scrollLeft;

    // 自動スクロールのループ
    function step() {
        if (!isScrollingPaused && !isMouseDown) {
            container.scrollLeft += scrollSpeed;
            if (container.scrollLeft >= container.scrollWidth / 2) {
                container.scrollLeft = 0;
            }
        }
        requestAnimationFrame(step);
    }

    // ドラッグ処理 (PC用)
    container.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
        pauseAutoScroll();
    });
    container.addEventListener('mouseleave', () => isMouseDown = false);
    container.addEventListener('mouseup', () => isMouseDown = false);
    container.addEventListener('mousemove', (e) => {
        if (!isMouseDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 2; // スクロール速度倍率
        container.scrollLeft = scrollLeft - walk;
    });

    // タッチ処理 (スマホ用)
    container.addEventListener('touchstart', () => pauseAutoScroll());

    requestAnimationFrame(step);
}

async function fetchCases() {
    if (!window.medai || !window.medai.client) return [];
    try {
        const { data, error } = await window.medai.client.from('cases').select('*').eq('status', 'approved').order('created_at', { ascending: false });
        return data || [];
    } catch(e) { return []; }
}

document.addEventListener('DOMContentLoaded', async () => {
    allCases = await fetchCases();
    const featured = document.getElementById('featured-grid');
    if (featured) {
        const top5 = [...allCases].sort((a,b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
        renderCards('featured-grid', top5, true);
        initInfiniteScroll('featured-grid');
    }
    if (document.getElementById('latest-grid')) {
        renderCards('latest-grid', allCases.slice(0, latestVisibleCount));
    }
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        if (allCases.length <= latestVisibleCount) loadMoreBtn.style.display = 'none';
        loadMoreBtn.addEventListener('click', () => {
            latestVisibleCount += 6; // 追加も6件ずつ
            renderCards('latest-grid', allCases.slice(0, latestVisibleCount));
            if (latestVisibleCount >= allCases.length) loadMoreBtn.style.display = 'none';
        });
    }
});
