import chai from 'chai';
import main from '../src/utils/main.js';
import {assert, expect, should} from 'chai';
    
    describe ('Pruebas de producto', function(){
    it('Consultar sin login', function () {
        //arrange
       const logueado = false;
       //act
       const resultado = main.intercambiarProducto(logueado);
       //assert
       assert.equal(resultado, 'Debes tener una cuenta para consultar');
  });
  
    it('Consultar con login', function () {
      //arrange
    const logueado = true;
      //act
    const resultado = main.intercambiarProducto(logueado);
      //assert
    assert.equal(resultado, 'Intercambio exitoso');
  });

    it('Publicar producto válido', function (){
        //arrange
        const Titulo_del_producto = 'Iphone 12';
        const descripcion= 'Iphone 12 con 128 gb, excelente estado.';
        const categoria='Tecnologia';
        const imagen= true;
        //act
        const resultado = main.publicarProducto(Titulo_del_producto, descripcion, categoria, imagen);
        //assert
        expect(resultado).to.include({ 
            Titulo_del_producto: 'Iphone 12', 
            descripcion: 'Iphone 12 con 128 gb, excelente estado.',
            categoria: 'Tecnologia', 
            imagen: true});
    });

    it('Publicar producto con campo incompleto', function(){
        //arrange 
        const Titulo_del_producto = 'Iphone 12';
        const descripcion = '';
        const categoria = 'Tecnologia';
        const imagen= true;
        //act y assert
        expect (()=> main.publicarProducto(Titulo_del_producto, descripcion, categoria, imagen)).to.throw
        ('Faltan datos del producto');
    });
});
       

