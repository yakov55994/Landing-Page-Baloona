// תיקון בעיות מובייל - גרסה מתוקנת לגלריה עם Dropdown ומספור תמונות

// בדיקת תמיכה במובייל
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
// console.log('Mobile detected:', isMobile);
// console.log('Is localhost:', isLocalhost);

// הגדרות מותאמות למובייל
let cloudinaryConfig =  {
    cloudName: 'dbbivwbbt',
    apiKey: '549784497364423',
    uploadPreset: 'balloon_gallery',
    folder: 'balloon-gallery'
};

// תיקון בעיית CORS למובייל
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// קטגוריות עם fallback
let categories =  {
    '': 'בחר קטגורייה',
    "arches": "קשתות",
  "room-arrangements": "סידורי חדרים",
  "balloon": "כדור פורח",
  "balloon-numbers": "מספרים מבלונים", 
  "photo-reviews": "קירות צילום",
  "flowers-balloons": "פרחים מבלונים",
  "kids-balloons": "בלונים לילדים",
  "gender-reveal": "גילוי מין",
  "balloon-bouquet": "בלונים ליום הולדת",
  "centerpiece": "מרכזי שולחן",
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
    // תמיד נטען מהשרת בלבד
    await loadFromLocalServer(selectedCategory);
}

// טעינה מהשרת המקומי עם timeout - תמיכה מלאה במספור
async function loadFromLocalServer(selectedCategory) {
    const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
    );
    try {
        const fetchPromise = fetch('https://baloona-server.onrender.com/api/gallery', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
        const response = await Promise.race([fetchPromise, timeout]);
        if (response.ok) {
            const images = await response.json();
            galleryData = images.map((img, index) => ({
                id: img.public_id || `image_${index}_${Date.now()}`,
                publicId: img.public_id,
                url: img.url || img.secure_url,
                thumbnail: generateOptimizedUrl(img.url || img.secure_url, 'thumbnail'),
                image: generateOptimizedUrl(img.url || img.secure_url, 'medium'),
                fullsize: generateOptimizedUrl(img.url || img.secure_url, 'large'),
                category: extractCategoryFromPath(img.public_id || img.folder),
                uploadDate: img.created_at || new Date().toISOString()
                // imageNumber יתווסף רק לאחר הסינון לקטגוריה
            }));
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
            uploadDate: resource.created_at || new Date().toISOString()
            // imageNumber יתווסף רק לאחר הסינון לקטגוריה
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

    // מיון לפי תאריך (או כל שדה אחר שתרצה)
    filteredImages.sort((a, b) => (a.uploadDate || 0) - (b.uploadDate || 0));

    // מספור מחדש לכל קטגוריה
    filteredImages.forEach((item, idx) => {
        item.imageNumber = idx + 1;
    });

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

    // יצירת תוכן הגלריה
    let galleryContent = '';
    
    if (filteredImages.length > 0) {
        // יצירת פריטי גלריה עם lazy loading ומספור + אירוע לחיצה
        const galleryItems = filteredImages.map((item, index) => `
            <div class="gallery-item" 
                 data-category="${item.category}"
                 data-index="${index}"
                 onclick="openLightbox(${index})" 
                 style="cursor: pointer;">
                <div class="image-number">${item.imageNumber || index + 1}</div>
                <img src="${item.thumbnail || item.url}" 
                     alt="${item.title }" 
                     loading="lazy"
                     onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtGQ15XXkNGO16DXlDwvdGV4dD48L3N2Zz4K';">
                <div class="gallery-overlay">
                    <div class="gallery-info">
                    </div>
                </div>
            </div>
        `).join('');
        
        galleryContent = `<div class="modern-gallery">${galleryItems}</div>`;
    } else {
        // אם אין תמונות - הצגת הודעה מעוצבת
        galleryContent = `
            <div class="empty-category-message">
                <div class="empty-icon">📷</div>
                <h3>אין תמונות בקטגוריה זו כרגע</h3>
            </div>
        `;
    }

    // מונה תמונות
    const imageCounter = `
        <div class="gallery-counter">
            ${filteredImages.length > 0 
                ? `נמצאו <strong>${filteredImages.length}</strong> תמונות ב${categories[selectedCategory]}`
                : `<span class="no-results">לא נמצאו תמונות בקטגוריה ${categories[selectedCategory]}</span>`
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
            ${galleryContent}
        </div>
    `);

    // יצירת לייטבוקס מותאם למובייל עם תמיכה במספור
    if (filteredImages.length > 0) {
        createLightboxModal(filteredImages.length);
    }

    // אתחול הדרופדאון
    initDropdownEvents();

    console.log('UI built successfully');
}

// פונקציה לבדיקת קטגוריות ריקות ועדכון הדרופדאון
function updateDropdownWithEmptyCategories() {
    const categoryKeys = Object.keys(categories).filter(key => key !== "");
    
    categoryKeys.forEach(category => {
        const categoryImages = galleryData.filter(item => item.category === category);
        const dropdownItem = document.querySelector(`[data-filter="${category}"]`);
        
        if (dropdownItem) {
            const categoryName = categories[category];
            const categoryIcon = getCategoryIcon(category);
            
            if (categoryImages.length === 0) {
                // סימון קטגוריה ריקה
                dropdownItem.classList.add('empty-category');
                dropdownItem.innerHTML = `
                    ${categoryIcon} ${categoryName} 
                    <span class="empty-indicator">(ריק)</span>
                `;
            } else {
                // הסרת סימון ריק
                dropdownItem.classList.remove('empty-category');
                dropdownItem.innerHTML = `${categoryIcon} ${categoryName}`;
            }
        }
    });
}

// פונקציה לבחירת קטגוריה עם טיפול בקטגוריות ריקות
function selectCategory(category) {
    console.log('Selecting category:', category);
    
    // עדכון הדרופדאון
    updateDropdownWithEmptyCategories();
    
    // בניית הUI
    const gallerySection = document.getElementById('gallery');
    if (gallerySection) {
        buildGalleryUI(gallerySection, category);
    }
    
    // סגירת הדרופדאון
    const dropdownMenu = document.getElementById('filterMenu');
    const dropdownOverlay = document.getElementById('dropdownOverlay');
    
    if (dropdownMenu) dropdownMenu.classList.remove('show');
    if (dropdownOverlay) dropdownOverlay.style.display = 'none';
}
// פונקציה נפרדת ליצירת הלייטבוקס
function createLightboxModal(totalImages) {
    // מחיקת לייטבוקס קיים אם יש
    const existingLightbox = document.getElementById('lightboxModal');
    if (existingLightbox) {
        existingLightbox.remove();
    }

    const lightboxModal = `
        <div class="lightbox-modal" id="lightboxModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 9999; justify-content: center; align-items: center;" onclick="closeLightboxOnBackdrop(event)">
            <div class="lightbox-content" onclick="event.stopPropagation()" style="position: relative; max-width: 90%; max-height: 90%; text-align: center;">
                <button class="close-lightbox" onclick="closeLightbox()" type="button" aria-label="סגור" style="position: absolute; top: -40px; right: -40px; background: rgba(255,255,255,0.8); border: none; border-radius: 50%; width: 40px; height: 40px; font-size: 20px; cursor: pointer; z-index: 10;">
                    <span>&times;</span>
                </button>
                <img class="lightbox-image" src="" alt="" id="lightboxImage" style="max-width: 100%; max-height: 70vh; object-fit: contain; border-radius: 8px;">
                <div class="lightbox-info" style="color: white; padding: 20px; background: rgba(0,0,0,0.8); border-radius: 8px; margin-top: 20px;">
                    <h3 class="lightbox-title" id="lightboxTitle" style="color: #4CAF50; margin-bottom: 10px;"></h3>
                    <p class="lightbox-desc" id="lightboxDesc" style="margin-bottom: 15px;"></p>
                    <span class="lightbox-category" id="lightboxCategory" style="background: rgba(76,175,80,0.8); padding: 6px 12px; border-radius: 15px; font-size: 0.9em; display: inline-block; margin-bottom: 15px;"></span>
                    <div class="lightbox-image-number" id="lightboxImageNumber" style="background: rgba(255, 255, 255, 0.1); padding: 8px 16px; border-radius: 20px; font-size: 0.9em; display: inline-block; border: 1px solid rgba(255, 255, 255, 0.2);"></div>
                </div>
                <button class="lightbox-prev" onclick="navigateLightbox(-1)" type="button" aria-label="תמונה קודמת" style="position: absolute; top: 50%; left: 20px; transform: translateY(-50%); background: rgba(0,0,0,0.6); color: white; border: none; font-size: 24px; padding: 15px 12px; cursor: pointer; border-radius: 8px;">
                    <span>❮</span>
                </button>
                <button class="lightbox-next" onclick="navigateLightbox(1)" type="button" aria-label="תמונה הבאה" style="position: absolute; top: 50%; right: 20px; transform: translateY(-50%); background: rgba(0,0,0,0.6); color: white; border: none; font-size: 24px; padding: 15px 12px; cursor: pointer; border-radius: 8px;">
                    <span>❯</span>
                </button>
                <div class="lightbox-counter" style="position: absolute; top: 20px; left: 50%; transform: translateX(-50%); color: white; background: rgba(0,0,0,0.6); padding: 8px 16px; border-radius: 20px; font-size: 14px;">
                    <span id="currentImageNum">1</span> / <span id="totalImagesNum">${totalImages}</span>
                </div>
            </div>
        </div>
    `;

    // הוספת הלייטבוקס ל-body
    document.body.insertAdjacentHTML('beforeend', lightboxModal);
    console.log('Lightbox modal created and added to body');
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
    console.log('openLightbox called for index:', index, 'filteredImages:', filteredImages);
    
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
    modal.style.display = 'flex';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.9)';
    modal.style.zIndex = '9999';
    
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
    
    if (lightboxCategory) lightboxCategory.textContent = categories[image.category] || image.category;
    if (lightboxImageNumber) lightboxImageNumber.textContent = `תמונה מספר ${image.imageNumber || index + 1}`;
    if (currentImageNum) currentImageNum.textContent = index + 1;
    if (totalImagesNum) totalImagesNum.textContent = filteredImages.length;

    // הצגת מודל
    modal.style.display = 'flex';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    console.log('Lightbox opened');
}

