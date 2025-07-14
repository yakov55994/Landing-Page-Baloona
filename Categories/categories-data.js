// קובץ JavaScript לגלריה עם שאיבה מ-Cloudinary
// גרסה מתקדמת שעובדת עם דף הניהול

// הגדרות Cloudinary - יטענו מ-localStorage או מהגדרות ידניות
let cloudinaryConfig = JSON.parse(localStorage.getItem('cloudinaryConfig')) || {
    cloudName: 'your-cloud-name', // החלף בשם שלך
    apiKey: 'your-api-key',      // החלף במפתח שלך (אופציונלי)
    uploadPreset: 'your-preset'   // החלף ב-preset שלך
};

// קטגוריות - יטענו מ-localStorage או ברירת מחדל
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

// נתוני גלריה גלובליים
let galleryData = [];
let currentImageIndex = 0;
let filteredImages = [];

// פונקציה ראשית ליצירת הגלריה
async function createGallery(selectedCategory = 'all') {
    const gallerySection = document.getElementById('gallery');
    if (!gallerySection) {
        console.warn('Gallery section not found');
        return;
    }

    showLoadingState(gallerySection, true);

    try {
        // טעינת תמונות מ-Cloudinary או מ-localStorage
        await loadGalleryData(selectedCategory);
        
        // בניית הממשק
        buildGalleryUI(gallerySection, selectedCategory);
        
        // אתחול אירועים
        initGalleryEvents();
        
        // הוספת CSS
        addGalleryCSS();
        
    } catch (error) {
        console.error('Error creating gallery:', error);
        showErrorState(gallerySection, 'שגיאה בטעינת הגלריה');
    } finally {
        showLoadingState(gallerySection, false);
    }
}

// טעינת נתוני גלריה
async function loadGalleryData(selectedCategory) {
    // בדיקה אם יש נתונים שמורים ב-localStorage
    const savedGalleryData = JSON.parse(localStorage.getItem('galleryData')) || [];
    
    if (savedGalleryData.length > 0) {
        console.log('Loading gallery data from localStorage');
        galleryData = savedGalleryData;
        return;
    }

    // אם אין נתונים שמורים, נסה לטעון מ-Cloudinary
    if (cloudinaryConfig.cloudName) {
        console.log('Loading gallery data from Cloudinary');
        try {
            await loadFromCloudinary(selectedCategory);
        } catch (error) {
            console.warn('Failed to load from Cloudinary, using fallback data');
            loadFallbackData();
        }
    } else {
        console.log('No Cloudinary config found, using fallback data');
        loadFallbackData();
    }
}

