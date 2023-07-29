const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');

dotenv.config();

app.use(cors());
app.use(express.json()); // Pour parser les requêtes JSON
app.use(express.urlencoded({ extended: false })); // Pour parser les requêtes URL-encoded

const mongoose = require('mongoose');


// Remplacez 'MONGODB_URI' par l'URI de votre base de données MongoDB
const MONGODB_URI = process.env.MONGODB_URI; 

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
});

// Importez et utilisez les routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const avatarRoutes = require('./routes/avatarRoutes');

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/avatars', avatarRoutes);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
