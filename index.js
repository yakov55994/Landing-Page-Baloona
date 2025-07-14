// הוסף את זה בתחילת הקובץ index.js שלך, לפני ה-DOMContentLoaded

// נתוני הגלריה
const galleryData = [
    {
        id: 1,
        title: "בר מצווה ",
        description: "עיצוב בלונים מיוחד לבר מצווה",
        image: "https://www.iballoon.co.il/wp-content/uploads/2019/12/balloons-bar-mitzvah2.jpg", // שנה לנתיב האמיתי
        category: "bar-mitzvah"
    },
    {
        id: 2,
        title: "יום הולדת ",
        description: "עמודי בלונים ליום הולדת",
        image: "https://www.iballoon.co.il/wp-content/uploads/2021/07/mom-bitrday-ballons-1001x1024.jpg", // שנה לנתיב האמיתי
        category: "birthdays"
    },
    {
        id: 3,
        title: "הצעת נישואין",
        description: "קשת בלונים לחתונה",
        image: "https://blue-balloon.co.il/wp-content/uploads/2021/06/1-3-768x576.jpg", // שנה לנתיב האמיתי
        category: "Marriage-proposals"
    },
    {
        id: 4,
        title: "בר מצווה ",
        description: "עיצוב בלונים מיוחד לבר מצווה",
        image: "https://yambalon.co.il/wp-content/uploads/2022/01/IMG-20211122-WA0106-300x450.jpg", // שנה לנתיב האמיתי
        category: "bar-mitzvah"
    },
    {
        id: 5,
        title: "יום הולדת ",
        description: "עמודי בלונים ליום הולדת",
        image: "https://www.tulipflowers.co.il/Cat_433626_626.jpg", // שנה לנתיב האמיתי
        category: "birthdays"
    },
    {
        id: 6,
        title: "הצעת נישואין",
        description: "קשת בלונים לחתונה",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmDP1zZ287J5TrDjpUclGXRSV0V65bhgw-Ug&s", // שנה לנתיב האמיתי
        category: "Marriage-proposals"
    },
    
    // הוסף עוד פריטים לפי הצורך...
];

// פונקציה ליצירת הגלריה
async function createGallery(selectedCategory = 'all') {
    const gallerySection = document.getElementById('gallery');
    if (!gallerySection) return;

    // שמות הקטגוריות
    const categories = [
        'all',
        'balloon-flowers',
        'Arches', // שם התיקיה בדיוק כמו ב-Cloudinary
        'photo-reviews',
        'centerpiece',
        'birthday-bouquets',
        'balloon-numbers',
        'room-arrangements',
        'balloon',
        'gender-reveal',
        'balloons-for-kids',
        'birth-of-child'
    ];
    const categoryNames = {
        'all': 'הכל',
        'balloon-flowers': 'פרחים עם בלונים',
        'Arches': 'קשתות',
        'photo-reviews': 'קירות צילום',
        'centerpiece': 'שולחן מרכזי',
        'birthday-bouquets': 'זרים ליום הולדת',
        'balloon-numbers': 'מספרים מבלונים',
        'room-arrangements': 'סידורי חדרים',
        'balloon': 'כדור פורח',
        'gender-reveal': 'גילוי מין',
        'balloons-for-kids': 'בלונים לילדים',
        'birth-of-child': 'הולדת הבן / בת'
    };

    // יצירת כפתורי פילטר
    const filterButtons = categories.map(category => `
        <button class="filter-btn ${category === selectedCategory ? 'active' : ''}" data-filter="${category}">
            ${categoryNames[category] || category}
        </button>
    `).join('');

    // משיכת התמונות מה-API
    let galleryItemsArray = [];
    if (selectedCategory === 'all') {
        // משוך מכל הקטגוריות
        const allImages = await Promise.all(
            categories.filter(cat => cat !== 'all').map(async cat => {
                const res = await fetch(`http://localhost:3001/api/images/${cat}`);
                const images = await res.json();
                return images.map(img => ({ ...img, category: cat }));
            })
        );
        galleryItemsArray = allImages.flat();
    } else {
        const res = await fetch(`http://localhost:3001/api/images/${selectedCategory}`);
        galleryItemsArray = (await res.json()).map(img => ({ ...img, category: selectedCategory }));
    }

    // יצירת פריטי הגלריה
    const galleryItems = galleryItemsArray.map(item => `
        <div class="gallery-item" data-category="${item.category}">
            <img src="${item.url}" alt="" loading="lazy">
            <div class="gallery-info"></div>
        </div>
    `).join('');

    // מודל לייטבוקס (כמו קודם)
    const lightboxModal = `
        <div class="lightbox-modal">
            <div class="lightbox-content">
                <span class="close-lightbox">&times;</span>
                <img class="lightbox-image" src="" alt="">
                <div class="lightbox-info">
                    <h3 class="lightbox-title"></h3>
                    <p class="lightbox-desc"></p>
                </div>
                <button class="lightbox-prev">&#10094;</button>
                <button class="lightbox-next">&#10095;</button>
            </div>
        </div>
    `;

    // הכנסת הכל לדף
    const existingTitle = gallerySection.querySelector('.section-title');
    gallerySection.innerHTML = '';
    if (existingTitle) {
        gallerySection.appendChild(existingTitle);
    }
    gallerySection.insertAdjacentHTML('beforeend', `
        <div class="filter-buttons">
            ${filterButtons}
        </div>
        <div class="gallery-container">
            ${galleryItems}
        </div>
        ${lightboxModal}
    `);

    // מאזין לפילטרים
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            createGallery(this.dataset.filter);
        });
    });

    // הוספת CSS (אם יש לך פונקציה כזו)
    if (typeof addGalleryCSS === 'function') {
        addGalleryCSS();
    }
}


