# Task API — MongoDB/Mongoose Integration

A simple REST API built with Express and Mongoose for managing tasks and users, using MongoDB for persistent storage.

## Project Structure

```
├── config.js      # MongoDB connection
├── models.js      # User and Task schemas/models
├── main.js        # Express server, routes, and startup
├── package.json
└── .env           # MONGODB_URI and PORT
```

## Models

### User
| Field  | Type   | Constraints          |
|--------|--------|----------------------|
| name   | String | required, trimmed    |
| email  | String | required, unique, lowercase, trimmed |

### Task
| Field  | Type     | Constraints                               |
|--------|----------|-------------------------------------------|
| title  | String   | required, trimmed                         |
| status | String   | enum: `pending`, `in-progress`, `completed`, defaults to `pending` |
| user   | ObjectId | ref: `User`, required                     |

Both models include automatic `createdAt` / `updatedAt` timestamps.

## API Endpoints

All routes are prefixed with `/api`.

### Users

| Method   | Route            | Description       |
|----------|------------------|-------------------|
| `POST`   | `/api/users`     | Create a user     |
| `GET`    | `/api/users`     | Get all users     |
| `GET`    | `/api/users/:id` | Get user by ID    |
| `DELETE` | `/api/users/:id` | Delete a user     |

### Tasks

| Method   | Route            | Description       |
|----------|------------------|-------------------|
| `POST`   | `/api/tasks`     | Create a task     |
| `GET`    | `/api/tasks`     | Get all tasks     |
| `GET`    | `/api/tasks/:id` | Get task by ID    |
| `PUT`    | `/api/tasks/:id` | Update a task     |
| `DELETE` | `/api/tasks/:id` | Delete a task     |

Task responses populate the `user` field with `name` and `email`.

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally on port 27017

### Setup

```bash
# Install dependencies
npm install

# Set your MongoDB URI (default: localhost)
echo 'MONGODB_URI=mongodb://localhost:27017/task-api' > .env
echo 'PORT=5000' >> .env

# Start the server
npm start
```

### Development

```bash
npm run dev
```

Starts with `--watch` for auto-restart on file changes.

## Testing with curl

```bash
# Health check
curl http://localhost:5000/

# Create a user
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com"}'

# Get all users
curl http://localhost:5000/api/users

# Create a task (replace USER_ID with a real user _id)
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Set up MongoDB","status":"pending","user":"USER_ID"}'

# Get all tasks
curl http://localhost:5000/api/tasks

# Update a task
curl -X PUT http://localhost:5000/api/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'

# Delete a task
curl -X DELETE http://localhost:5000/api/tasks/TASK_ID
```
