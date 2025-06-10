# TaskNest 🪺

A collaborative task management platform that combines Trello's Kanban boards, Notion's flexibility, and AI-powered task generation. Built with React, Node.js, Prisma, and integrated with Auth0 for authentication and Gemini AI for intelligent task assistance.

![TaskNest Dashboard](https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200)

## ✨ Features

- **🎯 Kanban Boards**: Visual task management with drag-and-drop functionality
- **🤖 AI-Powered**: Generate tasks and get insights using Gemini AI
- **⚡ Real-time Collaboration**: Live updates with Socket.IO
- **👥 Role-Based Access**: Admin, Editor, and Viewer permissions
- **📊 Analytics Dashboard**: Track productivity and project metrics
- **📎 File Attachments**: Upload and manage files with tasks
- **🔐 Secure Authentication**: Auth0 integration with social logins
- **🌙 Dark/Light Mode**: Beautiful UI with theme switching
- **📱 Responsive Design**: Works on all devices

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Fastify, Socket.IO
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Auth0
- **AI**: Google Gemini API
- **Real-time**: Socket.IO
- **File Storage**: Local file system (configurable)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Auth0 account
- Google AI Studio account (for Gemini API)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd tasknest
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

### 3. Configure Environment Variables

Edit the `.env` file with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tasknest"

# Auth0 Configuration
VITE_AUTH0_DOMAIN="your-auth0-domain.auth0.com"
VITE_AUTH0_CLIENT_ID="your-auth0-client-id"
AUTH0_CLIENT_SECRET="your-auth0-client-secret"

# Gemini AI
GEMINI_API_KEY="your-gemini-api-key"

# Server Configuration
PORT=3001
NODE_ENV="development"

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760

# Socket.IO
SOCKET_CORS_ORIGIN="http://localhost:5173"
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 🔐 Auth0 Configuration

### Step 1: Create Auth0 Application

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Click **Applications** → **Create Application**
3. Choose **Single Page Application**
4. Select **React** as the technology

### Step 2: Configure Application Settings

In your Auth0 application settings, configure the following:

#### **Allowed Callback URLs**

```
http://localhost:5173,
http://localhost:5173/dashboard,
https://yourdomain.com,
https://yourdomain.com/dashboard
```

#### **Allowed Logout URLs**

```
http://localhost:5173,
https://yourdomain.com
```

#### **Allowed Web Origins**

```
http://localhost:5173,
https://yourdomain.com
```

#### **Allowed Origins (CORS)**

```
http://localhost:5173,
https://yourdomain.com
```

### Step 3: Get Your Credentials

From the **Settings** tab, copy:

- **Domain**: `your-auth0-domain.auth0.com`
- **Client ID**: `your-client-id`
- **Client Secret**: `your-client-secret` (found in **Advanced Settings** → **OAuth**)

### Step 4: Configure Social Connections (Optional)

1. Go to **Authentication** → **Social**
2. Enable **Google** and **GitHub** connections
3. Configure with your OAuth app credentials

### Step 5: Update Environment Variables

```env
VITE_AUTH0_DOMAIN="your-auth0-domain.auth0.com"
VITE_AUTH0_CLIENT_ID="your-client-id"
AUTH0_CLIENT_SECRET="your-client-secret"
```

## 🤖 Gemini AI Setup

### Step 1: Get API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **Create API Key**
3. Copy the generated key

### Step 2: Update Environment

```env
GEMINI_API_KEY="your-gemini-api-key"
```

## 🗄️ Database Configuration

### PostgreSQL Setup

#### Option 1: Local PostgreSQL

1. Install PostgreSQL on your system
2. Create a database:
   ```sql
   CREATE DATABASE tasknest;
   ```