// פונקציה להוספת CSS
function addGalleryCSS() {
    if (document.getElementById('gallery-styles')) return;

    const style = document.createElement('style');
    style.id = 'gallery-styles';
    style.textContent = `
        .filter-buttons {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin: 30px 0;
            flex-wrap: wrap;
            padding: 0 20px;
        }

        .filter-btn {
            padding: 12px 24px;
            border: 2px solid #ddd;
            background: white;
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: inherit;
            font-size: 14px;
            color: black;
            font-weight: 500;
        }

        .filter-btn:hover {
            border-color:#b9955b;
            color: white;
        }

        .filter-btn.active {
            background:rgb(222, 180, 113);
            color: black;
            border-color: black;
        }

        .gallery-container {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 110px;
            padding-left: 70px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .gallery-item {
            position: relative;
            cursor: pointer;
            overflow: hidden;
            border-radius: 8px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(255, 215, 0, 0.8);
            background: white;
            height: 180px;
        }

        .gallery-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 15px rgba(255, 215, 0, 0.8);
        }

        .gallery-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        .gallery-info {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 15px;
            background: linear-gradient(transparent, rgba(0,0,0,0.8));
            color: white;
            transform: translateY(100%);
            transition: transform 0.3s ease;
        }

        .gallery-item:hover .gallery-info {
            transform: translateY(0);
        }

        .gallery-info h3 {
            margin-bottom: 5px;
            color: white;
            font-size: 1.1em;
            font-weight: 600;
        }

        .gallery-info p {
            color: rgba(255,255,255,0.9);
            font-size: 0.85em;
            line-height: 1.3;
        }

        /* Lightbox */
        .lightbox-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            z-index: 1000;
            justify-content: center;
            align-items: center;
        }

        .lightbox-modal.active {
            display: flex;
        }

        .lightbox-content {
            position: relative;
            max-width: 90%;
            max-height: 90%;
        }

        .lightbox-image {
            max-width: 100%;
            max-height: 80vh;
            object-fit: contain;
        }

        .lightbox-info {
            color: white;
            padding: 20px;
            text-align: center;
        }

        .close-lightbox {
            position: absolute;
            top: -40px;
            right: 0;
            color: white;
            font-size: 30px;
            cursor: pointer;
            background: none;
            border: none;
        }

        .lightbox-prev, .lightbox-next {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255,255,255,0.2);
            color: white;
            border: none;
            font-size: 24px;
            padding: 10px 15px;
            cursor: pointer;
            border-radius: 50%;
        }

        .lightbox-prev {
            left: -60px;
        }

        .lightbox-next {
            right: -60px;
        }

        /* רספונסיביות */
        
        /* טאבלט גדול - 1024px ומטה */
        @media (max-width: 1024px) {
            .gallery-container {
                grid-template-columns: repeat(3, 1fr);
                gap: 40px;
                padding-left: 30px;
                max-width: 900px;
            }
            
            .gallery-item {
                height: 200px;
            }
        }

        /* טאבלט - 768px ומטה */
        @media (max-width: 768px) {
            .filter-buttons {
                gap: 8px;
                margin: 20px 0;
            }
            
            .filter-btn {
                padding: 10px 18px;
                font-size: 13px;
            }
            
            .gallery-container {
                grid-template-columns: repeat(2, 1fr);
                gap: 25px;
                padding-left: 20px;
                padding-right: 20px;
                max-width: 100%;
            }
            
            .gallery-item {
                height: 220px;
            }
            
            .lightbox-prev {
                left: 10px;
            }
            
            .lightbox-next {
                right: 10px;
            }
            
            .close-lightbox {
                top: -35px;
                font-size: 28px;
            }
        }

        /* מובייל - 480px ומטה */
        @media (max-width: 480px) {
            .filter-buttons {
                gap: 6px;
                margin: 8px 0;
                padding: 0 5px;
            }
            
            .filter-btn {
                padding: 6px 12px;
                font-size: 11px;
            }
            
            .gallery-container {
            grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                padding-left: 15px;
                padding-right: 15px;
                margin-top: 50px;
            }
            
            .gallery-item {
                height: 100px;
            }
            
            .gallery-info {
                padding: 12px;
            }
            
            .gallery-info h3 {
                font-size: 1em;
                margin-bottom: 4px;
            }
            
            .gallery-info p {
                font-size: 0.8em;
            }
            
            .lightbox-content {
                max-width: 95%;
                max-height: 95%;
            }
            
            .lightbox-info {
                padding: 15px;
            }
            
            .lightbox-prev, .lightbox-next {
                font-size: 20px;
                padding: 8px 12px;
            }
        }

        /* מובייל קטן - 320px ומטה */
        @media (max-width: 320px) {
            .filter-btn {
                padding: 6px 12px;
                font-size: 11px;
            }
            
            .gallery-container {
                gap: 15px;
                padding-left: 10px;
                padding-right: 10px;
            }
            
            .gallery-item {
                height: 200px;
            }
        }
    `;
    document.head.appendChild(style);
}

