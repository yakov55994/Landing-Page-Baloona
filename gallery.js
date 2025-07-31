// ✅ הגדרת קבועים רספונסיביים
const API_BASE = 'https://baloona-server.onrender.com';

// פונקציה לקביעת מספר תמונות מקסימליות לפי גודל מסך - לגלריה רגילה
function getMaxVisibleImages() {
  if (window.innerWidth < 768) {
    return 3; // מובייל וטאבלט קטן
  }
  return 5; // מחשב
}

// פונקציה לקביעת מספר המלצות מקסימליות - תמיד 3
function getMaxRecommendations() {
  if (window.innerWidth < 768) {
    return 2; // מובייל וטאבלט קטן - 2 המלצות
  }
  return 3; // מחשב - 3 המלצות
}

let MAX_VISIBLE_IMAGES = getMaxVisibleImages();

// ✅ DOM Elements
const galleryContainer = document.getElementById('galleryContainer');
const categoryDropdown = document.getElementById('categoryDropdown');
const dropdownMenu = document.getElementById('dropdownMenu');
const galleryCounter = document.getElementById('galleryCounter');
const lightboxModal = document.getElementById('lightboxModal');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxDesc = document.getElementById('lightboxDesc');
const lightboxNumber = document.getElementById('lightboxNumber');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
const closeLightboxBtn = document.getElementById('closeLightbox');
const recommendationsGallery = document.getElementById('recommendationsGallery');

// ✅ קטגוריות
const categories = {
  "arches": { label: "🌈 קשתות", tag: "arches" },
  "room-arrangements": { label: "🏠 סידורי חדרים", tag: "room-arrangements" },
  "balloon-numbers": { label: "🔢 מספרים מבלונים", tag: "balloon-numbers" },
  "photo-reviews": { label: "📸 קירות צילום", tag: "photo-reviews" },
  "flowers-balloons": { label: "🌸 פרחים מבלונים", tag: "flowers-balloons" },
  "kids-balloons": { label: "👶 בלונים לילדים", tag: "kids-balloons" },
  "gender-reveal": { label: "👶 גילוי מין", tag: "gender-reveal" },
  "balloon-bouquet": { label: "🎁 בלונים ליום הולדת", tag: "balloon-bouquet" },
  "centerpiece": { label: "🎯 מרכזי שולחן", tag: "centerpiece" },
  "birth-celebration": { label: "🎂 הולדת בן/בת", tag: "birth-celebration" },
  "balloon": { label: "🎈 כדור פורח", tag: "balloon" }
};

let currentImages = [];
let currentIndex = 0;

function buildDropdown() {
  dropdownMenu.innerHTML = '';
  Object.entries(categories).forEach(([key, info]) => {
    const btn = document.createElement('button');
    btn.className = 'dropdown-item';
    btn.textContent = info.label;
    btn.dataset.tag = info.tag;
    btn.onclick = () => {
      categoryDropdown.innerHTML = `${info.label} <span class="dropdown-arrow">▼</span>`;
      dropdownMenu.classList.remove('active');
      loadGallery(info.tag);
    };
    dropdownMenu.appendChild(btn);
  });
}

// פונקציה משופרת לטעינת גלריה עם כפתורי הצג/הסתר
async function loadGallery(tag) {
  // עדכון MAX_VISIBLE_IMAGES בכל טעינה
  MAX_VISIBLE_IMAGES = getMaxVisibleImages();
  
  galleryContainer.innerHTML = '';
  galleryCounter.textContent = 'טוען תמונות...';
  
  // הסרת כפתורים קיימים
  removeGalleryButtons();
  
  try {
    const res = await fetch(`${API_BASE}/api/images/${tag}`);
    const data = await res.json();
    currentImages = data.resources || [];

    if (currentImages.length === 0) return showEmptyMessage();

    galleryCounter.innerHTML = `מספר תמונות: <strong>${currentImages.length}</strong>`;
    displayGalleryItems(currentImages.slice(0, MAX_VISIBLE_IMAGES), tag);

    if (currentImages.length > MAX_VISIBLE_IMAGES) {
      createGalleryButtons(tag);
    }
  } catch (err) {
    console.error('שגיאה בטעינת תמונות:', err);
    galleryCounter.textContent = 'שגיאה בטעינת תמונות';
    showEmptyMessage();
  }
}