// טעינה מ-Cloudinary
async function loadFromCloudinary(selectedCategory) {
    const promises = [];
    const categoriesToLoad = selectedCategory === 'all' ? Object.keys(categories) : [selectedCategory];
    
    for (const category of categoriesToLoad) {
        try {
            // שימוש ב-Cloudinary Search API (דורש API key)
            if (cloudinaryConfig.apiKey) {
                const searchUrl = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/list/gallery_${category}.json`;
                promises.push(
                    fetch(searchUrl)
                        .then(response => response.json())
                        .then(data => processCloudinaryResponse(data, category))
                        .catch(error => {
                            console.warn(`Failed to load category ${category}:`, error);
                            return [];
                        })
                );
            } else {
                // fallback לטעינה ללא API key
                promises.push(loadCategoryWithoutApiKey(category));
            }
        } catch (error) {
            console.warn(`Error loading category ${category}:`, error);
        }
    }
    
    const results = await Promise.all(promises);
    galleryData = results.flat().filter(Boolean);
    
    // שמירה ב-localStorage לשימוש עתידי
    if (galleryData.length > 0) {
        localStorage.setItem('galleryData', JSON.stringify(galleryData));
    }
}

// טעינת קטגוריה ללא API key
async function loadCategoryWithoutApiKey(category) {
    // אם יש נתונים שמורים מדף הניהול, השתמש בהם
    const adminData = JSON.parse(localStorage.getItem('galleryData')) || [];
    return adminData.filter(item => item.category === category);
}

// עיבוד תגובה מ-Cloudinary
function processCloudinaryResponse(data, category) {
    if (!data || !data.resources) return [];
    
    return data.resources.map((resource, index) => ({
        id: resource.public_id || `${category}_${index}`,
        publicId: resource.public_id,
        url: resource.secure_url || resource.url,
        thumbnail: generateCloudinaryUrl(resource.public_id, 'w_300,h_200,c_fill,q_auto,f_auto'),
        image: generateCloudinaryUrl(resource.public_id, 'w_800,h_600,c_limit,q_auto,f_auto'),
        fullsize: generateCloudinaryUrl(resource.public_id, 'w_1200,h_900,c_limit,q_auto,f_auto'),
        title: resource.context?.custom?.title || `${categories[category]} ${index + 1}`,
        description: resource.context?.custom?.description || `תמונה יפה של ${categories[category]}`,
        category: category,
        uploadDate: resource.created_at || new Date().toISOString()
    }));
}

// יצירת URL מאופטם ל-Cloudinary
function generateCloudinaryUrl(publicId, transformations) {
    return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/${transformations}/${publicId}`;
}

// טעינת נתוני fallback
function loadFallbackData() {
    galleryData = [
        {
            id: 1,
            title: "זר בלונים ליום הולדת",
            description: "זר בלונים צבעוני ומיוחד ליום הולדת",
            url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800",
            thumbnail: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300&h=200&fit=crop",
            category: "birthday-bouquets"
        },
        {
            id: 2,
            title: "מספרים מבלונים",
            description: "בלוני מספרים מיוחדים לחגיגות",
            url: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800",
            thumbnail: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=300&h=200&fit=crop",
            category: "balloon-numbers"
        },
        {
            id: 3,
            title: "קשת בלונים מרהיבה",
            description: "קשת בלונים צבעונית לכניסת אירוע",
            url: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800",
            thumbnail: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=200&fit=crop",
            category: "arches"
        }
    ];
}

// בניית ממשק הגלריה
function buildGalleryUI(gallerySection, selectedCategory) {
    // סינון תמונות לפי קטגוריה
    filteredImages = selectedCategory === 'all' 
        ? galleryData 
        : galleryData.filter(item => item.category === selectedCategory);

    // יצירת כפתורי פילטר
    const categoryKeys = ['all', ...Object.keys(categories)];
    const filterButtons = categoryKeys.map(category => {
        const isActive = category === selectedCategory ? 'active' : '';
        const categoryName = category === 'all' ? '🎈 הכל' : categories[category];
        
        return `
            <button class="filter-btn ${isActive}" 
                    data-filter="${category}"
                    title="${categoryName}">
                ${categoryName}
            </button>
        `;
    }).join('');

    // יצירת פריטי גלריה
    const galleryItems = filteredImages.map((item, index) => `
        <div class="gallery-item" 
             data-category="${item.category}"
             data-index="${index}"
             onclick="openLightbox(${index})">
            <img src="${item.thumbnail || item.url}" 
                 alt="${item.title || ''}" 
                 loading="lazy"
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtGa15XXnNmJ16nigI0g157XkdGV155ZhnigI008L3RleHQ+PC9zdmc+'">
            <div class="gallery-overlay">
                <div class="gallery-info">
                    <h3>${item.title || ''}</h3>
                    <p>${item.description || ''}</p>
                    <span class="category-tag">${categories[item.category] || item.category}</span>
                </div>
            </div>
        </div>
    `).join('');

    // מודל לייטבוקס
    const lightboxModal = `
        <div class="lightbox-modal" id="lightboxModal">
            <div class="lightbox-content">
                <span class="close-lightbox" onclick="closeLightbox()">&times;</span>
                <img class="lightbox-image" src="" alt="" id="lightboxImage">
                <div class="lightbox-info">
                    <h3 class="lightbox-title" id="lightboxTitle"></h3>
                    <p class="lightbox-desc" id="lightboxDesc"></p>
                    <span class="lightbox-category" id="lightboxCategory"></span>
                </div>
                <button class="lightbox-prev" onclick="navigateLightbox(-1)" aria-label="תמונה קודמת">
                    <span>❮</span>
                </button>
                <button class="lightbox-next" onclick="navigateLightbox(1)" aria-label="תמונה הבאה">
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
                ? `נמצאו <strong>${filteredImages.length}</strong> תמונות בקטגוריה זו`
                : `<span class="no-results">לא נמצאו תמונות בקטגוריה זו</span>`
            }
        </div>
    `;

    // שמירת כותרת קיימת
    const existingTitle = gallerySection.querySelector('.section-title');
    
    // בניית ה-HTML הסופי
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
}

// אתחול אירועי גלריה
function initGalleryEvents() {
    // אירועי כפתורי פילטר
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // אפקט חזותי
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 100);
            
            // החלפת קטגוריה
            const category = this.dataset.filter;
            createGallery(category);
        });
    });

    // תמיכה במקלדת
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    // תמיכה במגע
    initTouchSupport();
}

