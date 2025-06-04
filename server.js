const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/account', (req, res) => {
  res.sendFile(path.join(__dirname, 'account.html'));
});

app.get('/search', (req, res) => {
  res.sendFile(path.join(__dirname, 'search.html'));
});

app.get('/create', (req, res) => {
  res.sendFile(path.join(__dirname, 'create.html'));
});

// API Placeholders
app.get('/api/cocktails', (req, res) => {
  // PLACEHOLDER: Remplacer par votre appel API réel
  const sampleCocktails = [
    { id: 1, name: "Mojito", image: "/images/placeholder.jpg", description: "Rhum blanc, menthe, citron vert" },
    { id: 2, name: "Martini", image: "/images/placeholder.jpg", description: "Gin, vermouth sec, olive" },
    // etc.
  ];
  res.json(sampleCocktails);
});

app.get('/api/cocktails/:id', (req, res) => {
  // PLACEHOLDER: Remplacer par votre appel API réel
  res.json({
    id: req.params.id,
    name: "Mojito",
    image: "/images/placeholder.jpg",
    description: "Rhum blanc, menthe, citron vert",
    ingredients: [
      { name: "Rhum blanc", quantity: "5cl" },
      { name: "Menthe fraîche", quantity: "8 feuilles" },
      { name: "Citron vert", quantity: "1" },
      { name: "Sucre", quantity: "2 cuillères" },
      { name: "Eau gazeuse", quantity: "au goût" }
    ],
    instructions: "Piler la menthe avec le sucre et le jus de citron. Ajouter le rhum et compléter avec de l'eau gazeuse."
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});