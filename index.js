// תיקון גלריה למובייל - גרסה עובדת עם תמונות

// זיהוי מובייל
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

console.log('🎈 Mobile Gallery Debug:', { isMobile, isLocalhost });

// נתוני גלריה עם תמונות אמיתיות
let galleryData = [];
let currentImageIndex = 0;
let filteredImages = [];

// קטגוריות קבועות
const categories = {
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

// פונקציה לטעינת נתוני דמו עם תמונות אמיתיות
function loadRealDemoData() {
    console.log('🎯 Loading real demo data...');
    
    galleryData = [
        // זרים ליום הולדת
        {
            id: 'bd1',
            title: 'זר בלונים קלאסי',
            description: 'זר בלונים צבעוני ליום הולדת',
            url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format',
            thumbnail: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300&h=200&fit=crop&auto=format',
            fullsize: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&auto=format',
            category: 'birthday-bouquets'
        },
        {
            id: 'bd2',
            title: 'זר בלונים מיוחד',
            description: 'זר בלונים עם עיצוב מיוחד',
            url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&auto=format',
            thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&auto=format',
            fullsize: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&auto=format',
            category: 'birthday-bouquets'
        },
        
        // מספרים מבלונים
        {
            id: 'bn1',
            title: 'מספר 1 מבלונים',
            description: 'בלון מספר גדול ליום הולדת',
            url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&auto=format',
            thumbnail: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=300&h=200&fit=crop&auto=format',
            fullsize: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1200&auto=format',
            category: 'balloon-numbers'
        },
        {
            id: 'bn2',
            title: 'מספרים זהובים',
            description: 'בלוני מספרים בצבע זהב',
            url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format',
            thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop&auto=format',
            fullsize: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format',
            category: 'balloon-numbers'
        },
        
        // קשתות
        {
            id: 'arch1',
            title: 'קשת בלונים צבעונית',
            description: 'קשת בלונים גדולה לכניסה',
            url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&auto=format',
            thumbnail: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=200&fit=crop&auto=format',
            fullsize: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200&auto=format',
            category: 'arches'
        },
        {
            id: 'arch2',
            title: 'קשת בלונים אלגנטית',
            description: 'קשת בלונים בעיצוב מינימליסטי',
            url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&auto=format',
            thumbnail: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=300&h=200&fit=crop&auto=format',
            fullsize: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=1200&auto=format',
            category: 'arches'
        },
        
        // פרחים עם בלונים
        {
            id: 'bf1',
            title: 'שילוב פרחים ובלונים',
            description: 'עיצוב מיוחד עם פרחים ובלונים',
            url: 'https://images.unsplash.com/photo-1546541865-a1e0de5ac8dc?w=800&auto=format',
            thumbnail: 'https://images.unsplash.com/photo-1546541865-a1e0de5ac8dc?w=300&h=200&fit=crop&auto=format',
            fullsize: 'https://images.unsplash.com/photo-1546541865-a1e0de5ac8dc?w=1200&auto=format',
            category: 'balloon-flowers'
        },
        {
            id: 'bf2',
            title: 'זר פרחים עם בלונים',
            description: 'זר פרחים טריים עם בלונים צבעוניים',
            url: 'https://images.unsplash.com/photo-1563473213013-de2a0133c100?w=800&auto=format',
            thumbnail: 'https://images.unsplash.com/photo-1563473213013-de2a0133c100?w=300&h=200&fit=crop&auto=format',
            fullsize: 'https://images.unsplash.com/photo-1563473213013-de2a0133c100?w=1200&auto=format',
            category: 'balloon-flowers'
        },
        
        // מרכזי שולחן
        {
            id: 'cp1',
            title: 'מרכז שולחן אלגנטי',
            description: 'עיצוב מרכז שולחן עם בלונים',
            url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&auto=format',
            thumbnail: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=300&h=200&fit=crop&auto=format',
            fullsize: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&auto=format',
            category: 'centerpiece'
        },
        
        // בלונים לילדים
        {
            id: 'kids1',
            title: 'בלונים צבעוניים לילדים',
            description: 'בלונים עליזים וצבעוניים',
            url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format',
            thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop&auto=format',
            fullsize: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format',
            category: 'balloons-for-kids'
        }
    ];
    
    console.log('✅ Demo data loaded:', galleryData.length, 'images');
    return galleryData;
}

// פונקציה ראשית ליצירת הגלריה
async function createGallery(selectedCategory = 'all') {
    console.log('🎯 Creating gallery for category:', selectedCategory);
    
    const gallerySection = document.getElementById('gallery');
    if (!gallerySection) {
        console.error('❌ Gallery section not found');
        return;
    }

    // הצגת מצב טעינה
    showLoadingState(gallerySection);

    try {
        // טעינת נתונים
        await loadGalleryData(selectedCategory);
        
        if (galleryData.length === 0) {
            console.warn('⚠️ No data found, loading demo data');
            loadRealDemoData();
        }
        
        // בניית הממשק
        buildGalleryUI(gallerySection, selectedCategory);
        
        // הוספת CSS
        addMobileCSS();
        
        // אתחול אירועים
        initEvents();
        
        console.log('✅ Gallery created successfully');
        
    } catch (error) {
        console.error('❌ Error creating gallery:', error);
        loadRealDemoData();
        buildGalleryUI(gallerySection, selectedCategory);
    }
}

// טעינת נתונים
async function loadGalleryData(selectedCategory) {
    console.log('📂 Loading gallery data...');
    
    // בדיקת localStorage תחילה
    const savedData = JSON.parse(localStorage.getItem('galleryData') || '[]');
    if (savedData.length > 0) {
        console.log('📦 Found saved data:', savedData.length, 'images');
        galleryData = savedData;
        return;
    }
    
    // אם אין נתונים שמורים, נטען דמו
    console.log('📦 No saved data, loading demo');
    loadRealDemoData();
}

// בניית ממשק הגלריה
function buildGalleryUI(gallerySection, selectedCategory) {
    console.log('🎨 Building UI for category:', selectedCategory);
    
    // סינון תמונות
    filteredImages = selectedCategory === 'all' 
        ? galleryData 
        : galleryData.filter(item => item.category === selectedCategory);

    console.log('🔍 Filtered images:', filteredImages.length);

    // יצירת כפתורי פילטר
    const categoryKeys = ['all', ...Object.keys(categories)];
    const filterButtons = categoryKeys.map(category => {
        const isActive = category === selectedCategory ? 'active' : '';
        const categoryName = category === 'all' ? '🎈 הכל' : categories[category];
        
        return `
            <button class="filter-btn ${isActive}" 
                    data-filter="${category}"
                    onclick="handleFilterClick('${category}')"
                    type="button">
                ${categoryName}
            </button>
        `;
    }).join('');

    // יצירת פריטי גלריה
    const galleryItems = filteredImages.length > 0 ? filteredImages.map((item, index) => `
        <div class="gallery-item" 
             data-category="${item.category}"
             data-index="${index}">
            <img src="${item.thumbnail || item.url}" 
                 alt="${item.title || 'תמונה'}" 
                 loading="lazy"
                 onclick="openLightbox(${index})"
                 onerror="handleImageError(this)">
            <div class="gallery-overlay">
                <div class="gallery-info">
                    <h3>${item.title || 'ללא כותרת'}</h3>
                    <p>${item.description || 'ללא תיאור'}</p>
                    <span class="category-tag">${categories[item.category] || item.category}</span>
                </div>
            </div>
        </div>
    `).join('') : '<div class="no-images">אין תמונות להצגה בקטגוריה זו</div>';

    // לייטבוקס
    const lightboxModal = `
        <div class="lightbox-modal" id="lightboxModal" onclick="closeLightboxOnBackdrop(event)">
            <div class="lightbox-content" onclick="event.stopPropagation()">
                <button class="close-lightbox" onclick="closeLightbox()" type="button">×</button>
                <img class="lightbox-image" src="" alt="" id="lightboxImage">
                <div class="lightbox-info">
                    <h3 class="lightbox-title" id="lightboxTitle"></h3>
                    <p class="lightbox-desc" id="lightboxDesc"></p>
                    <span class="lightbox-category" id="lightboxCategory"></span>
                </div>
                <button class="lightbox-prev" onclick="navigateLightbox(-1)" type="button">❮</button>
                <button class="lightbox-next" onclick="navigateLightbox(1)" type="button">❯</button>
                <div class="lightbox-counter">
                    <span id="currentImageNum">1</span> / <span id="totalImagesNum">${filteredImages.length}</span>
                </div>
            </div>
        </div>
    `;

    // מונה תמונות
    const imageCounter = `
        <div class="gallery-counter">
            ${filteredImages.length > 0 
                ? `נמצאו <strong>${filteredImages.length}</strong> תמונות`
                : `<span class="no-results">לא נמצאו תמונות בקטגוריה זו</span>`
            }
        </div>
    `;

    // בניית HTML
    const existingTitle = gallerySection.querySelector('.section-title');
    gallerySection.innerHTML = '';
    
    if (existingTitle) {
        gallerySection.appendChild(existingTitle);
    }

    gallerySection.insertAdjacentHTML('beforeend', `
        <div class="filter-section">
            <div class="filter-buttons">
                ${filterButtons}
            </div>
            ${imageCounter}
        </div>
        <div class="gallery-container" id="galleryContainer">
            ${galleryItems}
        </div>
        ${lightboxModal}
    `);

    console.log('✅ UI built successfully');
}

// פונקציות עזר
function handleFilterClick(category) {
    console.log('🔍 Filter clicked:', category);
    
    // הסרת active מכל הכפתורים
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // הוספת active לכפתור הנוכחי
    document.querySelector(`[data-filter="${category}"]`)?.classList.add('active');
    
    // יצירת הגלריה מחדש
    createGallery(category);
}

function handleImageError(img) {
    console.warn('⚠️ Image failed to load:', img.src);
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtGQ15XXkNGO16DXlCDZhNin16rXktef158ZgOKAjTwvdGV4dD48L3N2Zz4K';
}

function showLoadingState(container) {
    container.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>טוען תמונות...</p>
        </div>
    `;
}

// פונקציות לייטבוקס
function openLightbox(index) {
    console.log('🖼️ Opening lightbox for image:', index);
    
    if (!filteredImages[index]) {
        console.error('❌ Image not found at index:', index);
        return;
    }

    currentImageIndex = index;
    const image = filteredImages[index];
    const modal = document.getElementById('lightboxModal');
    
    if (!modal) {
        console.error('❌ Lightbox modal not found');
        return;
    }
    
    // עדכון תוכן
    document.getElementById('lightboxImage').src = image.fullsize || image.url;
    document.getElementById('lightboxTitle').textContent = image.title || 'ללא כותרת';
    document.getElementById('lightboxDesc').textContent = image.description || 'ללא תיאור';
    document.getElementById('lightboxCategory').textContent = categories[image.category] || image.category;
    document.getElementById('currentImageNum').textContent = index + 1;
    document.getElementById('totalImagesNum').textContent = filteredImages.length;

    // הצגת מודל
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const modal = document.getElementById('lightboxModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function closeLightboxOnBackdrop(event) {
    if (event.target === event.currentTarget) {
        closeLightbox();
    }
}

function navigateLightbox(direction) {
    currentImageIndex += direction;
    
    if (currentImageIndex < 0) {
        currentImageIndex = filteredImages.length - 1;
    } else if (currentImageIndex >= filteredImages.length) {
        currentImageIndex = 0;
    }
    
    openLightbox(currentImageIndex);
}

// אתחול אירועים
function initEvents() {
    // תמיכה במקלדת
    document.addEventListener('keydown', function(e) {
        const modal = document.getElementById('lightboxModal');
        if (!modal || !modal.classList.contains('active')) return;

        switch (e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                navigateLightbox(-1);
                break;
            case 'ArrowRight':
                navigateLightbox(1);
                break;
        }
    });
}

// CSS מותאם למובייל
function addMobileCSS() {
    if (document.getElementById('mobile-gallery-css')) return;

    const style = document.createElement('style');
    style.id = 'mobile-gallery-css';
    style.textContent = `
        /* CSS מותאם למובייל */
        .filter-section {
            margin-bottom: 20px;
            text-align: center;
        }

        .filter-buttons {
            display: flex;
            justify-content: center;
            gap: 8px;
            margin: 15px 0;
            flex-wrap: wrap;
            padding: 0 10px;
        }

        .filter-btn {
            padding: 8px 12px;
            border: 2px solid #e0e0e0;
            background: white;
            border-radius: 20px;
            cursor: pointer;
            font-size: 12px;
            color: #333;
            font-weight: 500;
            transition: all 0.3s ease;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
        }

        .filter-btn:active {
            transform: scale(0.95);
        }

        .filter-btn.active {
            background: #4CAF50;
            color: white;
            border-color: #4CAF50;
        }

        .gallery-counter {
            text-align: center;
            margin: 10px 0;
            font-size: 14px;
            color: #666;
        }

        .gallery-counter strong {
            color: #4CAF50;
        }

        .gallery-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            padding: 0 10px;
            margin: 0 auto;
        }

        .gallery-item {
            position: relative;
            cursor: pointer;
            overflow: hidden;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            background: white;
            height: 180px;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
        }

        .gallery-item:active {
            transform: scale(0.98);
        }

        .gallery-item img {
            width: 100%;
            height: 70%;
            object-fit: cover;
            display: block;
        }

        .gallery-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 30%;
            background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
            color: white;
            display: flex;
            align-items: flex-end;
            padding: 8px;
        }

        .gallery-info h3 {
            margin: 0 0 2px 0;
            font-size: 0.8em;
            font-weight: 600;
            line-height: 1.2;
        }

        .gallery-info p {
            margin: 0 0 2px 0;
            font-size: 0.7em;
            line-height: 1.2;
            opacity: 0.9;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .category-tag {
            background: rgba(76,175,80,0.8);
            padding: 2px 4px;
            border-radius: 6px;
            font-size: 0.6em;
        }

        /* לייטבוקס */
        .lightbox-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.95);
            z-index: 2000;
            justify-content: center;
            align-items: center;
        }

        .lightbox-modal.active {
            display: flex;
        }

        .lightbox-content {
            position: relative;
            width: 95%;
            max-width: 95%;
            max-height: 95%;
            display: flex;
            flex-direction: column;
        }

        .lightbox-image {
            width: 100%;
            max-height: 70vh;
            object-fit: contain;
            border-radius: 8px;
        }

        .lightbox-info {
            color: white;
            padding: 15px;
            text-align: center;
            background: rgba(0,0,0,0.8);
            border-radius: 0 0 8px 8px;
        }

        .lightbox-title {
            font-size: 1.1em;
            margin-bottom: 5px;
            color: #4CAF50;
        }

        .lightbox-desc {
            margin-bottom: 5px;
            font-size: 0.9em;
        }

        .lightbox-category {
            background: rgba(76,175,80,0.8);
            padding: 4px 8px;
            border-radius: 10px;
            font-size: 0.8em;
        }

        .close-lightbox {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.6);
            color: white;
            border: none;
            border-radius: 50%;
            width: 35px;
            height: 35px;
            font-size: 20px;
            cursor: pointer;
            z-index: 10;
        }

        .lightbox-prev, .lightbox-next {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(0,0,0,0.6);
            color: white;
            border: none;
            padding: 10px 6px;
            cursor: pointer;
            z-index: 10;
        }

        .lightbox-prev {
            left: 10px;
        }

        .lightbox-next {
            right: 10px;
        }

        .lightbox-counter {
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.6);
            color: white;
            padding: 5px 10px;
            border-radius: 10px;
            font-size: 12px;
            z-index: 10;
        }

        /* מצב טעינה */
        .loading-state {
            text-align: center;
            padding: 40px 20px;
            color: #666;
        }

        .loading-spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #4CAF50;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .no-images, .no-results {
            text-align: center;
            color: #999;
            font-style: italic;
            padding: 40px 20px;
        }

        /* רספונסיביות */
        @media (max-width: 360px) {
            .gallery-container {
                gap: 8px;
                padding: 0 5px;
            }
            
            .gallery-item {
                height: 160px;
            }
            
            .filter-btn {
                padding: 6px 8px;
                font-size: 11px;
            }
        }
    `;
    document.head.appendChild(style);
}

// API ציבורי
window.mobileGallery = {
    init: createGallery,
    refresh: () => {
        galleryData = [];
        loadRealDemoData();
        createGallery();
    },
    loadDemo: () => {
        loadRealDemoData();
        createGallery();
    },
    getStatus: () => ({
        totalImages: galleryData.length,
        filteredImages: filteredImages.length,
        isMobile,
        isLocalhost
    })
};

// אתחול אוטומטי
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎈 Mobile Gallery System Loading...');
    
    // טעינת נתוני דמו תמיד (לוודא שיש תמונות)
    loadRealDemoData();
    
    // יצירת הגלריה
    createGallery().then(() => {
        console.log('✅ Mobile Gallery loaded successfully!');
    }).catch(error => {
        console.error('❌ Failed to load gallery:', error);
        // נסה שוב עם נתוני דמו
        loadRealDemoData();
        createGallery();
    });
});

console.log('🎈 Mobile Gallery Script Loaded!');