const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');

exports.signup = async (req, res) => {
    const { username, email, password } = req.body;
    const reservedUsernames = ['signup', 'login', 'admin', 'verify']; // Ajoutez d'autres noms réservés au besoin

    // Vérifiez si l'adresse e-mail est déjà utilisée
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(409).json({ error: 'L\'adresse e-mail est déjà utilisée' });
    }
  
    // Vérifiez si l'username est déjà utilisé
    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res.status(409).json({ error: 'Le nom d\'utilisateur est déjà utilisé' });
    }

    // Vérifiez si le nom d'utilisateur est dans la liste des mots réservés
  if (reservedUsernames.includes(username.toLowerCase())) {
    return res.status(400).json({ error: 'Ce nom d\'utilisateur n\'est pas autorisé.' });
  }
  
    // Hachez le mot de passe avant de l'enregistrer dans la base de données
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    try {
      await newUser.save();
  
      // Générez un jeton de vérification d'e-mail
      const verificationToken = jwt.sign({ userId: newUser._id }, process.env.EMAIL_VERIFICATION_SECRET, { expiresIn: '1d' });
  
      // Enregistrez le jeton de vérification d'e-mail dans la base de données
      newUser.emailVerificationToken = verificationToken;
      await newUser.save();
  
      // Envoyez un e-mail de vérification à l'utilisateur
      sendVerificationEmail(newUser.email, verificationToken);
  
      return res.status(201).json({ message: 'Utilisateur enregistré avec succès. Veuillez vérifier votre e-mail pour activer votre compte.' });
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement de l\'utilisateur:', err);
      return res.status(500).json({ error: 'Erreur lors de l\'enregistrement de l\'utilisateur' });
    }
  };

  // Fonction pour envoyer un e-mail de vérification
const sendVerificationEmail = (email, verificationToken) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Utilisez le service Gmail
        auth: {
          user: process.env.MAIL_EMAIL, // Votre adresse e-mail Gmail
          pass: process.env.MAIL_PASSWORD, // Le mot de passe de votre compte Gmail
        },
      });
    
      const mailOptions = {
        from: process.env.MAIL_EMAIL, // L'adresse e-mail qui envoie l'e-mail
        to: email, // L'adresse e-mail du destinataire
        subject: 'Vérification de votre compte',
        text: `Cliquez sur le lien suivant pour vérifier votre compte : ${process.env.CLIENT_URL}/verify/${verificationToken}`,
      };
    
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
  };

    // Fonction pour envoyer un e-mail de vérification
    exports.resend = async (req, res) => {
      const { email } = req.body;
    
      try {
        const user = await User.findOne({ email });
    
        if (!user) {
          return res.status(404).json({ error: 'Aucun utilisateur trouvé avec cet e-mail.' });
        }
    
        if (user.isVerified) {
          return res.status(400).json({ error: 'Votre e-mail est déjà vérifié.' });
        }
    
        const verificationToken = jwt.sign(
          { userId: user._id },
          process.env.EMAIL_VERIFICATION_SECRET,
          { expiresIn: '1h' }
        );
    
        // Save the verification token in the user document
        user.verificationToken = verificationToken;
        await user.save();
    
        // Send the verification email
        const transporter = nodemailer.createTransport({
          service: 'gmail', // Utilisez le service Gmail
          auth: {
            user: process.env.MAIL_EMAIL, // Votre adresse e-mail Gmail
            pass: process.env.MAIL_PASSWORD, // Le mot de passe de votre compte Gmail
          },
        });
    
        const mailOptions = {
          from: process.env.MAIL_EMAIL, // L'adresse e-mail qui envoie l'e-mail
          to: email, // L'adresse e-mail du destinataire
          subject: 'Vérification de votre compte',
          text: `Cliquez sur le lien suivant pour vérifier votre compte : ${process.env.CLIENT_URL}/verify/${verificationToken}`,
        };
    
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
            return res.status(500).json({ error: 'Une erreur est survenue lors de l\'envoi de l\'e-mail de vérification.' });
          } else {
            console.log('Email sent: ' + info.response);
            return res.json({ message: 'Un e-mail de vérification a été envoyé.' });
          }
        });
      } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Une erreur est survenue lors de l\'envoi de l\'e-mail de vérification.' });
      }
    };


  exports.login = (req, res) => {
    const user = req.user;
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  
    return res.json({ token });
  };

// Configuration de la stratégie locale (nom d'utilisateur et mot de passe)
passport.use(new LocalStrategy(
    { usernameField: 'username' }, // Spécifiez que nous utilisons l'e-mail comme nom d'utilisateur
    async (username, password, done) => {
      try {
        const user = await User.findOne({ username });
        if (!user) {
          return done(null, false, { message: 'L\'utilisateur n\'existe pas' });
        }
  
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Mot de passe incorrect' });
        }
      } catch (err) {
        return done(err);
      }
    }
  ));
  
  // Configuration de la stratégie JWT (JSON Web Token)
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };
  
  passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await User.findById(payload.userId);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err);
    }
  }));
  
  // Middleware pour l'authentification
  exports.authenticate = passport.authenticate('local', { session: false });
  
  // Middleware pour vérifier l'authentification JWT
  exports.verifyJwt = passport.authenticate('jwt', { session: false });