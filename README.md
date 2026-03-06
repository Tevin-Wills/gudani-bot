<p align="center">
  <img src="frontend/public/gudani-icon.svg" alt="Gudani Bot" width="80" />
</p>

<h1 align="center">Gudani Bot 🤖📚</h1>
<h3 align="center"><em>"Gudani! — Learn in your language"</em></h3>

<p align="center">
  A multilingual South African school chatbot supporting 9 official languages.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License" />
</p>

---

## 📖 Overview

South Africa has 11 official languages, yet most educational technology is only available in English. This creates a significant barrier for millions of learners who think and learn best in their home language.

**Gudani Bot** bridges this gap. Named after the Tshivenda word meaning *"to learn"*, it is an AI-powered school chatbot that lets students ask questions, take quizzes, and access school information — all in their own language.

The bot automatically detects the learner's language, processes queries through a large language model, and translates responses back — making quality education accessible regardless of language.

---

## ✨ Features

### 💬 Multilingual Chat
AI-powered homework help and learning assistant. Ask questions in any of the 9 supported languages and get answers translated back.

<!-- ![Chat Screenshot](docs/screenshots/chat.png) -->

### 📝 Quiz Mode
Interactive quizzes across 10 CAPS-aligned subjects. Supports multiple choice, true/false, and fill-in-the-blank questions with instant AI-generated feedback and explanations.

<!-- ![Quiz Screenshot](docs/screenshots/quiz.png) -->

### ❓ School FAQ
Instant answers to common school questions (fees, term dates, admissions, uniform, transport, contacts). Searches a structured FAQ database first, falls back to AI for complex queries.

<!-- ![FAQ Screenshot](docs/screenshots/faq.png) -->

### 📢 Announcement Generator
Write a school notice once in English, and Gudani translates it into all 9 languages instantly. Supports formal and casual tones. One-click copy for each translation.

<!-- ![Announcements Screenshot](docs/screenshots/announcements.png) -->

### ⚙️ Settings
- Language selector with native language names
- Grade level selector (Grade 1–12)
- Dark mode toggle

---

## 🌍 Supported Languages

| ISO Code | Language        | Native Name   |
|----------|-----------------|---------------|
| `en`     | English         | English       |
| `af`     | Afrikaans       | Afrikaans     |
| `zu`     | Zulu            | isiZulu       |
| `xh`     | Xhosa           | isiXhosa      |
| `st`     | Sotho           | Sesotho       |
| `tn`     | Tswana          | Setswana      |
| `nso`    | Northern Sotho  | Sepedi        |
| `ts`     | Tsonga          | Xitsonga      |
| `ve`     | Venda           | Tshivenda     |

---

## 🛠️ Tech Stack

| Layer       | Technology                                                     |
|-------------|----------------------------------------------------------------|
| **Frontend** | React 18, Vite 6, Tailwind CSS 3, Plus Jakarta Sans          |
| **Backend**  | Python 3.11+, FastAPI, Pydantic, uvicorn                     |
| **AI/LLM**   | Groq API (Llama 3.3 70B Versatile)                           |
| **Translation** | Google Cloud Translation API v2                            |
| **Language Detection** | `langdetect` (Python library)                      |
| **Hosting**  | Vercel (frontend), Render (backend, free tier)                |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                     │
│                                                         │
│  React 18 + Vite + Tailwind CSS                         │
│  ┌─────────┬────────┬─────────┬──────────┬──────────┐   │
│  │  Chat   │  Quiz  │   FAQ   │ Announce │ Settings │   │
│  └────┬────┴───┬────┴────┬────┴────┬─────┴──────────┘   │
│       │        │         │         │                     │
│       └────────┴─────────┴─────────┘                     │
│                    │  api.js (fetch)                      │
└────────────────────┼─────────────────────────────────────┘
                     │ HTTPS
