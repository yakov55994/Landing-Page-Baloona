const express = require('express');
const cors = require('cors');
const { getImagesByCategory, getAllImageUrlsPaginated } = require('./API_cloudLinary');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json()); // הוספה לטיפול בJSON

// בריאות השרת
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    features: ['image-numbering', 'enhanced-gallery', 'auto-sync']
  });
});

// API: קבל תמונות לפי קטגוריה עם מספור
app.get('/api/images/:category', async (req, res) => {
  const { category } = req.params;
  try {
    console.log(`Loading images for category: ${category}`);
    const images = await getImagesByCategory(category);
    
    // הוספת מספור אוטומטי לתמונות
    const numberedImages = images.map((img, index) => ({
      ...img,
      imageNumber: index + 1,
      category: extractCategoryFromPath(img.public_id || img.folder || category)
    }));
    
    console.log(`Returning ${numberedImages.length} images with numbering`);
    res.json(numberedImages);
  } catch (err) {
    console.error('Error fetching category images:', err);
    res.status(500).json({ 
      error: 'שגיאה בשליפת תמונות', 
      details: err.message 
    });
  }
});

// API: קבל את כל התמונות בגלריה עם מספור משופר
app.get('/api/gallery', async (req, res) => {
  try {
    console.log('Loading full gallery with numbering...');
    const images = await getAllImageUrlsPaginated();
    
    // עיבוד מתקדם עם מספור ומטא-דטה
    const processedImages = images.map((img, index) => {
      const category = extractCategoryFromPath(img.public_id || img.folder);
      
      return {
        ...img,
        imageNumber: index + 1,
        category: category,
        thumbnailUrl: generateOptimizedUrl(img.secure_url || img.url, 'thumbnail'),
        mediumUrl: generateOptimizedUrl(img.secure_url || img.url, 'medium'),
        fullsizeUrl: generateOptimizedUrl(img.secure_url || img.url, 'fullsize'),
        uploadDate: img.created_at || new Date().toISOString(),
        tags: img.tags || [category, 'gallery'],
        metadata: {
          width: img.width,
          height: img.height,
          format: img.format,
          size: img.bytes,
          publicId: img.public_id
        }
      };
    });
    
    console.log(`Returning ${processedImages.length} images with enhanced numbering`);
    res.json(processedImages);
  } catch (err) {
    console.error('Error fetching gallery:', err);
    res.status(500).json({ 
      error: 'שגיאה בשליפת גלריה', 
      details: err.message 
    });
  }
});

