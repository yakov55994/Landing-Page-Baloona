const express = require('express');
const cors = require('cors');
const { getImagesByCategory } = require('./API_cloudLinary');

const app = express();
const PORT = 3001;

app.use(cors());

// בריאות
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API: קבל תמונות לפי קטגוריה
app.get('/api/images/:category', async (req, res) => {
  const { category } = req.params;
  try {
    const images = await getImagesByCategory(category);
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בשליפת תמונות' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 