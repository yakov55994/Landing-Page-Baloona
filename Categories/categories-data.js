// קובץ: cloudinary-gallery-loader.js
// הוסף את הקובץ הזה לאתר שלך במקום categories-data.js

// הגדרות קלאודינרי
const CLOUDINARY_CONFIG = {
    cloudName: 'dbbivwbbt',
    folder: 'balloon-gallery'
};

// מיפוי קטגוריות
const categories = {
    'room-arrangements': 'סידורי חדרים',
    'balloon-numbers': 'מספרים מבלונים',
    'arches': 'קשתות',
    'photo-reviews': 'קירות צילום',
    'flowers-balloons': 'פרחים מבלונים',
    'kids-balloons': 'בלונים לילדים',
    'gender-reveal': 'גילוי מין',
    'balloon-bouquet': 'בלונים ליום הולדת',
    'centerpiece': 'מרכזי שולחן',
    'birth-celebration': 'הולדת בן / בת'
};

// פונקציה לטעינת תמונות מקלאודינרי
async function loadGalleryFromCloudinary() {
    try {
        console.log('🔄 Loading gallery from Cloudinary...');
        
        // ניסיון לטעון מהשרת הקיים שלך
        const serverResponse = await fetch('https://baloona-server.onrender.com/api/gallery');
        
        if (serverResponse.ok) {
            const images = await serverResponse.json();
            console.log('✅ Loaded from server:', images.length, 'images');
            return processImages(images);
        } else {
            console.log('⚠️ Server not available, trying Cloudinary direct...');
            throw new Error('Server not available');
        }
        
    } catch (error) {
        console.log('🔄 Trying direct Cloudinary access...');
        
        try {
            // ניסיון לטעון ישירות מקלאודינרי
            const cloudinaryImages = await loadDirectFromCloudinary();
            if (cloudinaryImages && cloudinaryImages.length > 0) {
                console.log('✅ Loaded direct from Cloudinary:', cloudinaryImages.length, 'images');
                return processImages(cloudinaryImages);
            }
        } catch (cloudinaryError) {
            console.error('❌ Failed to load from Cloudinary:', cloudinaryError);
        }
        
        // אם הכל נכשל, נטען נתונים מהזיכרון המקומי
        // const savedData = localStorage.getItem('galleryData');
        // if (savedData) {
        //     const images = JSON.parse(savedData);
        //     console.log('📦 Loaded from localStorage:', images.length, 'images');
        //     return processImages(images);
        // }
        
        // אם אין כלום, נחזיר מערך ריק
        console.log('❌ No images found');
        return createEmptyGalleryStructure();
    }
}

