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

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form');

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(form);

        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Redirect the user to the thank you page after a successful submission
                window.location.href = "https://baloona-store.com/thanks.html";
            } else {
                alert('שגיאה בשליחת הטופס. אנא נסה שוב.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('אירעה שגיאה. אנא נסה שוב מאוחר יותר.');
        });
    });
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🎈 Gallery server is running on http://localhost:${PORT}`);
});
