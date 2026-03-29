/**
 * Swagger / OpenAPI Configuration
 *
 * Usage:
 *   1. Copy this file into your project (e.g., config/swagger.js)
 *   2. Update info, servers, and apis paths
 *   3. Call setupSwagger(app) in your app.js
 *
 * Install:
 *   npm install swagger-jsdoc swagger-ui-express
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: process.env.API_TITLE || 'My API',
      version: process.env.API_VERSION || '1.0.0',
      description: process.env.API_DESCRIPTION || 'API Documentation',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development',
      },
      // Add more servers as needed:
      // { url: 'https://api.example.com', description: 'Production' },
      // { url: 'https://staging-api.example.com', description: 'Staging' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
    },
    // Apply JWT globally (override per-endpoint with security: [])
    security: [{ bearerAuth: [] }],
  },
  // Paths to files with @swagger JSDoc comments
  apis: [
    './routes/*.js',
    './routes/**/*.js',
    './docs/swagger-schemas.js', // Reusable schemas file
  ],
};

const swaggerSpec = swaggerJsdoc(options);

/**
 * Mount Swagger UI and JSON spec on an Express app.
 *
 * @param {import('express').Application} app
 * @param {string} [path='/api-docs'] - URL path for the Swagger UI
 */
function setupSwagger(app, path = '/api-docs') {
  // Interactive Swagger UI
  app.use(
    path,
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'API Documentation',
      swaggerOptions: {
        persistAuthorization: true, // Keep token across page reloads
        docExpansion: 'none', // Collapse all by default
        filter: true, // Enable search/filter bar
        tryItOutEnabled: true,
      },
    })
  );

  // Raw JSON spec endpoint (for Postman import, code generators, etc.)
  app.get(`${path}.json`, (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`Swagger docs available at ${path}`);
}

module.exports = { setupSwagger, swaggerSpec };
