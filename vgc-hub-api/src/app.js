const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');

dotenv.config();

app.use(cors());
app.use(express.json()); // Pour parser les requêtes JSON
app.use(express.urlencoded({ extended: false })); // Pour parser les requêtes URL-encoded

const mongoose = require('mongoose');
const http = require('http');

const initSocket = require('./utils/socketLogic'); 

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

const server = http.createServer(app); // Créez le serveur HTTP

// Initialisez le WebSocket en passant le serveur en argument
const io = initSocket(server);

// Importez et utilisez les routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const avatarRoutes = require('./routes/avatarRoutes');
const postRoutes = require('./routes/postRoutes');
const reportRoutes = require('./routes/reportRoutes');

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/avatars', avatarRoutes);
app.use('/posts', postRoutes);
app.use('/reports', reportRoutes);

const port = process.env.PORT;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
