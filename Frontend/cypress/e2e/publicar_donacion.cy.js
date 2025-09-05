describe('Publicar Donación', () => {
  beforeEach(() => {
    // Login usando el comando de soporte existente
    cy.loginToSwapWeb('naila@gmail.com', '1234');
  });

  it('debe crear una donación correctamente', () => {
    const titulo = `Donación de prueba ${Date.now()}`;

    // Ir a la página de publicar donación
    cy.goToPublishDonationPage();
    cy.url({ timeout: 15000 }).should('include', '/donaciones/publicar');

    // Completar formulario de donación (DonationCreateNew.jsx)
    cy.get('form.publicar-producto-form').should('exist');
    cy.get('#title').clear().type(titulo);
    cy.get('#condition').select('bueno');
    cy.get('#description').clear().type('Descripción detallada de la donación de prueba.');
    cy.get('#category').select('otros');
    cy.get('#pickupMethod').select('flexible');
    cy.get('#location').clear().type('CABA');

    // Subir al menos una imagen
    cy.get('input[type="file"]').invoke('removeAttr', 'disabled').invoke('removeAttr', 'style')
      .selectFile('cypress/fixtures/ejemplo.jpg', { force: true });

    // Enviar formulario - abre modal de confirmación
    cy.get('button.btn-publicar').click();

    // Confirmar en el modal (buscar botón por texto "Confirmar")
    cy.get('.modal-actions', { timeout: 15000 }).should('be.visible').within(() => {
      cy.contains('button', 'Confirmar').click();
    });

    // Debe redirigir al perfil tras el modal de gracias
    cy.url({ timeout: 30000 }).should('include', '/perfil');
  });
});