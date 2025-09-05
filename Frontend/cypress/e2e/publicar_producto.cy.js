describe ('Crear producto', () => {
beforeEach(() => {
  cy.loginToSwapWeb('naila@gmail.com', '1234')
});

it('debe crear un producto correctamente', () => {
    // Ir a "Publicar producto"
    cy.goToPublishPage();
    cy.url({ timeout: 10000 }).should('include', '/publicarproducto');

    // Completar formulario básico
    cy.fillProductForm({
      title: 'Auriculares de prueba',
      description: 'Auriculares usados en excelente estado',
      category: 'tecnologia',     
    });

    // Subir imagen de prueba desde fixtures
    cy.uploadProductImage('ejemplo.jpg');

    // Publicar y confirmar
    cy.confirmPublish();

    // Verificar redirección a perfil
    cy.url({ timeout: 20000 }).should('include', '/perfil');

    // Verificar que el producto aparece en el perfil
    cy.contains('Auriculares de prueba', { timeout: 15000 }).should('be.visible');
  });
});