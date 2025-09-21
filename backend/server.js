const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('CivicVoice API is running...');
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/reports', require('./routes/reportRoutes')); // <-- Now correctly wired up
app.use('/api/misc', require('./routes/miscRoutes'));

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
<<<<<<< HEAD
});
=======
});
>>>>>>> 609f1b36a642258c2c5b6076671e855c5cd95fdb
