describe('Búsqueda de productos', () => {
  it('debe filtrar productos por término de búsqueda', () => {
    cy.visit('/');

    // Esperar a que se carguen las cards
    cy.get('.product-card-premium', { timeout: 20000 }).should('have.length.greaterThan', 0);

    // Contar cantidad inicial
    cy.get('.product-card-premium').then(($items) => {
      const initialCount = $items.length;
      cy.wrap(initialCount).as('initialCount');
    });

    // Tomar el título del primer producto
    cy.get('.product-card-premium').first().within(() => {
      cy.get('.product-title').invoke('text').then((fullTitle) => {
        const term = fullTitle.trim().split(/\s+/)[0]; // primera palabra del título
        cy.wrap({ fullTitle: fullTitle.trim(), term }).as('searchData');
      });
    });

    // Escribir el término en el buscador de Home
    cy.get('@searchData').then(({ term }) => {
      cy.get('input.search-input-premium-v2').clear().type(term);
    });

    // Verificar que los resultados se reducen y contienen el producto esperado
    cy.get('.product-card-premium', { timeout: 10000 }).should('have.length.greaterThan', 0);
    cy.get('.product-card-premium').then(($filtered) => {
      cy.get('@initialCount').then((initialCount) => {
        expect($filtered.length).to.be.at.most(initialCount);
      });
    });

    cy.get('@searchData').then(({ fullTitle }) => {
      cy.contains('.product-title', fullTitle, { timeout: 10000 }).should('be.visible');
    });

    // Limpiar búsqueda y verificar que vuelve a aumentar o igualar
    cy.get('input.search-input-premium-v2').clear();
    cy.get('.product-card-premium', { timeout: 10000 }).then(($afterClear) => {
      cy.get('@initialCount').then((initialCount) => {
        expect($afterClear.length).to.be.at.least(initialCount);
      });
    });
  });
});