# CareerLink — Public Production Deployment Guide

This guide details the exact steps to deploy **CareerLink** (*"Connect. Grow. Get Hired."*) to production for public access.

---

## 🏗️ Production Architecture Overview

- **Frontend**: React + Vite deployed to **Vercel** (Single Page Application with `vercel.json` rewrites).
- **Backend**: Node.js + Express + Socket.IO deployed to **Render** (or Railway / AWS).
- **Database**: **MongoDB Atlas** (Managed Cloud Database).
- **Media & Resume Storage**: **Cloudinary** (Persistent cloud storage for profile avatars & PDF resumes).
- **Real-Time Sockets**: WebSockets via **Socket.IO** with production CORS.
- **Authentication**: JWT + **Google OAuth 2.0 / OpenID Connect**.

---

## 🗄️ Step 1: Set Up MongoDB Atlas Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in.
2. Click **Create Cluster** (Shared Free Tier or Dedicated).
3. Under **Database Access**, create a database user:
   - **Username**: `careerlink_admin`
   - **Password**: Secure random password
   - **Role**: `Read and write to any database`
4. Under **Network Access**, click **Add IP Address** → choose **Allow Access From Anywhere** (`0.0.0.0/0`) so Render and Vercel servers can connect.
5. Click **Connect** → **Drivers (Node.js)** → copy the connection string:
   ```
   mongodb+srv://careerlink_admin:<password>@cluster0.abcde.mongodb.net/careerlink?retryWrites=true&w=majority
   ```

---

## ☁️ Step 2: Set Up Cloudinary for Persistent Resumes & Avatars

1. Sign in to [Cloudinary](https://cloudinary.com/).
2. On your Dashboard, copy:
   - **Cloud Name** (`CLOUDINARY_CLOUD_NAME`)
   - **API Key** (`CLOUDINARY_API_KEY`)
   - **API Secret** (`CLOUDINARY_API_SECRET`)

---

## 🚀 Step 3: Deploy Backend Server to Render

1. Sign in to [Render](https://render.com/).
2. Click **New +** → **Web Service** → Connect your GitHub repository.
3. Configure settings:
   - **Name**: `careerlink-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
4. Add **Environment Variables**:

| Variable Name | Example Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Production environment mode |
| `PORT` | `5000` | Server listening port |
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas cluster connection string |
| `JWT_SECRET` | *(Random 32+ char string)* | Secure secret key for signing JWT tokens |
| `JWT_EXPIRE` | `30d` | Token expiry duration |
| `CLIENT_URL` | `https://careerlink.vercel.app` | Production frontend domain (CORS whitelist) |
| `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | Cloudinary cloud identifier |
| `CLOUDINARY_API_KEY` | `your_api_key` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | `your_api_secret` | Cloudinary API secret |
| `GOOGLE_CLIENT_ID` | `...apps.googleusercontent.com` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | `...` | Google OAuth Client Secret |

5. Click **Create Web Service**.
6. Once deployed, copy your backend URL:
   `https://careerlink-api.onrender.com`

---

## ⚡ Step 4: Deploy Frontend to Vercel

1. Sign in to [Vercel](https://vercel.com/).
2. Click **Add New...** → **Project** → Import your repository.
3. Configure settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variables**:

| Variable Name | Production Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://careerlink-api.onrender.com/api` | Deployed backend REST API base URL |
| `VITE_SOCKET_URL` | `https://careerlink-api.onrender.com` | Deployed Socket.IO backend URL |
| `VITE_GOOGLE_CLIENT_ID` | `your_google_client_id.apps.googleusercontent.com` | Google OAuth 2.0 Client ID |

5. Click **Deploy**.
6. Once deployed, copy your frontend public URL:
   `https://careerlink.vercel.app`

---

## 🔐 Step 5: Update Google OAuth Authorized Origins

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Go to **APIs & Services** → **Credentials** → Click your **OAuth 2.0 Client ID**.
3. Under **Authorized JavaScript origins**, add:
   - `https://careerlink.vercel.app`
   - `https://careerlink-api.onrender.com`
4. Under **Authorized redirect URIs**, add:
   - `https://careerlink.vercel.app`
   - `https://careerlink.vercel.app/login`
5. Click **Save**.

---

## 🛡️ Step 6: Update Backend CORS on Render

Return to Render for `careerlink-api` → Environment:
- Set `CLIENT_URL` = `https://careerlink.vercel.app,http://localhost:5173`
- Render will automatically restart with the new origins.

---

## 📋 22-Step Production Verification Checklist

- [x] 1. Open public CareerLink URL (`/login` loads with playing cinematic video).
- [x] 2. Register a new user account with email & password.
- [x] 3. Login with newly created credentials.
- [x] 4. Test instant logout.
- [x] 5. Login again with session persistence.
- [x] 6. Test **"Continue with Google"** popup authentication.
- [x] 7. Navigate to **Edit Profile** (`/profile/edit`).
- [x] 8. Upload profile avatar image to Cloudinary cloud storage.
- [x] 9. Upload PDF resume attachment to cloud storage.
- [x] 10. Create an engineering post with tags.
- [x] 11. Test **Repost** (instant repost & repost with commentary).
- [x] 12. Like, comment, share, and save posts in real-time.
- [x] 13. Send connection request to peers in Network Hub (`/network`).
- [x] 14. Accept connection request and verify connection count increments.
- [x] 15. Search technology jobs by skill/location (`/jobs`).
- [x] 16. Apply for a job and verify application tracker increments.
- [x] 17. Explore curated company directory (Microsoft, NVIDIA, Samsung, Apple, Google).
- [x] 18. Send 1-to-1 private messaging via Socket.IO between two browser sessions.
- [x] 19. Receive real-time notification with audio bell chime chime chime sound.
- [x] 20. Refresh all SPA routes (`/feed`, `/network`, `/jobs`, `/companies`, `/messages`, `/notifications`, `/analytics`, `/profile/me`).
- [x] 21. Verify MongoDB Atlas database persistence across restarts.
- [x] 22. Verify mobile viewport responsiveness ($390\times844$).
