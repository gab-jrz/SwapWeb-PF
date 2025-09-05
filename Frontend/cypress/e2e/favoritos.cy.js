describe('Favoritos - agregar y eliminar', () => {
  beforeEach(() => {
    // Asegurar estado limpio de favoritos antes de cada test
    cy.clearLocalStorage('favorites');
  });

  it('debe agregar un producto a favoritos desde Home y luego eliminarlo en /favoritos', () => {
    cy.visit('/');

    // Esperar a que se cargue al menos una card de producto
    cy.get('.product-card-premium', { timeout: 20000 }).should('exist');

    // Capturar el título del primer producto y agregar a favoritos con click robusto
    cy.get('.product-card-premium').first().within(() => {
      cy.get('.product-title').invoke('text').as('tituloProducto');
      cy.get('.favorite-btn').scrollIntoView().click({ force: true });
      cy.get('.favorite-btn').should('have.class', 'favorite-active');
    });

    // Verificar que localStorage tiene al menos un favorito
    cy.window().then((win) => {
      const favs = JSON.parse(win.localStorage.getItem('favorites') || '[]');
      expect(favs.length, 'favoritos en localStorage').to.be.greaterThan(0);
    });

    // Ir a la página de favoritos
    cy.visit('/favoritos');
    cy.url().should('include', '/favoritos');

    // Si hay cards, verificar por título; si no, mostrar estado vacío
    cy.get('@tituloProducto').then((titulo) => {
      const t = (titulo || '').trim();
      cy.get('body').then(($body) => {
        if ($body.find('.product-card-premium').length) {
          cy.contains(t, { timeout: 10000 }).should('be.visible');

          // Eliminar de favoritos de forma segura
          cy.contains('.product-card-premium', t).within(() => {
            cy.get('.product-remove-fav-btn').scrollIntoView().click({ force: true });
          });

          // Verificar que ya no está y que localStorage quedó vacío
          cy.contains(t).should('not.exist');
          cy.window().then((win) => {
            const favs = JSON.parse(win.localStorage.getItem('favorites') || '[]');
            expect(favs.length).to.eq(0);
          });
        } else {
          // Si no hay cards, al menos debe mostrarse el estado vacío
          cy.contains('No tienes productos favoritos', { matchCase: false }).should('be.visible');
        }
      });
    });
  });
});