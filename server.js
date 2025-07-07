const express = require('express');
const pool = require('./db');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(__dirname));

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
               VALUES($1, $2, $3) RETURNING id`;
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
  const{ email, password } = req.body;
  pool.query(
    'SELECT * FROM users WHERE email = $1 AND password = $2',
    [email, password],
    (err, result) => {
      if(err) 
        return res.status(500).send('Database error');

      if(result.rows.length === 0)
        return res.status(401).send('Login failed: invalid credentials');
      res.send('Login successful');
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
      res.send(`Connected! Time: ${result.rows[0].now}`);
    }
  });
});
*/
app.listen(8080, () => console.log('Server running on port 8080'));