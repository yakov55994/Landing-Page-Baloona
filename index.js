// הוסף את זה בתחילת הקובץ index.js שלך, לפני ה-DOMContentLoaded

// נתוני הגלריה לדוגמה
const galleryData = [
    {
        id: 1,
        title: "בר מצווה מיוחד",
        description: "עיצוב בלונים מיוחד לבר מצווה",
        image: "https://www.iballoon.co.il/wp-content/uploads/2019/12/balloons-bar-mitzvah2.jpg",
        category: "special-events"
    },
    {
        id: 2,
        title: "זר יום הולדת",
        description: "זר בלונים מיוחד ליום הולדת",
        image: "https://www.iballoon.co.il/wp-content/uploads/2021/07/mom-bitrday-ballons-1001x1024.jpg",
        category: "birthday-bouquets"
    },
    {
        id: 3,
        title: "הצעת נישואין רומנטית",
        description: "עיצוב מיוחד להצעת נישואין",
        image: "https://blue-balloon.co.il/wp-content/uploads/2021/06/1-3-768x576.jpg",
        category: "marriage-proposals"
    }
];

// פונקציה ליצירת הגלריה
async function createGallery(selectedCategory = 'all') {
    const gallerySection = document.getElementById('gallery');
    if (!gallerySection) return;

    // קטגוריות מסודרות לפי חשיבות ופופולריות
    const categories = [
        'all',
        'birthday-bouquets',        // זרים ליום הולדת
        'balloon-numbers',          // מספרים מבלונים
        'arches',                   // קשתות
        'balloon-flowers',          // פרחים עם בלונים
        'centerpiece',              // מרכזי שולחן
        'room-arrangements',        // סידורי חדרים
        'photo-walls',              // קירות צילום
        'balloon-sphere',           // כדור פורח
        'gender-reveal',            // גילוי מין
        'balloons-for-kids',        // בלונים לילדים
        'birth-celebration'         // הולדת הבן / בת
    ];

    // שמות הקטגוריות בעברית
    const categoryNames = {
        'all': '🎈 הכל',
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

    // יצירת כפתורי פילטר עם אייקונים
    const filterButtons = categories.map(category => `
        <button class="filter-btn ${category === selectedCategory ? 'active' : ''}" 
                data-filter="${category}"
                title="${categoryNames[category] || category}">
            ${categoryNames[category] || category}
        </button>
    `).join('');

    // משיכת התמונות מה-API
    let galleryItemsArray = [];
    try {
        if (selectedCategory === 'all') {
            // משוך מכל הקטגוריות
            const allImages = await Promise.all(
                categories.filter(cat => cat !== 'all').map(async cat => {
                    try {
                        const res = await fetch(`http://localhost:3001/api/images/${cat}`);
                        if (res.ok) {
                            const images = await res.json();
                            return images.map(img => ({ ...img, category: cat }));
                        }
                        return [];
                    } catch (error) {
                        console.warn(`Failed to load images for category: ${cat}`, error);
                        return [];
                    }
                })
            );
            galleryItemsArray = allImages.flat();
        } else {
            const res = await fetch(`http://localhost:3001/api/images/${selectedCategory}`);
            if (res.ok) {
                galleryItemsArray = (await res.json()).map(img => ({ ...img, category: selectedCategory }));
            }
        }
    } catch (error) {
        console.warn('Failed to load gallery images:', error);
        // שימוש בנתונים לדוגמה במקרה של שגיאה
        galleryItemsArray = galleryData.filter(item => 
            selectedCategory === 'all' || item.category === selectedCategory
        );
    }

    // יצירת פריטי הגלריה
    const galleryItems = galleryItemsArray.map((item, index) => `
        <div class="gallery-item" 
             data-category="${item.category}"
             data-index="${index}"
             loading="lazy">
            <img src="${item.url || item.image}" 
                 alt="${item.alt || item.title || ''}" 
                 loading="lazy"
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTA1LjUyMyA3MCAxMTAgNzQuNDc3IDExMCA4MEM4NS4xNDY5IDgwIDc1IDkwLjE0NjkgNzUgMTE1QzY5LjQ3NyAxMTUgNjUgMTE5LjQ3NyA2NSAxMjVINjBDNTQuNDc3IDEyNSA1MCAxMjkuNDc3IDUwIDEzNUM1MCA5NS44MTc0IDgyLjgxNzQgNjMgMTIyIDYzSDEyNUMxMzAuNTIzIDYzIDEzNSA2Ny40NzcgMTM1IDczVjEyMEMxMzUgMTI1LjUyMyAxMzkuNDc3IDEzMCAxNDUgMTMwSDE1MEMxNTUuNTIzIDEzMCAxNjAgMTM0LjQ3NyAxNjAgMTQwVjE0NUMxNjAgMTUwLjUyMyAxNTUuNTIzIDE1NSAxNTAgMTU1SDQ1QzM5LjQ3NyAxNTUgMzUgMTUwLjUyMyAzNSAxNDVWNDVDMzUgMzkuNDc3IDM5LjQ3NyAzNSA0NSAzNUgxMDBWNzBaIiBmaWxsPSIjZTVlN2ViIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTE1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOWNhM2FmIiBmb250LXNpemU9IjE0Ij7Qs9mF2YjZhtipINmE2Kcg2YXZiNis2YjYr9ipPC90ZXh0Pgo8L3N2Zz4K'">
            <div class="gallery-info">
                <h3>${item.title || ''}</h3>
                <p>${item.description || ''}</p>
                <span class="category-tag">${categoryNames[item.category] || item.category}</span>
            </div>
        </div>
    `).join('');

    // מודל לייטבוקס
    const lightboxModal = `
        <div class="lightbox-modal">
            <div class="lightbox-content">
                <span class="close-lightbox" aria-label="סגור">&times;</span>
                <img class="lightbox-image" src="" alt="">
                <div class="lightbox-info">
                    <h3 class="lightbox-title"></h3>
                    <p class="lightbox-desc"></p>
                    <span class="lightbox-category"></span>
                </div>
                <button class="lightbox-prev" aria-label="תמונה קודמת">&#10094;</button>
                <button class="lightbox-next" aria-label="תמונה הבאה">&#10095;</button>
                <div class="lightbox-counter">
                    <span class="current-image">1</span> / <span class="total-images">${galleryItemsArray.length}</span>
                </div>
            </div>
        </div>
    `;

    // הכנסת הכל לדף
    const existingTitle = gallerySection.querySelector('.section-title');
    gallerySection.innerHTML = '';
    if (existingTitle) {
        gallerySection.appendChild(existingTitle);
    }

    // הוספת מונה תמונות
    const imageCounter = galleryItemsArray.length > 0 ? 
        `<div class="gallery-counter">נמצאו <strong>${galleryItemsArray.length}</strong> תמונות</div>` : 
        `<div class="gallery-counter no-results">לא נמצאו תמונות בקטגוריה זו</div>`;

    gallerySection.insertAdjacentHTML('beforeend', `
        <div class="filter-section">
            <div class="filter-buttons">
                ${filterButtons}
            </div>
            ${imageCounter}
        </div>
        <div class="gallery-container">
            ${galleryItems}
        </div>
        ${lightboxModal}
    `);

    // מאזין לפילטרים
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // הוספת אפקט לחיצה
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 100);
            
            createGallery(this.dataset.filter);
        });
    });

    // הוספת CSS
    addGalleryCSS();

    // אתחול הלייטבוקס
    initLightbox(galleryItemsArray);
}