// יצירת כפתורי הצג עוד והסתר
function createGalleryButtons(tag) {
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'gallery-buttons';
  buttonsContainer.id = 'galleryButtons';
  
  // כפתור הצג עוד
  const showMoreBtn = document.createElement('button');
  showMoreBtn.className = 'show-more-btn';
  showMoreBtn.innerHTML = 'הצג עוד תמונות ';
  showMoreBtn.onclick = () => showMoreImages(showMoreBtn, tag);
  
  buttonsContainer.appendChild(showMoreBtn);
  galleryContainer.parentElement.appendChild(buttonsContainer);
}

// הצגת תמונות נוספות
function showMoreImages(showBtn, tag) {
  // אפקט טעינה
  showBtn.classList.add('loading');
  showBtn.textContent = 'טוען...';
  
  setTimeout(() => {
    // הצגת התמונות הנוספות
    const remainingImages = currentImages.slice(MAX_VISIBLE_IMAGES);
    const currentCount = galleryContainer.children.length;
    
    remainingImages.forEach((img, i) => {
      const item = createGalleryItem(img, currentCount + i, tag);
      galleryContainer.appendChild(item);
    });
    
    // החלפת הכפתור
    replaceShowButtonWithHide(showBtn);
    
    // גלילה חלקה לתמונות החדשות
    setTimeout(() => {
      const firstNewImage = galleryContainer.children[MAX_VISIBLE_IMAGES];
      if (firstNewImage) {
        firstNewImage.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 100);
    
  }, 800); // השהיה לאפקט הטעינה
}

// החלפת כפתור הצג עוד בכפתור הסתר
function replaceShowButtonWithHide(showBtn) {
  const hideBtn = document.createElement('button');
  hideBtn.className = 'hide-more-btn';
  hideBtn.innerHTML = 'הסתר תמונות נוספות ';
  hideBtn.onclick = () => hideExtraImages(hideBtn);
  
  // אפקט מעבר חלק
  showBtn.classList.add('fade-out');
  
  setTimeout(() => {
    showBtn.replaceWith(hideBtn);
    // אנימציית כניסה לכפתור החדש
    hideBtn.style.opacity = '0';
    hideBtn.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      hideBtn.style.transition = 'all 0.4s ease';
      hideBtn.style.opacity = '1';
      hideBtn.style.transform = 'translateY(0)';
    }, 50);
  }, 400);
}

// הסתרת תמונות נוספות
function hideExtraImages(hideBtn) {
  // עדכון MAX_VISIBLE_IMAGES למקרה של שינוי גודל מסך
  const currentMaxVisible = getMaxVisibleImages();
  
  // אפקט טעינה
  hideBtn.classList.add('loading');
  hideBtn.textContent = 'מסתיר...';
  
  setTimeout(() => {
    // הסרת התמונות הנוספות עם אנימציה
    const extraImages = Array.from(galleryContainer.children).slice(currentMaxVisible);
    
    extraImages.forEach((item, index) => {
      setTimeout(() => {
        item.style.transition = 'all 0.3s ease';
        item.style.opacity = '0';
        item.style.transform = 'translateY(-20px) scale(0.9)';
        
        setTimeout(() => item.remove(), 300);
      }, index * 50); // מעבר מדורג
    });
    
    // החלפה חזרה בכפתור הצג עוד
    setTimeout(() => {
      replaceHideButtonWithShow(hideBtn);
    }, extraImages.length * 50 + 300);
    
    // גלילה חזרה למקום המקורי
    setTimeout(() => {
      const lastVisibleImage = galleryContainer.children[currentMaxVisible - 1];
      if (lastVisibleImage) {
        lastVisibleImage.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'end' 
        });
      }
    }, 100);
    
  }, 600);
}

// החלפת כפתור הסתר בכפתור הצג עוד
function replaceHideButtonWithShow(hideBtn) {
  const showBtn = document.createElement('button');
  showBtn.className = 'show-more-btn';
  showBtn.innerHTML = 'הצג עוד תמונות';
  showBtn.onclick = () => showMoreImages(showBtn, getCurrentTag());
  
  // אפקט מעבר חלק
  hideBtn.classList.add('fade-out');
  
  setTimeout(() => {
    hideBtn.replaceWith(showBtn);
    // אנימציית כניסה לכפתור החדש
    showBtn.style.opacity = '0';
    showBtn.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
      showBtn.style.transition = 'all 0.4s ease';
      showBtn.style.opacity = '1';
      showBtn.style.transform = 'translateY(0)';
    }, 50);
  }, 400);
}

