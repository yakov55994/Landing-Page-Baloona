// תיקון בעיות מובייל - גרסה מתוקנת לגלריה עם Dropdown ומספור תמונות

// בדיקת תמיכה במובייל
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

console.log('Mobile detected:', isMobile);
console.log('Is localhost:', isLocalhost);

// הגדרות מותאמות למובייל
let cloudinaryConfig = JSON.parse(localStorage.getItem('cloudinaryConfig')) || {
    cloudName: 'dbbivwbbt',
    apiKey: '549784497364423',
    uploadPreset: 'balloon_gallery',
    folder: 'balloon-gallery'
};

// תיקון בעיית CORS למובייל
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// קטגוריות עם fallback
let categories = JSON.parse(localStorage.getItem('categories')) || {
  "": "בחר קטגוריה",
  "room-arrangements": "סידורי חדרים",
  "balloon-numbers": "מספרים מבלונים", 
  "arches": "קשתות",
  "photo-reviews": "קירות צילום",
  "flowers-balloons": "פרחים מבלונים",
  "kids-balloons": "בלונים לילדים",
  "gender-reveal": "גילוי מין",
  "balloon-bouquet": "זר בלונים",
  "centerpiece": "שולחן מרכזי",
  "birth-celebration": "הולדת בן / בת"
};

let galleryData = [];
let currentImageIndex = 0;
let filteredImages = [];