┌────────────────────┼─────────────────────────────────────┐
│                BACKEND (Render)                           │
│                    │                                      │
│  FastAPI + uvicorn │                                      │
│  ┌─────────────────┴──────────────────┐                   │
│  │           API Routers              │                   │
│  │  /api/chat  /api/quiz  /api/faq    │                   │
│  │  /api/announce  /api/health        │                   │
│  └──────┬─────────┬──────────┬────────┘                   │
│         │         │          │                            │
│  ┌──────┴───┐ ┌───┴────┐ ┌──┴──────────┐                 │
│  │ Language  │ │  LLM   │ │ Translation │                 │
│  │ Detect   │ │Service │ │   Service   │                 │
│  │(langdetect)│ │(Groq)  │ │(Google API) │                 │
│  └──────────┘ └────────┘ └─────────────┘                 │
│                                                          │
│  Data: faq_data.json, subjects.json                      │
│  Cache: In-memory TTL cache                              │
└──────────────────────────────────────────────────────────┘
```

**Chat Flow:**
1. User sends a message in any language
2. Backend detects the language (or uses the user's selection)
3. If non-English → translate to English via Google Translate
4. Send English text to Groq LLM with grade-appropriate system prompt
5. Translate LLM response back to the user's language
6. Return response with language metadata

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.11+** ([python.org](https://www.python.org/downloads/))
- **Node.js 18+** ([nodejs.org](https://nodejs.org/))
- **Git** ([git-scm.com](https://git-scm.com/))
- API Keys:
  - [Groq API Key](https://console.groq.com/) (free tier available)
  - [Google Cloud Translation API Key](https://cloud.google.com/translate/docs/setup) (optional — chat works without it in English)

### Clone the repository

```bash
git clone https://github.com/Tevin-Wills/gudani-bot.git
cd gudani-bot
```

### Backend setup

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and add your API keys:
#   GROQ_API_KEY=your_groq_key_here
#   GOOGLE_TRANSLATE_API_KEY=your_google_key_here  (optional)
#   GEMINI_API_KEY=your_gemini_key_here            (optional)

# Start the backend server
uvicorn app.main:app --reload --port 8000
```

The API will be running at `http://localhost:8000`. Visit `http://localhost:8000/docs` for the interactive Swagger documentation.

### Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be running at `http://localhost:5173` and will proxy API requests to the backend.

---

## ☁️ Deployment

### Backend → Render (free tier)

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables: `GROQ_API_KEY`, `GOOGLE_TRANSLATE_API_KEY`, `GEMINI_API_KEY`
5. Deploy

> **Note:** The free tier sleeps after 15 minutes of inactivity. Gudani Bot includes a built-in keep-alive ping (every 13 minutes) and a "waking up" loading screen to handle cold starts gracefully.

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Import the GitHub repo
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variable: `VITE_API_URL` = `https://your-backend.onrender.com`
5. Deploy

### Keep-Alive (recommended)

