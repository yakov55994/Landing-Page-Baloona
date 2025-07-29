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

// ✅ שליפת תמונות לפי תגית
router.get('/:tag', async (req, res) => {
  const { tag } = req.params;
  try {
    const result = await cloudinary.v2.search
      .expression(`tags=${tag}`)
      .sort_by('public_id', 'desc')
      .max_results(30)
      .execute();
    res.json(result);
  } catch (err) {
    console.error("❌ שגיאה בשליפת תמונות:", err);
    res.status(500).json({ error: 'שגיאה בטעינה מהשרת' });
  }
});

// ✅ בדיקה לתיקיית גלריה
router.get('/test', async (req, res) => {
  try {
    const result = await cloudinary.v2.search
      .expression('folder:gallery')
      .sort_by('public_id', 'desc')
      .max_results(10)
      .execute();
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
