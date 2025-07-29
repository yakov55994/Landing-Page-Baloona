import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import imagesRoute from './route.js'

dotenv.config();

const app = express();
app.use(cors());
app.use(express.static('public')); // שם נמצא gallery.html

app.use('/api/images', imagesRoute);


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🎈 Gallery server is running on http://localhost:${PORT}`);
});
