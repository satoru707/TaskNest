# TaskNest

TaskNest is a collaborative task and board management platform that allows teams to organize work, track progress, and collaborate in real time. It also includes analytics and AI-powered features for enhanced productivity.

---

## ✨ Features

- **Real-Time Collaboration** – Instantly sync tasks and boards across connected clients using Socket.IO.
- **Task & Board Management** – Create, update, delete, and organize boards and tasks with ease.
- **Analytics Dashboard** – View task completion trends and productivity insights.
- **AI-Powered Assistance** – Get suggestions using the Google Generative AI API.
- **File Uploads** – Upload and manage task-related files.(TBA)
- **Authentication & Authorization** – Secured using Auth0.

---

## 🚧 Work in Progress

This project is actively being developed and contains **a few unfinished or partially implemented features**.  
If you are looking for a project to contribute to, there’s plenty of room for improvement!  

Some examples of features you can help complete:
- More detailed analytics and reporting
- Enhanced AI task suggestions
- Board & list sorting and filtering
- Mobile-friendly optimizations
- Role-based permissions for boards
- Improved file upload UI
- Notifications & activity history


## 🛠 Tech Stack

**Frontend:**
- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [TailwindCSS](https://tailwindcss.com/)

**Backend:**
- [Fastify](https://fastify.dev/)
- [Prisma](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Socket.IO](https://socket.io/)

**AI:**
- [GEMINI AI API](https://ai.google.dev/gemini-api/docs/)

**Authentication:**
- [Auth0](https://auth0.com/)

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/satoru707/TaskNest.git
cd TaskNest
2️⃣ Install Dependencies
Frontend

bash
Copy
Edit
cd frontend
npm install
Backend

bash
Copy
Edit
cd backend
npm install
3️⃣ Configure Environment Variables
Create a .env file in both frontend and backend directories using the templates below.

Frontend .env.example
env
Copy
Edit
VITE_AUTH0_DOMAIN="your-auth0-domain"
VITE_AUTH0_CLIENT_ID="your-auth0-client-id"
VITE_AUTH0_CLIENT_SECRET="your-auth0-client-secret"
VITE_AUTH0_AUDIENCE="your-auth0-audience-url"
VITE_FRONTURL="http://localhost:5173"

VITE_SOCKET_CORS_ORIGIN="http://localhost:3000"
Backend .env.example
env
Copy
Edit
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/tasknest_db"
# Optional Prisma Accelerate connection
# DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=your-api-key"

# AI API Key
GEMINI_API_KEY="your-gemini-api-key"

# Auth0 Settings
AUTH0_DOMAIN="your-auth0-domain"
AUTH0_CLIENT_ID="your-auth0-client-id"
AUTH0_CLIENT_SECRET="your-auth0-client-secret"
AUTH0_AUDIENCE="your-auth0-audience-url"
AUTH0_MANAGEMENT_CLIENT_ID="your-auth0-management-client-id"
AUTH0_MANAGEMENT_CLIENT_SECRET="your-auth0-management-client-secret"

# Server Config
PORT=3000
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760

# Socket.IO Config
SOCKET_CORS_ORIGIN="http://localhost:5173"
4️⃣ Set Up the Database
bash
Copy
Edit
cd backend
npx prisma migrate dev
5️⃣ Run the Application
Backend

bash
Copy
Edit
cd backend
npm run dev
Backend runs on: http://localhost:3000

Frontend

bash
Copy
Edit
cd frontend
npm run dev
Frontend runs on: http://localhost:5173

📊 Real-Time Events (Socket.IO)
Event Name	Description
join-board	Join a specific board room for live updates
leave-board	Leave a specific board room
task-updated	Broadcast task updates
board-updated	Broadcast board changes
task-created	Notify others of a new task
list-created	Notify others of a new list

📂 Folder Structure
bash
Copy
Edit
TaskNest/
│
├── backend/           # Fastify + Prisma backend
│   ├── routes/        # API route handlers
│   ├── prisma/        # Prisma schema & migrations
│   ├── uploads/       # Uploaded files
│   └── ...
│
├── frontend/          # Vite + React + Tailwind frontend
│   ├── src/           # React components, pages, hooks
│   └── ...
│
└── README.md
📜 License
This project is licensed under the MIT License.

🙌 Contributing
Pull requests are welcome. For major changes, open an issue first to discuss what you’d like to change.


