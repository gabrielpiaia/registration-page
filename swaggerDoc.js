// swaggerDoc.js
const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0', // versão do OpenAPI
    info: {
      title: 'API de Autenticação',
      version: '1.0.0',
      description: 'Documentação da API de autenticação usando JWT e MySQL',
    },
  },
  apis: ['./swaggerRoutes.js'], // Arquivo contendo as anotações Swagger das rotas
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;