// פונקציה לאתחול הלייטבוקס
function initLightbox(items) {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightboxModal = document.querySelector('.lightbox-modal');
    const lightboxImage = document.querySelector('.lightbox-image');
    const lightboxTitle = document.querySelector('.lightbox-title');
    const lightboxDesc = document.querySelector('.lightbox-desc');
    const lightboxCategory = document.querySelector('.lightbox-category');
    const closeLightbox = document.querySelector('.close-lightbox');
    const lightboxNext = document.querySelector('.lightbox-next');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const currentImageSpan = document.querySelector('.current-image');
    const totalImagesSpan = document.querySelector('.total-images');

    if (!lightboxModal || !items.length) return;

    let currentIndex = 0;

    // פתיחת לייטבוקס
    function openLightbox(index) {
        if (!items[index]) return;

        currentIndex = index;
        const item = items[index];

        lightboxImage.src = item.url || item.image;
        lightboxImage.alt = item.alt || item.title || '';
        lightboxTitle.textContent = item.title || '';
        lightboxDesc.textContent = item.description || '';
        
        // עדכון קטגוריה
        const categoryNames = {
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
        
        lightboxCategory.textContent = categoryNames[item.category] || item.category;
        
        // עדכון מונה
        currentImageSpan.textContent = index + 1;
        totalImagesSpan.textContent = items.length;

        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // סגירת לייטבוקס
    function closeLightboxFunc() {
        lightboxModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // אירועי לחיצה על פריטי גלריה
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => openLightbox(index));
    });

    // אירועי ניווט
    if (closeLightbox) {
        closeLightbox.addEventListener('click', closeLightboxFunc);
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % items.length;
            openLightbox(currentIndex);
        });
    }

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            openLightbox(currentIndex);
        });
    }

    // סגירה בלחיצה מחוץ לתמונה
    lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) {
            closeLightboxFunc();
        }
    });

    // תמיכה במקלדת
    document.addEventListener('keydown', (e) => {
        if (!lightboxModal.classList.contains('active')) return;

        switch (e.key) {
            case 'Escape':
                closeLightboxFunc();
                break;
            case 'ArrowRight':
                currentIndex = (currentIndex + 1) % items.length;
                openLightbox(currentIndex);
                break;
            case 'ArrowLeft':
                currentIndex = (currentIndex - 1 + items.length) % items.length;
                openLightbox(currentIndex);
                break;
        }
    });
}

