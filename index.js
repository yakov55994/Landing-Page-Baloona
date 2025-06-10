document.addEventListener('DOMContentLoaded', function() {
    // הגדרות לקרוסלת וידאו
    initVideoCarousels();
    
    // אתחול לשוניות קטגוריה
    initCategoryTabs();
    
    // הפעלת מודל וידאו
    initVideoModals();
    
    // כפתור חזרה לראש העמוד
    initBackToTopButton();
});

// אתחול קרוסלות וידאו
function initVideoCarousels() {
    // חפש את כל הקרוסלות באתר
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
        const gap = 20; // המרווח בין הפריטים
        const visibleItems = Math.floor(carouselStrip.offsetWidth / (itemWidth + gap));
        
        // מאזיני לחיצות על כפתורי ניווט
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        });
        
        nextBtn.addEventListener('click', () => {
            if (currentIndex < items.length - visibleItems) {
                currentIndex++;
                updateCarousel();
            }
        });
        
        // מאזיני לחיצה על נקודות ניווט
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentIndex = index;
                updateCarousel();
            });
        });
        
        // פונקציה לעדכון מצב הקרוסלה
        function updateCarousel() {
            // חישוב הזזה - תלוי בכיוון האתר (RTL)
            const offset = -currentIndex * (itemWidth + gap); // המרווח בין פריטים
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
            prevBtn.style.opacity = currentIndex > 0 ? '1' : '0.5';
            nextBtn.style.opacity = currentIndex < items.length - visibleItems ? '1' : '0.5';
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
                // החלקה לצד ימין במצב RTL או שמאל במצב LTR - הקודם
                if (currentIndex > 0) {
                    currentIndex--;
                    updateCarousel();
                }
            } else if ((touchStartX - touchEndX) * direction > minSwipeDistance) {
                // החלקה לצד שמאל במצב RTL או ימין במצב LTR - הבא
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
                    // הגדרת טעינה לזית לסרט כדי לשפר ביצועים
                    video.preload = 'metadata';
                    
                    // טעינת תמונת קדימון אם קיימת
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
            // עדכון רוחב פריט בעת שינוי גודל חלון
            const newItemWidth = items[0].offsetWidth;
            const newVisibleItems = Math.floor(carouselStrip.offsetWidth / (newItemWidth + gap));
            
            // הגבלת האינדקס הנוכחי
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
            document.getElementById(category).classList.add('active');
            
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
            
            // יצירת iframe של יוטיוב
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            
            videoContainer.innerHTML = '';
            videoContainer.appendChild(iframe);
            
            openVideoModal();
        });
    });
    
    // פתיחת מודל עם סרטון מקומי
    document.querySelectorAll('[data-video-src]').forEach(card => {
        card.addEventListener('click', () => {
            const videoSrc = card.getAttribute('data-video-src');
            
            // יצירת אלמנט וידאו
            const video = document.createElement('video');
            video.src = videoSrc;
            video.controls = true;
            video.autoplay = true;
            
            videoContainer.innerHTML = '';
            videoContainer.appendChild(video);
            
            openVideoModal();
        });
    });
    
    // פונקציה לפתיחת המודל
    function openVideoModal() {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // מניעת גלילה בעמוד הרקע
    }
    
    // פונקציה לסגירת המודל
    function closeVideoModal() {
        modal.style.display = 'none';
        videoContainer.innerHTML = ''; // ניקוי תוכן הוידאו
        document.body.style.overflow = ''; // אפשור גלילה בעמוד
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

// בדיקת תמיכה בשפה עברית וכיוון RTL
function checkRTLSupport() {
    // בדיקה האם השפה בדפדפן היא עברית או ערבית
    const isRTLLanguage = /^(he|ar|fa|ur)\b/.test(navigator.language);
    
    // וידוא שהכיוון הוא RTL עבור שפות אלו
    if (isRTLLanguage && document.dir !== 'rtl') {
        document.dir = 'rtl';
    }
}

// אתחול צף של קישורים פנימיים בעמוד
function initSmoothScrolling() {
    // בחירת כל הקישורים שמובילים לעוגנים בעמוד הנוכחי
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // הפחתה של גובה כותרת אם יש
                    behavior: 'smooth'
                });
            }
        });
    });
}

