require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
require('./config');
const LOGIN_SCHEMA = require('./models/login_schema');
const session = require('express-session');
const app = express(); //Calls the express function "express()" and puts new Express application inside the app variable (to start a new Express application). It's something like you are creating an object of a class

const bcrypt = require('bcrypt'); // Importing bcrypt package
const passport = require('passport');
const initializePassport = require('./passport-config');
const flash = require('express-flash');
const methodOverride = require('method-override');
const cors = require('cors');
app.use(cors());
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
);

const users = [];

const PORT = process.env.PORT || 4000;

app.use(flash());
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); //This method is used to parse the incoming requests with JSON payloads and is based upon the bodyparser. This method returns the middleware that only parses JSON and only looks at the requests where the content-type header matches the type option
app.use(
  session({
    secret: 'my secret key',
    saveUninitialized: true,
    resave: false
  })
);

app.use((req, res, next) => {
  res.locals.message = req.session.message; //clean up the flow between CRUD functions by passing messages between pages to find out whether the server operations were successful or certain types of errors occurred.
  delete req.session.message;
  next();
});
app.use(express.static(__dirname + '/public/uploads'));

app.set('view engine', 'ejs');

//route prefix
app.use('', require('./routes/routes'));

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

// Configuring the register post functionality
app.post('/login', async (req, res) => {
  const body = req.body;
  const user = await LOGIN_SCHEMA.findOne({ email: body.email });
  try {
    if (user) {
      // check user password with hashed password stored in the database
      const validPassword = await bcrypt.compare(body.password, user.password);
      if (validPassword) {
        res.redirect('/index');
      } else {
        res.render('login.ejs', { message: 'Invalid Password' });
        res.redirect('/login');
      }
    } else {
      res.render('login.ejs', { message: 'User does not exist' });
      res.redirect('/login');
    }
  } catch (e) {
    console.log(e);
  }
});

// Configuring the register post functionality
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let strongRegex = new RegExp(
      '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})'
    );
    const user = await LOGIN_SCHEMA.findOne({ email });

    if (user) {
      res.render('register.ejs', { message: 'User already exists' });
      res.redirect('/register');
      // throw new Error('User already exists');
    }
    if (strongRegex.test(password)) {
      const hashedPassword = await bcrypt.hash(password, 10);

      const Login = new LOGIN_SCHEMA({
        name,
        email,
        password: hashedPassword
      });
      await Login.save();
      res.redirect('/login');
    } else {
      res.render('register.ejs', {
        message:
          'Password must be minimum 8 characters in length with atleast one capital, small and special letter'
      });
      res.redirect('/register');
      // throw new Error('Please choose a strong password');
    }
  } catch (e) {
    console.log(e);
    // res.render('register.ejs', { errorMessage: e });
  }
});

app.get('/', (req, res) => {
  res.render('login.ejs');
});

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs');
});

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs');
});

app.delete('/logout', (req, res) => {
  req.logout(req.user, err => {
    if (err) return next(err);
    res.redirect('/login');
  });
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
}

app.listen(PORT, () => {
  console.log(`SERVER started at ${PORT}`);
});
