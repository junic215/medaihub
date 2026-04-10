// Mock Data removed for production
const mockCases = [];

const DEFAULT_IMAGES = [
    "https://images.unsplash.com/photo-1576091160550-217359f49f4c?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1516549221152-da7462934a64?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&q=80&w=800"
];

function getRandomDefaultImage(id) {
    const index = id % DEFAULT_IMAGES.length;
    return DEFAULT_IMAGES[index];
}

// Helper to render case cards
function renderCards(containerId, cases) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (cases.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px; color: var(--text-muted);">まだ事例がありません。最初の事例を投稿してみませんか？</div>';
        return;
    }

    container.innerHTML = cases.map(c => {
        const displayImage = c.image_url || getRandomDefaultImage(c.id);
        return `
        <article class="card">
            <img src="${displayImage}" alt="${c.title}" class="card-img">
            <div class="card-body">
                <span class="card-tag">${c.category}</span>
                <h3><a href="detail.html?id=${c.id}">${c.title}</a></h3>
            </div>
            <div class="card-footer">
                <div class="hospital-name">
                    <i data-lucide="building" style="width:16px"></i>
                    ${c.hospital_name}
                </div>
                <div class="card-stats">
                    <span><i data-lucide="eye" style="width:14px"></i> ${c.views}</span>
                    <span><i data-lucide="thumbs-up" style="width:14px"></i> ${c.likes}</span>
                </div>
            </div>
        </article>
    `}).join('');
    
    // Re-initialize icons for dynamica content
    if (window.lucide) {
        lucide.createIcons();
    }
}

// Supabase Integration Logic
async function fetchCases() {
    if (!window.medai || !window.medai.client) {
        console.warn('Supabase not configured, using mock data.');
        return mockCases;
    }

    const { data, error } = await window.medai.client
        .from('cases')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching cases:', error);
        return mockCases;
    }
    return data;
}

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    const cases = await fetchCases();
    
    // Render featured cases (by likes)
    renderCards('featured-grid', [...cases].sort((a,b) => b.likes - a.likes).slice(0, 3));
    
    // Render latest cases
    renderCards('latest-grid', cases.slice(0, 6));

    // For all-cases-grid (list page)
    renderCards('all-cases-grid', cases);
});