// עדכן את ה-DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // צור את הגלריה קודם
    createGallery();
    
    // אחר כך אתחל את כל השאר
    initVideoCarousels();
    initCategoryTabs();
    initVideoModals();
    initBackToTopButton();
    initGallery(); // עכשיו זה יעבוד כי האלמנטים קיימים
    initContactForm();
    initMap();
    checkRTLSupport();
    initSmoothScrolling();
    initScrollArrow();
});

document.addEventListener('DOMContentLoaded', function() {
    // הגדרות לקרוסלת וידאו
    initVideoCarousels();
    
    // אתחול לשוניות קטגוריה
    initCategoryTabs();
    
    // הפעלת מודל וידאו
    initVideoModals();
    
    // כפתור חזרה לראש העמוד
    initBackToTopButton();
    
    // אתחול הגלריה
    initGallery();
    
    // אתחול טופס יצירת קשר
    initContactForm();
    
    // אתחול מפה
    initMap();
    
    // הפעלת פונקציות נוספות
    checkRTLSupport();
    initSmoothScrolling();
    initScrollArrow();
});

// אתחול קרוסלות וידאו
function initVideoCarousels() {
    const carousels = document.querySelectorAll('.video-carousel-container');
    
    carousels.forEach(carousel => {
        const carouselStrip = carousel.querySelector('.video-carousel');
        const items = carousel.querySelectorAll('.video-carousel-item');
        const prevBtn = carousel.querySelector('.prev-btn');
        const nextBtn = carousel.querySelector('.next-btn');
        const dots = carousel.querySelectorAll('.carousel-dot');
        
        if (!items.length) return;
        
        let currentIndex = 0;
        const itemWidth = items[0].offsetWidth;
        const gap = 20;
        const visibleItems = Math.floor(carouselStrip.offsetWidth / (itemWidth + gap));
        
        // מאזיני לחיצות על כפתורי ניווט
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentIndex > 0) {
                    currentIndex--;
                    updateCarousel();
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentIndex < items.length - visibleItems) {
                    currentIndex++;
                    updateCarousel();
                }
            });
        }
        
        // מאזיני לחיצה על נקודות ניווט
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentIndex = index;
                updateCarousel();
            });
        });
        
        // פונקציה לעדכון מצב הקרוסלה
        function updateCarousel() {
            const offset = -currentIndex * (itemWidth + gap);
            carouselStrip.style.transform = `translateX(${offset}px)`;
            
            // עדכון מצב פריט פעיל
            items.forEach((item, index) => {
                if (index === currentIndex) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
            
            // עדכון מצב נקודות ניווט
            dots.forEach((dot, index) => {
                if (index === currentIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
            
            // עדכון מצב כפתורי ניווט
            if (prevBtn) {
                prevBtn.style.opacity = currentIndex > 0 ? '1' : '0.5';
            }
            if (nextBtn) {
                nextBtn.style.opacity = currentIndex < items.length - visibleItems ? '1' : '0.5';
            }
        }
        
        // הוספת תמיכה בהחלקה על מסך מגע
        let touchStartX = 0;
        let touchEndX = 0;
        
        carouselStrip.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        carouselStrip.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
        
        function handleSwipe() {
            const minSwipeDistance = 50;
            const direction = document.dir === 'rtl' ? -1 : 1;
            
            if ((touchEndX - touchStartX) * direction > minSwipeDistance) {
                if (currentIndex > 0) {
                    currentIndex--;
                    updateCarousel();
                }
            } else if ((touchStartX - touchEndX) * direction > minSwipeDistance) {
                if (currentIndex < items.length - visibleItems) {
                    currentIndex++;
                    updateCarousel();
                }
            }
        }
        
        // טעינה מראש של תמונות עבור וידאו
        items.forEach(item => {
            const videoContainer = item.querySelector('.event-video-container');
            if (videoContainer) {
                const video = videoContainer.querySelector('video');
                if (video) {
                    video.preload = 'metadata';
                    
                    if (video.poster) {
                        const img = new Image();
                        img.src = video.poster;
                    }
                }
            }
        });
        
        // עדכון ראשוני של הקרוסלה
        updateCarousel();
        
        // טיפול בשינוי גודל החלון
        window.addEventListener('resize', () => {
            const newItemWidth = items[0].offsetWidth;
            const newVisibleItems = Math.floor(carouselStrip.offsetWidth / (newItemWidth + gap));
            
            if (currentIndex > items.length - newVisibleItems) {
                currentIndex = Math.max(0, items.length - newVisibleItems);
            }
            
            updateCarousel();
        });
    });
}

// אתחול לשוניות קטגוריה
function initCategoryTabs() {
    const tabs = document.querySelectorAll('.category-tab');
    const contents = document.querySelectorAll('.category-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.getAttribute('data-category');
            
            // הסרת מצב פעיל מכל הלשוניות
            tabs.forEach(t => t.classList.remove('active'));
            
            // הסרת מצב פעיל מכל התוכן
            contents.forEach(c => c.classList.remove('active'));
            
            // הוספת מצב פעיל ללשונית הנוכחית ולתוכן המתאים
            tab.classList.add('active');
            const targetContent = document.getElementById(category);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            // איתחול קרוסלת הוידאו בקטגוריה הנוכחית
            setTimeout(() => {
                initVideoCarousels();
            }, 50);
        });
    });
}

