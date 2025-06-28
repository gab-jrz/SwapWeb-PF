export default {
    crearCuenta: function(nombre, apellido, email, contraseña){
        if (!nombre || !apellido || !email || !contraseña) { //valida los campos
            throw new Error('Todos los campos deben ser completados');
        } 
        return {nombre, apellido, email, contraseña};
    },
    login: function (email, contraseña) {
        if (!email || !contraseña) {
            throw new Error('Email y contraseña son requeridos');
        }
        if (email !== 'jperez@example.com') {
            throw new Error('Usuario no encontrado');
        }
        if (contraseña !== '1234') {
            throw new Error('Contraseña invalida');
        }
        return { token: 'abc123' };
    },
    publicarProducto: function (Titulo_del_producto, descripcion, categoria, imagen){
        if (!Titulo_del_producto || !descripcion || !categoria || !imagen){
            throw new Error ('Faltan datos del producto')
        }
        return {Titulo_del_producto, descripcion, categoria, imagen}
    },
    intercambiarProducto: function (logueado){
        if(!logueado){
            return 'Debes tener una cuenta para consultar';
        }
        return 'Intercambio exitoso';
    }
};