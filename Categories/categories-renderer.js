// categories-renderer.js - קובץ לבניית ה-HTML הדינמי

class CategoriesRenderer {
    constructor() {
        this.currentCategory = 'all'; // קטגוריה ברירת מחדל
        this.galleryData = JSON.parse(localStorage.getItem('galleryData')) || [];
        this.categories = {
            'bar-mitzvah': 'בר מצווה',
            'birthday-bouquets': '🎂 זרים ליום הולדת',
            'balloon-numbers': '🔢 מספרים מבלונים',
            'arches': '🌈 קשתות',
            'balloon-flowers': '🌺 פרחים עם בלונים',
            'centerpiece': '🍽️ מרכזי שולחן',
            'room-arrangements': '🏠 סידורי חדרים',
            'photo-walls': '📸 קירות צילום',
            'balloon-sphere': '🎯 כדור פורח',
            'gender-reveal': '👶 גילוי מין',
            'balloons-for-kids': '🧸 בלונים לילדים',
            'birth-celebration': '🍼 הולדת הבן / בת'
        };
    }

    // אתחול הקטגוריות והתוכן
    init() {
        this.renderCategoryTabs();
        this.renderCategoryContent();
        this.renderRecommendations();
        this.renderHits();
        this.bindEvents();
    }

    // בניית טאבים של הקטגוריות
    renderCategoryTabs() {
        const tabsContainer = document.querySelector('.category-tabs');
        if (!tabsContainer) return;

        const categoryKeys = ['all', ...Object.keys(this.categories)];
        const tabsHTML = categoryKeys.map((category, index) => {
            const activeClass = (category === this.currentCategory || (index === 0 && this.currentCategory === 'all')) ? 'active' : '';
            const categoryName = category === 'all' ? '🎈 הכל' : this.categories[category];
            return `<div class="category-tab ${activeClass}" data-category="${category}">${categoryName}</div>`;
        }).join('');

        tabsContainer.innerHTML = tabsHTML;
    }

    // בניית תוכן הקטגוריות
    renderCategoryContent() {
        const gallerySection = document.querySelector('#gallery');
        if (!gallerySection) return;

        const tabsContainer = gallerySection.querySelector('.category-tabs');
        
        const contentHTML = Object.keys(this.categories).map(category => {
            const filteredImages = this.currentCategory === 'all' 
                ? this.galleryData 
                : this.galleryData.filter(item => item.category === category);
            const activeClass = category === this.currentCategory ? 'active' : '';

            const imagesHTML = filteredImages.map(item => `
                <div class="gallery-item">
                    <img src="${item.thumbnail || item.url}" 
                         alt="${item.title || 'תמונה'}" 
                         loading="lazy">
                    <div class="gallery-info">
                        <h3>${item.title || 'ללא כותרת'}</h3>
                        <p>${item.description || 'ללא תיאור'}</p>
                        <span class="category-tag">${this.categories[item.category] || item.category}</span>
                    </div>
                </div>
            `).join('');

            return `
                <div class="category-content ${activeClass}" id="${category}">
                    <div class="video-grid-wrapper">
                        ${imagesHTML || '<div class="no-images">אין תמונות בקטגוריה זו</div>'}
                    </div>
                </div>
            `;
        }).join('');

        tabsContainer.insertAdjacentHTML('afterend', contentHTML);
    }

    // בניית ההמלצות (מותאם לתמונות)
    renderRecommendations() {
        const recommendationsContainer = document.querySelector('#recommendations .modern-gallery');
        if (!recommendationsContainer) return;

        const recommendations = this.galleryData.slice(0, 4); // דוגמה: 4 תמונות ראשונות כהמלצות
        const recommendationsHTML = recommendations.map(item => `
            <div class="gallery-item">
                <img src="${item.thumbnail || item.url}" 
                     alt="${item.title || 'תמונה'}" 
                     loading="lazy">
                <div class="gallery-info">
                    <h3>${item.title || 'ללא כותרת'}</h3>
                    <p>${item.description || 'ללא תיאור'}</p>
                </div>
            </div>
        `).join('');

        recommendationsContainer.innerHTML = recommendationsHTML || '<div class="no-recommendations">אין המלצות</div>';
    }

    // בניית הלהיטים (מותאם לתמונות)
    renderHits() {
        const hitsContainer = document.querySelector('#videos .modern-gallery');
        if (!hitsContainer) return;

        const hits = this.galleryData.filter(item => item.uploadDate > '2025-06-14'); // דוגמה: תמונות מהחודש האחרון
        const hitsHTML = hits.map(item => `
            <div class="gallery-item">
                <img src="${item.thumbnail || item.url}" 
                     alt="${item.title || 'תמונה'}" 
                     loading="lazy">
                <div class="gallery-info">
                    <h3>${item.title || 'ללא כותרת'}</h3>
                    <p>${item.description || 'ללא תיאור'}</p>
                </div>
            </div>
        `).join('');

        hitsContainer.innerHTML = hitsHTML || '<div class="no-hits">אין להיטים</div>';
    }

    // קישור אירועים
    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-tab')) {
                this.switchCategory(e.target.dataset.category);
            }
        });
    }

    // החלפת קטגוריה
    switchCategory(categoryId) {
        document.querySelectorAll('.category-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector(`[data-category="${categoryId}"]`).classList.add('active');

        document.querySelectorAll('.category-content').forEach(content => content.classList.remove('active'));
        document.getElementById(categoryId).classList.add('active');

        this.currentCategory = categoryId;
    }
}

// אתחול כאשר הדף נטען
document.addEventListener('DOMContentLoaded', () => {
    const renderer = new CategoriesRenderer();
    renderer.init();
    window.categoriesRenderer = renderer;

    // טעינת נתונים מ-Cloudinary אם אין ב-localStorage
    if (renderer.galleryData.length === 0) {
        const cloudinaryConfig = JSON.parse(localStorage.getItem('cloudinaryConfig')) || {};
        if (cloudinaryConfig.cloudName && cloudinaryConfig.cloudName !== 'your-cloud-name') {
            console.log('☁️ Loading from Cloudinary...');
            fetch(`https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/list/gallery.json`)
                .then(response => response.json())
                .then(data => {
                    if (data.resources) {
                        renderer.galleryData = data.resources.map(resource => ({
                            id: resource.public_id,
                            url: resource.secure_url,
                            thumbnail: resource.secure_url.replace('/upload/', '/upload/w_300,h_200,c_fill,q_auto,f_auto/'),
                            fullsize: resource.secure_url.replace('/upload/', '/upload/w_1200,h_900,c_limit,q_auto,f_auto/'),
                            title: resource.context?.custom?.title || 'תמונה',
                            description: resource.context?.custom?.description || 'תמונה יפה',
                            category: resource.tags?.[0] || 'all',
                            uploadDate: resource.created_at
                        }));
                        localStorage.setItem('galleryData', JSON.stringify(renderer.galleryData));
                        renderer.init(); // רענון לאחר טעינה
                    }
                })
                .catch(error => console.error('❌ Error loading from Cloudinary:', error));
        }
    }
});