// פונקציה ראשית מתוקנת למובייל
async function createGallery(selectedCategory = null) {
    const gallerySection = document.getElementById('gallery');
    if (!gallerySection) {
        console.error('Gallery section not found');
        return;
    }

    // אם לא נבחרה קטגוריה, נבחר את הראשונה
    const categoryKeys = Object.keys(categories).filter(key => key !== "");
    if (!selectedCategory || selectedCategory === 'all') {
        selectedCategory = categoryKeys[0];
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

// טעינה מהשרת המקומי עם timeout - תמיכה מלאה במספור
async function loadFromLocalServer(selectedCategory) {
    const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
    );

    try {
        const fetchPromise = fetch('http://localhost:3001/api/gallery', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
        
        const response = await Promise.race([fetchPromise, timeout]);
        
        if (response.ok) {
            const images = await response.json();
            // עיבוד התמונות עם מספור אוטומטי
            galleryData = images.map((img, index) => ({
                id: img.public_id || `image_${index}_${Date.now()}`,
                publicId: img.public_id,
                url: img.url || img.secure_url,
                thumbnail: generateOptimizedUrl(img.url || img.secure_url, 'thumbnail'),
                image: generateOptimizedUrl(img.url || img.secure_url, 'medium'),
                fullsize: generateOptimizedUrl(img.url || img.secure_url, 'large'),
                category: extractCategoryFromPath(img.public_id || img.folder),
                uploadDate: img.created_at || new Date().toISOString(),
                imageNumber: index + 1 // הוספת מספר תמונה
            }));
            
            if (galleryData.length > 0) {
                localStorage.setItem('galleryData', JSON.stringify(galleryData));
            }
        } else {
            galleryData = [];
        }
    } catch (error) {
        console.warn('Failed to load from server:', error);
        galleryData = [];
    }
}

// פונקציה לחילוץ קטגוריה מהנתיב
function extractCategoryFromPath(path) {
    if (!path) return 'balloon-bouquet'; // ברירת מחדל
    
    // אם יש בנתיב 'gallery/' נחלץ את מה שאחרי
    if (path.includes('gallery/')) {
        const parts = path.split('gallery/')[1].split('/');
        return parts[0] || 'balloon-bouquet';
    }
    
    // אם זה רק תיקייה, נבדוק אם זה אחת הקטגוריות הידועות
    const knownCategories = Object.keys(categories).filter(k => k !== "");
    const foundCategory = knownCategories.find(cat => path.includes(cat));
    
    return foundCategory || 'balloon-bouquet';
}

// טעינה מ-Cloudinary מותאמת למובייל עם מספור
async function loadFromCloudinaryMobile(selectedCategory) {
    console.log('Loading images from Cloudinary folder:', cloudinaryConfig.folder);
    
    try {
        // URL לטעינת כל התמונות מהתקייה הראשית
        const searchUrl = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/list/${cloudinaryConfig.folder}.json`;

        let response;
        try {
            response = await fetch(searchUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
        } catch (corsError) {
            console.log('CORS issue, trying with proxy...');
            response = await fetch(CORS_PROXY + encodeURIComponent(searchUrl));
        }

        if (response.ok) {
            const data = await response.json();
            if (data.resources && data.resources.length > 0) {
                // עיבוד כל התמונות וזיהוי הקטגוריה מהתת-תיקייה
                galleryData = processCloudinaryResponse(data);
            }
        } else {
            console.warn('No images found in folder:', cloudinaryConfig.folder);
        }
    } catch (error) {
        console.error('Error loading from Cloudinary:', error);
    }

    if (galleryData.length > 0) {
        localStorage.setItem('galleryData', JSON.stringify(galleryData));
    }
}

// עיבוד תגובה מ-Cloudinary עם מספור
function processCloudinaryResponse(data) {
    if (!data || !data.resources) return [];

    return data.resources.map((resource, index) => {
        // קבל את שם התת-תיקייה מה-public_id
        const folderPath = resource.public_id.split('/');
        const category = extractCategoryFromPath(resource.public_id);

        return {
            id: resource.public_id || `image_${index}_${Date.now()}`,
            publicId: resource.public_id,
            url: resource.secure_url || resource.url,
            thumbnail: generateOptimizedUrl(resource.secure_url || resource.url, 'thumbnail'),
            image: generateOptimizedUrl(resource.secure_url || resource.url, 'medium'),
            fullsize: generateOptimizedUrl(resource.secure_url || resource.url, 'large'),
            category: category,
            uploadDate: resource.created_at || new Date().toISOString(),
            imageNumber: index + 1 // הוספת מספר תמונה
        };
    });
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

// טעינת נתוני דמו למובייל עם מספור
function loadDemoData() {
    galleryData = [    ];
    
    console.log('Demo data loaded:', galleryData.length, 'images');
}

// בניית ממשק מותאם למובייל עם Dropdown ומספור תמונות
function buildGalleryUI(gallerySection, selectedCategory) {
    console.log('Building UI for', galleryData.length, 'images');
    
    // סינון תמונות לקטגוריה הנבחרת
    filteredImages = galleryData.filter(item => item.category === selectedCategory);

    // מיון לפי מספר תמונה
    filteredImages.sort((a, b) => (a.imageNumber || 0) - (b.imageNumber || 0));

    console.log('Filtered images:', filteredImages.length);

    // יצירת Dropdown
    const categoryKeys = Object.keys(categories).filter(key => key !== "");
    const dropdownItems = categoryKeys.map(category => {
        const isActive = category === selectedCategory ? 'active' : '';
        const categoryName = categories[category];
        const categoryIcon = getCategoryIcon(category);
        
        return `
            <button class="dropdown-item ${isActive}" 
                    data-filter="${category}"
                    onclick="selectCategory('${category}')"
                    type="button">
                ${categoryIcon} ${categoryName}
            </button>
        `;
    }).join('');

    const selectedCategoryName = categories[selectedCategory] || categories[categoryKeys[0]];
    const selectedIcon = getCategoryIcon(selectedCategory);

    // יצירת פריטי גלריה עם lazy loading ומספור
    const galleryItems = filteredImages.map((item, index) => `
        <div class="gallery-item" 
             data-category="${item.category}"
             data-index="${index}">
            <div class="image-number">${item.imageNumber || index + 1}</div>
            <img src="${item.thumbnail || item.url}" 
                 alt="${item.title || 'תמונה'}" 
                 loading="lazy"
                 onclick="openLightbox(${index})"
                 onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtGQ15XXkNGO16DXlDwvdGV4dD48L3N2Zz4K';">
            <div class="gallery-overlay">
                <div class="gallery-info">
                </div>
            </div>
        </div>
    `).join('');

    // לייטבוקס מותאם למובייל עם תמיכה במספור
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
                    <div class="lightbox-image-number" id="lightboxImageNumber"></div>
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
                ? `נמצאו <strong>${filteredImages.length}</strong> תמונות ב${categories[selectedCategory]}`
                : `<span class="no-results">לא נמצאו תמונות בקטגוריה זו</span>`
            }
        </div>
    `;

    // בניית HTML עם Dropdown
    const existingTitle = gallerySection.querySelector('.section-title');
    gallerySection.innerHTML = '';
    
    if (existingTitle) {
        gallerySection.appendChild(existingTitle);
    }

    gallerySection.insertAdjacentHTML('beforeend', `
        <div class="filter-section">
            <div class="filter-dropdown">
                <button class="dropdown-toggle" id="filterToggle">
                    <span id="selectedFilter">${selectedIcon} ${selectedCategoryName}</span>
                    <span class="dropdown-arrow">▼</span>
                </button>
                
                <div class="dropdown-menu" id="filterMenu">
                    ${dropdownItems}
                </div>
                
                <div class="dropdown-overlay" id="dropdownOverlay"></div>
            </div>
            ${imageCounter}
        </div>
        <div class="gallery-container" id="galleryContainer">
            ${galleryItems || '<p class="no-images">אין תמונות להצגה</p>'}
        </div>
        ${lightboxModal}
    `);

    // אתחול הדרופדאון
    initDropdownEvents();

    console.log('UI built successfully');
}

// פונקציה לקבלת אייקון קטגוריה
function getCategoryIcon(category) {
    const icons = {
        'room-arrangements': '🏠',
        'balloon-numbers': '🔢',
        'arches': '🌈',
        'photo-reviews': '📸',
        'flowers-balloons': '🌸',
        'kids-balloons': '👶',
        'gender-reveal': '👶',
        'balloon-bouquet': '💐',
        'centerpiece': '🎯',
        'birth-celebration': '🎂'
    };
    return icons[category] || '🎈';
}

// אתחול אירועי הדרופדאון
function initDropdownEvents() {
    const filterToggle = document.getElementById('filterToggle');
    const filterMenu = document.getElementById('filterMenu');
    const dropdownOverlay = document.getElementById('dropdownOverlay');

    if (!filterToggle || !filterMenu || !dropdownOverlay) return;

    function toggleDropdown() {
        const isActive = filterMenu.classList.contains('active');
        
        if (isActive) {
            closeDropdown();
        } else {
            openDropdown();
        }
    }

    function openDropdown() {
        filterToggle.classList.add('active');
        filterMenu.classList.add('active');
        dropdownOverlay.classList.add('active');
    }

    function closeDropdown() {
        filterToggle.classList.remove('active');
        filterMenu.classList.remove('active');
        dropdownOverlay.classList.remove('active');
    }

    filterToggle.addEventListener('click', toggleDropdown);
    dropdownOverlay.addEventListener('click', closeDropdown);

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && filterMenu.classList.contains('active')) {
            closeDropdown();
        }
    });

    filterMenu.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    window.toggleDropdown = toggleDropdown;
    window.closeDropdown = closeDropdown;
}

