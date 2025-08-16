# Study Pack API Endpoints

This document provides a comprehensive list of all Study Pack API endpoints available in the Medcin Platform.

**Base URL:** `http://localhost:3005/api/v1`

## Public Endpoints

### Browse Study Packs
- **Endpoint:** `GET /study-packs`
- **Authentication:** Optional (enhanced data with authentication)
- **Description:** Browse available study packs with pagination and filtering
- **Query Parameters:**
  - `page` - Page number (default: 1)
  - `limit` - Items per page (default: 10)
  - `search` - Search term
  - `difficulty` - Filter by difficulty level
  - `isPaid` - Filter by paid/free status
  - `minPrice` - Minimum price filter
  - `maxPrice` - Maximum price filter
  - `sortBy` - Sort field
  - `sortOrder` - Sort direction (`asc` | `desc`)

### Get Study Pack Details
- **Endpoint:** `GET /study-packs/{id}`
- **Authentication:** Optional (enhanced data with authentication)
- **Description:** Get detailed information about a specific study pack including units, modules, and user progress

### Check Study Pack Access
- **Endpoint:** `GET /study-packs/{id}/access`
- **Authentication:** Required
- **Description:** Check if the authenticated user has access to a specific study pack
- **Response:** Returns access status, reason, and subscription requirements

## Student Endpoints

### Get User Subscriptions
- **Endpoint:** `GET /students/subscriptions`
- **Authentication:** Required (Student role)
- **Description:** Get current subscription information for the authenticated student
- **Response:** Returns active subscriptions, payment status, and access details

## Subscription Management

### Check Subscription Access
- **Endpoint:** `GET /subscriptions/check-access`
- **Authentication:** Required
- **Description:** Check subscription status for specific content
- **Query Parameters:**
  - `contentId` - ID of the content
  - `contentType` - Type of content (`study-pack` | `course`)

### Start Free Trial
- **Endpoint:** `POST /subscriptions/start-trial`
- **Authentication:** Required
- **Description:** Start a free trial for a subscription plan
- **Body:** `{ "planType": "string" }`

### Create Checkout Session
- **Endpoint:** `POST /subscriptions/checkout`
- **Authentication:** Required
- **Description:** Create a checkout session for subscription purchase
- **Body:** `{ "planId": "string" }`

## Admin Endpoints

### Get All Study Packs (Admin)
- **Endpoint:** `GET /admin/study-packs`
- **Authentication:** Required (Admin role)
- **Description:** Get all study packs for admin management with full details
- **Query Parameters:**
  - `page` - Page number
  - `limit` - Items per page

### Create Study Pack
- **Endpoint:** `POST /admin/study-packs`
- **Authentication:** Required (Admin role)
- **Description:** Create a new study pack
- **Body:**
  ```json
  {
    "name": "string",
    "description": "string",
    "type": "YEAR" | "RESIDENCY",
    "yearNumber": "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE" | "SIX",
    "price": number,
    "isActive": boolean
  }
  ```

### Update Study Pack
- **Endpoint:** `PUT /admin/study-packs/{id}`
- **Authentication:** Required (Admin role)
- **Description:** Update an existing study pack
- **Body:** Partial study pack data (same structure as create)

### Delete Study Pack
- **Endpoint:** `DELETE /admin/study-packs/{id}`
- **Authentication:** Required (Admin role)
- **Description:** Delete a study pack

## Content Management (Admin)

### Unit Management

#### Create Unit
- **Endpoint:** `POST /admin/content/unites`
- **Authentication:** Required (Admin role)
- **Description:** Create a new unit linked to a study pack
- **Body:**
  ```json
  {
    "name": "string",
    "description": "string",
    "studyPackId": number,
    "logoUrl": "string" (optional)
  }
  ```

#### Update Unit
- **Endpoint:** `PUT /admin/content/unites/{id}`
- **Authentication:** Required (Admin role)
- **Description:** Update an existing unit

#### Delete Unit
- **Endpoint:** `DELETE /admin/content/unites/{id}`
- **Authentication:** Required (Admin role)
- **Description:** Delete a unit

### Module Management

#### Create Module
- **Endpoint:** `POST /admin/content/modules`
- **Authentication:** Required (Admin role)
- **Description:** Create a new module linked to a unit
- **Body:**
  ```json
  {
    "name": "string",
    "description": "string",
    "uniteId": number
  }
  ```

#### Update Module
- **Endpoint:** `PUT /admin/content/modules/{id}`
- **Authentication:** Required (Admin role)
- **Description:** Update an existing module

#### Delete Module
- **Endpoint:** `DELETE /admin/content/modules/{id}`
- **Authentication:** Required (Admin role)
- **Description:** Delete a module

### Course Management

#### Create Course
- **Endpoint:** `POST /admin/content/courses`
- **Authentication:** Required (Admin/Employee role)
- **Description:** Create a new course linked to a module
- **Body:**
  ```json
  {
    "name": "string",
    "description": "string",
    "moduleId": number
  }
  ```

#### Update Course
- **Endpoint:** `PUT /admin/content/courses/{id}`
- **Authentication:** Required (Admin/Employee role)
- **Description:** Update an existing course

#### Delete Course
- **Endpoint:** `DELETE /admin/content/courses/{id}`
- **Authentication:** Required (Admin/Employee role)
- **Description:** Delete a course

## Related Endpoints

### Course Resources
- **Endpoint:** `GET /courses/{id}/resources`
- **Authentication:** Required
- **Description:** Get course resources with pagination and filtering
- **Query Parameters:**
  - `page` - Page number
  - `limit` - Items per page
  - `type` - Resource type filter

### Check Course Access
- **Endpoint:** `GET /courses/{id}/access`
- **Authentication:** Required
- **Description:** Check if the authenticated user has access to a specific course

## Response Format

All endpoints return responses in the following format:

```json
{
  "success": boolean,
  "data": object | array,
  "error": "string" (only on failure),
  "message": "string" (optional)
}
```

## Authentication

Most endpoints require authentication using Bearer tokens:

```
Authorization: Bearer <access_token>
```

Role-based access control is enforced for admin endpoints.
