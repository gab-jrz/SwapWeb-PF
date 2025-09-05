//AUTENTICACIÓN 

// Comando para iniciar sesión
Cypress.Commands.add('loginToSwapWeb', (email, password) => {
    cy.visit('/login');
    cy.get('input[placeholder="Correo electrónico"]').type(email);
    cy.get('input[placeholder="Contraseña"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/login');
  });
  
  // Comando para registrarse rápidamente
  Cypress.Commands.add('registerToSwapWeb', (user) => {
    cy.visit('/register');
    cy.get('input[placeholder="Nombre"]').type(user.nombre);
    cy.get('input[placeholder="Apellido"]').type(user.apellido);
    cy.get('input[placeholder="Correo electrónico"]').type(user.email);
    cy.get('input[placeholder="Contraseña"]').type(user.password);
    cy.get('input[placeholder="Confirmar contraseña"]').type(user.password);
    cy.get('button[type="submit"]').click();
    cy.location('pathname', { timeout: 10000 }).should('eq', '/');
  });
  
  //PUBLICAR PRODUCTO
  
  // Ir a la página de publicar producto
  Cypress.Commands.add('goToPublishPage', () => {
    cy.visit('/publicarproducto');
    cy.get('form.publicar-producto-form').should('exist');
  });
  
  // Completar formulario de producto
  Cypress.Commands.add('fillProductForm', (product) => {
    if (product.title) cy.get('#title').clear().type(product.title);
    if (product.description) cy.get('#description').clear().type(product.description);
    if (product.category) cy.get('#categoria').select(product.category);
  });
  
  // Subir imagen de producto
  Cypress.Commands.add('uploadProductImage', (filename) => {
    cy.get('input[type="file"]')
      .invoke('removeAttr', 'disabled')
      .invoke('removeAttr', 'style')
      .selectFile(`cypress/fixtures/${filename}`, { force: true });
  
    cy.get('input[type="file"]').then($input => {
      expect($input[0].files.length, 'archivo subido').to.be.greaterThan(0);
    });
  });
  
  // Confirmar publicación
  Cypress.Commands.add('confirmPublish', () => {
    cy.get('button.btn-publicar').click();
   // cy.get('.modal, .modal-content, .modal-dialog', { timeout: 10000 }).should('be.visible');

   cy.get('button[type="submit"]').click();

 cy.get('.modal-actions', { timeout: 10000 })
  .should('be.visible')             // asegurarse que el modal está
  .within(() => {
    cy.get('.btn-confirmar').click(); // ahora sí hacer click dentro del modal
  });
  });
  // Ir a la página de publicar donación
Cypress.Commands.add('goToPublishDonationPage', () => {
  cy.visit('/donaciones/publicar');
  cy.get('form.publicar-producto-form').should('exist');
});

// Confirmar publicación de donación
Cypress.Commands.add('confirmDonationPublish', () => {
  cy.get('button.btn-publicar').click();

  cy.get('.modal-actions', { timeout: 10000 })
    .should('be.visible')
    .within(() => {
      cy.get('.btn-confirmar').click();
    });
});

  // NAVEGACIÓN
  
  Cypress.Commands.add('goToSection', (section) => {
    cy.contains(section).click();
  
    switch (section) {
      case 'Explorar productos':
        cy.url().should('include', '/');
        break;
      case 'Publicar producto':
        cy.url().should('include', '/publicarproducto');
        break;
      case 'Favoritos':
        cy.url().should('include', '/favoritos');
        break;
      case 'Perfil':
        cy.url().should('include', '/perfil');
        break;
    }
  });
  
  //VERIFICACIONES 
  
  // Verificar producto en resultados
  Cypress.Commands.add('verifyProductInResults', (title, shouldExist = true) => {
    if (shouldExist) {
      cy.contains(title, { timeout: 10000 }).should('be.visible');
    } else {
      cy.contains(title).should('not.exist');
    }
  });
  
  // Verificar mensajes de éxito/error
  Cypress.Commands.add('verifyMessage', (message, type) => {
    const className = type === 'success' ? '.success-message' : '.error-message';
    cy.get(className).should('contain', message);
  });
  