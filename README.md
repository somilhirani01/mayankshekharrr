ScopeLock

MERN web app for freelancers. Lock a project's scope as deliverables and hours, share a client portal link, classify incoming requests against that scope, and price out-of-scope work as change orders.

Stack

- Frontend: React, React Router, Axios
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Auth: JWT for freelancers, portal token for clients

Project layout

- client/   React app
- server/   Express API
- README.md

Local setup

Prerequisites

- Node.js 18 or later
- MongoDB 6 or later (local or Atlas)

1. Clone the repository

2. Configure the API

   cd server
   cp .env.example .env

   Fill in:

   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/scopelock
   JWT_SECRET=replace-with-a-long-random-string
   JWT_EXPIRY=7d
   CLIENT_ORIGIN=http://localhost:3000
   NODE_ENV=development

3. Configure the client

   cd client
   cp .env.example .env

   Fill in:

   REACT_APP_API_BASE_URL=http://localhost:5000

4. Install dependencies

   cd server && npm install
   cd ../client && npm install

5. Seed demo data (optional)

   cd server
   npm run seed

   Demo login:
   email: demo@example.com
   password: demo1234

   The seed script also prints the client portal path.

6. Run the API

   cd server
   npm run dev

7. Run the client

   cd client
   npm start

   Open http://localhost:3000

Deployment

MongoDB Atlas

1. Create a cluster and database user
2. Allow network access from Render (or 0.0.0.0/0 for testing)
3. Copy the connection string into Render as MONGODB_URI

Backend on Render

Important: this repo is a monorepo. The API lives in the server folder.

1. Create a Web Service from this GitHub repo
2. Set these exactly:

   Root Directory: server
   Runtime: Node
   Build Command: npm install
   Start Command: npm start

   Do not set Build Command to only "npm" (that fails).

3. Set environment variables:

   MONGODB_URI=<atlas connection string>
   JWT_SECRET=<long random secret>
   JWT_EXPIRY=7d
   CLIENT_ORIGIN=<your Vercel frontend URL>
   NODE_ENV=production

   Do not set PORT manually. Render provides PORT automatically.

4. Deploy / Manual Deploy -> Deploy latest commit

Frontend on Vercel

1. Import this repo into Vercel
2. Root directory: client
3. Build command: npm run build
4. Output directory: build
5. Set environment variable:

   REACT_APP_API_BASE_URL=<your Render backend URL>

6. Redeploy after setting the variable

After both are live, confirm CLIENT_ORIGIN on Render matches the Vercel URL and REACT_APP_API_BASE_URL on Vercel matches the Render URL.

API endpoints

Auth

- POST /api/auth/register
- POST /api/auth/login

Projects (JWT required)

- GET /api/projects
- POST /api/projects
- GET /api/projects/:id
- PUT /api/projects/:id
- DELETE /api/projects/:id
- POST /api/projects/:id/scope-items
- GET /api/projects/:id/scope-items
- GET /api/projects/:id/requests
- GET /api/projects/:id/change-orders
- GET /api/projects/:id/timeline

Scope items (JWT required)

- PUT /api/scope-items/:id
- DELETE /api/scope-items/:id

Requests and change orders (JWT required)

- POST /api/requests/:id/change-order
- GET /api/change-orders/:id
- PUT /api/change-orders/:id
- PUT /api/change-orders/:id/send

Notifications (JWT required)

- GET /api/notifications
- PUT /api/notifications/:id/read

Client portal (public, token in URL)

- GET /api/portal/:token
- POST /api/portal/:token/requests
- GET /api/portal/:token/timeline
- PUT /api/portal/:token/change-orders/:id/approve
- PUT /api/portal/:token/change-orders/:id/decline

Health check

- GET /api/health

Notes

- Passwords are hashed with bcrypt
- Freelancer routes require Authorization: Bearer <token>
- Portal routes are validated by the portal token only
- Portal request submission is limited to 20 requests per hour per token
- Change order price is always estimatedHours times project hourlyRate
- Approved change orders update project totalPrice and totalHours
- Declined change orders do not change totals
- Only one blocking change order may be pending on a project at a time

Out of scope for this version

- Payment collection
- Email or SMS delivery
- Client accounts
- ML-based request classification
