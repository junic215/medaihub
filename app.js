// Mock Data
const mockCases = [
    {
        id: 1,
        title: "ChatGPTを使用した紹介状の半自動作成システム",
        hospital: "聖マリア中央病院",
        tool: "ChatGPT (GPT-4)",
        category: "事務効率化",
        views: 1250,
        likes: 85,
        image: "https://images.unsplash.com/photo-1516549221152-da7462934a64?auto=format&fit=crop&q=80&w=400",
        tag: "臨床支援"
    },
    {
        id: 2,
        title: "Claude 3.5 Sonnetによる複雑な診療報酬改定の要約と分析",
        hospital: "西日本メディカルセンター",
        tool: "Claude 3.5",
        category: "経営・運営",
        views: 980,
        likes: 120,
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400",
        tag: "事務効率化"
    },
    {
        id: 3,
        title: "Gemini 1.5 Proを活用した多言語対応問診票システム",
        hospital: "国際クリニック東京",
        tool: "Gemini 1.5 Pro",
        category: "患者サービス",
        views: 750,
        likes: 45,
        image: "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&q=80&w=400",
        tag: "多言語対応"
    }
];

// Helper to render case cards
function renderCards(containerId, cases) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = cases.map(c => `
        <article class="card">
            <img src="${c.image}" alt="${c.title}" class="card-img" onerror="this.src='https://via.placeholder.com/400x200?text=Medical+AI'">
            <div class="card-body">
                <span class="card-tag">${c.tag}</span>
                <h3><a href="detail.html?id=${c.id}">${c.title}</a></h3>
            </div>
            <div class="card-footer">
                <div class="hospital-name">
                    <i data-lucide="building" style="width:16px"></i>
                    ${c.hospital}
                </div>
                <div class="card-stats">
                    <span><i data-lucide="eye" style="width:14px"></i> ${c.views}</span>
                    <span><i data-lucide="thumbs-up" style="width:14px"></i> ${c.likes}</span>
                </div>
            </div>
        </article>
    `).join('');
    
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
