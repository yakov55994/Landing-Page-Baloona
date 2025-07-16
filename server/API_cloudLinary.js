const cloudinary = require('cloudinary').v2;

// הגדרת הקונפיגורציה
cloudinary.config({
  cloud_name: 'dbbivwbbt',
  api_key: '549784497364423',
  api_secret: 'Pzn6bz27n3YIBbD2dbP8Uu8SGY8'
});

// קבלת כל התמונות עם מספור משופר
async function getAllImageUrlsPaginated() {
  let allResources = [];
  let nextCursor = null;
  let imageCounter = 1;

  console.log('🎈 Loading all images from Cloudinary with numbering...');
  
  do {
    try {
    const result = await cloudinary.api.resources({
      resource_type: 'image',
      type: 'upload',
      max_results: 500,
        next_cursor: nextCursor,
        prefix: 'balloon-gallery/', // מסנן רק תמונות מהגלריה
        context: true, // כולל context data
        tags: true, // כולל תגיות
        metadata: true // כולל מטא-דטה
      });

      // הוספת מספור לכל תמונה
      const numberedResources = result.resources.map(resource => ({
        ...resource,
        imageNumber: imageCounter++,
        // הוספת נתונים נוספים
        optimizedUrls: {
          thumbnail: generateOptimizedUrl(resource.secure_url, 'thumbnail'),
          medium: generateOptimizedUrl(resource.secure_url, 'medium'),
          fullsize: generateOptimizedUrl(resource.secure_url, 'fullsize')
        },
        category: extractCategoryFromPath(resource.public_id),
            }));

      allResources = allResources.concat(numberedResources);
    nextCursor = result.next_cursor;

      console.log(`📸 Loaded batch: ${numberedResources.length} images (Total: ${allResources.length})`);

    } catch (error) {
      console.error('❌ Error loading images batch:', error);
      break;
    }
  } while (nextCursor);
  
  console.log(`✅ Total images loaded with numbering: ${allResources.length}`);
  return allResources;
}

// קבלת תמונות לפי קטגוריה עם מספור
async function getImagesByCategory(category) {
  try {
    console.log(`🎈 Loading images for category: ${category}`);
    
    const result = await cloudinary.api.resources({
      resource_type: 'image',
      type: 'upload',
      prefix: `balloon-gallery/${category}/`, // נתיב ספציפי לקטגוריה
      max_results: 100,
      context: true,
      tags: true,
      metadata: true
    });

    // עיבוד התמונות עם מספור
    const processedImages = result.resources.map((resource, index) => ({
      ...resource,
      imageNumber: index + 1,
      category: category,
      optimizedUrls: {
        thumbnail: generateOptimizedUrl(resource.secure_url, 'thumbnail'),
        medium: generateOptimizedUrl(resource.secure_url, 'medium'),
        fullsize: generateOptimizedUrl(resource.secure_url, 'fullsize')
      },
      url: resource.secure_url,
      public_id: resource.public_id,
      folder: resource.folder,
      created_at: resource.created_at,
      tags: resource.tags || [category, 'gallery']
    }));

    console.log(`✅ Loaded ${processedImages.length} images for category: ${category}`);
    return processedImages;
  } catch (error) {
    console.error(`❌ Error loading category ${category}:`, error);
    return [];
  }
}

// פונקציה לעדכון מטא-דטה של תמונה (כולל מספור)
async function updateImageMetadata(publicId, metadata) {
  try {
    console.log(`🔄 Updating metadata for image: ${publicId}`);
    
    const result = await cloudinary.api.update(publicId, {
      context: {
        custom: {
          title: metadata.title,
          description: metadata.description,
          imageNumber: metadata.imageNumber,
          category: metadata.category,
          lastUpdated: new Date().toISOString()
        }
      },
      tags: metadata.tags || []
    });

    console.log(`✅ Metadata updated for: ${publicId}`);
    return result;
  } catch (error) {
    console.error(`❌ Error updating metadata for ${publicId}:`, error);
    throw error;
  }
}

