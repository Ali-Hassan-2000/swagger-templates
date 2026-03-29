# Swagger / OpenAPI Setup Guide for Express.js

> A general-purpose guide to adding interactive API documentation to any Express.js project using `swagger-jsdoc` and `swagger-ui-express`.

---

## Table of Contents

1. [Installation](#installation)
2. [Basic Setup](#basic-setup)
3. [Writing API Docs with JSDoc Comments](#writing-api-docs-with-jsdoc-comments)
4. [Common Patterns](#common-patterns)
5. [Authentication (JWT Bearer)](#authentication-jwt-bearer)
6. [Reusable Schemas (Components)](#reusable-schemas-components)
7. [File Uploads](#file-uploads)
8. [Pagination](#pagination)
9. [Error Responses](#error-responses)
10. [Grouping with Tags](#grouping-with-tags)
11. [Environment-Based Config](#environment-based-config)
12. [Serving a Static JSON/YAML Spec](#serving-a-static-jsonyaml-spec)
13. [Tips and Best Practices](#tips-and-best-practices)

---

## Installation

```bash
npm install swagger-jsdoc swagger-ui-express
```

| Package | Purpose |
|---------|---------|
| `swagger-jsdoc` | Scans JSDoc comments in your route files and generates an OpenAPI 3.0 spec |
| `swagger-ui-express` | Serves the Swagger UI at a route (e.g., `/api-docs`) |

---

## Basic Setup

Create a file called `swagger.js` (or `config/swagger.js`) in your project:

```js
// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'API documentation for My Project',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Development' },
      { url: 'https://api.example.com', description: 'Production' },
    ],
  },
  // Path to files containing JSDoc annotations
  apis: ['./routes/*.js', './routes/**/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
  // Serve Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'My API Docs',
  }));

  // Serve raw JSON spec (useful for Postman import, code generators, etc.)
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

module.exports = { setupSwagger, swaggerSpec };
```

Then in your `app.js` or `server.js`:

```js
const express = require('express');
const { setupSwagger } = require('./swagger');

const app = express();

// ... your middleware ...

// Setup Swagger (only in non-production, or always - your choice)
if (process.env.NODE_ENV !== 'production') {
  setupSwagger(app);
}

// ... your routes ...

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
  console.log('Swagger docs at http://localhost:3000/api-docs');
});
```

Visit `http://localhost:3000/api-docs` to see the interactive UI.

---

## Writing API Docs with JSDoc Comments

Add `@swagger` (or `@openapi`) comments directly above your route handlers:

### Simple GET endpoint

```js
/**
 * @swagger
 * /users:
 *   get:
 *     summary: List all users
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 15
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', authMiddleware, userController.list);
```

### POST endpoint with request body

```js
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: MyPass123!
 *               role:
 *                 type: string
 *                 enum: [admin, moderator, user]
 *                 default: user
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created successfully.
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.post('/', authMiddleware, userController.create);
```

### GET by ID with path parameter

```js
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', authMiddleware, userController.getById);
```

### PUT (update)

```js
/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:id', authMiddleware, userController.update);
```

### DELETE

```js
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User deleted successfully.
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', authMiddleware, userController.remove);
```

---

## Common Patterns

### Authentication (JWT Bearer)

Define the security scheme once (put this in any file scanned by `apis`):

```js
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Enter your JWT token (without "Bearer " prefix)
 */
```

Then reference it per-endpoint:

```yaml
security:
  - bearerAuth: []
```

Or apply globally in your `swagger.js` options:

```js
definition: {
  // ...
  security: [{ bearerAuth: [] }],
}
```

### Public Endpoints

Override global security for public endpoints:

```js
/**
 * @swagger
 * /auth/sign-in:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 *     security: []
 *     ...
 */
```

---

## Reusable Schemas (Components)

Define schemas once, reference them everywhere with `$ref`:

```js
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         username:
 *           type: string
 *           example: johndoe
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         role:
 *           type: string
 *           enum: [admin, moderator, user]
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     Pagination:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 150
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 15
 *         totalPages:
 *           type: integer
 *           example: 10
 *         hasNext:
 *           type: boolean
 *         hasPrev:
 *           type: boolean
 *
 *     Error:
 *       type: object
 *       properties:
 *         err:
 *           type: string
 *           example: Something went wrong.
 */
```

Reference in endpoints:

```yaml
schema:
  $ref: '#/components/schemas/User'
```

---

## File Uploads

```js
/**
 * @swagger
 * /users/me/avatar:
 *   post:
 *     summary: Upload profile photo
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPEG, PNG, WEBP, max 5MB)
 *     responses:
 *       200:
 *         description: Avatar uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 avatar:
 *                   type: string
 *                   format: uri
 */
```

### Multiple file upload

```js
/**
 * @swagger
 * /orders/{id}/proof:
 *   post:
 *     summary: Upload proof photos
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Up to 5 images (max 5MB each)
 *               latitude:
 *                 type: number
 *                 format: float
 *                 example: 40.7128
 *               longitude:
 *                 type: number
 *                 format: float
 *                 example: -74.0060
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Proof uploaded
 */
```

---

## Pagination

Reusable pagination query parameters (define once, use in all list endpoints):

```js
/**
 * @swagger
 * components:
 *   parameters:
 *     PageParam:
 *       in: query
 *       name: page
 *       schema:
 *         type: integer
 *         default: 1
 *         minimum: 1
 *       description: Page number
 *     LimitParam:
 *       in: query
 *       name: limit
 *       schema:
 *         type: integer
 *         default: 15
 *         minimum: 1
 *         maximum: 100
 *       description: Items per page
 *     SearchParam:
 *       in: query
 *       name: search
 *       schema:
 *         type: string
 *       description: Search keyword
 *     SortByParam:
 *       in: query
 *       name: sortBy
 *       schema:
 *         type: string
 *         default: createdAt
 *       description: Field to sort by
 *     SortOrderParam:
 *       in: query
 *       name: sortOrder
 *       schema:
 *         type: string
 *         enum: [asc, desc]
 *         default: desc
 *       description: Sort direction
 *     DateFromParam:
 *       in: query
 *       name: dateFrom
 *       schema:
 *         type: string
 *         format: date
 *       description: Filter from date (YYYY-MM-DD)
 *     DateToParam:
 *       in: query
 *       name: dateTo
 *       schema:
 *         type: string
 *         format: date
 *       description: Filter to date (YYYY-MM-DD)
 */
```

Reference in endpoints:

```yaml
parameters:
  - $ref: '#/components/parameters/PageParam'
  - $ref: '#/components/parameters/LimitParam'
  - $ref: '#/components/parameters/SearchParam'
  - $ref: '#/components/parameters/SortByParam'
  - $ref: '#/components/parameters/SortOrderParam'
```

---

## Error Responses

Define reusable error responses:

```js
/**
 * @swagger
 * components:
 *   responses:
 *     BadRequest:
 *       description: Validation error or missing required field
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             err: "Validation failed: email is required."
 *     Unauthorized:
 *       description: Missing or invalid JWT token
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             err: "Authentication required."
 *     Forbidden:
 *       description: Insufficient permissions
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             err: "Access denied."
 *     NotFound:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             err: "Resource not found."
 *     Conflict:
 *       description: Duplicate entry (unique constraint)
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             err: "Username already taken."
 */
```

---

## Grouping with Tags

Define tag descriptions at the top of any scanned file:

```js
/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication and account management
 *   - name: Users
 *     description: User CRUD and profile management
 *   - name: Orders
 *     description: Order operations
 *   - name: Settings
 *     description: Application configuration
 *   - name: Dashboard
 *     description: Analytics and statistics
 */
```

---

## Environment-Based Config

```js
// swagger.js
const servers = [];

if (process.env.NODE_ENV === 'production') {
  servers.push({ url: process.env.API_URL, description: 'Production' });
} else {
  servers.push(
    { url: `http://localhost:${process.env.PORT || 3000}`, description: 'Local Development' },
    { url: 'https://staging-api.example.com', description: 'Staging' }
  );
}

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: process.env.API_TITLE || 'My API',
      version: process.env.API_VERSION || '1.0.0',
      description: process.env.API_DESCRIPTION || 'API Documentation',
    },
    servers,
  },
  apis: ['./routes/*.js', './routes/**/*.js'],
};
```

---

## Serving a Static JSON/YAML Spec

If you prefer writing the spec manually instead of using JSDoc comments:

```js
const YAML = require('yamljs'); // npm install yamljs
const swaggerUi = require('swagger-ui-express');

// From JSON file
const swaggerSpec = require('./openapi.json');

// OR from YAML file
const swaggerSpec = YAML.load('./openapi.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

---

## Tips and Best Practices

1. **Keep schemas DRY** - Define once in `components/schemas`, reference with `$ref` everywhere.

2. **One schema file** - Put all `components` definitions in a single file (e.g., `swagger-schemas.js`) to keep route files clean.

3. **Use `example` values** - They show up in the "Try it out" feature and make the docs much more useful.

4. **Document all status codes** - At minimum: 200/201 (success), 400 (validation), 401 (auth), 403 (permission), 404 (not found).

5. **Security per endpoint** - Use `security: []` for public routes, `security: [{ bearerAuth: [] }]` for protected ones.

6. **Disable in production** (optional) - Wrap `setupSwagger()` in an env check if you don't want public docs.

7. **Export the spec** - The `/api-docs.json` endpoint lets you import directly into Postman, Insomnia, or any OpenAPI tool.

8. **Validate your spec** - Use [Swagger Editor](https://editor.swagger.io/) to paste your JSON and check for errors.

9. **Version your API** - Use `servers` to list versioned base URLs (e.g., `/api/v1`, `/api/v2`).

10. **Custom CSS** - Pass `customCss` to `swaggerUi.setup()` to match your brand.

---

## Folder Structure (Recommended)

```
project/
  config/
    swagger.js            # Swagger setup + options
  routes/
    auth.routes.js        # @swagger comments + route handlers
    user.routes.js
    order.routes.js
  docs/
    swagger-schemas.js    # All component schemas in one file
  app.js                  # setupSwagger(app) call
```

---

## Quick Reference: OpenAPI Types

| Type | Format | Example |
|------|--------|---------|
| `string` | — | `"hello"` |
| `string` | `email` | `"user@example.com"` |
| `string` | `password` | `"********"` |
| `string` | `date` | `"2026-01-15"` |
| `string` | `date-time` | `"2026-01-15T10:30:00Z"` |
| `string` | `uri` | `"https://example.com"` |
| `string` | `binary` | File upload |
| `integer` | `int32` | `42` |
| `number` | `float` | `3.14` |
| `boolean` | — | `true` |
| `array` | — | `[1, 2, 3]` |
| `object` | — | `{ "key": "value" }` |

---

*This guide covers OpenAPI 3.0 with swagger-jsdoc v6+ and swagger-ui-express v5+.*
