// categories-data.js - נתונים של כל הקטגוריות והסרטונים

const categoriesData = {
    // רשימת הקטגוריות והכותרות שלהן
    categories: [
        { id: 'bar-mitzvah', name: 'עלייה לתורה' },
        { id: 'brit-milah', name: 'ברית מילה' },
        { id: 'hilula', name: 'הילולא' },
        { id: 'taverna', name: 'טברנה' }
    ],

    // נתונים של הסרטונים לכל קטגוריה
    videos: {
        'bar-mitzvah': [
            {
                id: 1,
                title: 'שיר הקדשה לחתן',
                videoSrc: 'https://res.cloudinary.com/dbbivwbbt/video/upload/v1746045206/LandingPage-Uriel-Cohen/zlwfbwiwpy2yiybdpfqc.mp4',
                ariaLabel: 'שיר הקדשה לחתן',
                muted: true
            },
            {
                id: 2,
                title: 'ברכה לחתן',
                videoSrc: 'https://res.cloudinary.com/dbbivwbbt/video/upload/v1746045203/LandingPage-Uriel-Cohen/cocka0uz8ucr4mad0d0b.mp4',
                ariaLabel: 'ברכה לחתן',
                muted: false
            },
            {
                id: 3,
                title: 'תקציר טקס',
                videoSrc: 'https://res.cloudinary.com/dbbivwbbt/video/upload/v1746045206/LandingPage-Uriel-Cohen/odulnnjnkwca825wzttq.mp4',
                ariaLabel: 'תקציר טקס',
                muted: true
            },
            {
                id: 4,
                title: 'ישמח חתני',
                videoSrc: 'https://res.cloudinary.com/dbbivwbbt/video/upload/v1746045204/LandingPage-Uriel-Cohen/enahlflmet7vb2e8pxqo.mp4',
                ariaLabel: 'ישמח חתני',
                muted: true
            },
            {
                id: 5,
                title: 'לאל ברוך',
                videoSrc: 'https://res.cloudinary.com/dbbivwbbt/video/upload/v1746045216/LandingPage-Uriel-Cohen/rt0dcfthes4vmipobspa.mp4',
                ariaLabel: 'לאל ברוך',
                muted: true
            },
            {
                id: 6,
                title: 'קבלת עול מלכות שמיים',
                videoSrc: 'https://res.cloudinary.com/dbbivwbbt/video/upload/v1746045917/LandingPage-Uriel-Cohen/yc8qot2n3qzod7yol3ka.mp4',
                ariaLabel: 'קבלת עול מלכות שמיים',
                muted: true
            }
        ],

        'brit-milah': [
            {
                id: 1,
                title: 'ברכת הברית',
                videoSrc: 'https://res.cloudinary.com/dbbivwbbt/video/upload/v1746045206/LandingPage-Uriel-Cohen/zlwfbwiwpy2yiybdpfqc.mp4',
                ariaLabel: 'ברכת הברית',
                muted: true
            },
            {
                id: 2,
                title: 'שירי ברית מילה',
                videoSrc: 'https://res.cloudinary.com/dbbivwbbt/video/upload/v1746045203/LandingPage-Uriel-Cohen/cocka0uz8ucr4mad0d0b.mp4',
                ariaLabel: 'שירי ברית מילה',
                muted: false
            },
            {
                id: 3,
                title: 'חגיגת הברית',
                videoSrc: 'https://res.cloudinary.com/dbbivwbbt/video/upload/v1746045206/LandingPage-Uriel-Cohen/odulnnjnkwca825wzttq.mp4',
                ariaLabel: 'חגיגת הברית',
                muted: true
            }
        ],

        'hilula': [
            {
                id: 1,
                title: 'שירי הילולא',
                videoSrc: 'https://res.cloudinary.com/dbbivwbbt/video/upload/v1746045206/LandingPage-Uriel-Cohen/zlwfbwiwpy2yiybdpfqc.mp4',
                ariaLabel: 'שירי הילולא',
                muted: true
            },
            {
                id: 2,
                title: 'פיוטים מיוחדים',
                videoSrc: 'https://res.cloudinary.com/dbbivwbbt/video/upload/v1746045203/LandingPage-Uriel-Cohen/cocka0uz8ucr4mad0d0b.mp4',
                ariaLabel: 'פיוטים מיוחדים',
                muted: false
            },
            {
                id: 3,
                title: 'אווירת הילולא',
                videoSrc: 'https://res.cloudinary.com/dbbivwbbt/video/upload/v1746045216/LandingPage-Uriel-Cohen/rt0dcfthes4vmipobspa.mp4',
                ariaLabel: 'אווירת הילולא',
                muted: true
            }
        ],

        'taverna': [
            {
                id: 1,
                title: 'ערב טברנה',
                videoSrc: 'https://res.cloudinary.com/dbbivwbbt/video/upload/v1746045206/LandingPage-Uriel-Cohen/zlwfbwiwpy2yiybdpfqc.mp4',
                ariaLabel: 'ערב טברנה',
                muted: true
            },
            {
                id: 2,
                title: 'שירי טברנה מזרחית',
                videoSrc: 'https://res.cloudinary.com/dbbivwbbt/video/upload/v1746045203/LandingPage-Uriel-Cohen/cocka0uz8ucr4mad0d0b.mp4',
                ariaLabel: 'שירי טברנה מזרחית',
                muted: false
            },
            {
                id: 3,
                title: 'אווירה אותנטית',
                videoSrc: 'https://res.cloudinary.com/dbbivwbbt/video/upload/v1746045204/LandingPage-Uriel-Cohen/enahlflmet7vb2e8pxqo.mp4',
                ariaLabel: 'אווירה אותנטית',
                muted: true
            }
        ]
    },

    // נתונים של תמונות ההמלצות
    recommendations: [
        {
            id: 1,
            imageSrc: '/images/Recommendations/1.png',
            alt: 'המלצה 1',
            category: 'performances'
        },
        {
            id: 2,
            imageSrc: '/images/Recommendations/2.jpg',
            alt: 'המלצה 2',
            category: 'studio'
        },
        {
            id: 3,
            imageSrc: '/images/Recommendations/3.jpg',
            alt: 'המלצה 3',
            category: 'events'
        },
        {
            id: 4,
            imageSrc: '/images/Recommendations/4.jpg',
            alt: 'המלצה 4',
            category: 'performances'
        },
        {
            id: 5,
            imageSrc: '/images/Recommendations/5.jpg',
            alt: 'המלצה 5',
            category: 'studio'
        }
    ],

    // נתונים של הלהיטים
    hits: [
        {
            id: 1,
            title: 'מחרוזת זעבור',
            description: 'פורסם לפני שנתיים • 44K צפיות',
            imageSrc: '/images/Hits/1.png',
            videoId: 'Tyc-q6IKvew',
            alt: 'מחרוזת זעבור'
        },
        {
            id: 2,
            title: 'מחרוזת סליחות',
            description: 'פורסם לפני שנה • 132K צפיות',
            imageSrc: '/images/Hits/2.png',
            videoId: 'FcnsNhwuyus',
            alt: 'מחרוזת סליחות'
        },
        {
            id: 3,
            title: 'מחרוזת הייא הייא',
            description: 'פורסם לפני שנתיים • 2.5K צפיות',
            imageSrc: '/images/Hits/3.png',
            videoId: 'hmPgKXLScJM',
            alt: 'מחרוזת הייא הייא'
        },
        {
            id: 4,
            title: 'משמחים חתן כלה',
            description: 'פורסם לפני שנתיים • 2.5K צפיות',
            imageSrc: '/images/Hits/4.png',
            videoId: 'iWpaLIBeLMc',
            alt: 'משמחים חתן כלה'
        }
    ]
};