// פונקציה להוספת CSS משופר
function addGalleryCSS() {
    if (document.getElementById('gallery-styles')) return;

    const style = document.createElement('style');
    style.id = 'gallery-styles';
    style.textContent = `
        .filter-section {
            margin-bottom: 40px;
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

        .filter-btn:hover::before {
            left: 100%;
        }

        .filter-btn:hover {
            border-color: #b9955b;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(185,149,91,0.3);
        }

        .filter-btn.active {
            background: linear-gradient(135deg, #deb471, #b9955b);
            color: white;
            border-color: #b9955b;
            box-shadow: 0 4px 15px rgba(185,149,91,0.4);
        }

        .gallery-counter {
            text-align: center;
            margin: 15px 0;
            font-size: 16px;
            color: #666;
        }

        .gallery-counter.no-results {
            color: #999;
            font-style: italic;
        }

        .gallery-counter strong {
            color: #b9955b;
            font-weight: 600;
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
            height: 300px;
            transform: translateY(0);
        }

        .gallery-item:hover {
            transform: translateY(-10px) scale(1.02);
            box-shadow: 0 15px 40px rgba(185,149,91,0.3);
        }

        .gallery-item img {
            width: 100%;
            height: 70%;
            object-fit: cover;
            display: block;
            transition: transform 0.4s ease;
        }

        .gallery-item:hover img {
            transform: scale(1.1);
        }

        .gallery-info {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 20px;
            background: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.6), transparent);
            color: white;
            transform: translateY(0);
            transition: all 0.3s ease;
            height: 30%;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
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
            background: rgba(185,149,91,0.8);
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            align-self: flex-start;
            backdrop-filter: blur(5px);
        }

        /* Lightbox משופר */
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
            color: #b9955b;
        }

        .lightbox-desc {
            margin-bottom: 10px;
            line-height: 1.5;
        }

        .lightbox-category {
            background: rgba(185,149,91,0.8);
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
            background: rgba(185,149,91,0.8);
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
            background: rgba(185,149,91,0.8);
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

        /* רספונסיביות משופרת */
        @media (max-width: 1200px) {
            .gallery-container {
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 25px;
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
                height: 250px;
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
                height: 200px;
            }
            
            .gallery-info {
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

// עדכון ה-DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // צור את הגלריה קודם
    createGallery();
    
    // אחר כך אתחל את כל השאר
    initVideoCarousels();
    initCategoryTabs();
    initVideoModals();
    initBackToTopButton();
    initContactForm();
    initMap();
    checkRTLSupport();
    initSmoothScrolling();
    initScrollArrow();
});

// שאר הפונקציות נשארות כמו שהן...