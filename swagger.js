const swaggerAutogen = require('swagger-autogen')();
const outputFile = './swagger-output.json';
const endpointsFiles = ['./routes/clothes.js'];

swaggerAutogen(outputFile, endpointsFiles).then(() => {
  console.log('Swagger documentation generated successfully');
  require('./server');
});