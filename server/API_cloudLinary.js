const cloudinary = require('cloudinary').v2;

// הגדרת הקונפיגורציה
cloudinary.config({
  cloud_name: 'dbbivwbbt',
  api_key: '238115521785214',
  api_secret: '9bRCAaiAyLL-tGdRGUdrdvgnqMc'
});

// לקבל את כל התמונות
async function getAllImageUrls() {
  try {
    const result = await cloudinary.api.resources({
      resource_type: 'image',
      type: 'upload',
      max_results: 500 // עד 500 תמונות בבת אחת
    });
    
    const imageUrls = result.resources.map(resource => resource.secure_url);
    
    console.log('כל הקישורים:');
    imageUrls.forEach(url => console.log(url));
    
    return imageUrls;
  } catch (error) {
    console.error('Error:', error);
  }
}

// להוציא לקובץ
const fs = require('fs');

async function saveUrlsToFile() {
  const urls = await getAllImageUrls();
  const urlsText = urls.join('\n');
  
  fs.writeFileSync('cloudinary_urls.txt', urlsText);
  console.log('הקישורים נשמרו בקובץ cloudinary_urls.txt');
}

saveUrlsToFile();

async function getAllImageUrlsPaginated() {
  let allUrls = [];
  let nextCursor = null;
  
  do {
    const result = await cloudinary.api.resources({
      resource_type: 'image',
      type: 'upload',
      max_results: 500,
      next_cursor: nextCursor
    });
    
    const urls = result.resources.map(resource => resource.secure_url);
    allUrls = allUrls.concat(urls);
    
    nextCursor = result.next_cursor;
  } while (nextCursor);
  
  return allUrls;
}

// קבל תמונות לפי קטגוריה
async function getImagesByCategory(category) {
  try {
    const result = await cloudinary.api.resources({
      resource_type: 'image',
      type: 'upload',
      prefix: `gallery/${category}/`, // שם התיקיה לפי קטגוריה
      max_results: 100
    });
    return result.resources.map(resource => ({
      url: resource.secure_url,
      public_id: resource.public_id,
      folder: resource.folder,
      created_at: resource.created_at,
      // אפשר להוסיף title, description וכו' אם שמרתם ב-metadata
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

module.exports = { getImagesByCategory };