// פונקציה לבחירת קטגוריה
function selectCategory(category) {
    console.log('Category selected:', category);
    
    const selectedFilterSpan = document.getElementById('selectedFilter');
    const categoryName = categories[category];
    const categoryIcon = getCategoryIcon(category);
    
    if (selectedFilterSpan) {
        selectedFilterSpan.textContent = `${categoryIcon} ${categoryName}`;
    }
    
    if (window.closeDropdown) {
        window.closeDropdown();
    }
    
    filterGallery(category);
}

// פונקציות לייטבוקס מתוקנות עם מספור
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
    const lightboxImageNumber = document.getElementById('lightboxImageNumber');
    const currentImageNum = document.getElementById('currentImageNum');
    const totalImagesNum = document.getElementById('totalImagesNum');
    
    if (lightboxImage) {
        lightboxImage.src = image.fullsize || image.image || image.url;
        lightboxImage.alt = image.title || 'תמונה';
    }
    
    if (lightboxTitle) lightboxTitle.textContent = image.title || 'ללא כותרת';
    if (lightboxDesc) lightboxDesc.textContent = image.description || 'ללא תיאור';
    if (lightboxCategory) lightboxCategory.textContent = categories[image.category] || image.category;
    if (lightboxImageNumber) lightboxImageNumber.textContent = `תמונה מספר ${image.imageNumber || index + 1}`;
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

