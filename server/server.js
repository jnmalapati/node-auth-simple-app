

// npm modules
const express = require('express');
const uuid = require('uuid/v4');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const axios = require('axios');
const bcrypt = require('bcrypt-nodejs');

const users = [
  {
    id: 'id123',
    email: 'test@test.com',
    password: 'password'
    
  }
]

// passport.js local strategy
passport.use(new LocalStrategy({
  usernameField: 'email'
}, (email, password, done) => {
  console.log('inside local strategy callback')
  // call DB to find by their username and do  a password match etc..
  // // pretend user found
  // const user = users[0];
    
    axios.get(`http://localhost:5000/users?email=${email}`)
      .then(res => {
        const user = res.data[0]
        if (!user) {
          return done(null, false, { message: 'Invalid credentials.\n' });
        }
        if (!bcrypt.compareSync(password, user.password)) {
          console.log('Local strategy returned true');
        }
        return done(null, user);
      }).catch(error => done(error));
    
    
  }));

  // passport serialize user
passport.serializeUser((user, done) => {
  console.log('Inside serializeUser callback. User id is save to the session file store here');
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  // console.log('Inside deserializeUser callback');
  // console.log(`The user id passport saved in the session file store is: ${id}`);
  // const user = users[0].id === id ? users[0] : false;
  // done(null, user);

  axios.get(`http://localhost:5000/users/${id}`)
    .then(res => done(null, res.data))
    .catch(error => done(error, false));
})


// app server
const app = express();


// middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
  genid: (req) => {
    console.log('inside the session middleware');
    console.log(req.sessionID);
    // UUID for the session
    return uuid(); 
  },
  store: new FileStore(),
  secret: 'my secret',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());


// home page route
app.get('/', (req, res) => {
  console.log(req.sessionID);
  res.send(`home page ddddd! ${req.sessionID}`);
});


app.get('/login', (req, res) => {
  console.log('Inside GET /login callback\n');
  console.log(req.sessionID);

  res.send('You got the login page\n');
})
 
app.post('/login', (req, res, next) => {
  // console.log('Inside POST /login callback\n');
  // console.log(req.body);

  // passport.authenticate('local', (err, user, info) => {
  //   console.log('inside passport.authenticate callback');
  //   console.log(`req.session.passport:' ${JSON.stringify(req.session.passport)}`);
  //   console.log(`req.user: ${JSON.stringify(req.user)}`);
    
  //   req.login(user, (err) => {
  //     console.log('inside req.login callback');
  //     console.log(`req.session.passport:' ${JSON.stringify(req.session.passport)}`);
  //     console.log(`req.user: ${JSON.stringify(req.user)}`);
  //     return res.send(`you were autehnticated & logged in !\n`);
  //   })

  // })(req, res, next);


  passport.authenticate('local', (err, user, info) => {
    if(info) {return res.send(info.message)}
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    req.login(user, (err) => {
      if (err) { return next(err); }
      return res.redirect('/authrequired');
    })
  })(req, res, next);
});


app.get('/authrequired', (req, res) => {
  // console.log('Inside GET /authrequired callback');
  // console.log(`User authenticated ? ${req.isAuthenticated()}`)
  if (req.isAuthenticated()) {
    res.send(`you hit the authenticated endpoint\n`);
  } else {
    res.redirect('/');
  }
})


app.listen(3000, () => {
  console.log('App listening on port 3000');
});