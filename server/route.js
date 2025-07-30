// routes/images.js
import express from 'express';
import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloudinary config:", cloudinary.v2.config());

// ✅ שליפת תמונות לפי תגית - עם תמיכה בכל הכמות
router.get('/:tag', async (req, res) => {
  const { tag } = req.params;
  const { limit } = req.query; // קבלת limit מהפרמטרים
  
  try {
    let maxResults = 100; // ברירת מחדל
    
    // אם יש limit בבקשה, השתמש בו
    if (limit) {
      const limitNumber = parseInt(limit);
      if (limitNumber === 0) {
        maxResults = 500; // Cloudinary מגביל ל-500 מקסימום
      } else if (limitNumber > 0 && limitNumber <= 500) {
        maxResults = limitNumber;
      }
    }
    
    console.log(`🔍 חיפוש תמונות עבור tag: ${tag}, max_results: ${maxResults}`);
    
    const result = await cloudinary.v2.search
      .expression(`tags=${tag}`)
      .sort_by('public_id', 'desc')
      .max_results(maxResults)
      .execute();
    
    console.log(`✅ נמצאו ${result.resources.length} תמונות מתוך ${result.total_count} סה"כ`);
    
    res.json(result);
  } catch (err) {
    console.error("❌ שגיאה בשליפת תמונות:", err);
    res.status(500).json({ error: 'שגיאה בטעינה מהשרת' });
  }
});

// ✅ המלצות - גם כן עם תמיכה בכל הכמות
router.get('/testimonials', async (req, res) => {
  const { limit } = req.query;
  
  try {
    let maxResults = 100; // ברירת מחדל
    
    if (limit) {
      const limitNumber = parseInt(limit);
      if (limitNumber === 0) {
        maxResults = 500;
      } else if (limitNumber > 0 && limitNumber <= 500) {
        maxResults = limitNumber;
      }
    }
    
    const result = await cloudinary.v2.search
      .expression('tags=testimonials')
      .sort_by('public_id', 'desc')
      .max_results(maxResults)
      .execute();
      
    res.json(result);
  } catch (err) {
    console.error("שגיאה בטעינת המלצות:", err);
    res.status(500).json({ error: 'שגיאה בטעינת המלצות' });
  }
});

export default router;