// פתיחת לייטבוקס
function openLightbox(index) {
    if (!filteredImages[index]) return;

    currentImageIndex = index;
    const image = filteredImages[index];
    const modal = document.getElementById('lightboxModal');
    
    // עדכון תוכן
    document.getElementById('lightboxImage').src = image.fullsize || image.image || image.url;
    document.getElementById('lightboxImage').alt = image.title || '';
    document.getElementById('lightboxTitle').textContent = image.title || '';
    document.getElementById('lightboxDesc').textContent = image.description || '';
    document.getElementById('lightboxCategory').textContent = categories[image.category] || image.category;
    document.getElementById('currentImageNum').textContent = index + 1;
    document.getElementById('totalImagesNum').textContent = filteredImages.length;

    // הצגת מודל
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // מיקוד לנגישות
    modal.focus();
}

// סגירת לייטבוקס
function closeLightbox() {
    const modal = document.getElementById('lightboxModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ניווט בלייטבוקס
function navigateLightbox(direction) {
    currentImageIndex += direction;
    
    if (currentImageIndex < 0) {
        currentImageIndex = filteredImages.length - 1;
    } else if (currentImageIndex >= filteredImages.length) {
        currentImageIndex = 0;
    }
    
    openLightbox(currentImageIndex);
}

// טיפול בניווט מקלדת
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

// תמיכה במגע
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
                navigateLightbox(1); // החלקה שמאלה - הבא
            } else {
                navigateLightbox(-1); // החלקה ימינה - הקודם
            }
        }
    }
}

// הצגת מצב טעינה
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

// הצגת מצב שגיאה
function showErrorState(container, message) {
    container.innerHTML = `
        <div class="error-state">
            <div class="error-icon">⚠️</div>
            <h3>שגיאה</h3>
            <p>${message}</p>
            <button class="retry-btn" onclick="createGallery()">נסה שוב</button>
        </div>
    `;
}

// רענון גלריה
async function refreshGallery(category = 'all') {
    // מחיקת נתונים שמורים
    localStorage.removeItem('galleryData');
    galleryData = [];
    
    // טעינה מחדש
    await createGallery(category);
}

// סנכרון עם דף הניהול
function syncWithAdmin() {
    // בדיקה אם יש עדכונים מדף הניהול
    const adminData = JSON.parse(localStorage.getItem('galleryData')) || [];
    const adminCategories = JSON.parse(localStorage.getItem('categories')) || {};
    const adminConfig = JSON.parse(localStorage.getItem('cloudinaryConfig')) || {};
    
    // עדכון נתונים אם יש שינויים
    if (adminData.length > 0 && JSON.stringify(adminData) !== JSON.stringify(galleryData)) {
        galleryData = adminData;
        categories = { ...categories, ...adminCategories };
        cloudinaryConfig = { ...cloudinaryConfig, ...adminConfig };
        
        console.log('Gallery synced with admin panel');
        return true;
    }
    
    return false;
}

