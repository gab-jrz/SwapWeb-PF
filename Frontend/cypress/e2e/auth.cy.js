describe('Auth en SwapWeb', () => {

  it('Inicio de sesion exitoso', () => {
  const timestamp = Date.now();
   const email = `usuario${timestamp}@example.com`;
   cy.viewport(1280, 720)   // Ancho = 1280px, Alto = 720px (pantalla de notebook común)

    cy.visit('/register');
    cy.get('input[placeholder="Nombre"]').type('Jose');
    cy.get('input[placeholder="Apellido"]').type('Paz');
    cy.get('input[placeholder="Correo electrónico"]').type(email);
    cy.get('input[placeholder="Contraseña"]').type('1234');
    cy.get('input[placeholder="Confirmar contraseña"]').type('1234');
    cy.get('button[type="submit"]').click();

    // Redirige a Home tras registrarse
    cy.location('pathname').should('eq', '/')
  });
  

  it('Login exitoso con usuario existente', () => {
    cy.loginToSwapWeb('naila@gmail.com', '1234');
    cy.location('pathname', { timeout: 10000 }).should('eq', '/');

    // Verificar localStorage actualizado
    cy.window().then((win) => {
      expect(win.localStorage.getItem('isLoggedIn')).to.eq('true');
      const usuario = win.localStorage.getItem('usuarioActual');
      expect(usuario, 'usuarioActual presente').to.exist;
    });
  });
  
  it('Muestra error en login inválido', () => {
    cy.visit('/login');
    cy.get('input[placeholder="Correo electrónico"]').type('naila@gmail.com');
    cy.get('input[placeholder="Contraseña"]').type('clave_incorrecta');
    cy.get('button[type="submit"]').click();

    cy.get('.error-message', { timeout: 10000 }).should('be.visible');
    cy.url().should('include', '/login');
  });

});