// אתחול מודל וידאו
function initVideoModals() {
    const modal = document.getElementById('videoModal');
    const videoContainer = document.getElementById('videoContainer');
    const closeButton = document.querySelector('.close-modal');
    
    if (!modal || !videoContainer) return;
    
    // סגירת המודל באמצעות כפתור סגירה
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            closeVideoModal();
        });
    }
    
    // סגירת המודל בלחיצה מחוץ לתוכן
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeVideoModal();
        }
    });
    
    // סגירת המודל בלחיצה על מקש Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeVideoModal();
        }
    });
    
    // פתיחת מודל עם סרטון יוטיוב
    document.querySelectorAll('[data-video-id]').forEach(card => {
        card.addEventListener('click', () => {
            const videoId = card.getAttribute('data-video-id');
            
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            
            videoContainer.innerHTML = '';
            videoContainer.appendChild(iframe);
            
            openVideoModal();
        });
    });
    
    // פתיחת מודל עם סרטון מקומי
    document.querySelectorAll('[data-video-src]').forEach(card => {
        card.addEventListener('click', () => {
            const videoSrc = card.getAttribute('data-video-src');
            
            const video = document.createElement('video');
            video.src = videoSrc;
            video.controls = true;
            video.autoplay = true;
            video.style.width = '100%';
            video.style.height = 'auto';
            video.style.maxHeight = '80vh';
            
            videoContainer.innerHTML = '';
            videoContainer.appendChild(video);
            
            openVideoModal();
        });
    });
    
    // פונקציה לפתיחת המודל
    function openVideoModal() {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    // פונקציה לסגירת המודל
    function closeVideoModal() {
        modal.style.display = 'none';
        videoContainer.innerHTML = '';
        document.body.style.overflow = '';
    }
}

