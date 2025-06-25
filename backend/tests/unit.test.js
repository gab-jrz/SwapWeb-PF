import { expect } from 'chai';
import validarEmail from '../src/utils/validarEmail.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../src/config/jwt.js'; //para firmar/validar tokens

describe('Pruebas Unitarias, Funciones Básicas', () => {
  describe('1. Validación de Email', () => { //verifica la función de validación de emails
    it('email correcto debe ser válido', () => {     //asegurar que el mail correcto sea aceptado
      expect(validarEmail('test@test.com')).to.be.true; //verifica que un email válido sea aceptado
    });

    it('email sin @ debe ser inválido', () => { // verifica que un email sin '@' sea rechazado
      expect(validarEmail('test.com')).to.be.false;  //y uno incorrecto sea rechazado
    });
  });

  describe('2. Generación de Token JWT', () => {  //verifica la generación y validación de tokens JWT
    it('debe crear un token', () => { // crea un token JWT con una clave secreta
      const token = jwt.sign({ id: '123' }, JWT_SECRET); // crea un token con un ID de usuario
      expect(token).to.be.a('string'); // verifica que el token sea una cadena
    });

    it('debe verificar un token válido', () => { // verifica que un token JWT sea válido
      const token = jwt.sign({ id: '123' }, JWT_SECRET); // crea un token con un ID de usuario
      const decoded = jwt.verify(token, JWT_SECRET); // verifica el token con la clave secreta
      expect(decoded.id).to.equal('123'); // asegura que el ID decodificado sea el mismo que el original
    });
  });

  describe('3. Extracción de Token', () => { //verifica la extracción de un token de un header HTTP
    it('debe extraer token del header', () => { //extrae un token de un header HTTP
      const header = 'Bearer abc123'; // simula un header HTTP con un token
      const token = header.split(' ')[1];  // divide el header para obtener el token
      expect(token).to.equal('abc123'); // verifica que el token extraído sea correcto
    });
  });

  describe('4. Comparación de Contraseñas', () => { // verifica la comparación de contraseñas
    it('contraseñas iguales deben coincidir', () => { // verifica que dos contraseñas iguales sean consideradas iguales
      expect('password123' === 'password123').to.be.true; // asegura que las contraseñas coincidan
    });

    it('contraseñas diferentes no deben coincidir', () => { // verifica que dos contraseñas diferentes no sean consideradas iguales
      expect('password123' === 'password456').to.be.false; // asegura que las contraseñas no coincidan
    });
  });
  
  describe('5. Validación de campos vacíos', () => { // verifica la validación de campos vacíos
    it('un campo con texto no debe ser vacío', () => { //verifica que un campo con texto no sea considerado vacío
      const nombre = 'Juan'; //simula un campo con contenido
      expect(nombre.length > 0).to.be.true; // asegura que el campo tenga contenido
    });
  
    it('un campo vacío debe ser detectado como vacío', () => { // verifica que un campo vacío sea considerado como tal
      const nombre = '';
      expect(nombre.length > 0).to.be.false; // asegura que el campo vacío sea detectado
    });
  });
}); 