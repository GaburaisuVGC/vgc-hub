const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
const { initializeSockets } = require('./socket');

dotenv.config();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));


app.use(express.json()); // Pour parser les requêtes JSON
app.use(express.urlencoded({ extended: false })); // Pour parser les requêtes URL-encoded

const mongoose = require('mongoose');
const http = require('http');

const socketIo = require('socket.io');

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

// Importez et utilisez les routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const avatarRoutes = require('./routes/avatarRoutes');
const postRoutes = require('./routes/postRoutes');
const reportRoutes = require('./routes/reportRoutes');
const privateMessageRoutes = require('./routes/privateMessageRoutes');
const groupMessageRoutes = require('./routes/groupMessageRoutes');
const pokePasteRoutes = require('./routes/pokePasteRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/avatars', avatarRoutes);
app.use('/posts', postRoutes);
app.use('/reports', reportRoutes);
app.use('/private', privateMessageRoutes);
app.use('/group', groupMessageRoutes);
app.use('/pokepaste', pokePasteRoutes);
app.use('/notifications', notificationRoutes);

const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

initializeSockets(io); // Appel à la fonction pour initialiser les sockets

const port = process.env.BACKEND_PORT || 5000;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});