// הוספת CSS משופר
function addGalleryCSS() {
    if (document.getElementById('gallery-styles')) return;

    const style = document.createElement('style');
    style.id = 'gallery-styles';
    style.textContent = `
        /* סגנונות גלריה משופרים */
        .filter-section {
            margin-bottom: 40px;
            text-align: center;
        }

        .filter-buttons {
            display: flex;
            justify-content: center;
            gap: 12px;
            margin: 30px 0 20px 0;
            flex-wrap: wrap;
            padding: 0 20px;
        }

        .filter-btn {
            padding: 12px 20px;
            border: 2px solid #e0e0e0;
            background: white;
            border-radius: 30px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: inherit;
            font-size: 14px;
            color: #333;
            font-weight: 500;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            position: relative;
            overflow: hidden;
        }

        .filter-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            transition: left 0.5s;
        }

        .filter-btn:hover {
            border-color: #4CAF50;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(76,175,80,0.3);
        }

        .filter-btn:hover::before {
            left: 100%;
        }

        .filter-btn.active {
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            border-color: #4CAF50;
            box-shadow: 0 4px 15px rgba(76,175,80,0.4);
        }

        .gallery-counter {
            text-align: center;
            margin: 15px 0;
            font-size: 16px;
            color: #666;
        }

        .gallery-counter strong {
            color: #4CAF50;
            font-weight: 600;
        }

        .gallery-counter .no-results {
            color: #999;
            font-style: italic;
        }

        .gallery-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 30px;
            padding: 0 20px;
            max-width: 1400px;
            margin: 0 auto;
        }

        .gallery-item {
            position: relative;
            cursor: pointer;
            overflow: hidden;
            border-radius: 15px;
            transition: all 0.4s ease;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            background: white;
            height: 350px;
            transform: translateY(0);
        }

        .gallery-item:hover {
            transform: translateY(-10px) scale(1.02);
            box-shadow: 0 15px 40px rgba(76,175,80,0.3);
        }

        .gallery-item img {
            width: 100%;
            height: 75%;
            object-fit: cover;
            display: block;
            transition: transform 0.4s ease;
        }

        .gallery-item:hover img {
            transform: scale(1.1);
        }

        .gallery-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 25%;
            background: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.6), transparent);
            color: white;
            display: flex;
            align-items: flex-end;
            padding: 20px;
            transition: all 0.3s ease;
        }

        .gallery-info h3 {
            margin: 0 0 8px 0;
            color: white;
            font-size: 1.2em;
            font-weight: 600;
            text-shadow: 0 1px 3px rgba(0,0,0,0.5);
        }

        .gallery-info p {
            margin: 0 0 8px 0;
            color: rgba(255,255,255,0.9);
            font-size: 0.9em;
            line-height: 1.4;
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }

        .category-tag {
            background: rgba(76,175,80,0.8);
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            backdrop-filter: blur(5px);
        }

        /* לייטבוקס משופר */
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
            backdrop-filter: blur(5px);
        }

        .lightbox-modal.active {
            display: flex;
        }

        .lightbox-content {
            position: relative;
            max-width: 90%;
            max-height: 90%;
            animation: lightboxAppear 0.3s ease-out;
        }

        @keyframes lightboxAppear {
            from {
                opacity: 0;
                transform: scale(0.8);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        .lightbox-image {
            max-width: 100%;
            max-height: 70vh;
            object-fit: contain;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        .lightbox-info {
            color: white;
            padding: 25px;
            text-align: center;
            background: rgba(0,0,0,0.8);
            border-radius: 0 0 10px 10px;
            backdrop-filter: blur(10px);
        }

        .lightbox-title {
            font-size: 1.5em;
            margin-bottom: 10px;
            color: #4CAF50;
        }

        .lightbox-desc {
            margin-bottom: 10px;
            line-height: 1.5;
        }

        .lightbox-category {
            background: rgba(76,175,80,0.8);
            padding: 6px 12px;
            border-radius: 15px;
            font-size: 0.9em;
            display: inline-block;
        }

        .close-lightbox {
            position: absolute;
            top: -50px;
            right: 0;
            color: white;
            font-size: 35px;
            cursor: pointer;
            background: rgba(0,0,0,0.5);
            border: none;
            border-radius: 50%;
            width: 45px;
            height: 45px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }

        .close-lightbox:hover {
            background: rgba(76,175,80,0.8);
            transform: scale(1.1);
        }

        .lightbox-prev, .lightbox-next {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(0,0,0,0.7);
            color: white;
            border: none;
            font-size: 28px;
            padding: 15px 18px;
            cursor: pointer;
            border-radius: 50%;
            transition: all 0.3s ease;
            backdrop-filter: blur(5px);
        }

        .lightbox-prev:hover, .lightbox-next:hover {
            background: rgba(76,175,80,0.8);
            transform: translateY(-50%) scale(1.1);
        }

        .lightbox-prev {
            left: -70px;
        }

        .lightbox-next {
            right: -70px;
        }

        .lightbox-counter {
            position: absolute;
            top: -50px;
            left: 50%;
            transform: translateX(-50%);
            color: white;
            background: rgba(0,0,0,0.7);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            backdrop-filter: blur(5px);
        }

        /* מצבי טעינה ושגיאה */
        .loading-state, .error-state {
            text-align: center;
            padding: 60px 20px;
            color: #666;
        }

        .loading-spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #4CAF50;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .error-icon {
            font-size: 3rem;
            margin-bottom: 20px;
        }

        .retry-btn {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: background 0.3s ease;
        }

        .retry-btn:hover {
            background: #45a049;
        }

        /* רספונסיביות משופרת */
        @media (max-width: 1200px) {
            .gallery-container {
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 25px;
            }
            
            .gallery-item {
                height: 320px;
            }
        }

        @media (max-width: 768px) {
            .filter-buttons {
                gap: 8px;
                margin: 20px 0 15px 0;
            }
            
            .filter-btn {
                padding: 10px 16px;
                font-size: 13px;
            }
            
            .gallery-container {
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                padding: 0 15px;
            }
            
            .gallery-item {
                height: 280px;
            }
            
            .lightbox-prev {
                left: 10px;
            }
            
            .lightbox-next {
                right: 10px;
            }
            
            .close-lightbox {
                top: -40px;
                font-size: 30px;
                width: 40px;
                height: 40px;
            }

            .lightbox-counter {
                top: -40px;
                font-size: 12px;
                padding: 6px 12px;
            }
        }

        @media (max-width: 480px) {
            .filter-buttons {
                gap: 6px;
                margin: 15px 0 10px 0;
                padding: 0 10px;
            }
            
            .filter-btn {
                padding: 8px 12px;
                font-size: 12px;
            }
            
            .gallery-container {
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                padding: 0 10px;
            }
            
            .gallery-item {
                height: 220px;
            }
            
            .gallery-overlay {
                padding: 15px;
            }
            
            .gallery-info h3 {
                font-size: 1em;
            }
            
            .gallery-info p {
                font-size: 0.8em;
            }
            
            .lightbox-content {
                max-width: 95%;
                max-height: 95%;
            }
            
            .lightbox-prev, .lightbox-next {
                font-size: 24px;
                padding: 12px 15px;
            }
        }
    `;
    document.head.appendChild(style);
}