// הוספת קוד JavaScript להסתרת החץ לאחר לחיצה
document.addEventListener('DOMContentLoaded', function() {
    // מציאת החץ
    const scrollArrow = document.querySelector('.scroll-arrow');
    
    if (scrollArrow) {
        // הוספת מאזין אירוע ללחיצה על החץ
        scrollArrow.addEventListener('click', function() {
            // הסתרת החץ עם מחלקת CSS
            scrollArrow.classList.add('hidden');
            
            // גלילה לאזור האודות
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
        
        // גם להסתיר את החץ בעת גלילה מטה
        window.addEventListener('scroll', function() {
            if (window.scrollY > 200) { // אם גללנו למטה יותר מ-200 פיקסלים
                scrollArrow.classList.add('hidden');
            } else {
                scrollArrow.classList.remove('hidden');
            }
        });
    }
});
// הפעלת פונקציות נוספות
checkRTLSupport();
initSmoothScrolling();



//Gallery

// JavaScript לגלריה מודרנית עם פילטרים ולייטבוקס
document.addEventListener('DOMContentLoaded', function() {
    // אתחול הגלריה והפילטרים
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightboxModal = document.querySelector('.lightbox-modal');
    const lightboxImage = document.querySelector('.lightbox-image');
    const lightboxTitle = document.querySelector('.lightbox-title');
    const lightboxDesc = document.querySelector('.lightbox-desc');
    const closeLightbox = document.querySelector('.close-lightbox');
    const lightboxNext = document.querySelector('.lightbox-next');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    
    let currentImageIndex = 0;
    let filteredItems = [...galleryItems];
    
    // פונקציית פילטור הפריטים
    function filterItems(filter) {
        galleryItems.forEach(item => {
            const category = item.getAttribute('data-category');
            
            if (filter === 'all' || category === filter) {
                item.style.display = 'block';
                // אנימציית הופעה
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, 50);
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
    // filterBtns.forEach(btn => {
    //     btn.addEventListener('click', function() {
    //         // הסרת מחלקת אקטיב מכל הכפתורים
    //         filterBtns.forEach(btn => btn.classList.remove('active'));
            
    //         // הוספת מחלקת אקטיב לכפתור הנוכחי
    //         this.classList.add('active');
            
    //         // פילטור הפריטים לפי הקטגוריה
    //         const filter = this.getAttribute('data-filter');
    //         filteredItems = [];
    //         filterItems(filter);
    //     });
    // });
    
    // פונקציה לפתיחת הלייטבוקס
    function openLightbox(index) {
        currentImageIndex = index;
        const currentItem = filteredItems[index];
        
        // עדכון תוכן הלייטבוקס
        const img = currentItem.querySelector('img');
        const title = currentItem.querySelector('.gallery-info h3').textContent;
        const desc = currentItem.querySelector('.gallery-info p').textContent;
        
        lightboxImage.src = img.src;
        lightboxImage.alt = img.alt;
        lightboxTitle.textContent = title;
        lightboxDesc.textContent = desc;
        
        // הצגת הלייטבוקס
        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // מניעת גלילה ברקע
    }
    
    // הוספת אירועי לחיצה לפריטי הגלריה
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            openLightbox(index);
        });
    });
    
    // סגירת הלייטבוקס
    closeLightbox.addEventListener('click', () => {
        lightboxModal.classList.remove('active');
        document.body.style.overflow = ''; // שחרור גלילה ברקע
    });
    
    // ניווט בלייטבוקס - הבא
    lightboxNext.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex + 1) % filteredItems.length;
        openLightbox(currentImageIndex);
    });
    
    // ניווט בלייטבוקס - הקודם
    lightboxPrev.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex - 1 + filteredItems.length) % filteredItems.length;
        openLightbox(currentImageIndex);
    });
    
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
    
    // מניעת ברירת מחדל על אירועי טאץ' בלייטבוקס
    lightboxModal.addEventListener('touchstart', (e) => {
        initialX = e.touches[0].clientX;
    }, {passive: true});
    
    // אפקט החלקה במובייל
    let initialX;
    lightboxModal.addEventListener('touchmove', (e) => {
        if (initialX === null) {
            return;
        }
        
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
    
    // אפס את ערך ההתחלה בסיום המגע
    lightboxModal.addEventListener('touchend', () => {
        initialX = null;
    }, {passive: true});

    filteredItems = [...galleryItems];
    
    // הפעלת פילטר ברירת מחדל (הכל)
});

function openYouTubeModal(element) {
    const videoId = element.dataset.videoId;
    const videoContainer = document.getElementById('videoContainer');
    const modal = document.getElementById('videoModal');
  
    videoContainer.innerHTML = `
      <iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}?autoplay=1"
        frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
    `;
  
    modal.style.display = "block";
  
    document.querySelector(".close-modal").onclick = () => {
      modal.style.display = "none";
      videoContainer.innerHTML = "";
    };
  }
  

  // הקוד להפעלת מודאל ההצלחה
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    const successModal = document.getElementById('successModal');
    const closeBtn = document.getElementById('closeSuccessModal');
    
    // מאזין לשליחת הטופס
    if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
        e.preventDefault(); // מניעת התנהגות ברירת המחדל של הטופס
        
        // הצגת אנימציית טעינה בכפתור
        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="loading-spinner"></span> שולח...';
        
        // דימוי שליחת נתונים לשרת (במציאות היית משתמש ב-fetch או AJAX)
        setTimeout(function() {
          // שליחה מוצלחת - ריקון הטופס והצגת המודאל
          contactForm.reset();
          
          // החזרת הכפתור למצב הרגיל
          submitButton.disabled = false;
          submitButton.textContent = originalText;
          
          // הצגת מודאל ההצלחה
          showSuccessModal();
        }, 1500); // דימוי של השהיה ברשת - 1.5 שניות
      });
    }
    
    // פונקציה להצגת המודאל
    function showSuccessModal() {
      if (!successModal) return;
      
      successModal.style.display = 'flex';
      // טריק קטן כדי לגרום לאנימציה להופיע אחרי שהמודאל מוצג
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
      }, 300); // המתנה לאנימציית הדעיכה להסתיים
    }
    
    // סגירת המודאל בלחיצה מחוץ לתוכן המודאל
    window.addEventListener('click', function(event) {
      if (event.target === successModal) {
        closeSuccessModal();
      }
    });
  });

