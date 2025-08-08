import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const SECRET = 'supersecret';

const db = new sqlite3.Database('./cms.db');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    published INTEGER DEFAULT 0
  )`);
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// auth middleware
const auth = (rq, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.sendStatus(401).send('Unauthorized');
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403).send('Forbidden');
    req.user = user;
    next();
  });
};

// auth routes
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], err => {
    if (err) return res.status(400).json({ error: 'The user may already exists' });
    res.sendStatus(200);
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (!user || !(await bcrypt.compare(password, user.password))) return res.sendStatus(403);
    const token = jwt.sign({ email: user.email }, SECRET);
    res.json({ token });
  });
});
app.get('/', (req, res) => {
  res.send('Welcome to the backend!');
});

app.get('/secret', (req, res) => {
  if (req.query.secret === SECRET) {
    res.send('This is a secret endpoint!');
  } else {
    res.status(403).send('Forbidden: Invalid secret');
  }
});

app.listen(port, () => {
  console.log(`Your Skaffold CMS Database is running at http://localhost:${port}`);
});
