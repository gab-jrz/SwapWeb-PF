function sanitizarTexto(texto) {
    return texto.trim().replace(/[<>]/g, "");
  }
  
  module.exports = { sanitizarTexto };
  