// פונקציה לחיפוש תמונות עם מספור
async function searchImages(searchTerm, options = {}) {
  try {
    console.log(`🔍 Searching images for: "${searchTerm}"`);
    
    const searchOptions = {
      resource_type: 'image',
      type: 'upload',
      prefix: 'balloon-gallery/',
      max_results: options.limit || 50,
      context: true,
      tags: true,
      metadata: true
    };

    // אם יש קטגוריה ספציפית
    if (options.category && options.category !== 'all') {
      searchOptions.prefix = `balloon-gallery/${options.category}/`;
    }

    const result = await cloudinary.api.resources(searchOptions);

    // סינון תוצאות לפי המונח חיפוש
    const filteredResults = result.resources.filter(resource => {
      const title = resource.context?.custom?.title || '';
      const description = resource.context?.custom?.description || '';
      const tags = (resource.tags || []).join(' ');
      const publicId = resource.public_id || '';
      
      const searchableText = `${title} ${description} ${tags} ${publicId}`.toLowerCase();
      return searchableText.includes(searchTerm.toLowerCase());
    });

    // הוספת מספור לתוצאות
    const numberedResults = filteredResults.map((resource, index) => ({
      ...resource,
      imageNumber: index + 1,
      searchRelevance: calculateSearchRelevance(resource, searchTerm),
      category: extractCategoryFromPath(resource.public_id),
      optimizedUrls: {
        thumbnail: generateOptimizedUrl(resource.secure_url, 'thumbnail'),
        medium: generateOptimizedUrl(resource.secure_url, 'medium'),
        fullsize: generateOptimizedUrl(resource.secure_url, 'fullsize')
      }
    }));

    // מיון לפי רלוונטיות
    numberedResults.sort((a, b) => b.searchRelevance - a.searchRelevance);

    console.log(`✅ Found ${numberedResults.length} images matching: "${searchTerm}"`);
    return numberedResults;
  } catch (error) {
    console.error(`❌ Error searching images:`, error);
    return [];
  }
}

// פונקציה לקבלת סטטיסטיקות גלריה
async function getGalleryStats() {
  try {
    console.log('📊 Calculating gallery statistics...');
    
    const allImages = await getAllImageUrlsPaginated();
    
    // חישוב סטטיסטיקות לפי קטגוריה
    const categoryStats = {};
    const monthlyStats = {};
    const yearlyStats = {};
    
    allImages.forEach(image => {
      const category = extractCategoryFromPath(image.public_id);
      categoryStats[category] = (categoryStats[category] || 0) + 1;
      
      if (image.created_at) {
        const date = new Date(image.created_at);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const year = date.getFullYear().toString();
        
        monthlyStats[month] = (monthlyStats[month] || 0) + 1;
        yearlyStats[year] = (yearlyStats[year] || 0) + 1;
      }
    });

    const stats = {
      totalImages: allImages.length,
      categoriesCount: Object.keys(categoryStats).length,
      categoryBreakdown: categoryStats,
      monthlyUploads: monthlyStats,
      yearlyUploads: yearlyStats,
      averageImagesPerCategory: Math.round((allImages.length / Math.max(Object.keys(categoryStats).length, 1)) * 100) / 100,
      lastUpdated: new Date().toISOString(),
      oldestImage: allImages.reduce((oldest, current) => 
        (new Date(current.created_at || 0) < new Date(oldest.created_at || 0)) ? current : oldest, 
        allImages[0] || {}
      ),
      newestImage: allImages.reduce((newest, current) => 
        (new Date(current.created_at || 0) > new Date(newest.created_at || 0)) ? current : newest, 
        allImages[0] || {}
      )
    };

    console.log('✅ Gallery statistics calculated');
    return stats;
  } catch (error) {
    console.error('❌ Error calculating gallery stats:', error);
    return null;
  }
}

// פונקציה למחיקת תמונה
async function deleteImage(publicId) {
  try {
    console.log(`🗑️ Deleting image: ${publicId}`);
    
    const result = await cloudinary.api.delete_resources([publicId]);
    
    console.log(`✅ Image deleted: ${publicId}`);
    return result;
  } catch (error) {
    console.error(`❌ Error deleting image ${publicId}:`, error);
    throw error;
  }
}

// פונקציה לשכפול/גיבוי תמונה
async function duplicateImage(publicId, newPublicId) {
  try {
    console.log(`📋 Duplicating image: ${publicId} -> ${newPublicId}`);
    
    // קבלת פרטי התמונה המקורית
    const originalImage = await cloudinary.api.resource(publicId, {
      context: true,
      tags: true,
      metadata: true
    });
    
    // יצירת עותק עם מספור חדש
    const result = await cloudinary.uploader.upload(originalImage.secure_url, {
      public_id: newPublicId,
      folder: originalImage.folder,
      tags: originalImage.tags || [],
      context: {
        custom: {
          ...originalImage.context?.custom,
          originalImageId: publicId,
          duplicatedAt: new Date().toISOString()
        }
      }
    });
    
    console.log(`✅ Image duplicated: ${publicId} -> ${newPublicId}`);
    return result;
  } catch (error) {
    console.error(`❌ Error duplicating image:`, error);
    throw error;
  }
}