// אתחול כפתור חזרה לראש העמוד
function initBackToTopButton() {
    const backToTopBtn = document.getElementById('backToTop');
    
    if (!backToTopBtn) return;
    
    // הצגת/הסתרת הכפתור בהתאם למיקום הגלילה
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    // מעבר חלק לראש העמוד בלחיצה על הכפתור
    backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// אתחול גלריה מודרנית עם פילטרים ולייטבוקס
function initGallery() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightboxModal = document.querySelector('.lightbox-modal');
    const lightboxImage = document.querySelector('.lightbox-image');
    const lightboxTitle = document.querySelector('.lightbox-title');
    const lightboxDesc = document.querySelector('.lightbox-desc');
    const closeLightbox = document.querySelector('.close-lightbox');
    const lightboxNext = document.querySelector('.lightbox-next');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    
    // בדיקה שיש אלמנטים של גלריה
    if (!galleryItems.length || !lightboxModal) return;
    
    let currentImageIndex = 0;
    let filteredItems = Array.from(galleryItems);
    
    // פונקציית פילטור הפריטים
    function filterItems(filter) {
        filteredItems = []; // איפוס המערך
        
        galleryItems.forEach((item, index) => {
            const category = item.getAttribute('data-category');
            
            if (filter === 'all' || category === filter) {
                item.style.display = 'block';
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                
                // אנימציית הופעה
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, 50 * filteredItems.length);
                
                filteredItems.push(item);
            } else {
                // אנימציית היעלמות
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    }
    
    // הוספת אירועי לחיצה לכפתורי הפילטר
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // הסרת מחלקת אקטיב מכל הכפתורים
            filterBtns.forEach(b => b.classList.remove('active'));
            
            // הוספת מחלקת אקטיב לכפתור הנוכחי
            this.classList.add('active');
            
            // פילטור הפריטים לפי הקטגוריה
            const filter = this.getAttribute('data-filter');
            filterItems(filter);
        });
    });
    
    // פונקציה לפתיחת הלייטבוקס
    function openLightbox(index) {
        if (!filteredItems[index]) return;
        
        currentImageIndex = index;
        const currentItem = filteredItems[index];
        
        // עדכון תוכן הלייטבוקס
        const img = currentItem.querySelector('img');
        const titleElement = currentItem.querySelector('.gallery-info h3');
        const descElement = currentItem.querySelector('.gallery-info p');
        
        if (img && lightboxImage) {
            lightboxImage.src = img.src;
            lightboxImage.alt = img.alt;
        }
        
        if (titleElement && lightboxTitle) {
            lightboxTitle.textContent = titleElement.textContent;
        }
        
        if (descElement && lightboxDesc) {
            lightboxDesc.textContent = descElement.textContent;
        }
        
        // הצגת הלייטבוקס
        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // הוספת אירועי לחיצה לפריטי הגלריה
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            // מציאת האינדקס בתוך המערך המסונן
            const filteredIndex = filteredItems.indexOf(item);
            if (filteredIndex !== -1) {
                openLightbox(filteredIndex);
            }
        });
    });
    
    // סגירת הלייטבוקס
    if (closeLightbox) {
        closeLightbox.addEventListener('click', () => {
            lightboxModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // ניווט בלייטבוקס - הבא
    if (lightboxNext) {
        lightboxNext.addEventListener('click', () => {
            currentImageIndex = (currentImageIndex + 1) % filteredItems.length;
            openLightbox(currentImageIndex);
        });
    }
    
    // ניווט בלייטבוקס - הקודם
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', () => {
            currentImageIndex = (currentImageIndex - 1 + filteredItems.length) % filteredItems.length;
            openLightbox(currentImageIndex);
        });
    }
    
    // סגירת הלייטבוקס בלחיצה מחוץ לתמונה
    lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) {
            lightboxModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // סגירת הלייטבוקס בלחיצה על Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
            lightboxModal.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        // ניווט בין תמונות עם חצים
        if (lightboxModal.classList.contains('active')) {
            if (e.key === 'ArrowRight') {
                currentImageIndex = (currentImageIndex + 1) % filteredItems.length;
                openLightbox(currentImageIndex);
            } else if (e.key === 'ArrowLeft') {
                currentImageIndex = (currentImageIndex - 1 + filteredItems.length) % filteredItems.length;
                openLightbox(currentImageIndex);
            }
        }
    });
    
    // תמיכה במגע במובייל
    let initialX = null;
    
    lightboxModal.addEventListener('touchstart', (e) => {
        initialX = e.touches[0].clientX;
    }, {passive: true});
    
    lightboxModal.addEventListener('touchmove', (e) => {
        if (initialX === null) return;
        
        const currentX = e.touches[0].clientX;
        const diffX = initialX - currentX;
        
        // החלקה שמאלה (הבא)
        if (diffX > 50) {
            currentImageIndex = (currentImageIndex + 1) % filteredItems.length;
            openLightbox(currentImageIndex);
            initialX = null;
        }
        // החלקה ימינה (הקודם)
        else if (diffX < -50) {
            currentImageIndex = (currentImageIndex - 1 + filteredItems.length) % filteredItems.length;
            openLightbox(currentImageIndex);
            initialX = null;
        }
    }, {passive: true});
    
    lightboxModal.addEventListener('touchend', () => {
        initialX = null;
    }, {passive: true});
    
    // הפעלת פילטר ברירת מחדל (הכל)
    if (filterBtns.length > 0) {
        filterBtns[0].classList.add('active');
        filterItems('all');
    }
}