// API חדש: עדכון מספור תמונה
app.put('/api/image/:publicId/number', async (req, res) => {
  const { publicId } = req.params;
  const { imageNumber, title, description } = req.body;
  
  try {
    // כאן נוכל להוסיף לוגיקה לעדכון מטא-דטה ב-Cloudinary
    // לרגע נחזיר הצלחה
    console.log(`Updating image ${publicId} number to ${imageNumber}`);
    
    res.json({ 
      success: true, 
      message: 'מספר התמונה עודכן בהצלחה',
      data: {
        publicId,
        imageNumber,
        title,
        description,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Error updating image number:', err);
    res.status(500).json({ 
      error: 'שגיאה בעדכון מספר התמונה', 
      details: err.message 
    });
  }
});

// API חדש: סטטיסטיקות גלריה
app.get('/api/gallery/stats', async (req, res) => {
  try {
    const images = await getAllImageUrlsPaginated();
    
    // חישוב סטטיסטיקות
    const categoryStats = {};
    const monthlyStats = {};
    
    images.forEach(img => {
      const category = extractCategoryFromPath(img.public_id || img.folder);
      categoryStats[category] = (categoryStats[category] || 0) + 1;
      
      const month = new Date(img.created_at || Date.now()).toISOString().substr(0, 7);
      monthlyStats[month] = (monthlyStats[month] || 0) + 1;
    });
    
    const stats = {
      totalImages: images.length,
      categories: Object.keys(categoryStats).length,
      categoryBreakdown: categoryStats,
      monthlyUploads: monthlyStats,
      lastUpdated: new Date().toISOString(),
      averageImagesPerCategory: Math.round((images.length / Math.max(Object.keys(categoryStats).length, 1)) * 10) / 10
    };
    
    res.json(stats);
  } catch (err) {
    console.error('Error fetching gallery stats:', err);
    res.status(500).json({ 
      error: 'שגיאה בשליפת סטטיסטיקות', 
      details: err.message 
    });
  }
});

// API חדש: חיפוש תמונות
app.get('/api/search', async (req, res) => {
  const { q, category, limit = 50 } = req.query;
  
  try {
    let images = await getAllImageUrlsPaginated();
    
    // סינון לפי קטגוריה
    if (category && category !== 'all') {
      images = images.filter(img => 
        extractCategoryFromPath(img.public_id || img.folder) === category
      );
    }
    
    // חיפוש טקסט
    if (q) {
      const searchTerm = q.toLowerCase();
      images = images.filter(img => {
        const imgCategory = extractCategoryFromPath(img.public_id || img.folder);
        const categoryName = getCategoryName(imgCategory);
        
        return (
          (img.context?.custom?.title || '').toLowerCase().includes(searchTerm) ||
          (img.context?.custom?.description || '').toLowerCase().includes(searchTerm) ||
          categoryName.toLowerCase().includes(searchTerm) ||
          (img.public_id || '').toLowerCase().includes(searchTerm) ||
          (img.tags || []).some(tag => tag.toLowerCase().includes(searchTerm))
        );
      });
    }
    
    // הגבלת תוצאות
    images = images.slice(0, parseInt(limit));
    
    // הוספת מספור לתוצאות החיפוש
    const numberedResults = images.map((img, index) => ({
      ...img,
      imageNumber: index + 1,
      searchRelevance: calculateRelevance(img, q),
      category: extractCategoryFromPath(img.public_id || img.folder)
    }));
    
    res.json({
      results: numberedResults,
      total: numberedResults.length,
      query: q,
      category: category,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error searching images:', err);
    res.status(500).json({ 
      error: 'שגיאה בחיפוש תמונות', 
      details: err.message 
    });
  }
});

// פונקציות עזר

// חילוץ קטגוריה מנתיב
function extractCategoryFromPath(path) {
  if (!path) return 'balloon-bouquet';
  
  // אם יש בנתיב 'balloon-gallery/' נחלץ את מה שאחרי
  if (path.includes('balloon-gallery/')) {
    const parts = path.split('balloon-gallery/')[1].split('/');
    return parts[0] || 'balloon-bouquet';
  }
  
  // אם יש בנתיב 'gallery/' נחלץ את מה שאחרי
  if (path.includes('gallery/')) {
    const parts = path.split('gallery/')[1].split('/');
    return parts[0] || 'balloon-bouquet';
  }
  
  // קטגוריות ידועות
  const knownCategories = [
    'room-arrangements', 'balloon-numbers', 'arches', 'photo-reviews',
    'flowers-balloons', 'kids-balloons', 'gender-reveal', 'balloon-bouquet',
    'centerpiece', 'birth-celebration'
  ];
  
  const foundCategory = knownCategories.find(cat => path.includes(cat));
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
    'centerpiece': 'שולחן מרכזי',
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

// חישוב רלוונטיות לחיפוש
function calculateRelevance(image, searchTerm) {
  if (!searchTerm) return 1;
  
  const term = searchTerm.toLowerCase();
  let score = 0;
  
  // בדיקה בכותרת
  if ((image.context?.custom?.title || '').toLowerCase().includes(term)) {
    score += 3;
  }
  
  // בדיקה בתיאור
  if ((image.context?.custom?.description || '').toLowerCase().includes(term)) {
    score += 2;
  }
  
  // בדיקה בתגיות
  if ((image.tags || []).some(tag => tag.toLowerCase().includes(term))) {
    score += 1;
  }
  
  // בדיקה ב-public_id
  if ((image.public_id || '').toLowerCase().includes(term)) {
    score += 1;
  }
  
  return score;
}

// API לניהול קטגוריות
app.get('/api/categories', (req, res) => {
  const categories = {
  "": "בחר קטגוריה",
    'room-arrangements': 'סידורי חדרים',
    'balloon-numbers': 'מספרים מבלונים',
    'arches': 'קשתות',
    'photo-reviews': 'קירות צילום',
    'flowers-balloons': 'פרחים מבלונים',
    'kids-balloons': 'בלונים לילדים',
    'gender-reveal': 'גילוי מין',
    'balloon-bouquet': 'זר בלונים',
    'centerpiece': 'שולחן מרכזי',
    'birth-celebration': 'הולדת בן / בת'
  };
  
  res.json(categories);
});

// API לגיבוי ושחזור
app.post('/api/backup', async (req, res) => {
  try {
    const images = await getAllImageUrlsPaginated();
    const categories = await fetch('/api/categories').then(r => r.json()).catch(() => ({}));
    
    const backup = {
      images: images.map((img, index) => ({
        ...img,
        imageNumber: index + 1,
        category: extractCategoryFromPath(img.public_id || img.folder)
      })),
      categories,
      timestamp: new Date().toISOString(),
      version: '2.0',
      totalImages: images.length
    };
    
    res.json(backup);
  } catch (err) {
    console.error('Error creating backup:', err);
    res.status(500).json({ 
      error: 'שגיאה ביצירת גיבוי', 
      details: err.message 
    });
  }
});

// התחלת השרת
app.listen(PORT, () => {
  console.log(`🎈 Gallery Server v2.0 with Image Numbering running on http://localhost:${PORT}`);
  console.log('Features: Image numbering, Enhanced gallery, Auto-sync, Search, Stats');
});

// טיפול בסגירת השרת
process.on('SIGINT', () => {
  console.log('\n🎈 Shutting down Gallery Server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🎈 Gallery Server terminated');
  process.exit(0);
});

// טיפול בשגיאות לא צפויות
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
}); 