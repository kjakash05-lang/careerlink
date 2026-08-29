# CareerLink — Google OAuth 2.0 Authentication Setup Guide

This guide walks you through setting up real **Google Sign-In ("Continue with Google")** for the CareerLink web application.

---

## 🛠️ Step-by-Step Google Cloud Console Configuration

### Step 1: Create a Google Cloud Project
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. In the top project selector bar, click **New Project**.
3. Name your project (e.g. `CareerLink`) and click **Create**.

---

### Step 2: Configure the OAuth Consent Screen
1. In the left navigation menu, go to **APIs & Services** → **OAuth consent screen**.
2. Select **External** user type and click **Create**.
3. Fill in the required application details:
   - **App name**: `CareerLink`
   - **User support email**: Your email address
   - **App logo**: Optional
   - **Developer contact information**: Your email address
4. Click **Save and Continue**.
5. Under **Scopes**, click **Add or Remove Scopes** and select:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
6. Click **Update** → **Save and Continue**.
7. Under **Test Users**, add your personal Google account email address (for testing before publishing) → Click **Save and Continue**.

---

### Step 3: Create OAuth 2.0 Client Credentials
1. In the left menu, go to **APIs & Services** → **Credentials**.
2. Click **+ CREATE CREDENTIALS** at the top → select **OAuth client ID**.
3. Set **Application type** to **Web application**.
4. Set **Name** to `CareerLink Web Client`.
5. Under **Authorized JavaScript origins**, click **+ ADD URI** and add:
   - `http://localhost:5173`
   - `http://localhost:5000`
   - `http://localhost`
6. Under **Authorized redirect URIs**, click **+ ADD URI** and add:
   - `http://localhost:5173`
   - `http://localhost:5173/login`
   - `http://localhost:5000/api/auth/google/callback`
7. Click **CREATE**.
8. A modal will appear displaying your **Client ID** and **Client Secret**.

---

## 🔐 Step 4: Configure Environment Variables

### 1. Frontend Configuration (`client/.env`)
Create or edit `client/.env`:
```env
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
```

> [!IMPORTANT]
> **NEVER** expose the `GOOGLE_CLIENT_SECRET` in the frontend (`client/`) code or bundle. The secret must only ever be stored server-side.

### 2. Backend Configuration (`server/.env`)
Create or edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/careerlink
JWT_SECRET=careerlink_super_secret_jwt_key_983724892374982374
JWT_EXPIRE=30d

# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
```

---

## 🚀 Step 5: Start & Test CareerLink

1. **Start the Backend**:
   ```bash
   cd server
   node src/server.js
   ```
2. **Start the Frontend**:
   ```bash
   cd client
   npm run dev
   ```
3. Open your browser and navigate to:
   [http://localhost:5173/login](http://localhost:5173/login)
4. Click **Continue with Google**:
   - The official Google account chooser popup opens.
   - Select your Google account.
   - You are automatically authenticated and redirected to your CareerLink Home feed (`/feed`).
   - Your name and Google avatar are imported.

---

## 🔍 How Authentication Works in CareerLink

```
[ User clicks "Continue with Google" ]
                 ↓
[ Google Identity Services / OAuth 2.0 Popup ]
                 ↓
[ User consents & authorizes account ]
                 ↓
[ Google ID token sent to POST /api/auth/google ]
                 ↓
[ Backend verifies token cryptographically with google-auth-library ]
                 ↓
[ First time? -> Creates CareerLink User & Profile with Google Name + Avatar ]
[ Existing User? -> Links Google ID without duplicating account or overriding custom avatar ]
                 ↓
[ Issues standard CareerLink JWT session token ]
                 ↓
[ Authenticated in App -> Redirects to /feed ]
```

---

## ⚠️ Common Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `origin_mismatch` | `http://localhost:5173` is not listed in Authorized JavaScript Origins | Add `http://localhost:5173` under Authorized Origins in Google Cloud Console. |
| `redirect_uri_mismatch` | The callback URI does not match the Google Cloud Console | Ensure `http://localhost:5173` and `http://localhost:5173/login` are in the redirect URI list. |
| `popup_closed_by_user` | User closed the Google account selector before completing login | Handled gracefully with clean notification: *"Google sign-in was cancelled."* |
| `Google Client ID is not configured` | Missing `VITE_GOOGLE_CLIENT_ID` in `client/.env` | Add your Client ID to `client/.env` and restart Vite dev server. |