3. Update the connection string:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/tasknest"
   ```

#### Option 2: Cloud Database (Recommended for Production)

**Supabase:**

1. Create account at [Supabase](https://supabase.com/)
2. Create new project
3. Go to **Settings** → **Database**
4. Copy the connection string

**Railway:**

1. Create account at [Railway](https://railway.app/)
2. Create new PostgreSQL service
3. Copy the connection string from variables

**Neon:**

1. Create account at [Neon](https://neon.tech/)
2. Create new database
3. Copy the connection string

Update your `.env`:

```env
DATABASE_URL="your-cloud-database-url"
```

## 📁 File Upload Configuration

### Local Storage (Default)

Files are stored in the `./uploads` directory by default:

```env
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760  # 10MB in bytes
```

### Cloud Storage (Production)

For production, consider using cloud storage services:

- **AWS S3**
- **Google Cloud Storage**
- **Cloudinary**

Update the upload routes in `server/routes/uploads.ts` to integrate with your chosen service.

## 🌐 Deployment

### Frontend Deployment (Vercel/Netlify)

1. Build the frontend:

   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting service

3. Update Auth0 URLs with your production domain

### Backend Deployment (Railway/Heroku)

1. Set environment variables in your hosting platform
2. Ensure PostgreSQL database is accessible
3. Update CORS origins for production domain

### Environment Variables for Production

```env
# Database (use your cloud database URL)
DATABASE_URL="your-production-database-url"

# Auth0 (same credentials, update URLs in Auth0 dashboard)
VITE_AUTH0_DOMAIN="your-auth0-domain.auth0.com"
VITE_AUTH0_CLIENT_ID="your-auth0-client-id"
AUTH0_CLIENT_SECRET="your-auth0-client-secret"

# Gemini AI (same key)
GEMINI_API_KEY="your-gemini-api-key"

# Server
PORT=3001
NODE_ENV="production"

# CORS (update with your production domain)
SOCKET_CORS_ORIGIN="https://yourdomain.com"
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/profile` - Create/update user profile
- `GET /api/auth/profile/:auth0Id` - Get user profile
- `PUT /api/auth/profile/:auth0Id` - Update user profile

### Board Endpoints

- `GET /api/boards` - Get user's boards
- `POST /api/boards` - Create new board
- `GET /api/boards/:boardId` - Get specific board
- `PUT /api/boards/:boardId` - Update board
- `DELETE /api/boards/:boardId` - Delete board

### Task Endpoints

- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:taskId` - Update task
- `DELETE /api/tasks/:taskId` - Delete task
- `POST /api/tasks/:taskId/comments` - Add comment
- `POST /api/tasks/:taskId/checklist` - Add checklist item

### AI Endpoints

- `POST /api/ai/generate-tasks` - Generate tasks from description
- `POST /api/ai/summarize-tasks` - Get project summary
- `POST /api/ai/suggest-improvements` - Get task suggestions

### Analytics Endpoints

- `GET /api/analytics/boards/:boardId` - Board analytics
- `GET /api/analytics/users/:userId` - User analytics
- `GET /api/analytics/global` - Global analytics

## 🔧 Development Scripts

```bash
# Start development servers (frontend + backend)
npm run dev

# Start only frontend
npm run dev:client

# Start only backend
npm run dev:server

# Build for production
npm run build

# Database operations
npm run db:generate    # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:migrate    # Run migrations
npm run db:studio     # Open Prisma Studio
npm run db:seed       # Seed database with sample data

# Code quality
npm run lint          # Run ESLint
```

## 🐛 Troubleshooting

### Common Issues

**1. Database Connection Error**

- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists

**2. Auth0 Login Issues**

- Verify callback URLs in Auth0 dashboard
- Check domain and client ID
- Ensure HTTPS in production

**3. AI Features Not Working**

- Verify Gemini API key is valid
- Check API quota limits
- Ensure proper network connectivity

**4. Real-time Updates Not Working**

- Check Socket.IO CORS configuration
- Verify WebSocket support
- Check firewall settings

### Getting Help

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Review Auth0 and Gemini AI documentation
3. Check browser console for errors
4. Verify all environment variables are set

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🙏 Acknowledgments

- [Auth0](https://auth0.com/) for authentication
- [Google AI](https://ai.google.dev/) for Gemini API
- [Prisma](https://prisma.io/) for database ORM
- [Socket.IO](https://socket.io/) for real-time features
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide](https://lucide.dev/) for icons

---

Built with ❤️ by Praise
