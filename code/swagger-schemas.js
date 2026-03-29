/**
 * Reusable Swagger/OpenAPI Schemas & Components
 *
 * This file contains all shared schemas, parameters, and responses.
 * Place it in your project's docs/ folder and include its path
 * in the swagger.js `apis` array.
 *
 * Customize these schemas to match your project's data models.
 */

// ─── TAGS ────────────────────────────────────────────────

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

// ─── SCHEMAS ─────────────────────────────────────────────

/**
 * @swagger
 * components:
 *   schemas:
 *
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
 *         phone:
 *           type: string
 *           example: "+15551234567"
 *         role:
 *           type: string
 *           enum: [admin, moderator, user]
 *         avatar:
 *           type: string
 *           format: uri
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           example: admin1
 *         password:
 *           type: string
 *           format: password
 *           example: Test1234!
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         user:
 *           $ref: '#/components/schemas/User'
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
 *           example: true
 *         hasPrev:
 *           type: boolean
 *           example: false
 *
 *     SuccessMessage:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Operation completed successfully.
 *
 *     Error:
 *       type: object
 *       properties:
 *         err:
 *           type: string
 *           example: Something went wrong.
 */

// ─── REUSABLE PARAMETERS ─────────────────────────────────

/**
 * @swagger
 * components:
 *   parameters:
 *     IdParam:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: integer
 *       description: Resource ID
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

// ─── REUSABLE RESPONSES ──────────────────────────────────

/**
 * @swagger
 * components:
 *   responses:
 *     Success:
 *       description: Operation successful
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SuccessMessage'
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
 *       description: Duplicate entry (unique constraint violation)
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             err: "Username already taken."
 *     TooManyRequests:
 *       description: Rate limit exceeded
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             err: "Too many attempts. Please try again later."
 */
