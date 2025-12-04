 
# Newgate
 
 <h1 align="center">✨ Full-Stack Chat App with Auth & Emails
  ✨</h1>![Demo App](/frontend/public/screenshot-for-readme.png)Highlights:- 
  🔐 Custom JWT Authentication (no 3rd-party auth)- ⚡ Real-time Messaging via Socket.io- 
  🟢 Online/Offline Presence Indicators-
  🔔 Notification & Typing Sounds (with toggle)- 📨 Welcome Emails on Signup (Resend)-
  🗂️ Image Uploads (Cloudinary)-
  🧰 REST API with Node.js & Express-
  🧱 MongoDB for Data Persistence-
  🚦 API Rate-Limiting powered by Arcjet- 
  🎨 Beautiful UI with React, Tailwind CSS & DaisyUI
  - 🧠 Zustand for State Management
  - 🧑‍💻 Git & GitHub Workflow (branches, PRs, merges)
  - 🚀 Easy Deployment (free-tier friendly with Sevalla
  )---## 🧪 .env Setup### Backend (`/backend`)```bashPORT=3000MONGO_URI=your_mongo_uri_hereNODE_ENV=developmentJWT_SECRET=your
  _jwt_secretRESEND_API_KEY=your_resend_api_keyEMAIL_FROM=your_email_from_addressEMAIL_FROM_NAME=your_email_from_nameCLIENT_URL=http://localhost:5173CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_nameCLOUDINARY_API_KEY=your_cloudinary_api_keyCLOUDINARY_API_SECRET=your_cloudinary_api_secretARCJET_KEY=your_arcjet_keyARCJET_ENV=development```
  ---## 🔧 Run the Backend```bashcd backendnpm installnpm run dev``
  ## 💻 Run the Frontend```bashcd frontendnpm installnpm run dev```
 
