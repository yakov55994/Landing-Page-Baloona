// תיקון גלריה לעבודה באתר מפורסם (לא רק localhost)
// גרסה שעובדת גם ב-Cloudflare Pages ואתרים מפורסמים אחרים

console.log('🌐 Production Gallery Loading...');

// זיהוי סביבה
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' || 
                   window.location.hostname.includes('local');

const isProduction = !isLocalhost;
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

console.log('🎯 Environment:', { isLocalhost, isProduction, isMobile });

// נתוני גלריה
let galleryData = [];
let currentImageIndex = 0;
let filteredImages = [];

// קטגוריות
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

// הגדרות Cloudinary (יטענו מ-localStorage או ברירת מחדל)
let cloudinaryConfig = {};

// פונקציה ראשית - מותאמת לפרודקשן
async function createGallery(selectedCategory = 'all') {
    console.log('🎨 Creating gallery for:', selectedCategory);
    
    const gallerySection = document.getElementById('gallery');
    if (!gallerySection) {
        console.error('❌ Gallery section not found');
        return;
    }

    showLoadingState(gallerySection);

    try {
        // טעינת נתונים - תמיד מ-localStorage בפרודקשן
        await loadGalleryDataProduction(selectedCategory);
        
        if (galleryData.length === 0) {
            console.log('📦 No data found, loading fallback images');
            loadProductionFallbackData();
        }
        
        buildGalleryUI(gallerySection, selectedCategory);
        addProductionCSS();
        initGalleryEvents();
        
        console.log('✅ Gallery created successfully with', galleryData.length, 'images');
        
    } catch (error) {
        console.error('❌ Error creating gallery:', error);
        loadProductionFallbackData();
        buildGalleryUI(gallerySection, selectedCategory);
    }
}

// טעינת נתונים לפרודקשן
async function loadGalleryDataProduction(selectedCategory) {
    console.log('📂 Loading gallery data for production...');
    
    // בפרודקשן - תמיד מ-localStorage תחילה
    try {
        // נסה לטעון מ-localStorage
        const savedData = localStorage.getItem('galleryData');
        const savedConfig = localStorage.getItem('cloudinaryConfig');
        
        if (savedData) {
            const parsed = JSON.parse(savedData);
            if (Array.isArray(parsed) && parsed.length > 0) {
                console.log('✅ Found saved gallery data:', parsed.length, 'images');
                galleryData = parsed;
                return;
            }
        }
        
        if (savedConfig) {
            cloudinaryConfig = JSON.parse(savedConfig);
            console.log('✅ Found Cloudinary config');
        }
        
        // אם יש הגדרות Cloudinary, נסה לטעון משם
        if (cloudinaryConfig.cloudName && cloudinaryConfig.cloudName !== 'your-cloud-name') {
            console.log('☁️ Trying to load from Cloudinary...');
            await loadFromCloudinaryProduction(selectedCategory);
            
            if (galleryData.length > 0) {
                // שמור בזיכרון המטמון
                localStorage.setItem('galleryData', JSON.stringify(galleryData));
                return;
            }
        }
        
    } catch (error) {
        console.warn('⚠️ Error loading data:', error);
    }
    
    console.log('📦 Loading fallback data');
    loadProductionFallbackData();
}

