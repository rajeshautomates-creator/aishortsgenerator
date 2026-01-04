# AI YouTube Shorts Generator SaaS

A full-stack SaaS application that automatically generates vertical YouTube Shorts using AI. Built with Next.js 14, Node.js, and FFmpeg.

## 🚀 Features

- **AI Script Generation**: Powered by OpenAI GPT-4 with focus on viral hooks.
- **AI Image Generation**: DALL-E 3 creates 9:16 vertical cinematic images (with Google Gemini Fallback).
- **AI Voice Narration**: ElevenLabs natural speech synthesis.
- **Automated Video Pipeline**: FFmpeg combines images, audio, and burns subtitles.
- **Admin Dashboard**: Secure control panel for triggering and monitoring jobs.
- **Dark/Light Mode**: Modern glassmorphic UI with full responsive support.
- **Docker Ready**: Production-optimized Dockerfiles and docker-compose.

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Framer Motion, Lucide React.
- **Backend**: Node.js, Express, TypeScript, FFmpeg.
- **AI**: OpenAI (GPT-4, DALL-E 3), Google Gemini (Imagen 3), ElevenLabs.
- **Infrastructure**: Docker, Dokploy compatible.

## 🚦 Getting Started

### Prerequisites

- Node.js 20+
- FFmpeg installed (for local backend development)
- OpenAI API Key
- ElevenLabs API Key
- Google Gemini API Key (Optional, for fallback)

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd aishortsgen
   ```

2. Set up Backend:
   ```bash
   cd backend
   npm install
   # Create .env based on .env.example
   npm run dev
   ```

3. Set up Frontend:
   ```bash
   cd frontend
   npm install
   # Create .env.local with NEXT_PUBLIC_API_URL=http://localhost:5000
   npm run dev
   ```

### Running with Docker

```bash
# In the root directory
docker-compose up --build
```

## 🚢 Deployment (Dokploy)

For detailed step-by-step instructions, see the [Dokploy Deployment Guide](./DOKPLOY_DEPLOYMENT.md).

1. Create a new project in Dokploy.
2. Create an **Application** for the Backend (`backend/Dockerfile`, context `backend`).
3. Set environment variables (`OPENAI_API_KEY`, `ELEVENLABS_API_KEY`, etc.).
4. Create an **Application** for the Frontend (`frontend/Dockerfile`, context `frontend`).
5. Set `NEXT_PUBLIC_API_URL` to your backend URL.
6. Deploy!

## 📄 License

MIT © [Your Name]
