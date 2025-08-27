import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import imagesRoute from './route.js';

dotenv.config();

const app = express();

const allowedOrigins = [
  'https://baloona.pages.dev',
  'https://baloona-store.com',
  'http://localhost:5173',
  'http://127.0.0.1:5501',
  'http://127.0.0.1:5502',
];

const corsOptions = {
  origin: function (origin, callback) {
    // לאפשר בקשות ללא Origin (כמו curl/health checks) וגם את המותרים
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  }
};

app.use(cors(corsOptions));
// אם אתה מקבל JSON ב־/api/*:
app.use(express.json());
// קבצים סטטיים (public כולל gallery.html, style.css, gallery.js וכו')
app.use(express.static('public'));

// API גלריה
app.use('/api/images', imagesRoute);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🎈 Gallery server is running on http://localhost:${PORT}`);
});