// טעינה מ-Cloudinary לפרודקשן
async function loadFromCloudinaryProduction(selectedCategory) {
    if (!cloudinaryConfig.cloudName) return;
    
    const categoriesToLoad = selectedCategory === 'all' ? Object.keys(categories) : [selectedCategory];
    
    for (const category of categoriesToLoad) {
        try {
            // ניסיון לטעינה ישירה מ-Cloudinary
            const searchUrl = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/list/${category}.json`;
            
            const response = await fetch(searchUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                signal: AbortSignal.timeout(5000)
            });

            if (response.ok) {
                const data = await response.json();
                if (data.resources && data.resources.length > 0) {
                    const processedImages = processCloudinaryResponse(data, category);
                    galleryData.push(...processedImages);
                    console.log(`✅ Loaded ${processedImages.length} images from category: ${category}`);
                }
            } else {
                console.warn(`⚠️ Failed to load category ${category}: ${response.status}`);
            }
            
        } catch (error) {
            console.warn(`⚠️ Error loading category ${category}:`, error);
        }
    }
}

// עיבוד תגובה מ-Cloudinary
function processCloudinaryResponse(data, category) {
    if (!data || !data.resources) return [];
    
    return data.resources.map((resource, index) => ({
        id: resource.public_id || `${category}_${index}_${Date.now()}`,
        publicId: resource.public_id,
        url: resource.secure_url || resource.url,
        thumbnail: generateCloudinaryUrl(resource.secure_url || resource.url, 'w_300,h_200,c_fill,q_auto,f_auto'),
        image: generateCloudinaryUrl(resource.secure_url || resource.url, 'w_800,h_600,c_limit,q_auto,f_auto'),
        fullsize: generateCloudinaryUrl(resource.secure_url || resource.url, 'w_1200,h_900,c_limit,q_auto,f_auto'),
        title: resource.context?.custom?.title || `${categories[category]} ${index + 1}`,
        description: resource.context?.custom?.description || `תמונה יפה של ${categories[category]}`,
        category: category,
        uploadDate: resource.created_at || new Date().toISOString()
    }));
}

// יצירת URL מאופטם ל-Cloudinary
function generateCloudinaryUrl(originalUrl, transformations) {
    if (!originalUrl || !cloudinaryConfig.cloudName) return originalUrl;
    
    if (originalUrl.includes('cloudinary.com')) {
        return originalUrl.replace('/upload/', `/upload/${transformations}/`);
    }
    
    return originalUrl;
}

// נתוני fallback מותאמים לפרודקשן
function loadProductionFallbackData() {
    console.log('📦 Loading production fallback data...');
    
    galleryData = [
        // זרים ליום הולדת
        {
            id: 'prod_bd1',
            title: 'זר בלונים מיוחד ליום הולדת',
            description: 'זר בלונים צבעוני ועליז לחגיגת יום הולדת',
            url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&q=80',
            thumbnail: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300&h=200&fit=crop&auto=format&q=80',
            fullsize: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&auto=format&q=80',
            category: 'birthday-bouquets'
        },
        {
            id: 'prod_bd2',
            title: 'זר בלונים אלגנטי',
            description: 'זר בלונים מעוצב בסגנון אלגנטי',
            url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&auto=format&q=80',
            thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&auto=format&q=80',
            fullsize: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&auto=format&q=80',
            category: 'birthday-bouquets'
        },
        
        // מספרים מבלונים
        {
            id: 'prod_bn1',
            title: 'בלוני מספרים זהובים',
            description: 'בלוני מספרים מיוחדים בצבע זהב מבריק',
            url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&auto=format&q=80',
            thumbnail: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=300&h=200&fit=crop&auto=format&q=80',
            fullsize: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1200&auto=format&q=80',
            category: 'balloon-numbers'
        },
        {
            id: 'prod_bn2',
            title: 'מספרי בלונים צבעוניים',
            description: 'בלוני מספרים בצבעים עזים ומרהיבים',
            url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&q=80',
            thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop&auto=format&q=80',
            fullsize: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&q=80',
            category: 'balloon-numbers'
        },
        
        // קשתות
        {
            id: 'prod_arch1',
            title: 'קשת בלונים מרהיבה',
            description: 'קשת בלונים גדולה וצבעונית לכניסת אירוע',
            url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&auto=format&q=80',
            thumbnail: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=200&fit=crop&auto=format&q=80',
            fullsize: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200&auto=format&q=80',
            category: 'arches'
        },
        {
            id: 'prod_arch2',
            title: 'קשת בלונים מינימליסטית',
            description: 'קשת בלונים בעיצוב נקי ומינימליסטי',
            url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&auto=format&q=80',
            thumbnail: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=300&h=200&fit=crop&auto=format&q=80',
            fullsize: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=1200&auto=format&q=80',
            category: 'arches'
        },
        
        // פרחים עם בלונים
        {
            id: 'prod_bf1',
            title: 'שילוב פרחים ובלונים מרהיב',
            description: 'עיצוב מיוחד המשלב פרחים טריים עם בלונים צבעוניים',
            url: 'https://images.unsplash.com/photo-1546541865-a1e0de5ac8dc?w=800&auto=format&q=80',
            thumbnail: 'https://images.unsplash.com/photo-1546541865-a1e0de5ac8dc?w=300&h=200&fit=crop&auto=format&q=80',
            fullsize: 'https://images.unsplash.com/photo-1546541865-a1e0de5ac8dc?w=1200&auto=format&q=80',
            category: 'balloon-flowers'
        },
        {
            id: 'prod_bf2',
            title: 'זר פרחים עם בלונים אלגנטי',
            description: 'זר פרחים טריים בשילוב בלונים בעיצוב אלגנטי',
            url: 'https://images.unsplash.com/photo-1563473213013-de2a0133c100?w=800&auto=format&q=80',
            thumbnail: 'https://images.unsplash.com/photo-1563473213013-de2a0133c100?w=300&h=200&fit=crop&auto=format&q=80',
            fullsize: 'https://images.unsplash.com/photo-1563473213013-de2a0133c100?w=1200&auto=format&q=80',
            category: 'balloon-flowers'
        },
        
        // מרכזי שולחן
        {
            id: 'prod_cp1',
            title: 'מרכז שולחן עם בלונים',
            description: 'עיצוב מרכז שולחן מיוחד עם בלונים ופרחים',
            url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&auto=format&q=80',
            thumbnail: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=300&h=200&fit=crop&auto=format&q=80',
            fullsize: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&auto=format&q=80',
            category: 'centerpiece'
        },
        
        // סידורי חדרים
        {
            id: 'prod_room1',
            title: 'עיצוב חדר עם בלונים',
            description: 'סידור חדר מלא עם בלונים ועיטורים',
            url: 'https://images.unsplash.com/photo-1519167758481-83f29c5c6573?w=800&auto=format&q=80',
            thumbnail: 'https://images.unsplash.com/photo-1519167758481-83f29c5c6573?w=300&h=200&fit=crop&auto=format&q=80',
            fullsize: 'https://images.unsplash.com/photo-1519167758481-83f29c5c6573?w=1200&auto=format&q=80',
            category: 'room-arrangements'
        },
        
        // קירות צילום
        {
            id: 'prod_photo1',
            title: 'קיר צילום עם בלונים',
            description: 'רקע צילום מיוחד עם בלונים צבעוניים',
            url: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800&auto=format&q=80',
            thumbnail: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=300&h=200&fit=crop&auto=format&q=80',
            fullsize: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=1200&auto=format&q=80',
            category: 'photo-walls'
        },
        
        // בלונים לילדים
        {
            id: 'prod_kids1',
            title: 'בלונים עליזים לילדים',
            description: 'בלונים צבעוניים ועליזים שמשמחים את הילדים',
            url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&q=80',
            thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop&auto=format&q=80',
            fullsize: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&q=80',
            category: 'balloons-for-kids'
        }
    ];
    
    console.log('✅ Production fallback data loaded:', galleryData.length, 'images');
    
    // שמור בזיכרון המטמון לשימוש עתידי
    try {
        localStorage.setItem('galleryDataFallback', JSON.stringify(galleryData));
    } catch (e) {
        console.warn('⚠️ Failed to save fallback data to localStorage');
    }
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
                 onerror="handleImageError(this, '${item.url}')">
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
    const lightboxModal = createLightboxHTML();

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

// יצירת HTML ללייטבוקס
function createLightboxHTML() {
    return `
        <div class="lightbox-modal" id="lightboxModal" onclick="closeLightboxOnBackdrop(event)">
            <div class="lightbox-content" onclick="event.stopPropagation()">
                <button class="close-lightbox" onclick="closeLightbox()" type="button" aria-label="סגור">×</button>
                <img class="lightbox-image" src="" alt="" id="lightboxImage">
                <div class="lightbox-info">
                    <h3 class="lightbox-title" id="lightboxTitle"></h3>
                    <p class="lightbox-desc" id="lightboxDesc"></p>
                    <span class="lightbox-category" id="lightboxCategory"></span>
                </div>
                <button class="lightbox-prev" onclick="navigateLightbox(-1)" type="button" aria-label="תמונה קודמת">❮</button>
                <button class="lightbox-next" onclick="navigateLightbox(1)" type="button" aria-label="תמונה הבאה">❯</button>
                <div class="lightbox-counter">
                    <span id="currentImageNum">1</span> / <span id="totalImagesNum">${filteredImages.length}</span>
                </div>
            </div>
        </div>
    `;
}

// פונקציות עזר
function handleFilterClick(category) {
    console.log('🔍 Filter clicked:', category);
    
    // עדכון כפתורים
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${category}"]`)?.classList.add('active');
    
    // יצירת גלריה מחדש
    createGallery(category);
}

function handleImageError(img, fallbackUrl) {
    console.warn('⚠️ Image failed to load:', img.src);
    
    if (fallbackUrl && img.src !== fallbackUrl) {
        img.src = fallbackUrl;
    } else {
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtGQ15XXkNGO16DXlCDZhNin16rXktef158ZgOKAjTwvdGV4dD48L3N2Zz4K';
    }
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
    if (!filteredImages[index]) return;

    currentImageIndex = index;
    const image = filteredImages[index];
    const modal = document.getElementById('lightboxModal');
    
    if (!modal) return;
    
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
function initGalleryEvents() {
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

// CSS לפרודקשן
function addProductionCSS() {
    if (document.getElementById('production-gallery-css')) return;

    const style = document.createElement('style');
    style.id = 'production-gallery-css';
    style.textContent = `
        /* CSS מותאם לפרודקשן */
        .filter-section {
            margin-bottom: 30px;
            text-align: center;
        }

        .filter-buttons {
            display: flex;
            justify-content: center;
            gap: 10px;
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
            font-size: 13px;
            color: #333;
            font-weight: 500;
            transition: all 0.3s ease;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }

        .filter-btn:hover,
        .filter-btn:active {
            border-color: #4CAF50;
            background: #4CAF50;
            color: white;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(76,175,80,0.3);
        }

        .filter-btn.active {
            background: #4CAF50;
            color: white;
            border-color: #4CAF50;
            box-shadow: 0 4px 8px rgba(76,175,80,0.3);
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
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            padding: 0 15px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .gallery-item {
            position: relative;
            cursor: pointer;
            overflow: hidden;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            background: white;
            height: 300px;
            transition: all 0.3s ease;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
        }

        .gallery-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }

        .gallery-item:active {
            transform: translateY(-2px);
        }

        .gallery-item img {
            width: 100%;
            height: 75%;
            object-fit: cover;
            display: block;
            transition: transform 0.3s ease;
        }

        .gallery-item:hover img {
            transform: scale(1.05);
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
            padding: 15px;
        }

        .gallery-info h3 {
            margin: 0 0 5px 0;
            font-size: 1.1em;
            font-weight: 600;
            line-height: 1.2;
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }

        .gallery-info p {
            margin: 0 0 5px 0;
            font-size: 0.85em;
            line-height: 1.3;
            opacity: 0.9;
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .category-tag {
            background: rgba(76,175,80,0.8);
            padding: 3px 8px;
            border-radius: 10px;
            font-size: 0.75em;
            align-self: flex-start;
            backdrop-filter: blur(5px);
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
            backdrop-filter: blur(5px);
        }

        .lightbox-modal.active {
            display: flex;
        }

        .lightbox-content {
            position: relative;
            max-width: 90%;
            max-height: 90%;
            display: flex;
            flex-direction: column;
            animation: lightboxZoom 0.3s ease-out;
        }

        @keyframes lightboxZoom {
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
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        .lightbox-info {
            color: white;
            padding: 20px;
            text-align: center;
            background: rgba(0,0,0,0.8);
            border-radius: 0 0 8px 8px;
            backdrop-filter: blur(10px);
        }

        .lightbox-title {
            font-size: 1.3em;
            margin-bottom: 8px;
            color: #4CAF50;
        }

        .lightbox-desc {
            margin-bottom: 8px;
            line-height: 1.4;
        }

        .lightbox-category {
            background: rgba(76,175,80,0.8);
            padding: 5px 10px;
            border-radius: 12px;
            font-size: 0.9em;
            display: inline-block;
        }

        .close-lightbox {
            position: absolute;
            top: -45px;
            right: 0;
            background: rgba(0,0,0,0.6);
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            font-size: 24px;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(5px);
        }

        .close-lightbox:hover {
            background: rgba(76,175,80,0.8);
            transform: scale(1.1);
        }

        .lightbox-prev, .lightbox-next {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(0,0,0,0.6);
            color: white;
            border: none;
            padding: 12px 8px;
            cursor: pointer;
            font-size: 20px;
            transition: all 0.3s ease;
            backdrop-filter: blur(5px);
        }

        .lightbox-prev:hover, .lightbox-next:hover {
            background: rgba(76,175,80,0.8);
        }

        .lightbox-prev {
            left: -50px;
            border-radius: 0 8px 8px 0;
        }

        .lightbox-next {
            right: -50px;
            border-radius: 8px 0 0 8px;
        }

        .lightbox-counter {
            position: absolute;
            top: -45px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.6);
            color: white;
            padding: 8px 12px;
            border-radius: 15px;
            font-size: 14px;
            backdrop-filter: blur(5px);
        }

        /* מצבי טעינה */
        .loading-state {
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

        .no-images, .no-results {
            text-align: center;
            color: #999;
            font-style: italic;
            padding: 40px 20px;
            grid-column: 1 / -1;
        }

        /* רספונסיביות לטאבלט */
        @media (max-width: 1024px) {
            .gallery-container {
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 18px;
            }
            
            .gallery-item {
                height: 280px;
            }
        }

        /* רספונסיביות למובייל */
        @media (max-width: 768px) {
            .filter-buttons {
                gap: 8px;
                margin: 15px 0;
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
                padding: 12px;
            }
            
            .gallery-info h3 {
                font-size: 1em;
            }
            
            .gallery-info p {
                font-size: 0.8em;
                -webkit-line-clamp: 1;
            }
            
            .lightbox-prev {
                left: 10px;
            }
            
            .lightbox-next {
                right: 10px;
            }
            
            .close-lightbox {
                top: -35px;
                width: 35px;
                height: 35px;
                font-size: 20px;
            }
            
            .lightbox-counter {
                top: -35px;
                font-size: 12px;
                padding: 6px 10px;
            }
        }

        /* מובייל קטן */
        @media (max-width: 480px) {
            .filter-buttons {
                gap: 6px;
                padding: 0 5px;
            }
            
            .filter-btn {
                padding: 6px 10px;
                font-size: 11px;
            }
            
            .gallery-container {
                gap: 12px;
                padding: 0 8px;
            }
            
            .gallery-item {
                height: 200px;
            }
            
            .gallery-overlay {
                padding: 10px;
            }
            
            .lightbox-content {
                max-width: 95%;
                max-height: 95%;
            }
            
            .lightbox-image {
                max-height: 60vh;
            }
            
            .lightbox-info {
                padding: 15px;
            }
        }

        /* אנימציות */
        .gallery-item {
            opacity: 0;
            animation: fadeInUp 0.6s ease-out forwards;
        }

        .gallery-item:nth-child(1) { animation-delay: 0.1s; }
        .gallery-item:nth-child(2) { animation-delay: 0.2s; }
        .gallery-item:nth-child(3) { animation-delay: 0.3s; }
        .gallery-item:nth-child(4) { animation-delay: 0.4s; }
        .gallery-item:nth-child(5) { animation-delay: 0.5s; }
        .gallery-item:nth-child(6) { animation-delay: 0.6s; }
        .gallery-item:nth-child(7) { animation-delay: 0.7s; }
        .gallery-item:nth-child(8) { animation-delay: 0.8s; }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* אופטימיזציה לביצועים */
        .gallery-item img {
            will-change: transform;
        }

        .lightbox-modal {
            will-change: opacity, visibility;
        }

        /* נגישות */
        .filter-btn:focus,
        .close-lightbox:focus,
        .lightbox-prev:focus,
        .lightbox-next:focus {
            outline: 2px solid #4CAF50;
            outline-offset: 2px;
        }

        /* אנימציות מוקטנות למי שמעדיף */
        @media (prefers-reduced-motion: reduce) {
            .gallery-item,
            .filter-btn,
            .lightbox-content {
                animation: none;
                transition: none;
            }
            
            .loading-spinner {
                animation: none;
                border: 4px solid #4CAF50;
            }
        }
    `;
    document.head.appendChild(style);
}

// פונקציות סנכרון עם דף הניהול
function syncWithAdminPanel() {
    try {
        const adminData = localStorage.getItem('galleryData');
        const adminCategories = localStorage.getItem('categories');
        const adminConfig = localStorage.getItem('cloudinaryConfig');
        
        let hasUpdates = false;
        
        if (adminData) {
            const parsed = JSON.parse(adminData);
            if (Array.isArray(parsed) && parsed.length > 0) {
                if (JSON.stringify(parsed) !== JSON.stringify(galleryData)) {
                    galleryData = parsed;
                    hasUpdates = true;
                    console.log('✅ Synced gallery data from admin panel');
                }
            }
        }
        
        if (adminConfig) {
            const parsed = JSON.parse(adminConfig);
            if (JSON.stringify(parsed) !== JSON.stringify(cloudinaryConfig)) {
                cloudinaryConfig = parsed;
                hasUpdates = true;
                console.log('✅ Synced Cloudinary config from admin panel');
            }
        }
        
        return hasUpdates;
    } catch (error) {
        console.warn('⚠️ Failed to sync with admin panel:', error);
        return false;
    }
}

// API ציבורי לפרודקשן
window.productionGallery = {
    // אתחול הגלריה
    init: (category = 'all') => createGallery(category),
    
    // רענון מלא
    refresh: async () => {
        console.log('🔄 Refreshing gallery...');
        galleryData = [];
        await createGallery();
    },
    
    // טעינת נתוני דמו
    loadDemo: () => {
        console.log('🎨 Loading demo data...');
        loadProductionFallbackData();
        createGallery();
    },
    
    // סנכרון עם דף הניהול
    sync: () => {
        console.log('🔄 Syncing with admin panel...');
        if (syncWithAdminPanel()) {
            createGallery();
            return true;
        }
        return false;
    },
    
    // ניקוי מטמון
    clearCache: () => {
        console.log('🗑️ Clearing cache...');
        localStorage.removeItem('galleryData');
        localStorage.removeItem('galleryDataFallback');
        galleryData = [];
        loadProductionFallbackData();
        createGallery();
    },
    
    // קבלת סטטוס
    getStatus: () => ({
        environment: isProduction ? 'production' : 'development',
        totalImages: galleryData.length,
        filteredImages: filteredImages.length,
        hasCloudinaryConfig: cloudinaryConfig.cloudName && cloudinaryConfig.cloudName !== 'your-cloud-name',
        isMobile,
        lastUpdate: new Date().toISOString()
    }),
    
    // עדכון הגדרות Cloudinary
    updateCloudinaryConfig: (config) => {
        cloudinaryConfig = { ...cloudinaryConfig, ...config };
        localStorage.setItem('cloudinaryConfig', JSON.stringify(cloudinaryConfig));
        console.log('✅ Cloudinary config updated');
    },
    
    // הוספת תמונה חדשה
    addImage: (imageData) => {
        const newImage = {
            id: Date.now().toString(),
            ...imageData,
            uploadDate: new Date().toISOString()
        };
        galleryData.push(newImage);
        localStorage.setItem('galleryData', JSON.stringify(galleryData));
        createGallery();
        console.log('✅ Image added:', newImage.title);
    }
};

// אתחול אוטומטי
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌐 Production Gallery System Loading...');
    console.log('Environment:', { isProduction, isLocalhost, isMobile });
    
    // טעינת הגדרות מ-localStorage
    try {
        const savedConfig = localStorage.getItem('cloudinaryConfig');
        if (savedConfig) {
            cloudinaryConfig = JSON.parse(savedConfig);
        }
    } catch (e) {
        console.warn('⚠️ Failed to load Cloudinary config');
    }
    
    // אתחול הגלריה
    createGallery().then(() => {
        console.log('✅ Production Gallery loaded successfully!');
        
        // הגדרת סנכרון אוטומטי עם דף הניהול כל דקה
        setInterval(() => {
            if (syncWithAdminPanel()) {
                console.log('🔄 Auto-sync triggered');
            }
        }, 60000);
        
    }).catch(error => {
        console.error('❌ Failed to load gallery:', error);
        // נסה עם נתוני fallback
        loadProductionFallbackData();
        createGallery();
    });
});

// מאזין לשינויים ב-localStorage (לסנכרון בין כרטיסיות)
window.addEventListener('storage', function(e) {
    if (e.key === 'galleryData' || e.key === 'cloudinaryConfig') {
        console.log('📡 Storage changed, syncing...');
        if (syncWithAdminPanel()) {
            createGallery();
        }
    }
});

// מאזין לטעינת העמוד מחדש
window.addEventListener('beforeunload', function() {
    // שמירה אחרונה של נתונים
    if (galleryData.length > 0) {
        try {
            localStorage.setItem('galleryDataBackup', JSON.stringify({
                data: galleryData,
                timestamp: Date.now()
            }));
        } catch (e) {
            console.warn('⚠️ Failed to save backup data');
        }
    }
});

console.log('🌐 Production Gallery Script Loaded!');