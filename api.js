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
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

app.get('/cocktails', async (req, res) => {
  try {
    const conn = await pool.getConnection();

    const [cocktails] = await conn.query(`
      SELECT c.Id_Cocktails AS id, c.Nom, c.Description, c.Image, u.Pseudo AS createur
      FROM Cocktails c
      LEFT JOIN Utilisateurs u ON c.Id_Utilisateur = u.Id_Utilisateur
    `);

    for (let cocktail of cocktails) {
      const [recette] = await conn.query(`
        SELECT i.Nom AS ingredient, r.Quantite, r.Unite
        FROM Recette r
        JOIN Ingrédients i ON r.Id_Ingrédients = i.Id_Ingrédients
        WHERE r.Id_Cocktails = ?
      `, [cocktail.id]);

      cocktail.ingredients = recette;
    }

    conn.release();
    res.json(cocktails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des cocktails' });
  }
});

app.get('/cocktails/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const conn = await pool.getConnection();

    const [[cocktail]] = await conn.query(`
      SELECT c.Id_Cocktails AS id, c.Nom, c.Description, c.Image, u.Pseudo AS createur
      FROM Cocktails c
      LEFT JOIN Utilisateurs u ON c.Id_Utilisateur = u.Id_Utilisateur
      WHERE c.Id_Cocktails = ?
    `, [id]);

    if (!cocktail) {
      conn.release();
      return res.status(404).json({ error: 'Cocktail introuvable' });
    }

    const [recette] = await conn.query(`
      SELECT i.Nom AS ingredient, r.Quantite, r.Unite
      FROM Recette r
      JOIN Ingrédients i ON r.Id_Ingrédients = i.Id_Ingrédients
      WHERE r.Id_Cocktails = ?
    `, [id]);

    cocktail.ingredients = recette;
    conn.release();
    res.json(cocktail);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération du cocktail' });
  }
});

app.post('/cocktails', async (req, res) => {
  const { nom, description, image, id_utilisateur, ingredients } = req.body;

  if (!nom || !description || !image || !id_utilisateur || !Array.isArray(ingredients)) {
    return res.status(400).json({ error: 'Champs manquants ou invalides' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(`
      INSERT INTO Cocktails (Nom, Description, Image, Id_Utilisateur)
      VALUES (?, ?, ?, ?)
    `, [nom, description, image, id_utilisateur]);

    const idCocktail = result.insertId;

    for (const ing of ingredients) {
      const [[existing]] = await conn.query(
        `SELECT Id_Ingrédients FROM Ingrédients WHERE Id_Ingrédients = ?`,
        [ing.id]
      );

      if (!existing) {
        await conn.rollback();
        return res.status(400).json({ error: `Ingrédient ID ${ing.id} inexistant` });
      }

      await conn.query(`
        INSERT INTO Recette (Id_Cocktails, Id_Ingrédients, Quantite, Unite)
        VALUES (?, ?, ?, ?)
      `, [idCocktail, ing.id, ing.quantite, ing.unite]);
    }

    await conn.commit();
    conn.release();
    res.status(201).json({ success: true, id_cocktail: idCocktail });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la création du cocktail' });
  }
});

app.get('/cocktails/by-ingredient', async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'Nom d’ingrédient requis' });

  try {
    const conn = await pool.getConnection();

    const [cocktails] = await conn.query(`
      SELECT DISTINCT c.Id_Cocktails AS id, c.Nom, c.Description, c.Image
      FROM Cocktails c
      JOIN Recette r ON c.Id_Cocktails = r.Id_Cocktails
      JOIN Ingrédients i ON r.Id_Ingrédients = i.Id_Ingrédients
      WHERE i.Nom LIKE ?
    `, [`%${name}%`]);

    conn.release();
    res.json(cocktails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la recherche par ingrédient' });
  }
});

app.get('/cocktails/by-category/:id', async (req, res) => {
  const idCategorie = req.params.id;

  try {
    const conn = await pool.getConnection();

    const [cocktails] = await conn.query(`
      SELECT c.Id_Cocktails AS id, c.Nom, c.Description, c.Image
      FROM Cocktails c
      JOIN Catégorie_du_Cocktail cc ON c.Id_Cocktails = cc.Id_Cocktails
      WHERE cc.Id_Catégorie = ?
    `, [idCategorie]);

    conn.release();
    res.json(cocktails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la recherche par catégorie' });
  }
});

app.get('/cocktails/by-user/:id', async (req, res) => {
  const idUser = req.params.id;

  try {
    const conn = await pool.getConnection();

    const [cocktails] = await conn.query(`
      SELECT Id_Cocktails AS id, Nom, Description, Image
      FROM Cocktails
      WHERE Id_Utilisateur = ?
    `, [idUser]);

    conn.release();
    res.json(cocktails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la recherche des cocktails par utilisateur' });
  }
});

app.get('/cocktails/favorites/:id_user', async (req, res) => {
  const idUser = req.params.id_user;

  try {
    const conn = await pool.getConnection();

    const [favorites] = await conn.query(`
      SELECT c.Id_Cocktails AS id, c.Nom, c.Description, c.Image
      FROM Favoris f
      JOIN Cocktails c ON f.Id_Cocktails = c.Id_Cocktails
      WHERE f.Id_Utilisateurs = ?
    `, [idUser]);

    conn.release();
    res.json(favorites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des favoris' });
  }
});

app.post('/favorites', async (req, res) => {
  const { id_utilisateur, id_cocktail } = req.body;
  if (!id_utilisateur || !id_cocktail) {
    return res.status(400).json({ error: 'Champs manquants' });
  }

  try {
    const conn = await pool.getConnection();

    const [[existing]] = await conn.query(`
      SELECT * FROM Favoris WHERE Id_Utilisateurs = ? AND Id_Cocktails = ?
    `, [id_utilisateur, id_cocktail]);

    if (existing) {
      conn.release();
      return res.status(409).json({ error: 'Déjà dans les favoris' });
    }

    await conn.query(`
      INSERT INTO Favoris (Id_Utilisateurs, Id_Cocktails)
      VALUES (?, ?)
    `, [id_utilisateur, id_cocktail]);

    conn.release();
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de l’ajout aux favoris' });
  }
});

app.delete('/favorites', async (req, res) => {
  const { id_utilisateur, id_cocktail } = req.body;
  if (!id_utilisateur || !id_cocktail) {
    return res.status(400).json({ error: 'Champs manquants' });
  }

  try {
    const conn = await pool.getConnection();

    const [result] = await conn.query(`
      DELETE FROM Favoris WHERE Id_Utilisateurs = ? AND Id_Cocktails = ?
    `, [id_utilisateur, id_cocktail]);

    conn.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Favori non trouvé' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression du favori' });
  }
});

app.get('/categories', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query(`SELECT Id_Catégorie AS id, Nom FROM Catégories`);
    conn.release();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
  }
});

const PORT = process.env.PORT || 2606;
app.listen(PORT, () => {
  console.log(`API démarrée sur http://localhost:${PORT}`);
});
