import swaggerAutogen from 'swagger-autogen';
import path from 'path';

const doc = {
  info: {
    title: 'Backend Node.js API',
    description: 'Auto-generated API documentation',
  },
  host: 'localhost:8000',
  schemes: ['http'],
};

const outputFile = path.join(__dirname, '../docs/swagger-output.json');
const endpointsFiles = [
  path.join(__dirname, '../app.ts'),
  path.join(__dirname, '../routes/apiRoutes.ts')
];

swaggerAutogen()(outputFile, endpointsFiles, doc);
