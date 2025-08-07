describe('Pruebas en SwapWeb', () => {
    beforeEach(() => {
      cy.visit('/');
    });
  
  it('Inicio de sesion exitoso', () => {
    const timestamp = Date.now();
    const email = `usuario${timestamp}@example.com`;
  
    cy.visit('/register');
    cy.get('input').eq(0).type('Jose');
    cy.get('input').eq(1).type('Paz');
    cy.get('input').eq(2).type(email);
    cy.get('input').eq(3).type('1234');
    cy.get('input').eq(4).type('1234');
    cy.get('button[type="submit"]').click();
  
    cy.url().should('include', '/login');
  });
  
  it ('Inicio de sesion fallido (email existente)', () =>{
    cy.visit ('/register');
    cy.get('input[placeholder="Nombre"]').should('exist').type('Maria');
    cy.get('input[placeholder="Apellido"]').should('exist').type('Lopez')
    cy.get('input[placeholder="Correo electrónico"]').should('exist').type('marialopez@example.com');
    cy.get('input[placeholder="Contraseña"]').type('1234');
    cy.get('input[placeholder="Confirmar contraseña"]').type('1234')
    cy.get('button[type="submit"]').click();
  
    cy.contains('El email ya está registrado');
    });
  
  it('No permite enviar formulario vacío', () => {
    cy.visit('/register');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/register');
  });
  
  it('Login exitoso', ()=>{
      cy.visit('/login')
      cy.get('input[placeholder="Correo electrónico"]').should('exist').type('cirov@example.com');
      cy.get('input[placeholder="Contraseña"]').type('1234');
      cy.get('button[type="submit"]').click();
  
      cy.url().should('include', '/perfil/1750738895539'); 
    });
  
  it('No permite enviar login vacío', () => {
    cy.visit('/login');
    cy.get('button[type="submit"]').click();
    
    cy.url().should('include', '/login');
  });
  
  it ('Login fallido', () =>{
      cy.visit('/login');
      cy.get('input[placeholder="Correo electrónico"]').should('exist').type('cirovaldez@example.com');
      cy.get('input[placeholder="Contraseña"]').type('123');
      cy.get('button[type="submit"]').click();
  
      cy.contains('Usuario no encontrado');
    });
  
  it('Login fallido (contraseña incorrecta)', () =>{
      cy.visit('/login')
      cy.get('input[placeholder="Correo electrónico"]').should('exist').type('cirov@example.com');
      cy.get('input[placeholder="Contraseña"]').type('123');
      cy.get('button[type="submit"]').click();
  
      cy.contains('Contraseña incorrecta');
    });
  
  it('Login fallido (email incorrecto)', () =>{
      cy.visit('/login')
      cy.get('input[placeholder="Correo electrónico"]').should('exist').type('cirovaldez@example.com');
      cy.get('input[placeholder="Contraseña"]').type('1234');
      cy.get('button[type="submit"]').click();
  
      cy.contains('Usuario no encontrado');
    });
  });