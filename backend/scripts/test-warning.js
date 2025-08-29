#!/usr/bin/env node

console.log('\n🚨 AVISO IMPORTANTE - CONFIGURACIÓN DE TESTS 🚨');
console.log('====================================================');
console.log('Los tests están configurados para usar una base de datos separada:');
console.log('📁 Base de datos de TEST: mongodb://localhost:27017/swapweb_test');
console.log('📁 Base de datos de PROD: Tu MongoDB Atlas actual');
console.log('');
console.log('✅ Esto significa que tus datos de producción están SEGUROS');
console.log('🔄 Los tests solo borran datos de la BD de test, no de producción');
console.log('');
console.log('Para ejecutar tests de forma segura:');
console.log('npm test                    # Ejecuta todos los tests');
console.log('npm run test:products       # Solo tests de productos');
console.log('npm run test:users          # Solo tests de usuarios');
console.log('====================================================\n');