// טעינה ישירה מקלאודינרי
async function loadDirectFromCloudinary() {
    const searchUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/list/${CLOUDINARY_CONFIG.folder}.json`;
    
    try {
        const response = await fetch(searchUrl);
        if (response.ok) {
            const data = await response.json();
            return data.resources || [];
        }
    } catch (error) {
        console.error('Direct Cloudinary load failed:', error);
    }
    
    return [];
}

// עיבוד התמונות למבנה הנדרש לאתר
function processImages(rawImages) {
    const galleryStructure = createEmptyGalleryStructure();
    
    rawImages.forEach((img, index) => {
        const category = extractCategoryFromPath(img.public_id) || 'balloon-bouquet';
        const categoryName = categories[category] || category;
        
        // אם הקטגוriה לא קיימת, נוסיף אותה
        if (!galleryStructure.categories[category]) {
            galleryStructure.categories[category] = {
                name: categoryName,
                items: []
            };
        }
        
        // הוספת התמונה לקטגוריה המתאימה
        const imageData = {
            id: img.public_id || `img_${index}`,
            url: img.secure_url || img.url,
            thumbnail: generateThumbnailUrl(img.secure_url || img.url),
            fullsize: generateFullsizeUrl(img.secure_url || img.url),
            title: `תמונה ${index + 1}`,
            description: `${categoryName} - תמונה מספר ${index + 1}`,
            category: category,
            imageNumber: index + 1,
            uploadDate: img.created_at || new Date().toISOString()
        };
        
        galleryStructure.categories[category].items.push(imageData);
        galleryStructure.allImages.push(imageData);
    });
    
    // מיון תמונות לפי תאריך העלאה (החדשות ראשונות)
    Object.keys(galleryStructure.categories).forEach(categoryKey => {
        galleryStructure.categories[categoryKey].items.sort((a, b) => 
            new Date(b.uploadDate) - new Date(a.uploadDate)
        );
    });
    
    galleryStructure.allImages.sort((a, b) => 
        new Date(b.uploadDate) - new Date(a.uploadDate)
    );
    
    // עדכון localStorage
    localStorage.setItem('galleryData', JSON.stringify(galleryStructure.allImages));
    localStorage.setItem('galleryLastUpdate', Date.now().toString());
    
    console.log('✅ Gallery structure created:', galleryStructure);
    return galleryStructure;
}

// יצירת מבנה גלריה ריק
function createEmptyGalleryStructure() {
    return {
        categories: {},
        allImages: [],
        totalImages: 0
    };
}

// חילוץ קטגוריה מנתיב
function extractCategoryFromPath(path) {
    if (!path) return 'balloon-bouquet';
    
    if (path.includes('balloon-gallery/')) {
        const parts = path.split('balloon-gallery/')[1];
        const category = parts.split('/')[0];
        return category || 'balloon-bouquet';
    }
    
    // חיפוש קטגוריות ידועות
    const knownCategories = Object.keys(categories);
    for (const cat of knownCategories) {
        if (path.includes(cat)) {
            return cat;
        }
    }
    
    return 'balloon-bouquet';
}

// יצירת URL תמונה ממוזערת
function generateThumbnailUrl(originalUrl) {
    if (!originalUrl) return '';
    if (originalUrl.includes('cloudinary.com')) {
        return originalUrl.replace('/upload/', '/upload/w_400,h_300,c_fill,q_auto,f_auto/');
    }
    return originalUrl;
}

// יצירת URL תמונה מלאה
function generateFullsizeUrl(originalUrl) {
    if (!originalUrl) return '';
    if (originalUrl.includes('cloudinary.com')) {
        return originalUrl.replace('/upload/', '/upload/w_1200,h_900,c_limit,q_auto,f_auto/');
    }
    return originalUrl;
}

// פונקציה ליצירת הגלריה באתר (מחליפה את הפונקציה הקיימת)
async function createGallery() {
    const gallerySection = document.getElementById('gallery');
    if (!gallerySection) {
        console.error('Gallery section not found');
        return;
    }
    
    // הצגת טעינה
    const loadingHTML = `
        <div class="loading-gallery" style="text-align: center; padding: 40px;">
            <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="margin-top: 20px; color: #666;">טוען גלריה מעודכנת...</p>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    
    const categoryTabsContainer = gallerySection.querySelector('.category-tabs');
    if (categoryTabsContainer) {
        categoryTabsContainer.innerHTML = loadingHTML;
    }
    
    try {
        // טעינת הגלריה
        const galleryData = await loadGalleryFromCloudinary();
        
        if (!galleryData || galleryData.totalImages === 0) {
            displayEmptyGallery(gallerySection);
            return;
        }
        
        // יצירת הלשוניות
        createCategoryTabs(gallerySection, galleryData);
        
        // יצירת תוכן הקטגוריות
        createCategoryContent(gallerySection, galleryData);
        
        // הפעלת הלשונית הראשונה
        const firstTab = gallerySection.querySelector('.category-tab');
        if (firstTab) {
            firstTab.click();
        }
        
        console.log('✅ Gallery created successfully');
        
    } catch (error) {
        console.error('❌ Error creating gallery:', error);
        displayErrorGallery(gallerySection, error.message);
    }
}

