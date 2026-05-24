# ExpoTravel.AI - Intelligent Travel Assistant

ExpoTravel.AI is an agentic, full-stack travel application that leverages LLMs to help users discover destinations, find real-time flight information, and generate customized travel itineraries.

## 🚀 Features

- **Agentic AI Workflow:** Powered by LangGraph to handle complex, multi-step travel research.
- **Real-time Chat:** Interactive messaging interface with typing indicators via Socket.io.
- **Personalized Experience:** Secure JWT authentication with persistent user profiles and avatars.
- **Smart Itineraries:** Automatically save generated travel plans to your account.
- **Modern UI:** Responsive design with dynamic, animated backgrounds and clean layouts.

## 🛠 Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS.
- **Backend:** Node.js, Express, MongoDB, Socket.io.
- **AI/LLM:** LangChain/LangGraph, OpenAI/OpenRouter APIs.
- **Deployment:** Vercel (Frontend), Render (Backend).

## ⚙️ Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file in the backend directory:

- `MONGO_URI`: Your MongoDB Connection String.
- `JWT_SECRET`: A secure random string.
- `OPENROUTER_API_KEY`: Your OpenRouter API Key.
- `EMAIL_USER`: Your Gmail account for password resets.
- `EMAIL_PASS`: Your Gmail App Password.

## 🚀 Deployment Strategy

- **Frontend:** Deployed on Vercel. Connect your repository and set `VITE_API_URL` to your live Render backend URL.
- **Backend:** Deployed on Render. Ensure the root directory is set to `travel-express-backend` and environment variables are properly configured.

## 👤 Developer

**Tochukwu Sunday** Full-Stack Engineer
