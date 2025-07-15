// categories-renderer.js - קובץ לבניית ה-HTML הדינמי

class CategoriesRenderer {
    constructor() {
        this.currentCategory = null; // קטגוריה ברירת מחדל
        this.galleryData = [];
    }

    // אתחול הקטגוריות והתוכן
    async init() {
        await this.loadGalleryDataFromAPI();
        this.renderCategoryTabs();
        this.renderImagesByCategory(this.getDefaultCategoryId());
        this.bindEvents();
    }

    // טען את כל התמונות מה-API
    async loadGalleryDataFromAPI() {
        const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3001'
            : 'https://baloona-backend.onrender.com'; // שנה ל-URL שלך
        try {
            const response = await fetch(`${API_BASE_URL}/api/balloon-gallery`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }
            });
            if (response.ok) {
                this.galleryData = await response.json();
            } else {
                this.galleryData = [];
            }
        } catch (e) {
            this.galleryData = [];
        }
    }

    // החזר את הקטגוריה הראשונה כברירת מחדל
    getDefaultCategoryId() {
        const categories = CategoriesManager.getAllCategories();
        return categories.length > 0 ? categories[0].id : null;
    }

    // בניית טאבים של הקטגוריות
    renderCategoryTabs() {
        const tabsContainer = document.querySelector('.category-tabs');
        if (!tabsContainer) return;

        const categories = CategoriesManager.getAllCategories();
        const tabsHTML = categories.map((category, index) => {
            const activeClass = index === 0 ? 'active' : '';
            return `<div class="category-tab ${activeClass}" data-category="${category.id}">${category.name}</div>`;
        }).join('');

        tabsContainer.innerHTML = tabsHTML;
    }

    // הצגת תמונות לפי קטגוריה
    renderImagesByCategory(categoryId) {
        this.currentCategory = categoryId;
        const gallerySection = document.querySelector('#gallery');
        if (!gallerySection) return;

        // סנן תמונות לפי קטגוריה
        const filteredImages = this.galleryData.filter(img => img.category === categoryId);

        // בנה HTML
        const imagesHTML = filteredImages.length > 0 ? filteredImages.map(img => `
            <div class="gallery-item">
                <img onclick="openLightbox(${index})" style="cursor: pointer src="${img.thumbnail || img.url}" alt="${img.title || ''}">
            </div>
        `).join('') : '<p>אין תמונות בקטגוריה זו</p>';

        // שמור את הטאבים (אם קיימים)
        const tabs = document.querySelector('.category-tabs');
        gallerySection.innerHTML = '';
        if (tabs) gallerySection.appendChild(tabs);
        gallerySection.insertAdjacentHTML('beforeend', `<div class="gallery-container">${imagesHTML}</div>`);

        // עדכן טאבים
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.category === categoryId) tab.classList.add('active');
        });
    }

    // קישור אירועים
    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-tab')) {
                const categoryId = e.target.dataset.category;
                this.renderImagesByCategory(categoryId);
            }
        });
    }
}

// אתחול כאשר הדף נטען
document.addEventListener('DOMContentLoaded', () => {
    // ודא שקובץ הנתונים נטען
    if (typeof CategoriesManager !== 'undefined') {
        const renderer = new CategoriesRenderer();
        renderer.init();
        
        // הפוך את הרנדרר זמין גלובלית לשימוש אחר
        window.categoriesRenderer = renderer;
    } else {
        console.error('CategoriesManager לא נטען. ודא שקובץ categories-data.js נטען לפני קובץ זה.');
    }
});