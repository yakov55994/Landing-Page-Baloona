// תיקון בעיות מובייל - גרסה מתוקנת לגלריה

// בדיקת תמיכה במובייל
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

console.log('Mobile detected:', isMobile);
console.log('Is localhost:', isLocalhost);

// הגדרות מותאמות למובייל
let cloudinaryConfig = JSON.parse(localStorage.getItem('cloudinaryConfig')) || {
    cloudName: 'your-cloud-name',
    apiKey: 'your-api-key',
    uploadPreset: 'your-preset'
};

// תיקון בעיית CORS למובייל
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// קטגוריות עם fallback
let categories = JSON.parse(localStorage.getItem('categories')) || {
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

let galleryData = [];
let currentImageIndex = 0;
let filteredImages = [];

// פונקציה ראשית מתוקנת למובייל
async function createGallery(selectedCategory = 'all') {
    const gallerySection = document.getElementById('gallery');
    if (!gallerySection) {
        console.error('Gallery section not found');
        return;
    }

    console.log('Creating gallery for category:', selectedCategory);
    showLoadingState(gallerySection, true);

    try {
        // טעינת נתונים עם fallback למובייל
        await loadGalleryDataMobileFriendly(selectedCategory);
        
        if (galleryData.length === 0) {
            console.warn('No gallery data found, using demo data');
            loadDemoData();
        }
        
        buildGalleryUI(gallerySection, selectedCategory);
        initGalleryEvents();
        addMobileOptimizedCSS();
        
        console.log('Gallery created successfully with', galleryData.length, 'images');
        
    } catch (error) {
        console.error('Error creating gallery:', error);
        showErrorState(gallerySection, 'שגיאה בטעינת הגלריה');
        loadDemoData(); // fallback לנתוני דמו
        buildGalleryUI(gallerySection, selectedCategory);
    } finally {
        showLoadingState(gallerySection, false);
    }
}

// טעינת נתונים ידידותית למובייל
async function loadGalleryDataMobileFriendly(selectedCategory) {
    console.log('Loading gallery data for mobile...');
    
    // תחילה - בדיקת localStorage
    const savedData = JSON.parse(localStorage.getItem('galleryData')) || [];
    
    if (savedData.length > 0) {
        console.log('Found saved data:', savedData.length, 'images');
        galleryData = savedData;
        return;
    }

    // אם אין נתונים שמורים - ננסה לטעון מהשרת מקומי
    if (isLocalhost) {
        try {
            console.log('Trying to load from local server...');
            await loadFromLocalServer(selectedCategory);
            if (galleryData.length > 0) return;
        } catch (error) {
            console.warn('Local server not available:', error);
        }
    }

    // אם גם זה לא עובד - ננסה מ-Cloudinary עם fallback
    if (cloudinaryConfig.cloudName && cloudinaryConfig.cloudName !== 'your-cloud-name') {
        try {
            console.log('Trying to load from Cloudinary...');
            await loadFromCloudinaryMobile(selectedCategory);
            if (galleryData.length > 0) return;
        } catch (error) {
            console.warn('Cloudinary loading failed:', error);
        }
    }

    // אם כלום לא עובד - נטען נתוני דמו
    console.log('Loading demo data as fallback');
    loadDemoData();
}

// טעינה מהשרת המקומי עם timeout
async function loadFromLocalServer(selectedCategory) {
    const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
    );

    const categoriesToLoad = selectedCategory === 'all' ? Object.keys(categories) : [selectedCategory];
    const promises = categoriesToLoad.map(async category => {
        try {
            const fetchPromise = fetch(`/api/images/${category}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });
            
            const response = await Promise.race([fetchPromise, timeout]);
            
            if (response.ok) {
                const images = await response.json();
                return images.map(img => ({ ...img, category }));
            }
            return [];
        } catch (error) {
            console.warn(`Failed to load category ${category}:`, error);
            return [];
        }
    });

    const results = await Promise.all(promises);
    galleryData = results.flat().filter(Boolean);
    
    if (galleryData.length > 0) {
        localStorage.setItem('galleryData', JSON.stringify(galleryData));
    }
}

// טעינה מ-Cloudinary מותאמת למובייל
async function loadFromCloudinaryMobile(selectedCategory) {
    // שימוש ב-API פשוט יותר שעובד במובייל
    const categoriesToLoad = selectedCategory === 'all' ? Object.keys(categories) : [selectedCategory];
    
    for (const category of categoriesToLoad) {
        try {
            // חיפוש תמונות לפי tags
            const searchUrl = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/list/${category}.json`;
            
            // ניסיון ללא CORS proxy תחילה
            let response;
            try {
                response = await fetch(searchUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
            } catch (corsError) {
                // אם יש בעיית CORS, ננסה עם proxy
                console.log('CORS issue, trying with proxy...');
                response = await fetch(CORS_PROXY + encodeURIComponent(searchUrl));
            }

            if (response.ok) {
                const data = await response.json();
                if (data.resources && data.resources.length > 0) {
                    const processedImages = processCloudinaryResponse(data, category);
                    galleryData.push(...processedImages);
                }
            }
        } catch (error) {
            console.warn(`Failed to load category ${category} from Cloudinary:`, error);
        }
    }
    
    if (galleryData.length > 0) {
        localStorage.setItem('galleryData', JSON.stringify(galleryData));
    }
}

// עיבוד תגובה מ-Cloudinary
function processCloudinaryResponse(data, category) {
    if (!data || !data.resources) return [];
    
    return data.resources.map((resource, index) => ({
        id: resource.public_id || `${category}_${index}_${Date.now()}`,
        publicId: resource.public_id,
        url: resource.secure_url || resource.url,
        thumbnail: generateOptimizedUrl(resource.secure_url || resource.url, 'thumbnail'),
        image: generateOptimizedUrl(resource.secure_url || resource.url, 'medium'),
        fullsize: generateOptimizedUrl(resource.secure_url || resource.url, 'large'),
        title: resource.context?.custom?.title || `${categories[category]} ${index + 1}`,
        description: resource.context?.custom?.description || `תמונה יפה של ${categories[category]}`,
        category: category,
        uploadDate: resource.created_at || new Date().toISOString()
    }));
}

// יצירת URLs מאופטמים לגדלים שונים
function generateOptimizedUrl(originalUrl, size) {
    if (!originalUrl) return '';
    
    const transformations = {
        thumbnail: 'w_300,h_200,c_fill,q_auto,f_auto',
        medium: 'w_800,h_600,c_limit,q_auto,f_auto',
        large: 'w_1200,h_900,c_limit,q_auto,f_auto'
    };
    
    // אם זה URL של Cloudinary
    if (originalUrl.includes('cloudinary.com')) {
        return originalUrl.replace('/upload/', `/upload/${transformations[size]}/`);
    }
    
    // אם זה URL רגיל, נחזיר אותו כמו שהוא
    return originalUrl;
}

// טעינת נתוני דמו למובייל
function loadDemoData() {
    galleryData = [
        {
            id: 'demo_1',
            title: "זר בלונים ליום הולדת",
            description: "זר בלונים צבעוני ומיוחד ליום הולדת",
            url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800",
            thumbnail: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300&h=200&fit=crop&auto=format",
            image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format",
            fullsize: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&auto=format",
            category: "birthday-bouquets"
        },
        {
            id: 'demo_2',
            title: "מספרים מבלונים",
            description: "בלוני מספרים מיוחדים לחגיגות",
            url: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800",
            thumbnail: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=300&h=200&fit=crop&auto=format",
            image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&auto=format",
            fullsize: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1200&auto=format",
            category: "balloon-numbers"
        },
        {
            id: 'demo_3',
            title: "קשת בלונים מרהיבה",
            description: "קשת בלונים צבעונית לכניסת אירוע",
            url: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800",
            thumbnail: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=200&fit=crop&auto=format",
            image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&auto=format",
            fullsize: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200&auto=format",
            category: "arches"
        },
        {
            id: 'demo_4',
            title: "פרחים עם בלונים",
            description: "שילוב יפה של פרחים ובלונים",
            url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
            thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&auto=format",
            image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&auto=format",
            fullsize: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&auto=format",
            category: "balloon-flowers"
        },
        {
            id: 'demo_5',
            title: "מרכז שולחן מיוחד",
            description: "עיצוב מרכז שולחן עם בלונים",
            url: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800",
            thumbnail: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=300&h=200&fit=crop&auto=format",
            image: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&auto=format",
            fullsize: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=1200&auto=format",
            category: "centerpiece"
        },
        {
            id: 'demo_6',
            title: "בלונים לילדים",
            description: "בלונים צבעוניים ועליזים לילדים",
            url: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800",
            thumbnail: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=200&fit=crop&auto=format",
            image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&auto=format",
            fullsize: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200&auto=format",
            category: "balloons-for-kids"
        }
    ];
    
    console.log('Demo data loaded:', galleryData.length, 'images');
}

// בניית ממשק מותאם למובייל
function buildGalleryUI(gallerySection, selectedCategory) {
    console.log('Building UI for', galleryData.length, 'images');
    
    // סינון תמונות
    filteredImages = selectedCategory === 'all' 
        ? galleryData 
        : galleryData.filter(item => item.category === selectedCategory);

    console.log('Filtered images:', filteredImages.length);

    // יצירת כפתורי פילטר
    const categoryKeys = ['all', ...Object.keys(categories)];
    const filterButtons = categoryKeys.map(category => {
        const isActive = category === selectedCategory ? 'active' : '';
        const categoryName = category === 'all' ? '🎈 הכל' : categories[category];
        
        return `
            <button class="filter-btn ${isActive}" 
                    data-filter="${category}"
                    onclick="filterGallery('${category}')"
                    type="button">
                ${categoryName}
            </button>
        `;
    }).join('');

    // יצירת פריטי גלריה עם lazy loading
    const galleryItems = filteredImages.map((item, index) => `
        <div class="gallery-item" 
             data-category="${item.category}"
             data-index="${index}">
            <img src="${item.thumbnail || item.url}" 
                 alt="${item.title || 'תמונה'}" 
                 loading="lazy"
                 onclick="openLightbox(${index})"
                 onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtGQ15XXkNGO16DXlCDZhNin16jXktef158ZgOKAjTwvdGV4dD48L3N2Zz4K';">
            <div class="gallery-overlay">
                <div class="gallery-info">
                    <h3>${item.title || 'ללא כותרת'}</h3>
                    <p>${item.description || 'ללא תיאור'}</p>
                    <span class="category-tag">${categories[item.category] || item.category}</span>
                </div>
            </div>
        </div>
    `).join('');

    // לייטבוקס מותאם למובייל
    const lightboxModal = `
        <div class="lightbox-modal" id="lightboxModal" onclick="closeLightboxOnBackdrop(event)">
            <div class="lightbox-content" onclick="event.stopPropagation()">
                <button class="close-lightbox" onclick="closeLightbox()" type="button" aria-label="סגור">
                    <span>&times;</span>
                </button>
                <img class="lightbox-image" src="" alt="" id="lightboxImage">
                <div class="lightbox-info">
                    <h3 class="lightbox-title" id="lightboxTitle"></h3>
                    <p class="lightbox-desc" id="lightboxDesc"></p>
                    <span class="lightbox-category" id="lightboxCategory"></span>
                </div>
                <button class="lightbox-prev" onclick="navigateLightbox(-1)" type="button" aria-label="תמונה קודמת">
                    <span>❮</span>
                </button>
                <button class="lightbox-next" onclick="navigateLightbox(1)" type="button" aria-label="תמונה הבאה">
                    <span>❯</span>
                </button>
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
            ${galleryItems || '<p class="no-images">אין תמונות להצגה</p>'}
        </div>
        ${lightboxModal}
    `);

    console.log('UI built successfully');
}

// פונקציות לייטבוקס מתוקנות
function openLightbox(index) {
    console.log('Opening lightbox for image', index);
    
    if (!filteredImages[index]) {
        console.error('Image not found at index', index);
        return;
    }

    currentImageIndex = index;
    const image = filteredImages[index];
    const modal = document.getElementById('lightboxModal');
    
    if (!modal) {
        console.error('Lightbox modal not found');
        return;
    }
    
    // עדכון תוכן
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxDesc = document.getElementById('lightboxDesc');
    const lightboxCategory = document.getElementById('lightboxCategory');
    const currentImageNum = document.getElementById('currentImageNum');
    const totalImagesNum = document.getElementById('totalImagesNum');
    
    if (lightboxImage) {
        lightboxImage.src = image.fullsize || image.image || image.url;
        lightboxImage.alt = image.title || 'תמונה';
    }
    
    if (lightboxTitle) lightboxTitle.textContent = image.title || 'ללא כותרת';
    if (lightboxDesc) lightboxDesc.textContent = image.description || 'ללא תיאור';
    if (lightboxCategory) lightboxCategory.textContent = categories[image.category] || image.category;
    if (currentImageNum) currentImageNum.textContent = index + 1;
    if (totalImagesNum) totalImagesNum.textContent = filteredImages.length;

    // הצגת מודל
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    console.log('Lightbox opened');
}

function closeLightbox() {
    console.log('Closing lightbox');
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

// פילטור גלריה
function filterGallery(category) {
    console.log('Filtering gallery by category:', category);
    
    // הסרת active מכל הכפתורים
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // הוספת active לכפתור הנוכחי
    document.querySelector(`[data-filter="${category}"]`)?.classList.add('active');
    
    // יצירת הגלריה מחדש
    createGallery(category);
}

// מצבי טעינה ושגיאה
function showLoadingState(container, show) {
    if (show) {
        container.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>טוען תמונות...</p>
            </div>
        `;
    }
}

function showErrorState(container, message) {
    container.innerHTML = `
        <div class="error-state">
            <div class="error-icon">⚠️</div>
            <h3>שגיאה</h3>
            <p>${message}</p>
            <button class="retry-btn" onclick="createGallery()" type="button">נסה שוב</button>
        </div>
    `;
}

// אתחול אירועים
function initGalleryEvents() {
    console.log('Initializing gallery events');
    
    // תמיכה במקלדת
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    // תמיכה במגע למובייל
    initTouchSupport();
    
    // מניעת zoom במובייל בלחיצה כפולה
    if (isMobile) {
        document.addEventListener('touchend', function(e) {
            const now = new Date().getTime();
            const timeSince = now - lastTouchEnd;
            if ((timeSince < 300) && (timeSince > 0)) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }
}

let lastTouchEnd = 0;

function handleKeyboardNavigation(e) {
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
}

function initTouchSupport() {
    let touchStartX = 0;
    let touchEndX = 0;
    
    const modal = document.getElementById('lightboxModal');
    if (!modal) return;

    modal.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, {passive: true});

    modal.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipeGesture();
    }, {passive: true});

    function handleSwipeGesture() {
        const swipeThreshold = 50;
        const difference = touchStartX - touchEndX;

        if (Math.abs(difference) > swipeThreshold) {
            if (difference > 0) {
                navigateLightbox(1);
            } else {
                navigateLightbox(-1);
            }
        }
    }
}

// CSS מותאם למובייל
function addMobileOptimizedCSS() {
    if (document.getElementById('mobile-gallery-styles')) return;

    const style = document.createElement('style');
    style.id = 'mobile-gallery-styles';
    style.textContent = `
        /* סגנונות מותאמים למובייל */
        .filter-section {
            margin-bottom: 30px;
            text-align: center;
        }

        .filter-buttons {
            display: flex;
            justify-content: center;
            gap: 8px;
            margin: 20px 0;
            flex-wrap: wrap;
            padding: 0 15px;
        }

        .filter-btn {
            padding: 10px 16px;
            border: 2px solid #e0e0e0;
            background: white;
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: inherit;
            font-size: 13px;
            color: #333;
            font-weight: 500;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
        }

        .filter-btn:hover,
        .filter-btn:active {
            border-color: #4CAF50;
            background: #4CAF50;
            color: white;
            transform: scale(0.98);
        }

        .filter-btn.active {
            background: #4CAF50;
            color: white;
            border-color: #4CAF50;
        }

        .gallery-counter {
            text-align: center;
            margin: 15px 0;
            font-size: 14px;
            color: #666;
        }

        .gallery-counter strong {
            color: #4CAF50;
        }

        .gallery-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            padding: 0 15px;
            max-width: 100%;
            margin: 0 auto;
        }

        .gallery-item {
            position: relative;
            cursor: pointer;
            overflow: hidden;
            border-radius: 12px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            background: white;
            height: 200px;
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
            transition: transform 0.3s ease;
        }

        .gallery-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 30%;
            background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.4), transparent);
            color: white;
            display: flex;
            align-items: flex-end;
            padding: 12px;
        }

        .gallery-info h3 {
            margin: 0 0 4px 0;
            color: white;
            font-size: 0.9em;
            font-weight: 600;
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
            line-height: 1.2;
        }

        .gallery-info p {
            margin: 0 0 4px 0;
            color: rgba(255,255,255,0.9);
            font-size: 0.75em;
            line-height: 1.3;
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .category-tag {
            background: rgba(76,175,80,0.8);
            color: white;
            padding: 2px 6px;
            border-radius: 8px;
            font-size: 0.7em;
            align-self: flex-start;
        }

        /* לייטבוקס מותאם למובייל */
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
            touch-action: manipulation;
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
            background: #000;
        }

        .lightbox-info {
            color: white;
            padding: 15px;
            text-align: center;
            background: rgba(0,0,0,0.8);
            border-radius: 0 0 8px 8px;
            margin-top: auto;
        }

        .lightbox-title {
            font-size: 1.2em;
            margin-bottom: 8px;
            color: #4CAF50;
        }

        .lightbox-desc {
            margin-bottom: 8px;
            line-height: 1.4;
            font-size: 0.9em;
        }

        .lightbox-category {
            background: rgba(76,175,80,0.8);
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            display: inline-block;
        }

        .close-lightbox {
            position: absolute;
            top: 10px;
            right: 10px;
            color: white;
            background: rgba(0,0,0,0.6);
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 24px;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            z-index: 10;
        }

        .close-lightbox:active {
            background: rgba(76,175,80,0.8);
            transform: scale(0.95);
        }

        .lightbox-prev, .lightbox-next {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(0,0,0,0.6);
            color: white;
            border: none;
            font-size: 20px;
            padding: 12px 8px;
            cursor: pointer;
            border-radius: 4px;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            z-index: 10;
        }

        .lightbox-prev:active, .lightbox-next:active {
            background: rgba(76,175,80,0.8);
            transform: translateY(-50%) scale(0.95);
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
            color: white;
            background: rgba(0,0,0,0.6);
            padding: 6px 12px;
            border-radius: 15px;
            font-size: 12px;
            z-index: 10;
        }

        /* מצבי טעינה ושגיאה */
        .loading-state, .error-state {
            text-align: center;
            padding: 40px 20px;
            color: #666;
        }

        .loading-spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #4CAF50;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .error-icon {
            font-size: 2.5rem;
            margin-bottom: 15px;
        }

        .retry-btn {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
        }

        .retry-btn:active {
            background: #45a049;
            transform: scale(0.98);
        }

        .no-images {
            text-align: center;
            color: #999;
            font-style: italic;
            padding: 40px 20px;
        }

        .no-results {
            color: #999;
            font-style: italic;
        }

        /* רספונסיביות מתקדמת */
        @media (max-width: 480px) {
            .filter-buttons {
                gap: 6px;
                padding: 0 10px;
            }
            
            .filter-btn {
                padding: 8px 12px;
                font-size: 12px;
            }
            
            .gallery-container {
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
                padding: 0 10px;
            }
            
            .gallery-item {
                height: 180px;
            }
            
            .gallery-overlay {
                padding: 10px;
            }
            
            .gallery-info h3 {
                font-size: 0.8em;
            }
            
            .gallery-info p {
                font-size: 0.7em;
            }
            
            .lightbox-image {
                max-height: 60vh;
            }
            
            .lightbox-info {
                padding: 12px;
            }
            
            .lightbox-title {
                font-size: 1em;
            }
            
            .lightbox-desc {
                font-size: 0.85em;
            }
        }

        @media (max-width: 360px) {
            .gallery-container {
                gap: 10px;
                padding: 0 8px;
            }
            
            .gallery-item {
                height: 160px;
            }
            
            .filter-btn {
                padding: 6px 10px;
                font-size: 11px;
            }
        }

        /* תמיכה במכשירים עם notch */
        @supports (padding: max(0px)) {
            .lightbox-modal {
                padding: max(10px, env(safe-area-inset-top)) max(10px, env(safe-area-inset-right)) max(10px, env(safe-area-inset-bottom)) max(10px, env(safe-area-inset-left));
            }
        }

        /* אופטימיזציה לביצועים */
        .gallery-item img {
            will-change: transform;
        }

        .lightbox-modal {
            will-change: opacity, visibility;
        }

        /* מניעת בחירת טקסט במובייל */
        .gallery-item,
        .filter-btn,
        .lightbox-modal {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }

        /* שיפור נגישות */
        .filter-btn:focus,
        .close-lightbox:focus,
        .lightbox-prev:focus,
        .lightbox-next:focus,
        .retry-btn:focus {
            outline: 2px solid #4CAF50;
            outline-offset: 2px;
        }

        /* אנימציות מוקטנות למובייל */
        @media (prefers-reduced-motion: reduce) {
            .gallery-item,
            .filter-btn,
            .lightbox-content {
                transition: none;
            }
            
            .loading-spinner {
                animation: none;
            }
        }
    `;
    document.head.appendChild(style);
}

// פונקציות עזר נוספות למובייל

// בדיקת רשת
function checkNetworkStatus() {
    if ('connection' in navigator) {
        const connection = navigator.connection;
        console.log('Network type:', connection.effectiveType);
        console.log('Downlink:', connection.downlink);
        
        // אם הרשת איטית, נטען תמונות קטנות יותר
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            return 'slow';
        }
    }
    return 'normal';
}

// טעינה מותאמת לרשת
function loadImageWithNetworkOptimization(imageUrl, element) {
    const networkStatus = checkNetworkStatus();
    
    if (networkStatus === 'slow') {
        // בשביל רשת איטית, נטען תמונה קטנה יותר
        const optimizedUrl = imageUrl.replace(/w_\d+/, 'w_200').replace(/h_\d+/, 'h_150');
        element.src = optimizedUrl;
    } else {
        element.src = imageUrl;
    }
}

// מחיקת מטמון ישן
function clearOldCache() {
    const cacheKeys = ['galleryData', 'galleryDataCache', 'categories', 'cloudinaryConfig'];
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    cacheKeys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
            try {
                const parsed = JSON.parse(data);
                if (parsed.timestamp && parsed.timestamp < oneWeekAgo) {
                    localStorage.removeItem(key);
                    console.log('Removed old cache:', key);
                }
            } catch (e) {
                // אם הנתונים לא תקינים, נמחק אותם
                localStorage.removeItem(key);
            }
        }
    });
}

// API ציבורי מותאם למובייל
window.mobileGalleryAPI = {
    // רענון עם אופטימיזציה למובייל
    refresh: async (category = 'all') => {
        console.log('Mobile refresh initiated');
        clearOldCache();
        await createGallery(category);
    },
    
    // בדיקת סטטוס
    getStatus: () => ({
        isMobile,
        isLocalhost,
        imagesLoaded: galleryData.length,
        filteredImages: filteredImages.length,
        networkStatus: checkNetworkStatus()
    }),
    
    // הגדרת מצב דמו
    enableDemoMode: () => {
        localStorage.removeItem('galleryData');
        loadDemoData();
        createGallery();
    },
    
    // ניקוי מטמון מלא
    clearAllCache: () => {
        localStorage.clear();
        galleryData = [];
        filteredImages = [];
        console.log('All cache cleared');
    }
};

// אתחול אוטומטי
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎈 Mobile Gallery System Loading...');
    console.log('Device info:', {
        isMobile,
        isLocalhost,
        userAgent: navigator.userAgent,
        screen: `${screen.width}x${screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`
    });
    
    // ניקוי מטמון ישן
    clearOldCache();
    
    // אתחול הגלריה
    createGallery().then(() => {
        console.log('✅ Gallery initialized successfully');
    }).catch(error => {
        console.error('❌ Gallery initialization failed:', error);
        // נסה שוב עם נתוני דמו
        loadDemoData();
        createGallery();
    });
    
    // הודעת דיבוג למובייל
    if (isMobile) {
        console.log('📱 Mobile optimizations enabled');
        
        // הצגת מידע דיבוג על המסך במובייל (רק לפיתוח)
        if (window.location.search.includes('debug=true')) {
            const debugInfo = document.createElement('div');
            debugInfo.style.cssText = 'position:fixed;top:0;left:0;background:rgba(0,0,0,0.8);color:white;padding:10px;font-size:12px;z-index:9999;';
            debugInfo.innerHTML = `
                📱 Mobile Debug<br>
                Images: ${galleryData.length}<br>
                Network: ${checkNetworkStatus()}<br>
                LocalHost: ${isLocalhost}<br>
                Viewport: ${window.innerWidth}x${window.innerHeight}
            `;
            document.body.appendChild(debugInfo);
            
            setTimeout(() => debugInfo.remove(), 5000);
        }
    }
});

// יצוא לשימוש חיצונی
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createGallery,
        openLightbox,
        closeLightbox,
        filterGallery,
        mobileGalleryAPI: window.mobileGalleryAPI
    };
}

console.log('🎈 Mobile-optimized Gallery System loaded!');
console.log('Available APIs:', Object.keys(window.mobileGalleryAPI || {}));