// יצירת פריט גלריה בודד
function createGalleryItem(img, index, tag) {
  const item = document.createElement('div');
  item.className = 'gallery-item';
  item.dataset.category = tag;
  item.onclick = () => openLightbox(index);
  
  // אנימציית כניסה
  item.style.opacity = '0';
  item.style.transform = 'translateY(30px) scale(0.9)';
  
  const image = document.createElement('img');
  image.src = img.secure_url;
  image.alt = img.public_id;
  image.loading = 'lazy';

  const number = document.createElement('div');
  number.className = 'image-number';
  number.textContent = index + 1;

  const overlay = document.createElement('div');
  overlay.className = 'gallery-overlay';
  const info = document.createElement('div');
  info.className = 'gallery-info';
  const title = document.createElement('h3');
  const desc = document.createElement('p');

  info.appendChild(title);
  info.appendChild(desc);
  overlay.appendChild(info);

  item.appendChild(image);
  item.appendChild(number);
  item.appendChild(overlay);
  
  // אנימציית כניסה מושהית
  setTimeout(() => {
    item.style.transition = 'all 0.4s ease';
    item.style.opacity = '1';
    item.style.transform = 'translateY(0) scale(1)';
  }, 100);
  
  return item;
}

// עדכון הפונקציה הקיימת displayGalleryItems
function displayGalleryItems(images, tag) {
  images.forEach((img, i) => {
    const item = createGalleryItem(img, i, tag);
    galleryContainer.appendChild(item);
  });
}

function showEmptyMessage() {
  galleryContainer.innerHTML = `<div class="empty-category-message">
    <div class="empty-icon">😕</div>
    <h3>לא נמצאו תמונות</h3>
    <p>אין תמונות בקטגוריה זו. נסה לבחור אחרת.</p>
  </div>`;
  galleryCounter.textContent = '';
}

function openLightbox(index) {
  currentIndex = index;
  const image = currentImages[index];
  lightboxImage.src = image.secure_url;
  lightboxNumber.textContent = `${index + 1} מתוך ${currentImages.length}`;
  lightboxModal.classList.add('active');
  
  // הצגת חצי הניווט רק אם יש יותר מתמונה אחת
  const showNav = currentImages.length > 1;
  lightboxPrev.style.display = showNav ? 'block' : 'none';
  lightboxNext.style.display = showNav ? 'block' : 'none';
  
  // ניקוי סימון המלצות
  delete lightboxModal.dataset.type;
}

function navigateLightbox(direction) {
  currentIndex = (currentIndex + direction + currentImages.length) % currentImages.length;
  openLightbox(currentIndex);
}

function closeLightbox() {
  lightboxModal.classList.remove('active');
}

// קבלת הקטגוריה הנוכחית
function getCurrentTag() {
  const firstItem = galleryContainer.querySelector('.gallery-item');
  return firstItem ? firstItem.dataset.category : 'arches';
}

// הסרת כפתורי גלריה קיימים
function removeGalleryButtons() {
  const existingButtons = document.getElementById('galleryButtons');
  if (existingButtons) {
    existingButtons.remove();
  }
}

// עדכן את מספר התמונות המקסימליות בשינוי גודל מסך
window.addEventListener('resize', () => {
  const newMaxVisible = getMaxVisibleImages();
  
  // אם השתנה מספר התמונות המקסימליות
  if (newMaxVisible !== MAX_VISIBLE_IMAGES) {
    MAX_VISIBLE_IMAGES = newMaxVisible;
    
    // אם יש תמונות מוצגות כרגע
    if (galleryContainer.children.length > 0) {
      const currentTag = getCurrentTag();
      
      // בדוק אם צריך להציג או להסתיר כפתורים
      if (currentImages.length > MAX_VISIBLE_IMAGES) {
        // אם אין כפתורים ויש יותר תמונות ממה שצריך להציג
        if (!document.getElementById('galleryButtons') && galleryContainer.children.length <= MAX_VISIBLE_IMAGES) {
          createGalleryButtons(currentTag);
        }
        // אם מוצגות יותר תמונות ממה שצריך (מעבר ממחשב לטלפון)
        else if (galleryContainer.children.length > MAX_VISIBLE_IMAGES) {
          const extraImages = Array.from(galleryContainer.children).slice(MAX_VISIBLE_IMAGES);
          extraImages.forEach(item => item.remove());
          
          // וודא שיש כפתור הצג עוד
          if (!document.querySelector('.show-more-btn')) {
            removeGalleryButtons();
            createGalleryButtons(currentTag);
          }
        }
      } else {
        // אם אין צורך יותר בכפתורים
        removeGalleryButtons();
      }
    }
  }
});