// פונקציות עזר נוספות

// בדיקת חיבור לאינטרנט
function checkOnlineStatus() {
    return navigator.onLine;
}

// שמירה אוטומטית בזיכרון המטמון
function cacheGalleryData() {
    if (galleryData.length > 0) {
        localStorage.setItem('galleryDataCache', JSON.stringify({
            data: galleryData,
            timestamp: Date.now(),
            categories: categories
        }));
    }
}

// טעינה מהזיכרון המטמון
function loadFromCache() {
    const cache = localStorage.getItem('galleryDataCache');
    if (!cache) return false;
    
    try {
        const parsed = JSON.parse(cache);
        const cacheAge = Date.now() - parsed.timestamp;
        const maxAge = 30 * 60 * 1000; // 30 דקות
        
        if (cacheAge < maxAge && parsed.data && parsed.data.length > 0) {
            galleryData = parsed.data;
            if (parsed.categories) {
                categories = { ...categories, ...parsed.categories };
            }
            console.log('Gallery loaded from cache');
            return true;
        }
    } catch (error) {
        console.warn('Failed to load from cache:', error);
    }
    
    return false;
}

// אתחול אוטומטי בטעינת הדף
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing gallery...');
    
    // בדיקה אם צריך לסנכרן עם דף הניהול
    if (syncWithAdmin()) {
        console.log('Synced with admin panel, rebuilding gallery...');
    }
    
    // יצירת הגלריה
    createGallery();
    
    // הגדרת סנכרון אוטומטי כל דקה
    setInterval(() => {
        if (syncWithAdmin()) {
            createGallery();
        }
    }, 60000);
    
    // שמירה אוטומטית במטמון כל 5 דקות
    setInterval(cacheGalleryData, 5 * 60 * 1000);
});

