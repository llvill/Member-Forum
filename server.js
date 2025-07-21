const express = require('express');
const pool = require('./js/db');
const path = require('path');


const app = express();

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
    res.send('Signup  successful, user id: ' + result.rows[0].user_id);
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
      

      res.redirect('/home.html');
    }
  )
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
app.listen(8080, () => console.log('Server running on port 8080'));