function closeLightbox() {
    console.log('Closing lightbox');
    const modal = document.getElementById('lightboxModal');
    if (modal) {
        modal.style.display = 'none';
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
    console.log('navigateLightbox', direction, 'currentImageIndex:', currentImageIndex, 'filteredImages:', filteredImages);
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
        .filter-section, .filter-dropdown {
            width: 100%;
            max-width: 400px;
            margin: 0 auto 30px auto;
            position: relative;
            text-align: center;
        }
        .dropdown-toggle {
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 15px 25px;
            border: 2px solid #b38a49;
            background: linear-gradient(135deg, #181818 0%, #232323 100%);
            border-radius: 30px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: inherit;
            font-size: 16px;
            color: #ffd700;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(201, 160, 92, 0.15);
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            min-width: 200px;
        }
        .dropdown-toggle:hover, .dropdown-toggle.active {
            background: linear-gradient(135deg, #b38a49 0%, #c9a05c 100%);
            color: #181818;
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
            max-width: 400px;
            background: linear-gradient(135deg, #232323 0%, #181818 100%);
            border: 2px solid #b38a49;
            border-top: none;
            border-radius: 0 0 20px 20px;
            box-shadow: 0 8px 25px rgba(201,160,92,0.10);
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            max-height: 400px;
            overflow-y: auto;
            margin: 0;
        }
        .dropdown-menu.active {
            opacity: 1;
            visibility: visible;
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
            color: #ffd700;
            font-weight: 500;
            border-bottom: 1px solid #b38a49;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
        }
        .dropdown-item:last-child {
            border-bottom: none;
            border-radius: 0 0 18px 18px;
        }
        .dropdown-item:hover, .dropdown-item.active {
            background: #b38a49;
            color: #181818;
        }
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
            color: #ffd700;
        }
        .gallery-counter strong {
            color: #ffd700;
        }
        .gallery-container {
            display: grid;
            gap: 15px;
            padding: 0 15px;
            max-width: 1200px;
            margin: 0 auto;
            justify-content: center;
        }
        @media (min-width: 1024px) {
            .gallery-container {
                grid-template-columns: repeat(5, 1fr);
                gap: 20px;
                max-width: 1000px;
            }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
            .gallery-container {
                grid-template-columns: repeat(4, 1fr);
                gap: 18px;
                max-width: 800px;
            }
        }
        @media (min-width: 481px) and (max-width: 767px) {
            .gallery-container {
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
            }
        }
        @media (max-width: 480px) {
            .gallery-container {
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
                padding: 0 10px;
            }
            .dropdown-toggle {
                font-size: 14px;
                padding: 12px 20px;
                min-width: 120px;
            }
            .dropdown-menu {
                min-width: 0;
                max-width: 98vw;
            }
            .dropdown-item {
                padding: 10px 15px;
                font-size: 13px;
            }
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

    if (!document.getElementById('lightboxModal')) {
        document.body.insertAdjacentHTML('beforeend', `
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
                        <span id="currentImageNum">1</span> / <span id="totalImagesNum">0</span>
                    </div>
                </div>
            </div>
        `);
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

