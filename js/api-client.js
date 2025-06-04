const API = {
  // Récupérer tous les cocktails ou filtrer par recherche
  getCocktails: async (query = '') => {
    try {
      // PLACEHOLDER: Remplacer par votre appel API réel
      // const response = await fetch(`votre-api/cocktails?q=${query}`);
      
      // Pour le développement, on utilise l'API placeholder du serveur
      const response = await fetch(`/api/cocktails${query ? `?q=${query}` : ''}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des cocktails');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur API:', error);
      return [];
    }
  },
  
  // Récupérer un cocktail par son ID
  getCocktailById: async (id) => {
    try {
      // PLACEHOLDER: Remplacer par votre appel API réel
      // const response = await fetch(`votre-api/cocktails/${id}`);
      
      // Pour le développement, on utilise l'API placeholder du serveur
      const response = await fetch(`/api/cocktails/${id}`);
      
      if (!response.ok) {
        throw new Error('Cocktail non trouvé');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur API:', error);
      return null;
    }
  },
  
  // Créer un nouveau cocktail
  createCocktail: async (cocktailData) => {
    try {
      // PLACEHOLDER: Remplacer par votre appel API réel
      // const response = await fetch('votre-api/cocktails', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(cocktailData)
      // });
      
      // Pour le développement, on simule une réponse réussie
      console.log('Données du cocktail à envoyer:', cocktailData);
      return { success: true, id: Date.now() };
    } catch (error) {
      console.error('Erreur API:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Authentification: connexion
  login: async (credentials) => {
    try {
      // PLACEHOLDER: Remplacer par votre appel API réel
      // const response = await fetch('votre-api/auth/login', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(credentials)
      // });
      
      // Pour le développement, on simule une réponse réussie
      console.log('Tentative de connexion avec:', credentials);
      return { success: true, user: { id: 1, username: 'utilisateur_test' } };
    } catch (error) {
      console.error('Erreur API:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Authentification: inscription
  register: async (userData) => {
    try {
      // PLACEHOLDER: Remplacer par votre appel API réel
      // const response = await fetch('votre-api/auth/register', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(userData)
      // });
      
      // Pour le développement, on simule une réponse réussie
      console.log('Données d\'inscription à envoyer:', userData);
      return { success: true, user: { id: Date.now(), username: userData.username } };
    } catch (error) {
      console.error('Erreur API:', error);
      return { success: false, error: error.message };
    }
  }
};