// מעקב אחר כיוון המסך במכשירים ניידים
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
  }, 100);
});

// Event Listeners - עם תיקונים ובדיקות
lightboxPrev.onclick = () => navigateLightbox(-1);
lightboxNext.onclick = () => navigateLightbox(1);
closeLightboxBtn.onclick = closeLightbox;

// לחיצה על הרקע לסגירת ה-lightbox
lightboxModal.addEventListener('click', (e) => {
  // אם לחצו על המודל עצמו (הרקע) ולא על התמונה או הכפתורים
  if (e.target === lightboxModal) {
    closeLightbox();
  }
});

// מניעת סגירה בלחיצה על התמונה עצמה
lightboxImage.addEventListener('click', (e) => {
  e.stopPropagation();
});

// מניעת סגירה בלחיצה על הכפתורים - עם בדיקה שהאלמנט קיים
const lightboxNav = document.querySelector('.lightbox-nav');
if (lightboxNav) {
  lightboxNav.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}

// מניעת סגירה גם בלחיצה על כפתורי הניווט עצמם
if (lightboxPrev) {
  lightboxPrev.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}

if (lightboxNext) {
  lightboxNext.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}

if (closeLightboxBtn) {
  closeLightboxBtn.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}

window.addEventListener('keydown', (e) => {
  if (!lightboxModal.classList.contains('active')) return;
  if (e.key === 'ArrowRight') navigateLightbox(1);
  if (e.key === 'ArrowLeft') navigateLightbox(-1);
  if (e.key === 'Escape') closeLightbox();
});

categoryDropdown.addEventListener('click', () => {
  dropdownMenu.classList.toggle('active');
});

// המלצות לקוחות - תמיד 3 המלצות עם lightbox
const RECOMMENDATIONS_API = `${API_BASE}/api/images/testimonials`;
let recommendationsImages = []; // מערך נפרד להמלצות

async function loadRecommendations() {
  const maxRecommendations = getMaxRecommendations(); // רספונסיבי
  
  try {
    recommendationsGallery.innerHTML = '<p style="color:#ccc">טוען המלצות...</p>';
    const res = await fetch(RECOMMENDATIONS_API);
    const data = await res.json();
    const items = data.resources || [];

    if (items.length === 0) {
      recommendationsGallery.innerHTML = '<p style="color:#ccc">אין עדיין המלצות</p>';
      return;
    }

    recommendationsImages = items; // שמירת כל ההמלצות
    recommendationsGallery.innerHTML = ''; // נקה את הודעת הטעינה
    
    const first = items.slice(0, maxRecommendations);
    first.forEach((item, index) => createRecommendationItem(item, index));

    if (items.length > maxRecommendations) {
      createRecommendationsShowMoreButton(items, maxRecommendations);
    }
  } catch (err) {
    console.error('שגיאה בטעינת המלצות:', err);
    recommendationsGallery.innerHTML = '<p style="color:#f66">שגיאה בטעינת המלצות</p>';
  }
}

// פונקציה להצגת המלצות נוספות
function showMoreRecommendations(showBtn, items, maxRecommendations) {
  showBtn.classList.add('loading');
  showBtn.textContent = 'טוען...';
  
  setTimeout(() => {
    // הצגת ההמלצות הנוספות
    items.slice(maxRecommendations).forEach((item, index) => 
      createRecommendationItem(item, maxRecommendations + index)
    );
    
    // החלפת הכפתור בכפתור "הסתר"
    const hideBtn = document.createElement('button');
    hideBtn.className = 'hide-more-btn recommendations premium-button';
    hideBtn.id = 'recommendationsHideBtn';
    hideBtn.textContent = 'הסתר המלצות נוספות ';
    hideBtn.onclick = () => hideExtraRecommendations(hideBtn, maxRecommendations);
    
    // החלפה חלקה
    showBtn.style.transition = 'all 0.4s ease';
    showBtn.style.opacity = '0';
    showBtn.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
      showBtn.replaceWith(hideBtn);
      hideBtn.style.opacity = '0';
      hideBtn.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        hideBtn.style.transition = 'all 0.4s ease';
        hideBtn.style.opacity = '1';
        hideBtn.style.transform = 'translateY(0)';
      }, 50);
    }, 400);
    
  }, 800);
}