// CSS מותאם למובייל עם Dropdown ומספור תמונות
function addMobileOptimizedCSS() {
    if (document.getElementById('mobile-gallery-styles')) return;

    const style = document.createElement('style');
    style.id = 'mobile-gallery-styles';
    style.textContent = `
        /* סגנונות מותאמים למובייל עם מספור תמונות */
        .filter-section {
            margin-bottom: 30px;
            text-align: center;
            position: relative;
        }

        /* Dropdown Menu למקום הכפתורים */
        .filter-dropdown {
            position: relative;
            display: inline-block;
            margin: 20px 0;
        }

        .dropdown-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 15px 25px;
            border: 2px solid #4CAF50;
            background: white;
            border-radius: 30px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: inherit;
            font-size: 16px;
            color: #4CAF50;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.2);
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            min-width: 250px;
        }

        .dropdown-toggle:hover {
            background: #4CAF50;
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(76, 175, 80, 0.3);
        }

        .dropdown-toggle.active {
            background: #4CAF50;
            color: white;
            border-radius: 30px 30px 15px 15px;
        }

        .dropdown-arrow {
            font-size: 12px;
            transition: transform 0.3s ease;
        }

        .dropdown-toggle.active .dropdown-arrow {
            transform: rotate(180deg);
        }

        .dropdown-menu {
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            width: 100%;
            min-width: 300px;
            max-width: 90vw;
            background: white;
            border: 2px solid #4CAF50;
            border-top: none;
            border-radius: 0 0 20px 20px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transform: translateX(-50%) translateY(-10px);
            transition: all 0.3s ease;
            max-height: 400px;
            overflow-y: auto;
        }

        .dropdown-menu.active {
            opacity: 1;
            visibility: visible;
            transform: translateX(-50%) translateY(0);
        }

        .dropdown-item {
            display: block;
            width: 100%;
            padding: 12px 20px;
            border: none;
            background: transparent;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: inherit;
            font-size: 14px;
            color: #333;
            font-weight: 500;
            border-bottom: 1px solid #f0f0f0;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
        }

        .dropdown-item:last-child {
            border-bottom: none;
            border-radius: 0 0 18px 18px;
        }

        .dropdown-item:hover {
            background: #f8f8f8;
            color: #4CAF50;
        }

        .dropdown-item.active {
            background: #4CAF50;
            color: white;
        }

        /* Overlay לסגירת ה-dropdown */
        .dropdown-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 999;
            display: none;
        }

        .dropdown-overlay.active {
            display: block;
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

        /* רשת גלריה מותאמת למחשב ומובייל */
        .gallery-container {
            display: grid;
            gap: 15px;
            padding: 0 15px;
            max-width: 1200px;
            margin: 0 auto;
            justify-content: center;
        }

        /* מחשב - 5 תמונות בשורה */
        @media (min-width: 1024px) {
            .gallery-container {
                grid-template-columns: repeat(5, 1fr);
                gap: 20px;
                max-width: 1000px;
            }
        }

        /* טאבלט - 4 תמונות בשורה */
        @media (min-width: 768px) and (max-width: 1023px) {
            .gallery-container {
                grid-template-columns: repeat(4, 1fr);
                gap: 18px;
                max-width: 800px;
            }
        }

        /* מובייל - 3 תמונות בשורה */
        @media (min-width: 481px) and (max-width: 767px) {
            .gallery-container {
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
            }
        }

        /* מובייל קטן - 2 תמונות בשורה */
        @media (max-width: 480px) {
            .gallery-container {
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
                padding: 0 10px;
            }
            
            .dropdown-toggle {
                font-size: 14px;
                padding: 12px 20px;
                min-width: 200px;
            }
            
            .dropdown-menu {
                min-width: 250px;
            }
            
            .dropdown-item {
                padding: 10px 15px;
                font-size: 13px;
            }
        }

        .gallery-item {
            position: relative;
            cursor: pointer;
            overflow: hidden;
            border-radius: 12px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            background: white;
            aspect-ratio: 1;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
        }

        .gallery-item:active {
            transform: scale(0.98);
        }

        .gallery-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            transition: transform 0.3s ease;
        }

        /* מספר תמונה */
        .image-number {
            position: absolute;
            top: 8px;
            right: 8px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            z-index: 10;
            border: 1px solid rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(5px);
        }

        .gallery-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%);
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            padding: 15px;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .gallery-item:hover .gallery-overlay {
            opacity: 1;
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
            margin: 0;
            color: rgba(255,255,255,0.9);
            font-size: 0.75em;
            line-height: 1.3;
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
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
            margin-bottom: 8px;
        }

        .lightbox-image-number {
            background: rgba(255, 255, 255, 0.1);
            padding: 6px 12px;
            border-radius: 15px;
            font-size: 0.85em;
            display: inline-block;
            border: 1px solid rgba(255, 255, 255, 0.2);
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
        @media (max-width: 360px) {
            .gallery-container {
                gap: 10px;
                padding: 0 8px;
            }
            
            .dropdown-toggle {
                font-size: 13px;
                padding: 10px 15px;
                min-width: 180px;
            }

            .image-number {
                font-size: 10px;
                padding: 2px 6px;
                top: 4px;
                right: 4px;
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
        .dropdown-toggle,
        .dropdown-item,
        .lightbox-modal {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }

        /* שיפור נגישות */
        .dropdown-toggle:focus,
        .dropdown-item:focus,
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
            .dropdown-toggle,
            .dropdown-menu,
            .lightbox-content {
                transition: none;
            }
            
            .loading-spinner {
                animation: none;
            }
        }

        /* סקרול חלק לתפריט הנגלל */
        .dropdown-menu {
            scrollbar-width: thin;
            scrollbar-color: #4CAF50 #f0f0f0;
        }

        .dropdown-menu::-webkit-scrollbar {
            width: 6px;
        }

        .dropdown-menu::-webkit-scrollbar-track {
            background: #f0f0f0;
        }

        .dropdown-menu::-webkit-scrollbar-thumb {
            background: #4CAF50;
            border-radius: 3px;
        }
    `;
    document.head.appendChild(style);
}

