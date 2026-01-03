# Dokploy Deployment Guide: AI YouTube Shorts Generator

This guide provides step-by-step instructions to deploy the AI YouTube Shorts Generator to your own VPS using [Dokploy](https://dokploy.com/).

## Prerequisites

1.  A VPS with Dokploy installed and running.
2.  A GitHub account with the project repository.
3.  API Keys for:
    *   **OpenAI** (GPT-4 and DALL-E access)
    *   **ElevenLabs**

---

## Step 1: Create a Project in Dokploy

1.  Log in to your Dokploy dashboard.
2.  Click on **Projects** in the sidebar.
3.  Click **Create Project** and give it a name like `AI Shorts Generator`.

---

## Step 2: Deploy the Backend Service

1.  Inside your project, click **Create Service** and select **Application**.
2.  **General Settings**:
    *   **Name**: `ai-shorts-backend`
    *   **Source**: GitHub
    *   **Repository**: `rajeshautomates-creator/aishortsgenerator`
    *   **Branch**: `main`
    *   **Build Type**: Dockerfile
    *   **Dockerfile Path**: `backend/Dockerfile`
    *   **Context Path**: `./` (Root directory)

3.  **Environment Variables**:
    Add the following variables in the **Environment** tab:
    *   `OPENAI_API_KEY`: Your OpenAI key
    *   `ELEVENLABS_API_KEY`: Your ElevenLabs key
    *   `ADMIN_PASSWORD`: A secure password for your dashboard
    *   `JWT_SECRET`: A long random string
    *   `PORT`: `5000`
    *   `NODE_ENV`: `production`

4.  **Networking**:
    *   Set the **Port** to `5000`.
    *   Enable **Public Access** if you want to test the API directly (optional).
    *   Dokploy will provide a URL like `https://backend-xyz.yourdomain.com`. **Copy this URL.**

5.  **Storage (Volumes)**:
    To persist generated videos and logs, add these volumes:
    *   `/app/outputs` -> `ai-shorts-outputs`
    *   `/app/uploads` -> `ai-shorts-uploads`
    *   `/app/logs` -> `ai-shorts-logs`

6.  **Deploy**: Click **Deploy**.

---

## Step 3: Deploy the Frontend Service

1.  Inside the same project, click **Create Service** -> **Application**.
2.  **General Settings**:
    *   **Name**: `ai-shorts-frontend`
    *   **Source**: GitHub
    *   **Repository**: `rajeshautomates-creator/aishortsgenerator`
    *   **Branch**: `main`
    *   **Build Type**: Dockerfile
    *   **Dockerfile Path**: `frontend/Dockerfile`
    *   **Context Path**: `./` (Root directory)

3.  **Environment Variables**:
    *   `NEXT_PUBLIC_API_URL`: Use the **Backend URL** you copied in Step 2.

4.  **Networking**:
    *   Set the **Port** to `3080`.
    *   Enable **Public Access**. This will be your main application URL.

5.  **Deploy**: Click **Deploy**.

---

## Step 4: Verification

1.  Open the Frontend URL provided by Dokploy.
2.  You should see the login page.
3.  Enter the `ADMIN_PASSWORD` you set in the Backend environment variables.
4.  Try creating a short with a topic like "The future of space exploration".
5.  Monitor the logs in both Dokploy services if anything fails.

---

## Troubleshooting

*   **FFmpeg errors**: Ensure the backend is using the `Dockerfile` which installs `ffmpeg`.
*   **CORS errors**: Ensure the Backend has the correct `FRONTEND_URL` environment variable if you added that logic (currently not strictly enforced in the provided code for simplicity, but good to have).
*   **Build failures**: Check the `Context Path` in Dokploy. It must be set to the folder containing the `Dockerfile` and `package.json`.