// פונקציה להסתרת המלצות נוספות
function hideExtraRecommendations(hideBtn, maxRecommendations) {
  hideBtn.classList.add('loading');
  hideBtn.textContent = 'מסתיר...';
  
  setTimeout(() => {
    // הסרת ההמלצות הנוספות עם אנימציה
    const allRecommendations = Array.from(recommendationsGallery.children);
    const extraRecommendations = allRecommendations.slice(maxRecommendations);
    
    extraRecommendations.forEach((item, index) => {
      setTimeout(() => {
        item.style.transition = 'all 0.3s ease';
        item.style.opacity = '0';
        item.style.transform = 'translateY(-20px) scale(0.9)';
        
        setTimeout(() => item.remove(), 300);
      }, index * 50);
    });
    
    // החלפה חזרה בכפתור "הצג עוד"
    setTimeout(() => {
      const showBtn = document.createElement('button');
      showBtn.className = 'show-more-btn recommendations premium-button';
      showBtn.id = 'recommendationsShowMoreBtn';
      showBtn.textContent = 'הצג עוד המלצות ';
      showBtn.onclick = () => showMoreRecommendations(showBtn, recommendationsImages, maxRecommendations);
      
      hideBtn.style.transition = 'all 0.4s ease';
      hideBtn.style.opacity = '0';
      hideBtn.style.transform = 'translateY(-20px)';
      
      setTimeout(() => {
        hideBtn.replaceWith(showBtn);
        showBtn.style.opacity = '0';
        showBtn.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
          showBtn.style.transition = 'all 0.4s ease';
          showBtn.style.opacity = '1';
          showBtn.style.transform = 'translateY(0)';
        }, 50);
      }, 400);
    }, extraRecommendations.length * 50 + 300);
    
  }, 600);
}
// פונקציה ליצירת כפתור "הצג עוד" להמלצות - הוסף את זה לקוד
function createRecommendationsShowMoreButton(items, maxRecommendations) {
  const btn = document.createElement('button');
  btn.className = 'show-more-btn recommendations premium-button';
  btn.id = 'recommendationsShowMoreBtn';
  btn.textContent = 'הצג עוד המלצות ';
  btn.onclick = () => showMoreRecommendations(btn, items, maxRecommendations);
  recommendationsGallery.parentElement.appendChild(btn);
}
function createRecommendationItem(img, index) {
  const item = document.createElement('div');
  item.className = 'recommendation-item';
  item.onclick = () => openRecommendationLightbox(index); // הוספת אירוע לחיצה

  const image = document.createElement('img');
  image.src = img.secure_url;
  image.alt = 'המלצה מלקוח';
  image.loading = 'lazy';

  item.appendChild(image);
  recommendationsGallery.appendChild(item);
}

// פונקציה לפתיחת lightbox להמלצות
function openRecommendationLightbox(index) {
  // החלפה להמלצות
  currentImages = recommendationsImages;
  currentIndex = index;
  
  const image = recommendationsImages[index];
  lightboxImage.src = image.secure_url;
  lightboxNumber.textContent = `המלצה ${index + 1} מתוך ${recommendationsImages.length}`;
  lightboxModal.classList.add('active');
  
  // הצגת חצי הניווט רק אם יש יותר מהמלצה אחת
  const showNav = recommendationsImages.length > 1;
  lightboxPrev.style.display = showNav ? 'block' : 'none';
  lightboxNext.style.display = showNav ? 'block' : 'none';
  
  // סימון שזה lightbox להמלצות
  lightboxModal.dataset.type = 'recommendations';
}

// עדכון פונקציית הניווט ב-lightbox
function navigateLightbox(direction) {
  currentIndex = (currentIndex + direction + currentImages.length) % currentImages.length;
  
  if (lightboxModal.dataset.type === 'recommendations') {
    openRecommendationLightbox(currentIndex);
  } else {
    openLightbox(currentIndex);
  }
}

// עדכון פונקציית סגירת ה-lightbox
function closeLightbox() {
  lightboxModal.classList.remove('active');
  
  // ניקוי כל הסימונים
  delete lightboxModal.dataset.type;
  
  // החזרת החצים למצב רגיל
  lightboxPrev.style.display = 'block';
  lightboxNext.style.display = 'block';
}

// אתחול
buildDropdown();
loadGallery(categories["arches"].tag);
loadRecommendations();

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
// Back to Top Button
const backToTopBtn = document.getElementById('backToTop');

// הצגת הכפתור כשגוללים למטה
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
});

// פונקציונליות הכפתור
backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});