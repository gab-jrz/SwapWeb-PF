
import main from '../src/utils/main.js';
import {assert, expect, should} from 'chai';

describe ('Pruebas de autenticación', function(){
    it('Crear cuenta válida', function(){
      //arrange
      const nombre = 'Juan';
      const apellido ='Perez';
      const email = 'jperez@example.com';
      const contraseña = '1234';
      //act
      const resultado = main.crearCuenta(nombre, apellido, email,contraseña);
      //assert
      resultado.should.include({ nombre: 'Juan'});
    });

    it('Crear cuenta con datos incompletos', function () {
      //arrange
      const nombre = 'Juan';
      const apellido = '';
      const email = 'jperez@example.com';
      const contraseña = '';
      // act y assert
      expect(() => main.crearCuenta(nombre, apellido, email, contraseña)).to.throw('Todos los campos deben ser completados');
    });

    it('Crear cuenta con campos vacios', function (){
     expect(() => main.crearCuenta('', '', '', '')).to.throw();
    });

    it ('Login valido', function (){
    //arrange 
    const email = 'jperez@example.com';
    const contraseña = '1234';
    //act
    const resultado = main.login(email, contraseña);
    //assert
    resultado.should.have.property('token');
  });
    it('Login invalido', function (){
      //arrange
      const email = 'juperez@exmple.com';
      const contraseña = '123';
      //act y assert
      (() => main.login(email, contraseña)).should.throw('Usuario no encontrado');
    });

    it('Login vacio', function (){
      expect(() => main.login('', '')).to.throw();
    });

    it('Login con contraseña invalida', function(){
    //arrange 
    const email= 'jperez@example.com';
    const contraseña= '12';
    //act y assert
     expect(() => main.login(email, contraseña)).to.throw('Contraseña invalida');
  });

    it('Login con email invalido', function(){
    //arrange 
    const email= 'juanperez@example.com';
    const contraseña= '1234';
    //act y assert
  (() => main.login(email, contraseña)).should.throw('Usuario no encontrado');
});
});