// אתחול טופס יצירת קשר
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    const successModal = document.getElementById('successModal');
    const closeBtn = document.getElementById('closeSuccessModal');
    
    if (!contactForm) return;
    
    // מאזין לשליחת הטופס
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // הצגת אנימציית טעינה בכפתור
        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="loading-spinner"></span> שולח...';
        
        // דימוי שליחת נתונים לשרת
        setTimeout(function() {
            // שליחה מוצלחת - ריקון הטופס והצגת המודאל
            contactForm.reset();
            
            // החזרת הכפתור למצב הרגיל
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            
            // הצגת מודאל ההצלחה
            showSuccessModal();
        }, 1500);
    });
    
    // פונקציה להצגת המודאל
    function showSuccessModal() {
        if (!successModal) return;
        
        successModal.style.display = 'flex';
        setTimeout(function() {
            successModal.classList.add('show');
        }, 10);
    }
    
    // סגירת המודאל בלחיצה על כפתור הסגירה
    if (closeBtn) {
        closeBtn.addEventListener('click', closeSuccessModal);
    }
    
    // פונקציה לסגירת המודאל
    function closeSuccessModal() {
        if (!successModal) return;
        
        successModal.classList.remove('show');
        setTimeout(function() {
            successModal.style.display = 'none';
        }, 300);
    }
    
    // סגירת המודאל בלחיצה מחוץ לתוכן המודאל
    window.addEventListener('click', function(event) {
        if (event.target === successModal) {
            closeSuccessModal();
        }
    });
}

// אתחול מפה
function initMap() {
    const mapContainer = document.querySelector('.embedded-map');
    if (mapContainer) {
        mapContainer.addEventListener('click', function() {
            const googleMapsUrl = 'https://www.google.com/maps/search/?api=1&query=אלי+כהן+19+אשקלון';
            window.open(googleMapsUrl, '_blank');
        });
    }
}

// בדיקת תמיכה בשפה עברית וכיוון RTL
function checkRTLSupport() {
    const isRTLLanguage = /^(he|ar|fa|ur)\b/.test(navigator.language);
    
    if (isRTLLanguage && document.dir !== 'rtl') {
        document.dir = 'rtl';
    }
}

// אתחול גלילה חלקה של קישורים פנימיים בעמוד
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// אתחול חץ הגלילה
function initScrollArrow() {
    const scrollArrow = document.querySelector('.scroll-arrow');
    
    if (scrollArrow) {
        // הוספת מאזין אירוע ללחיצה על החץ
        scrollArrow.addEventListener('click', function() {
            scrollArrow.classList.add('hidden');
            
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
        
        // הסתרת החץ בעת גלילה מטה
        window.addEventListener('scroll', function() {
            if (window.scrollY > 200) {
                scrollArrow.classList.add('hidden');
            } else {
                scrollArrow.classList.remove('hidden');
            }
        });
    }
}