// פונקציות עזר נוספות למובייל
function checkNetworkStatus() {
    if ('connection' in navigator) {
        const connection = navigator.connection;
        console.log('Network type:', connection.effectiveType);
        console.log('Downlink:', connection.downlink);
        
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            return 'slow';
        }
    }
    return 'normal';
}

function loadImageWithNetworkOptimization(imageUrl, element) {
    const networkStatus = checkNetworkStatus();
    
    if (networkStatus === 'slow') {
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
                localStorage.removeItem(key);
            }
        }
    });
}

// API ציבורי מותאם למובייל
window.mobileGalleryAPI = {
    refresh: async (category = null) => {
        console.log('Mobile refresh initiated');
        clearOldCache();
        await createGallery(category);
    },
    
    getStatus: () => ({
        isMobile,
        isLocalhost,
        imagesLoaded: galleryData.length,
        filteredImages: filteredImages.length,
        networkStatus: checkNetworkStatus()
    }),
    
    enableDemoMode: () => {
        localStorage.removeItem('galleryData');
        loadDemoData();
        createGallery();
    },
    
    clearAllCache: () => {
        localStorage.clear();
        galleryData = [];
        filteredImages = [];
        console.log('All cache cleared');
    }
};

// הפיכת פונקציות לגלובליות
window.createGallery = createGallery;
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.navigateLightbox = navigateLightbox;
window.filterGallery = filterGallery;
window.selectCategory = selectCategory;
window.closeLightboxOnBackdrop = closeLightboxOnBackdrop;

// אתחול אוטומטי
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎈 Mobile Gallery System with Dropdown and Image Numbers Loading...');
    console.log('Device info:', {
        isMobile,
        isLocalhost,
        userAgent: navigator.userAgent,
        screen: `${screen.width}x${screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`
    });
    
    clearOldCache();
    
    createGallery().then(() => {
        console.log('✅ Gallery with dropdown and image numbers initialized successfully');
    }).catch(error => {
        console.error('❌ Gallery initialization failed:', error);
        loadDemoData();
        createGallery();
    });
    
    if (isMobile) {
        console.log('📱 Mobile optimizations with dropdown and image numbering enabled');
        
        if (window.location.search.includes('debug=true')) {
            const debugInfo = document.createElement('div');
            debugInfo.style.cssText = 'position:fixed;top:0;left:0;background:rgba(0,0,0,0.8);color:white;padding:10px;font-size:12px;z-index:9999;';
            debugInfo.innerHTML = `
                📱 Mobile Debug<br>
                Images: ${galleryData.length}<br>
                Network: ${checkNetworkStatus()}<br>
                LocalHost: ${isLocalhost}<br>
                Viewport: ${window.innerWidth}x${window.innerHeight}<br>
                Features: Dropdown ✅, Numbers ✅
            `;
            document.body.appendChild(debugInfo);
            
            setTimeout(() => debugInfo.remove(), 5000);
        }
    }
});

// יצוא לשימוש חיצוני
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createGallery,
        openLightbox,
        closeLightbox,
        filterGallery,
        selectCategory,
        mobileGalleryAPI: window.mobileGalleryAPI
    };
}

console.log('🎈 Mobile-optimized Gallery System with Dropdown and Image Numbers loaded!');
console.log('Available APIs:', Object.keys(window.mobileGalleryAPI || {}));