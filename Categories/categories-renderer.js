// categories-renderer.js - קובץ לבניית ה-HTML הדינמי

class CategoriesRenderer {
    constructor() {
        this.currentCategory = 'bar-mitzvah'; // קטגוריה ברירת מחדל
    }

    // אתחול הקטגוריות והתוכן
    init() {
        this.renderCategoryTabs();
        this.renderCategoryContent();
        // this.renderRecommendations();
        this.renderHits();
        this.bindEvents();
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

    // בניית תוכן הקטגוריות
    renderCategoryContent() {
        const gallerySection = document.querySelector('#gallery');
        if (!gallerySection) return;

        // מוצא את המיקום אחרי הטאבים
        const tabsContainer = gallerySection.querySelector('.category-tabs');
        
        // בונה תוכן לכל קטגוריה
        const categories = CategoriesManager.getAllCategories();
        const contentHTML = categories.map((category, index) => {
            const videos = CategoriesManager.getVideosByCategory(category.id);
            const activeClass = index === 0 ? 'active' : '';
            
            const videosHTML = videos.map(video => 
                CategoriesManager.buildVideoHTML(video)
            ).join('');

            return `
                <div class="category-content ${activeClass}" id="${category.id}">
                    <div class="video-grid-wrapper">
                        ${videosHTML}
                    </div>
                </div>
            `;
        }).join('');

        // הוסף את התוכן אחרי הטאבים
        tabsContainer.insertAdjacentHTML('afterend', contentHTML);
    }

    // בניית ההמלצות
    // renderRecommendations() {
    //     const recommendationsContainer = document.querySelector('#recommendations .modern-gallery');
    //     if (!recommendationsContainer) return;

    //     const recommendations = CategoriesManager.getAllRecommendations();
    //     const recommendationsHTML = recommendations.map(recommendation => 
    //         CategoriesManager.buildRecommendationHTML(recommendation)
    //     ).join('');

    //     recommendationsContainer.innerHTML = recommendationsHTML;
    // }

    // בניית הלהיטים
    renderHits() {
        const hitsContainer = document.querySelector('#videos .modern-gallery');
        if (!hitsContainer) return;

        const hits = CategoriesManager.getAllHits();
        const hitsHTML = hits.map(hit => 
            CategoriesManager.buildHitHTML(hit)
        ).join('');

        hitsContainer.innerHTML = hitsHTML;
    }

    // קישור אירועים
    bindEvents() {
        // אירועי לחיצה על טאבים
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-tab')) {
                this.switchCategory(e.target.dataset.category);
            }
        });

        // אירועי לחיצה על סרטונים
        document.addEventListener('click', (e) => {
            const videoItem = e.target.closest('.video-carousel-item');
            if (videoItem) {
                this.playVideo(videoItem);
            }
        });
    }

    // החלפת קטגוריה
    switchCategory(categoryId) {
        // עדכן את הטאב הפעיל
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-category="${categoryId}"]`).classList.add('active');

        // עדכן את התוכן הפעיל
        document.querySelectorAll('.category-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(categoryId).classList.add('active');

        this.currentCategory = categoryId;
    }

    // הפעלת סרטון
    playVideo(videoItem) {
        const video = videoItem.querySelector('video');
        const overlay = videoItem.querySelector('.event-overlay');
        
        if (video.paused) {
            // עצור את כל הסרטונים האחרים
            document.querySelectorAll('.event-video').forEach(v => {
                if (v !== video) {
                    v.pause();
                    v.closest('.video-carousel-item').querySelector('.event-overlay').style.opacity = '1';
                }
            });
            
            video.play();
            overlay.style.opacity = '0';
        } else {
            video.pause();
            overlay.style.opacity = '1';
        }
    }

    // פונקציות עזר נוספות
    addNewVideo(categoryId, videoData) {
        if (!categoriesData.videos[categoryId]) {
            categoriesData.videos[categoryId] = [];
        }
        categoriesData.videos[categoryId].push(videoData);
        
        // רענן את התצוגה אם זו הקטגוריה הפעילה
        if (this.currentCategory === categoryId) {
            this.renderCategoryContent();
        }
    }

    removeVideo(categoryId, videoId) {
        if (categoriesData.videos[categoryId]) {
            categoriesData.videos[categoryId] = categoriesData.videos[categoryId]
                .filter(video => video.id !== videoId);
            
            // רענן את התצוגה אם זו הקטגוריה הפעילה
            if (this.currentCategory === categoryId) {
                this.renderCategoryContent();
            }
        }
    }

    // עדכון מידע סרטון
    updateVideo(categoryId, videoId, newData) {
        if (categoriesData.videos[categoryId]) {
            const videoIndex = categoriesData.videos[categoryId]
                .findIndex(video => video.id === videoId);
            
            if (videoIndex !== -1) {
                categoriesData.videos[categoryId][videoIndex] = {
                    ...categoriesData.videos[categoryId][videoIndex],
                    ...newData
                };
                
                // רענן את התצוגה אם זו הקטגוריה הפעילה
                if (this.currentCategory === categoryId) {
                    this.renderCategoryContent();
                }
            }
        }
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