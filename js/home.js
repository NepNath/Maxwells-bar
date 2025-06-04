document.addEventListener('DOMContentLoaded', function() {
  const cocktailsContainer = document.getElementById('cocktail-suggestions');
  const searchForm = document.getElementById('search-form');
  
  // Charger les suggestions de cocktails
  async function loadCocktailSuggestions() {
    try {
      const cocktails = await API.getCocktails();
      
      if (cocktails.length === 0) {
        cocktailsContainer.innerHTML = '<p class="no-results">Aucun cocktail disponible pour le moment.</p>';
        return;
      }
      
      cocktailsContainer.innerHTML = cocktails.map(cocktail => `
        <div class="cocktail-card">
          <div class="cocktail-content">
            <img src="${cocktail.image}" alt="${cocktail.name}" class="cocktail-image">
            <h4 class="cocktail-name">${cocktail.name}</h4>
            <p class="cocktail-description">${cocktail.description}</p>
            <div class="cocktail-actions">
              <a href="/cocktail/${cocktail.id}" class="btn btn-outline">Voir recette</a>
              <button class="btn btn-icon favorite-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </button>
            </div>
          </div>
        </div>
      `).join('');
      
      // Ajouter les écouteurs d'événements pour les boutons favoris
      document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          // PLACEHOLDER: Ajouter aux favoris
          this.classList.toggle('active');
        });
      });
      
    } catch (error) {
      console.error('Erreur lors du chargement des cocktails:', error);
      cocktailsContainer.innerHTML = '<p class="error">Une erreur est survenue lors du chargement des cocktails.</p>';
    }
  }
  
  // Gérer la recherche
  searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const searchInput = this.querySelector('.search-input');
    const query = searchInput.value.trim();
    
    if (query) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  });
  
  // Charger les cocktails au chargement de la page
  loadCocktailSuggestions();
});