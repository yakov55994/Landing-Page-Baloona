import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import imagesRoute from './route.js'

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
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  }
};

app.use(cors(corsOptions));

app.use(express.static('public')); // שם נמצא gallery.html

app.use('/api/images', imagesRoute);


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🎈 Gallery server is running on http://localhost:${PORT}`);
});