// פונקציות עזר

// חילוץ קטגוריה מנתיב
function extractCategoryFromPath(publicId) {
  if (!publicId) return 'balloon-bouquet';
  
  const pathParts = publicId.split('/');
  if (pathParts.length >= 2 && pathParts[0] === 'balloon-gallery') {
    return pathParts[1] || 'balloon-bouquet';
  }
  
  const knownCategories = [
    'room-arrangements', 'balloon-numbers', 'arches', 'photo-reviews',
    'flowers-balloons', 'kids-balloons', 'gender-reveal', 'balloon-bouquet',
    'centerpiece', 'birth-celebration'
  ];
  
  const foundCategory = knownCategories.find(cat => publicId.includes(cat));
  return foundCategory || 'balloon-bouquet';
}

// קבלת שם קטגוריה בעברית
function getCategoryName(categoryKey) {
  const categoryNames = {
  "": "בחר קטגוריה",
    'room-arrangements': 'סידורי חדרים',
    'balloon-numbers': 'מספרים מבלונים',
    'arches': 'קשתות',
    'photo-reviews': 'קירות צילום',
    'flowers-balloons': 'פרחים מבלונים',
    'kids-balloons': 'בלונים לילדים',
    'gender-reveal': 'גילוי מין',
    'balloon-bouquet': 'זר בלונים',
    'centerpiece': 'מרכזי שולחן',
    'birth-celebration': 'הולדת בן / בת'
  };
  
  return categoryNames[categoryKey] || categoryKey;
}

// יצירת URLs מאופטמים
function generateOptimizedUrl(originalUrl, size) {
  if (!originalUrl) return '';
  
  const transformations = {
    thumbnail: 'w_300,h_200,c_fill,q_auto,f_auto',
    medium: 'w_800,h_600,c_limit,q_auto,f_auto',
    fullsize: 'w_1200,h_900,c_limit,q_auto,f_auto'
  };
  
  if (originalUrl.includes('cloudinary.com')) {
    return originalUrl.replace('/upload/', `/upload/${transformations[size]}/`);
  }
  
  return originalUrl;
}

// חישוב רלוונטיות חיפוש
function calculateSearchRelevance(resource, searchTerm) {
  if (!searchTerm) return 0;
  
  const term = searchTerm.toLowerCase();
  let score = 0;
  
  // בדיקה בכותרת (משקל גבוה)
  const title = resource.context?.custom?.title || '';
  if (title.toLowerCase().includes(term)) {
    score += 5;
    if (title.toLowerCase().startsWith(term)) score += 3; // אם מתחיל במונח
  }
  
  // בדיקה בתיאור
  const description = resource.context?.custom?.description || '';
  if (description.toLowerCase().includes(term)) {
    score += 3;
  }
  
  // בדיקה בתגיות
  const tags = resource.tags || [];
  if (tags.some(tag => tag.toLowerCase().includes(term))) {
    score += 2;
  }
  
  // בדיקה ב-public_id
  if (resource.public_id && resource.public_id.toLowerCase().includes(term)) {
    score += 1;
  }
  
  return score;
}

// פונקציה לטעינת תמונות בטווח מספרים
async function getImagesByNumberRange(startNumber, endNumber, category = null) {
  try {
    console.log(`🔢 Loading images in range: ${startNumber}-${endNumber}`);
    
    let allImages = await getAllImageUrlsPaginated();
    
    // סינון לפי קטגוריה אם נדרש
    if (category && category !== 'all') {
      allImages = allImages.filter(img => extractCategoryFromPath(img.public_id) === category);
    }
    
    // סינון לפי טווח מספרים
    const filteredImages = allImages.filter(img => 
      img.imageNumber >= startNumber && img.imageNumber <= endNumber
    );
    
    console.log(`✅ Found ${filteredImages.length} images in range ${startNumber}-${endNumber}`);
    return filteredImages;
  } catch (error) {
    console.error('❌ Error loading images by number range:', error);
    return [];
  }
}

// ייצוא הפונקציות
module.exports = { 
  getImagesByCategory, 
  getAllImageUrlsPaginated,
  updateImageMetadata,
  searchImages,
  getGalleryStats,
  deleteImage,
  duplicateImage,
  getImagesByNumberRange,
  extractCategoryFromPath,
  getCategoryName,
  generateOptimizedUrl,
  calculateSearchRelevance
};

console.log('🎈 Cloudinary API v2.0 with Image Numbering loaded!');
console.log('Available functions:', Object.keys(module.exports).join(', '));