Set up [UptimeRobot](https://uptimerobot.com) (free) to ping `https://your-backend.onrender.com/api/ping` every 5 minutes to prevent the backend from sleeping.

---

## 📡 API Documentation

Base URL: `http://localhost:8000` (dev) or your Render URL (prod)

### Health & Utility

| Method | Endpoint           | Description              |
|--------|--------------------|--------------------------|
| `GET`  | `/`                | Root — API status        |
| `GET`  | `/api/health`      | Health check             |
| `GET`  | `/api/ping`        | Keep-alive ping          |
| `GET`  | `/api/languages`   | List supported languages |

### Chat

| Method | Endpoint     | Description                    |
|--------|-------------|--------------------------------|
| `POST` | `/api/chat` | Send a message, get AI response |

```json
// Request
{
  "message": "What is photosynthesis?",
  "language": "zu",          // optional, auto-detected if omitted
  "grade": 7,                // optional, default 8
  "conversation_history": [] // optional, last 10 messages
}

// Response
{
  "response": "Ukudla kwelanga yi-...",
  "detected_language": "zu",
  "translated": true
}
```

### Quiz

| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| `GET`  | `/api/quiz/subjects`  | List available subjects  |
| `POST` | `/api/quiz/start`     | Generate a new quiz      |
| `POST` | `/api/quiz/answer`    | Submit an answer         |
| `POST` | `/api/quiz/summary`   | Get quiz results summary |

```json
// Start Quiz Request
{
  "subject": "Mathematics",
  "topic": "Algebra",       // optional
  "grade": 9,
  "language": null,          // optional
  "num_questions": 5
}

// Answer Request
{
  "quiz_id": "abc123",
  "question_id": 1,
  "answer": "B) 42"
}
```

### FAQ

| Method | Endpoint              | Description             |
|--------|-----------------------|-------------------------|
| `GET`  | `/api/faq/categories` | List FAQ categories     |
| `POST` | `/api/faq`            | Ask a school question   |

```json
// Request
{
  "question": "What time does school start?",
  "language": null,       // optional
  "category": "contacts"  // optional
}

// Response
{
  "answer": "School starts at 07:30...",
  "source": "faq",       // "faq" or "llm"
  "detected_language": "en"
}
```

### Announcements

| Method | Endpoint        | Description                      |
|--------|----------------|----------------------------------|
| `POST` | `/api/announce` | Translate notice to all languages |

```json
// Request
{
  "message": "School fees are due by Friday.",
  "tone": "formal",
  "source_language": "en"
}

// Response
{
  "polished": "...",
  "translations": {
    "en": "...",
    "af": "...",
    "zu": "...",
    // ... all 9 languages
  }
}
```

---

## 📁 Project Structure

```
gudani-bot/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                # FastAPI app, CORS, routers
│   │   ├── config.py              # Settings (API keys via env vars)
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── schemas.py         # Pydantic request/response models
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── llm_service.py     # Groq/Gemini LLM abstraction
│   │   │   ├── translation.py     # Google Translate API wrapper
│   │   │   ├── lang_detect.py     # Language detection
│   │   │   ├── quiz_engine.py     # Quiz generation & scoring
│   │   │   └── cache.py           # In-memory TTL cache
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── chat.py            # POST /api/chat
│   │   │   ├── quiz.py            # Quiz endpoints
│   │   │   ├── faq.py             # FAQ endpoints
│   │   │   └── announce.py        # Announcement endpoint
│   │   └── data/
│   │       ├── faq_data.json      # School FAQ database
│   │       └── subjects.json      # CAPS subjects list
│   ├── requirements.txt
│   ├── Procfile                   # Render start command
│   ├── render.yaml                # Render deployment config
│   ├── .env.example
│   └── .gitignore
├── frontend/
│   ├── public/
│   │   └── gudani-icon.svg
│   ├── src/
│   │   ├── main.jsx               # React entry point
│   │   ├── App.jsx                # Root component + ErrorBoundary
│   │   ├── index.css              # Global styles + animations
│   │   ├── context/
│   │   │   └── AppContext.jsx      # Language, grade, dark mode state
│   │   ├── services/
│   │   │   └── api.js             # All API fetch functions
│   │   ├── utils/
│   │   │   └── constants.js       # Languages, grades, tabs
│   │   └── components/
│   │       ├── Layout/
│   │       │   ├── Sidebar.jsx    # Desktop sidebar + mobile bottom bar
│   │       │   └── Header.jsx     # Top bar with language selector
│   │       ├── Chat/
│   │       │   ├── ChatWindow.jsx # Chat container + welcome screen
│   │       │   ├── MessageBubble.jsx
│   │       │   ├── MessageInput.jsx
│   │       │   ├── TypingIndicator.jsx
│   │       │   └── LanguageBadge.jsx
│   │       ├── Quiz/
│   │       │   ├── QuizMode.jsx   # Quiz state machine
│   │       │   ├── QuizSetup.jsx  # Subject/topic selector
│   │       │   ├── QuestionCard.jsx
│   │       │   └── ScoreSummary.jsx
│   │       ├── FAQ/
│   │       │   └── FAQChat.jsx    # FAQ chat + category browser
│   │       ├── Announcements/
│   │       │   └── AnnouncementGenerator.jsx
│   │       └── Settings/
│   │           ├── LanguageSelector.jsx
│   │           └── GradeSelector.jsx
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   ├── vercel.json
│   ├── package.json
│   ├── .env.production
│   └── .gitignore
├── docs/
│   └── PRESENTATION.md           # Demo talking points
└── README.md
```

---

## 🔮 Future Roadmap

- [ ] **Career Guidance Module** — Help learners explore career paths based on their subjects and interests
- [ ] **Lesson Plan Generator** — AI-generated lesson plans for teachers, aligned to CAPS curriculum
- [ ] **Voice Input/Output** — Speech-to-text and text-to-speech for learners with limited literacy
- [ ] **siSwati & isiNdebele** — Expand from 9 to all 11 official South African languages
- [ ] **Offline Mode** — PWA support with cached FAQ data for areas with poor connectivity
- [ ] **Student Progress Tracking** — Persistent quiz scores and learning analytics
- [ ] **Teacher Dashboard** — Admin panel for managing FAQ data and viewing usage statistics
- [ ] **WhatsApp Integration** — Reach learners where they already are via WhatsApp Business API

---

## 🙏 Credits

- **Name:** "Gudani" comes from Tshivenda, meaning "to learn" — reflecting the project's mission to make learning accessible in all South African languages
- **Context:** Built for the South African education system, aligned with the CAPS (Curriculum and Assessment Policy Statement) curriculum
- **AI:** Powered by [Groq](https://groq.com/) (Llama 3.3 70B) for fast, intelligent responses
- **Translation:** [Google Cloud Translation API](https://cloud.google.com/translate) for accurate multilingual support
- **Design:** [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) font, custom teal/amber/cream color palette
- **Hosting:** [Vercel](https://vercel.com/) (frontend) and [Render](https://render.com/) (backend) free tiers

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  <strong>Built with ❤️ for South African learners</strong><br/>
  <sub>by Tevin Wills</sub>
</p>