// מאזין לשינויים ב-localStorage (לסנכרון בין כרטיסיות)
window.addEventListener('storage', function(e) {
    if (e.key === 'galleryData' || e.key === 'categories') {
        console.log('Gallery data updated in another tab, refreshing...');
        if (syncWithAdmin()) {
            createGallery();
        }
    }
});

// פונקציות API ציבוריות

// API לעדכון הגלריה מבחוץ
window.galleryAPI = {
    // רענון הגלריה
    refresh: (category = 'all') => createGallery(category),
    
    // הוספת תמונה חדשה
    addImage: (imageData) => {
        galleryData.push({
            id: Date.now(),
            ...imageData,
            uploadDate: new Date().toISOString()
        });
        localStorage.setItem('galleryData', JSON.stringify(galleryData));
        createGallery();
    },
    
    // מחיקת תמונה
    removeImage: (imageId) => {
        galleryData = galleryData.filter(img => img.id !== imageId);
        localStorage.setItem('galleryData', JSON.stringify(galleryData));
        createGallery();
    },
    
    // עדכון קטגוריות
    updateCategories: (newCategories) => {
        categories = { ...categories, ...newCategories };
        localStorage.setItem('categories', JSON.stringify(categories));
        createGallery();
    },
    
    // קבלת נתוני גלריה נוכחיים
    getData: () => ({ galleryData, categories, filteredImages }),
    
    // עדכון הגדרות Cloudinary
    updateConfig: (config) => {
        cloudinaryConfig = { ...cloudinaryConfig, ...config };
        localStorage.setItem('cloudinaryConfig', JSON.stringify(cloudinaryConfig));
    },
    
    // ניקוי מטמון
    clearCache: () => {
        localStorage.removeItem('galleryData');
        localStorage.removeItem('galleryDataCache');
        galleryData = [];
        createGallery();
    }
};

// הודעה לקונסול על טעינה מוצלחת
console.log('🎈 Gallery system loaded successfully!');
console.log('Available API methods:', Object.keys(window.galleryAPI));

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createGallery,
        refreshGallery,
        openLightbox,
        closeLightbox,
        syncWithAdmin,
        galleryAPI: window.galleryAPI
    };
}