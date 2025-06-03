require('dotenv').config();
const express = require('express');
const argon2 = require('argon2');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Champs manquants' });

  try {
    const hashedPassword = await argon2.hash(password);
    const conn = await pool.getConnection();

    const [result] = await conn.query(
      "INSERT INTO User (Nom, password) VALUES (?, ?)",
      [username, hashedPassword]
    );
    const userId = result.insertId;

    conn.release();
    res.json({ success: true, userId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Champs manquants' });

  try {
    const conn = await pool.getConnection();
    const [users] = await conn.query("SELECT * FROM User WHERE Nom = ?", [username]);

    if (users.length === 0) {
      conn.release();
      return res.status(401).json({ error: 'Utilisateur introuvable' });
    }

    const user = users[0];
    const passwordOk = await argon2.verify(user.password, password);
    if (!passwordOk) {
      conn.release();
      return res.status(401).json({ error: 'Mot de passe invalide' });
    }

    conn.release();
    res.json({
      user: {
        id: user.Id,
        username: user.Nom,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

const PORT = process.env.PORT || 2606;
app.listen(PORT, () => {
  console.log(`✅ API démarrée sur http://localhost:${PORT}`);
});
