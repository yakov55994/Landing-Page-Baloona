const API_BASE = 'https://baloona-server.onrender.com'; // שנה ל-localhost אם צריך
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

// רשימת קטגוריות
const categories = {
  "arches": { label: "🌈 קשתות", tag: "קשתות" },
  "room-arrangements": { label: "🏠 סידורי חדרים", tag: "סידורי חדרים" },
  "balloon-numbers": { label: "🔢 מספרים מבלונים", tag: "מספרים מבלונים" },
  "photo-reviews": { label: "📸 קירות צילום", tag: "קירות צילום" },
  "flowers-balloons": { label: "🌸 פרחים מבלונים", tag: "פרחים מבלונים" },
  "kids-balloons": { label: "👶 בלונים לילדים", tag: "בלונים לילדים" },
  "gender-reveal": { label: "👶 גילוי מין", tag: "גילוי מין" },
  "balloon-bouquet": { label: "🎁 בלונים ליום הולדת", tag: "בלונים ליום הולדת" },
  "centerpiece": { label: "🎯 מרכזי שולחן", tag: "מרכזי שולחן" },
  "birth-celebration": { label: "🎂 הולדת בן/בת", tag: "הולדת בן/בת" },
  "balloon": { label: "🎈 כדור פורח", tag: "כדור פורח" }
};




// נתונים דינמיים
let currentImages = [];
let currentIndex = 0;

// יצירת תפריט נפתח
function buildDropdown() {
  dropdownMenu.innerHTML = '';
 Object.entries(categories).forEach(([key, labelObj]) => {
  const btn = document.createElement('button');
  btn.className = 'dropdown-item';
  btn.textContent = labelObj.label;
  btn.dataset.tag = labelObj.tag;
  btn.onclick = () => {
    categoryDropdown.innerHTML = `${labelObj.label} <span class="dropdown-arrow">▼</span>`;
    dropdownMenu.classList.remove('active');
    loadGallery(labelObj.tag);
  };
  dropdownMenu.appendChild(btn);
});

}

// טעינת תמונות לפי תגית
async function loadGallery(tag) {
  galleryContainer.innerHTML = '';
  galleryCounter.textContent = 'טוען תמונות...';
  try {
    const res = await fetch(`${API_BASE}/api/images/${tag}`);
    // console.log("res", res);
    const data = await res.json();
    console.log("data.resources = ", data.resources);
    if (!data.resources || data.resources.length === 0) {
      showEmptyMessage();
      return;
    }

    currentImages = data.resources;
    galleryContainer.innerHTML = '';
    galleryCounter.innerHTML = `מספר תמונות: <strong>${currentImages.length}</strong>`;

    currentImages.forEach((img, i) => {
      const item = document.createElement('div');
      item.className = 'gallery-item';
      item.dataset.category = tag;
      item.onclick = () => openLightbox(i);

      const image = document.createElement('img');
      image.src = img.secure_url;
      image.alt = img.public_id;

      const number = document.createElement('div');
      number.className = 'image-number';
      number.textContent = i + 1;

      const overlay = document.createElement('div');
      overlay.className = 'gallery-overlay';

      const info = document.createElement('div');
      info.className = 'gallery-info';
      const title = document.createElement('h3');
    //   title.textContent  = tag;
      const desc = document.createElement('p');
    //   desc.textContent = img.public_id.split('/').pop();

      info.appendChild(title);
      info.appendChild(desc);
      overlay.appendChild(info);

      item.appendChild(image);
      item.appendChild(number);
      item.appendChild(overlay);
      galleryContainer.appendChild(item);
    });

  } catch (err) {
    console.error('שגיאה בטעינת תמונות:', err);
    galleryCounter.textContent = 'שגיאה בטעינת תמונות';
    showEmptyMessage();
  }
}

// הודעה אם אין תמונות
function showEmptyMessage() {
  galleryContainer.innerHTML = `<div class="empty-category-message">
    <div class="empty-icon">😕</div>
    <h3>לא נמצאו תמונות</h3>
    <p>אין תמונות בקטגוריה זו. נסה לבחור אחרת.</p>
  </div>`;
  galleryCounter.textContent = '';
}

// פתיחת לייטבוקס
function openLightbox(index) {
  currentIndex = index;
  const image = currentImages[index];
  lightboxImage.src = image.secure_url;
//   lightboxTitle.textContent = categories[image.tag] || 'תמונה';
//   lightboxDesc.textContent = image.public_id.split('/').pop();
  lightboxNumber.textContent = `${index + 1} מתוך ${currentImages.length}`;
  lightboxModal.classList.add('active');
}

// ניווט בלייטבוקס
function navigateLightbox(direction) {
  currentIndex += direction;
  if (currentIndex < 0) currentIndex = currentImages.length - 1;
  if (currentIndex >= currentImages.length) currentIndex = 0;
  openLightbox(currentIndex);
}

// סגירת לייטבוקס
function closeLightbox() {
  lightboxModal.classList.remove('active');
}

// אירועים
lightboxPrev.onclick = () => navigateLightbox(-1);
lightboxNext.onclick = () => navigateLightbox(1);
closeLightboxBtn.onclick = closeLightbox;
window.addEventListener('keydown', (e) => {
  if (!lightboxModal.classList.contains('active')) return;
  if (e.key === 'ArrowRight') navigateLightbox(1);
  if (e.key === 'ArrowLeft') navigateLightbox(-1);
  if (e.key === 'Escape') closeLightbox();
});

// תפריט נפתח
categoryDropdown.addEventListener('click', () => {
  dropdownMenu.classList.toggle('active');
});

// אתחול
buildDropdown();
loadGallery('arches'); // קטגוריה ברירת מחדל
