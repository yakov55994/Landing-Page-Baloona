// categories-data.js - נתונים של כל הקטגוריות והתמונות

const categoriesData = {
    // רשימת הקטגוריות והכותרות שלהן
    categories: [  ],

    // נתונים של התמונות לכל קטגוריה
    images: {
        'bar-mitzvah': [
            {
                id: 1,
                title: '',
                imageSrc: '',
                alt: '',
                description: ''
            },
            {
                id: 2,
                title: '',
                imageSrc: '',
                alt: '',
                description: ''
            },
            {
                id: 3,
                title: '',
                imageSrc: '',
                alt: '',
                description: ''
            },
            {
                id: 4,
                title: '',
                imageSrc: '',
                alt: '',
                description: ''
            },
            {
                id: 5,
                title: '',
                imageSrc: '',
                alt: '',
                description: ''
            },
            {
                id: 6,
                title: '',
                imageSrc: '',
                alt: '',
                description: ''
            }
        ],

        'brit-milah': [
            {
                id: 1,
                title: '',
                imageSrc: '',
                alt: '',
                description: ''
            },
            {
                id: 2,
                title: '',
                imageSrc: '',
                alt: '',
                description: ''
            },
            {
                id: 3,
                title: '',
                imageSrc: '',
                alt: '',
                description: ''
            },
            {
                id: 4,
                title: '',
                imageSrc: '',
                alt: '',
                description: ''
            },
            {
                id: 5,
                title: '',
                imageSrc: '',
                alt: '',
                description: ''
            },
            {
                id: 6,
                title: '',
                imageSrc: '',
                alt: '',
                description: ''
            }
        ],

        'birthday': [
            {
                id: 1,
                title: '',
                imageSrc: '',
                alt: '',
                description: ''
            },
            {
                id: 2,
                title: '',
                imageSrc: '',
                alt: '',
                description: ''
            },
            {
                id: 3,
                title: '',
                imageSrc: '',
                alt: '',
                description: ''
            },
            {
                id: 4,
                title: '',
                imageSrc: '',
                alt: '',
                description: ''
            },
            {
                id: 5,
                title: '',
                imageSrc: '',
                alt: '',
                description: ''
            },
            {
                id: 6,
                title: '',
                imageSrc: '',
                alt: '',
                description: ''
            }
        ],

        'Marriage-proposal': [
            {
                id: 1,
                title: '',
                imageSrc: '',
                alt: '',
                description: ''
            },
            {
                id: 2,
                title: '',
                imageSrc: '',
                alt: '',
                description: ''
            },
            {
                id: 3,
                title: '',
                imageSrc: '',
                alt: '',
                description: ''
            },
            {
                id: 4,
                title: '',
                imageSrc: '',
                alt: '',
                description: ''
            },
            {
                id: 5,
                title: '',
                imageSrc: '',
                alt: '',
                description: ''
            },
            {
                id: 6,
                title: '',
                imageSrc: '',
                alt: '',
                description: ''
            }
        ]
    },

    // נתונים של תמונות ההמלצות
    // recommendations: [
    //     {
    //         id: 1,
    //         imageSrc: '/images/Recommendations/1.png',
    //         alt: 'המלצה 1',
    //         title: 'המלצה 1',
    //         description: '',
    //         category: 'performances'
    //     },
    //     {
    //         id: 2,
    //         imageSrc: '/images/Recommendations/2.jpg',
    //         alt: 'המלצה 2',
    //         title: 'המלצה 2',
    //         description: '',
    //         category: 'studio'
    //     },
    //     {
    //         id: 3,
    //         imageSrc: '/images/Recommendations/3.jpg',
    //         alt: 'המלצה 3',
    //         title: 'המלצה 3',
    //         description: '',
    //         category: 'events'
    //     },
    //     {
    //         id: 4,
    //         imageSrc: '/images/Recommendations/4.jpg',
    //         alt: 'המלצה 4',
    //         title: 'המלצה 4',
    //         description: '',
    //         category: 'performances'
    //     },
    //     {
    //         id: 5,
    //         imageSrc: '/images/Recommendations/5.jpg',
    //         alt: 'המלצה 5',
    //         title: 'המלצה 5',
    //         description: '',
    //         category: 'studio'
    //     }
    // ],

    // נתונים של הלהיטים - כעת תמונות
    hits: [
        {
            id: 1,
            title: '',
            description: '',
            imageSrc: '',
            alt: ''
        },
        {
            id: 2,
            title: '',
            description: '',
            imageSrc: '',
            alt: ''
        },
        {
            id: 3,
            title: '',
            description: '',
            imageSrc: '',
            alt: ''
        },
        {
            id: 4,
            title: '',
            description: '',
            imageSrc: '',
            alt: ''
        },
        {
            id: 5,
            title: '',
            description: '',
            imageSrc: '',
            alt: ''
        }     
    ]
};

// פונקציות עזר לקבלת נתונים
const CategoriesManager = {
    // קבלת כל הקטגוריות
    getAllCategories: () => categoriesData.categories,
    
    // קבלת תמונות לפי קטגוריה
    getImagesByCategory: (categoryId) => categoriesData.images[categoryId] || [],
    
    // קבלת כל ההמלצות
    getAllRecommendations: () => categoriesData.recommendations,
    
    // קבלת כל הלהיטים
    getAllHits: () => categoriesData.hits,
    
    // קבלת המלצות לפי קטגוריה
    getRecommendationsByCategory: (category) => 
        categoriesData.recommendations.filter(item => item.category === category),
    
    // בניית HTML לתמונה בודדת בקטגוריה
    buildCategoryImageHTML: (image) => {
        return `
            <div class="gallery-item" data-image-id="${image.id}">
                <div class="gallery-item-inner">
                    <img src="${image.imageSrc}" alt="${image.alt}">
                    <div class="gallery-overlay">
                        <div class="gallery-info">
                        </div>
                        <div class="gallery-icon">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#ffffff"/>
                            </svg>
                        </div>
                    </div>
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
    
    // בניית HTML ללהיט בודד - כעת תמונה
    buildHitHTML: (hit) => {
        return `
            <div class="gallery-item" data-hit-id="${hit.id}">
                <div class="gallery-item-inner">
                    <img src="${hit.imageSrc}" alt="${hit.alt}">
                    <div class="gallery-overlay">
                        <div class="gallery-info">
                        </div>
                        <div class="gallery-icon">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#ffffff"/>
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