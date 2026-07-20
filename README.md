ScopeLock

MERN app for freelancers to lock project scope, classify client requests, and manage change orders.

Folder structure

- client/  React frontend
- server/  Express API

Local setup

1. Copy server/.env.example to server/.env and fill in values
2. Copy client/.env.example to client/.env and set REACT_APP_API_BASE_URL
3. Install server dependencies: cd server && npm install
4. Install client dependencies: cd client && npm install
5. Start API: cd server && npm run dev
6. Start app: cd client && npm start

Deployment notes and full API docs will be added when the app is complete.

Required env (server)

- PORT
- MONGODB_URI
- JWT_SECRET
- JWT_EXPIRY
- CLIENT_ORIGIN
- NODE_ENV

Required env (client)

- REACT_APP_API_BASE_URL
