TaskNest 🪺
A collaborative task management platform that blends Trello's Kanban boards, Notion's flexibility, and AI-powered task magic.
Built with React, Node.js, Prisma, Auth0, and Google’s Gemini AI.



✨ Features
🎯 Kanban Boards – Drag-and-drop tasks like a pro.

🤖 AI-Powered – Generate tasks & get insights via Gemini AI.

⚡ Real-time Collaboration – See updates instantly with Socket.IO.

👥 Role-Based Access – Admin, Editor, Viewer – you pick who does what.

📊 Analytics Dashboard – Track productivity & project stats.

🔐 Auth0 Authentication – With social logins support.

🌙 Dark/Light Mode – Pretty UI that fits your vibe.

📱 Responsive – Works on any screen.

🛠 Tech Stack
Frontend: React 18, TypeScript, Tailwind CSS, Framer Motion
Backend: Node.js, Fastify, Socket.IO
Database: PostgreSQL + Prisma ORM
Auth: Auth0
AI: Google Gemini API
Realtime: Socket.IO

🚀 Quick Start
Prerequisites
Node.js 18+

PostgreSQL

Auth0 account

Google AI Studio account (Gemini API)

1. Clone & Install
bash
Copy
Edit
git clone <your-repo-url>
cd tasknest
npm install
2. Env Setup
bash
Copy
Edit
cp .env.example .env
Edit .env with your database, Auth0, and Gemini keys.

3. Database Setup
bash
Copy
Edit
npm run db:generate
npm run db:push
npm run db:seed
4. Start Dev Server
bash
Copy
Edit
npm run dev
Frontend → http://localhost:5173

Backend → http://localhost:3000

🔐 Auth0 Setup
Create a SPA app in Auth0

Add callback/logout URLs for local & prod

Grab Domain, Client ID, and Client Secret

Update .env

🤖 Gemini AI Setup
Create an API key in Google AI Studio

Add it to .env → GEMINI_API_KEY

🌐 Deployment
Frontend (Vercel/Netlify)
bash
Copy
Edit
npm run build
Deploy the dist folder.

Backend (Railway/Heroku)
Set env vars in hosting platform

Ensure DB is accessible

Update CORS origins

📚 API Overview
Boards – Create, fetch, update, delete.
Tasks – Create, update, delete, add comments/checklists.
AI – Task generation, summarization, suggestions.
Analytics – Per board, per user, or global.

🐛 Dev Notes
I removed file upload support (it was half-baked anyway).

I started adding a couple new features… but didn’t finish them yet. If you want to complete them, feel free to open a PR.

There are a few extra routes that probably don’t need to exist – I kinda lost track when I didn’t touch the code for a while. Clean-up welcome! 😅

📄 License
MIT – free to use, tweak, and share.

🤝 Contributing
PRs are welcome! Especially if you feel like finishing those new features or trimming down the unnecessary routes.

Built with 💪 by Praise