// יצירת לשוניות קטגוריות
function createCategoryTabs(gallerySection, galleryData) {
    const categoryTabsContainer = gallerySection.querySelector('.category-tabs');
    if (!categoryTabsContainer) return;
    
    const categoryKeys = Object.keys(galleryData.categories);
    
    if (categoryKeys.length === 0) {
        categoryTabsContainer.innerHTML = '<p>אין קטגוריות זמינות</p>';
        return;
    }
    
    const tabsHTML = categoryKeys.map(categoryKey => {
        const category = galleryData.categories[categoryKey];
        return `
            <button class="category-tab" data-category="${categoryKey}">
                ${category.name} (${category.items.length})
            </button>
        `;
    }).join('');
    
    categoryTabsContainer.innerHTML = tabsHTML;
    
    // הוספת event listeners
    categoryTabsContainer.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const categoryKey = e.target.dataset.category;
            showCategory(categoryKey, galleryData);
            
            // עדכון טאב פעיל
            categoryTabsContainer.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
}

// יצירת תוכן קטגוריות
function createCategoryContent(gallerySection, galleryData) {
    // נסיר תוכן קיים ונוסיף div לתוכן דינמי
    let contentContainer = gallerySection.querySelector('.gallery-content');
    if (!contentContainer) {
        contentContainer = document.createElement('div');
        contentContainer.className = 'gallery-content';
        gallerySection.appendChild(contentContainer);
    }
    
    contentContainer.innerHTML = ''; // נקה תוכן קיים
}

// הצגת קטגוריה ספציפית
function showCategory(categoryKey, galleryData) {
    const contentContainer = document.querySelector('.gallery-content');
    if (!contentContainer) return;
    
    const category = galleryData.categories[categoryKey];
    if (!category || !category.items.length) {
        contentContainer.innerHTML = '<p>אין תמונות בקטגוריה זו</p>';
        return;
    }
    
    const itemsHTML = category.items.map(item => `
        <div class="gallery-item" data-category="${item.category}">
            <div class="image-number">${item.imageNumber}</div>
            <img src="${item.thumbnail}" 
                 alt="${item.title}" 
                 data-fullsize="${item.fullsize}"
                 loading="lazy"
                 onclick="openLightbox('${item.fullsize}', '${item.title}')">
            <div class="gallery-info">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
            </div>
        </div>
    `).join('');
    
    contentContainer.innerHTML = `
        <div class="modern-gallery">
            ${itemsHTML}
        </div>
    `;
}

// הצגת גלריה ריקה
function displayEmptyGallery(gallerySection) {
    const categoryTabsContainer = gallerySection.querySelector('.category-tabs');
    if (categoryTabsContainer) {
        categoryTabsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h3>הגלריה בתהליך עדכון</h3>
                <p>התמונות החדשות שלנו בדרך אליכם...</p>
                <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    רענן דף
                </button>
            </div>
        `;
    }
}

// הצגת שגיאה
function displayErrorGallery(gallerySection, errorMessage) {
    const categoryTabsContainer = gallerySection.querySelector('.category-tabs');
    if (categoryTabsContainer) {
        categoryTabsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <h3>אירעה שגיאה בטעינת הגלריה</h3>
                <p style="font-size: 14px;">${errorMessage}</p>
                <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    נסה שוב
                </button>
            </div>
        `;
    }
}

// פונקציה לרענון אוטומטי של הגלריה
function setupAutoRefresh() {
    // בדיקה כל 5 דקות אם יש תמונות חדשות
    setInterval(async () => {
        const lastUpdate = localStorage.getItem('galleryLastUpdate');
        const timeDiff = Date.now() - parseInt(lastUpdate || '0');
        
        // אם עברו יותר מ-10 דקות, רענן
        if (timeDiff > 10 * 60 * 1000) {
            console.log('🔄 Auto-refreshing gallery...');
            try {
                await createGallery();
                console.log('✅ Gallery auto-refreshed');
            } catch (error) {
                console.error('❌ Auto-refresh failed:', error);
            }
        }
    }, 5 * 60 * 1000); // כל 5 דקות
}

// אתחול מערכת הגלריה הדינמית
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎈 Dynamic Gallery System Loading...');
    
    // יצירת הגלריה
    await createGallery();
    
    // הפעלת רענון אוטומטי
    setupAutoRefresh();
    
    console.log('✅ Dynamic Gallery System Ready');
});

// ייצוא לשימוש חיצוני
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadGalleryFromCloudinary,
        createGallery,
        categories,
    };
}