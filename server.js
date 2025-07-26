const express = require('express');
const pool = require('./js/db');
const path = require('path');
const session = require('express-session');

const app = express();

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(express.static(__dirname));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/js', express.static(path.join(__dirname, 'js')));

//make 'localhost:8080/signup' path connect to signup page
app.get('/signup', (req,res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

//make 'localhost:8080/login' path connect to login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

//-----signup-----
app.post('/signup', (req,res) => {
  const { username, email, password} = req.body;
  const sql = `INSERT INTO users (username,email,password)
               VALUES($1, $2, $3) RETURNING user_id`;
  pool.query(sql, [username, email, password], (err, result) => {
    if(err){
      console.log(err);
      return res.status(500).send('Signup failed');
    }
    res.redirect('/home.html');
  })
})

//-----login-----
app.post('/login', (req, res) => {
  const{ username, password } = req.body;

  pool.query(
    'SELECT * FROM users WHERE username = $1 AND password = $2',
    [username, password],
    (err, result) => {
      if(err) 
        return res.status(500).send('Database error');

      if(result.rows.length === 0)
        return res.status(401).send('<script>alert("Login failed: invalid credentials"); window.location.href="/login";</script>');
      
      req.session.userId = result.rows[0].user_id;

      res.redirect('/home.html');
    }
  )
})

//-----logout-----
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if(err){
      console.error('Logout error:', err);
      return res.status(500).send('Error logging out');
    }
    res.redirect('/login');
  })
})
/*
//-----Database connection-----
app.get('/', (req, res) => {
  pool.query('SELECT NOW()', (err, result) => {
    if(err){
      console.error(err);
      res.status(500).send('Database connection failed');
    } else {
      res.send(`Connected`);
    }
  });
});
*/

app.get('/session', (req, res) => {
 if(!req.session.userId) {
    return res.json({loggedIn: false});
 }

pool.query(
  'SELECT username FROM users where user_id = $1',
  [req.session.userId],
  (err, result) => {
    if(err || result.rows.length === 0){
      return res.json({loggedIn: false});
      }

      res.json({
        loggedIn:true,
        username:result.rows[0].username
      });
    }
  );
});
app.listen(8080, () => console.log('Server running on port 8080'));