// פונקציות עזר לקבלת נתונים
const CategoriesManager = {
    // קבלת כל הקטגוריות
    getAllCategories: () => categoriesData.categories,
    
    // קבלת סרטונים לפי קטגוריה
    getVideosByCategory: (categoryId) => categoriesData.videos[categoryId] || [],
    
    // קבלת כל ההמלצות
    getAllRecommendations: () => categoriesData.recommendations,
    
    // קבלת כל הלהיטים
    getAllHits: () => categoriesData.hits,
    
    // קבלת המלצות לפי קטגוריה
    getRecommendationsByCategory: (category) => 
        categoriesData.recommendations.filter(item => item.category === category),
    
    // בניית HTML לסרטון בודד
    buildVideoHTML: (video) => {
        return `
            <div class="video-carousel-item" data-video-src="${video.videoSrc}">
                <div class="event-video-container">
                    <video aria-label="${video.ariaLabel}" class="event-video" preload="metadata" 
                           poster="${video.videoSrc}" ${video.muted ? 'muted' : ''} playsinline>
                        <source src="${video.videoSrc}" type="video/mp4">
                    </video>
                    <div class="event-overlay">
                        <div class="event-play-button">
                            <svg class="event-play-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 5V19L19 12L8 5Z" fill="#ffffff"/>
                            </svg>
                        </div>
                    </div>
                </div>
                <div class="event-video-info">
                    <h3 class="event-title">${video.title}</h3>
                </div>
            </div>
        `;
    },
    
    // בניית HTML להמלצה בודדת
    buildRecommendationHTML: (recommendation) => {
        return `
            <div class="gallery-item" data-category="${recommendation.category}">
                <div class="gallery-item-inner">
                    <img src="${recommendation.imageSrc}" alt="${recommendation.alt}">
                    <div class="gallery-overlay">
                        <div class="gallery-info">
                            <p></p>
                        </div>
                        <div class="gallery-icon">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 3h4a2 2 0 0 1 2 2v4M9 21H5a2 2 0 0 1-2-2v-4m0-8V5a2 2 0 0 1 2-2h4m8 18h-4a2 2 0 0 1-2-2v-4M9 3v18M3 9h18M21 15v6M3 15v6"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // בניית HTML ללהיט בודד
    buildHitHTML: (hit) => {
        return `
            <div class="gallery-item video-item" data-video-id="${hit.videoId}" onclick="openYouTubeModal(this)">
                <div class="gallery-item-inner">
                    <img src="${hit.imageSrc}" alt="${hit.alt}">
                    <div class="gallery-overlay">
                        <div class="gallery-info">
                            <h3>${hit.title}</h3>
                            <p>${hit.description}</p>
                        </div>
                        <div class="play-button">
                            <svg class="play-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 5V19L19 12L8 5Z" fill="#ffffff"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

// אם זה סביבת Node.js, ייצא את הנתונים
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { categoriesData, CategoriesManager };
}