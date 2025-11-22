# Deployment Guide

This guide explains how to deploy the **Utility App** (Visionary Lab) to the internet.

## Prerequisites

- A GitHub account (to host your code).
- A [Vercel](https://vercel.com/) account (for the frontend).
- A [Render](https://render.com/) account (for the backend).

## 1. Push Code to GitHub

### Step 1.1: Install Git (if not installed)
It looks like you might not have Git installed.
1.  Download and install Git from [git-scm.com](https://git-scm.com/downloads).
2.  During installation, choose the default options.
3.  After installing, restart your terminal (or VS Code).

### Step 1.2: Create a Repository
1.  Go to [GitHub.com](https://github.com) and sign in.
2.  Click the **+** icon in the top right and select **New repository**.
3.  Name it `utility-app` (or whatever you like).
4.  Make it **Public** or **Private**.
5.  Do **not** initialize with README, .gitignore, or License (we have them).
6.  Click **Create repository**.

### Step 1.3: Push your code
Open your terminal in the project folder (`d:\React Native Toturial\utility_app`) and run these commands one by one:

```bash
# Initialize a new git repository
git init

# Add all files to the staging area
git add .

# Commit the files
git commit -m "Initial commit"

# Link your local repo to GitHub (replace URL with YOUR repository URL)
git remote add origin https://github.com/Thangam2001/utility-app.git

# Push the code
git push -u origin master
```

## 2. Deploy Backend (Render)

We will deploy the backend first so we can get the API URL.

1.  Log in to **Render**.
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  Configure the service:
    -   **Name**: `visionary-lab-backend` (or similar)
    -   **Root Directory**: `backend`
    -   **Environment**: `Node`
    -   **Build Command**: `npm install`
    -   **Start Command**: `npm start`
5.  **Environment Variables**:
    Add the following environment variables in the "Environment" tab (or "Advanced" section):
    -   `CLIENT_ORIGINS`: `https://utility-app-3sbn.vercel.app` (You will update this *after* deploying the frontend, for now you can use `*` or leave it empty if you want to test without CORS restriction initially, but `*` is recommended for testing).
    -   `PORT`: `10000` (Render usually sets this, but good to be explicit).
6.  Click **Create Web Service**.
7.  Wait for the deployment to finish. Copy the **Service URL** (e.g., `https://visionary-lab-backend.onrender.com`).## 3. Deploy Frontend (Vercel)

1.  Log in to **Vercel**.
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  Configure the project:
    -   **Framework Preset**: Vite
    -   **Root Directory**: Click "Edit" and select `frontend`.
5.  **Environment Variables**:
    Expand the "Environment Variables" section and add:
    -   `VITE_API_URL`: Paste your Render Backend URL (e.g., `https://visionary-lab-backend.onrender.com/api`). **Important:** Ensure you append `/api` if your backend routes are prefixed with it (based on `server.js` and `app.js`, the router is mounted at `/api`).
6.  Click **Deploy**.

## 4. Final Configuration

1.  Once the frontend is deployed, copy its URL (e.g., `https://visionary-lab-frontend.vercel.app`).
2.  Go back to your **Render Dashboard** -> **Settings** -> **Environment Variables**.
3.  Update `CLIENT_ORIGINS` to your actual frontend URL (e.g., `https://visionary-lab-frontend.vercel.app`). This secures your backend so only your frontend can access it.
4.  **Redeploy** the backend (Manual Deploy -> Deploy latest commit) for the changes to take effect.

## Troubleshooting

-   **CORS Errors**: If you see CORS errors in the browser console, check that `CLIENT_ORIGINS` in Render exactly matches your Vercel URL (no trailing slash usually).
-   **404 Errors**: If backend routes return 404, check if you included `/api` in the `VITE_API_URL`.
