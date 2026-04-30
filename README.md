<p align="center">
  <img src="frontend/public/gudani-icon.svg" alt="Gudani Bot" width="80" />
</p>

<h1 align="center">Gudani Bot 🤖📚</h1>
<h3 align="center"><em>"Gudani! — Your multilingual community & learning assistant"</em></h3>

<p align="center">
  A multilingual South African community assistant supporting 9 languages — chat,
  image understanding, voice, language learning, and a Tshivenda-quality layer.
</p>

<p align="center">
  <a href="https://gudani-bot.vercel.app"><strong>Live Demo</strong></a> &nbsp;|&nbsp;
  <a href="https://gudani-bot.onrender.com/docs"><strong>API Docs</strong></a>
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

South Africa has 11 official languages, yet most digital tools only speak English. **Gudani Bot** is a multilingual assistant for **students AND the broader community** — homework help, translation, document/form understanding, language learning, and everyday questions, all in your home language.

Named after the Tshivenda word meaning *"to learn"*, Gudani Bot has been deliberately broadened from a school-only chatbot to a community-wide assistant. Schoolwork still works the way it did; the same chat now also handles photos of forms or signs, voice input, and dedicated language-learning sessions.

### What's new in v2

- **🖼️ Image upload + vision** — photograph schoolwork, posters, signs, or forms and ask questions about them.
- **🎙️ Voice in / voice out** — speak instead of typing; hear answers read aloud (browser-side; honest fallbacks for low-resource languages).
- **🗂️ Persistent chat history** — saved past conversations you can reopen or delete.
- **🎓 Learn mode** — phrase-of-the-day, vocabulary, lessons, translation, explain-this-word, and flashcard practice. Tshivenda is the priority.
- **🌟 Tshivenda quality layer** — heuristic detection (langdetect lacks a ve profile), curated few-shot examples, post-processing corrections (e.g., `mbumbno` → `Mbumbano`), and Gemini routing. Includes an offline + live evaluation harness.

---

## ✨ Features

### 💬 Multilingual Chat
Ask anything — homework, translation, document understanding, everyday questions, community matters. Auto-detects language; replies in your language. Tshivenda is routed through a dedicated quality pipeline.

### 🖼️ Image Upload + Vision
Tap the paperclip in chat to attach an image. Gudani Bot uses Gemini Vision to read text, describe the picture, or answer your specific question about it. Useful for photographed schoolwork, posters, signs, and forms.

### 🎙️ Voice
- **Mic button** records your question and sends it as text (browser SpeechRecognition).
- **"Listen" button** on each assistant reply reads it aloud (browser SpeechSynthesis).
- Browser support varies by language. English/Afrikaans/isiZulu/isiXhosa work well in modern Chrome/Edge; Tshivenda and other low-resource languages typically have **no native voices** — Gudani surfaces this honestly rather than faking output.

### 🗂️ Past Chats
All conversations are saved server-side. Open the **Past chats** drawer in the chat tab to reopen or delete any prior conversation.

### 🎓 Learn Mode
Dedicated tab for language learning. Tshivenda is the priority and uses curated content; other South African languages are best-effort via the LLM.
- Phrase of the day (curated)
- Vocabulary by category (greetings, family, school, everyday, community)
- Beginner lessons with practice lines
- Translate text → target language
- Explain a word/phrase
- Flashcard practice

### 🌟 Tshivenda Quality Layer
Tshivenda was getting low-quality output through the generic translate-roundtrip pipeline (e.g., the model emitting `mbumbno` instead of `Mbumbano`). The fixes:
1. **Heuristic detection** for Tshivenda before langdetect (langdetect has no ve profile).
2. **Direct Gemini routing** — no English roundtrip — with a Tshivenda-anchored system prompt that forbids guessed spellings and instructs the model to admit uncertainty.
3. **Curated few-shot examples** (20+) covering greetings, school, community, language learning.
4. **Corrections normalizer** applied to both input and output: `mbumbno → Mbumbano`, `tshi venda → Tshivenda`, `ndilivhuwa → Ndi a livhuwa`, etc.
5. **Offline + live evaluation harness** at `backend/test_tshivenda.py`.

### 📝 Quiz Mode
Interactive quizzes across 10 CAPS-aligned subjects. MCQ / true-false / fill-in-blank with instant AI feedback.

### ❓ Community Info (was School FAQ)
Quick answers to common questions about school fees, term dates, admissions, uniform, transport, and contacts. Structured search first, AI fallback.

### 📢 Notices Generator
Write a notice in English (or any supported language), Gudani translates it into all 9 languages.

### ⚙️ Settings
Language selector · Grade level (1–12) · Dark mode toggle.

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
| **AI/LLM**   | Groq (Llama 3.3 70B) for general chat · Gemini 2.0 Flash for Tshivenda + image vision |
| **Translation** | Google Cloud Translation API v2 (optional, for af/zu/xh/st/tn/nso/ts only) |
| **Language Detection** | `langdetect` + Tshivenda heuristic (langdetect has no ve profile) |
| **Voice (frontend)** | Browser Web Speech API (SpeechRecognition + SpeechSynthesis) |
| **Voice (backend)** | Pluggable stubs — server STT/TTS providers can be wired in [`app/services/speech.py`](backend/app/services/speech.py) |
| **History storage** | File-based JSON at `backend/app/data/conversations/<id>.json`. Swap for Supabase/Postgres without changing the router contract. |
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

**Chat Flow (general languages):**
1. User sends a message
2. Backend detects the language (Tshivenda heuristic runs first; otherwise langdetect)
3. If non-English/Afrikaans → translate to English via Google Translate
4. Send to Groq with system prompt
5. Translate response back to user's language

**Tshivenda Flow (special):**
1. Detect (heuristic in `services/tshivenda.py`)
2. Normalize input (corrections JSON)
3. Skip the English roundtrip — call **Gemini directly** with a Tshivenda-anchored system prompt + curated few-shot
4. If Gemini fails, fall back to Groq with the same prompt
5. **Post-process** output through the same corrections normalizer before returning

**Image Flow:**
1. User uploads via multipart `POST /api/media/analyze-image`
2. Image bytes are validated (size + mime type)
3. Sent to Gemini Vision with mode-specific prompt (qa / ocr / describe)
4. Text response returned in the user's language

**Voice Flow:**
1. Mic button uses browser SpeechRecognition → transcript becomes the chat input
2. Listen button uses browser SpeechSynthesis with a BCP-47 tag for the message language
3. Backend `/api/media/transcribe` and `/api/media/synthesize` exist as a pluggable structured fallback (currently return `supported: false` until a provider is wired in)

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.11+** ([python.org](https://www.python.org/downloads/))
- **Node.js 18+** ([nodejs.org](https://nodejs.org/))
- **Git** ([git-scm.com](https://git-scm.com/))
- API Keys:
  - [Groq API Key](https://console.groq.com/) — required for general chat (free tier available)
  - [Gemini API Key](https://ai.google.dev/) — required for **Tshivenda quality** + **image vision** (free tier available)
  - [Google Cloud Translation API Key](https://cloud.google.com/translate/docs/setup) — optional; without it, non-English/Afrikaans/Tshivenda messages fall back to English

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
| `GET/HEAD` | `/api/ping`   | Keep-alive ping          |
| `GET`  | `/api/languages`   | List supported languages |

### Media (image + voice)

| Method | Endpoint                      | Description                                 |
|--------|-------------------------------|---------------------------------------------|
| `POST` | `/api/media/analyze-image`    | multipart image + optional prompt → analysis |
| `POST` | `/api/media/transcribe`       | multipart audio → transcript (provider stub) |
| `POST` | `/api/media/synthesize`       | text → audio (provider stub)                 |

### Chat history

| Method | Endpoint                      | Description                          |
|--------|-------------------------------|--------------------------------------|
| `GET`  | `/api/history`                | List saved conversations             |
| `POST` | `/api/history`                | Create a conversation                |
| `GET`  | `/api/history/{id}`           | Get a single conversation + messages |
| `PATCH`| `/api/history/{id}`           | Update messages / title / language   |
| `DELETE`|`/api/history/{id}`           | Delete a conversation                |

### Language learning

| Method | Endpoint                      | Description                          |
|--------|-------------------------------|--------------------------------------|
| `GET`  | `/api/learn/phrase-of-the-day`| Curated Tshivenda phrase             |
| `GET`  | `/api/learn/vocabulary`       | Curated Tshivenda vocab (categories) |
| `GET`  | `/api/learn/lessons`          | Lesson list                          |
| `GET`  | `/api/learn/lessons/{id}`     | Lesson detail                        |
| `POST` | `/api/learn/translate`        | Translate text → target language     |
| `POST` | `/api/learn/explain`          | Explain a word/phrase                |
| `POST` | `/api/learn/practice`         | Generate flashcards                  |

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
│   ├── test_api.py               # Quick API smoke tests
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
│   ├── PRESENTATION.md           # Demo talking points
│   └── TESTING_CHECKLIST.md      # Manual testing checklist
└── README.md
```

---

## ⚖️ Honest limits & fallbacks

This project deliberately does **not** fake capability. Things to know:

**Tshivenda quality layer**
- The corrections JSON at [`backend/app/data/tshivenda_corrections.json`](backend/app/data/tshivenda_corrections.json) is hand-curated and small. It is **not** a full Tshivenda spellchecker — it targets observed model errors. Add entries when you see new ones.
- Few-shot examples at [`backend/app/data/tshivenda_examples.json`](backend/app/data/tshivenda_examples.json) are also hand-checked. Don't auto-generate them.
- The system prompt instructs the model to **admit uncertainty** rather than invent spellings. Some answers will say "A thi ḓivhi" or fall back to English in parentheses — this is intentional.

**Voice support by language**
| Language | Browser STT | Browser TTS | Notes |
|----------|-------------|-------------|-------|
| `en` | ✅ | ✅ | Best support across browsers |
| `af` | ✅ | ✅ | Good in Chrome/Edge |
| `zu`, `xh` | ⚠️ partial | ⚠️ partial | Voice availability depends on the OS/browser |
| `st`, `tn`, `nso`, `ts` | ❌ | ❌ | No native voices in most browsers |
| `ve` | ❌ | ❌ | **No browser voice support today.** Type the message instead. |

When voice is unavailable, the UI shows an honest fallback message rather than producing fake audio.

**Image vision**
- Powered by Gemini 2.0 Flash. Free tier limits apply.
- 6 MB upload cap (mirrored client and server side).
- Allowed types: JPEG, PNG, WebP, HEIC.

**Chat history storage**
- Default storage is JSON files at `backend/app/data/conversations/<id>.json`. Render's free tier has an ephemeral filesystem — saved conversations will not survive a redeploy. For durable storage, swap [`backend/app/services/history.py`](backend/app/services/history.py) for a database client. The router contract does not change.

---

## 🧪 Testing

**Backend smoke test:**
```bash
cd backend
uvicorn app.main:app --reload --port 8000   # in one terminal
python test_api.py                           # in another
```

**Tshivenda evaluation:**
```bash
cd backend
python test_tshivenda.py            # offline checks (corrections, detection, prompt)
python test_tshivenda.py --live     # full /api/chat round-trip (requires backend running)
```

**Frontend build:**
```bash
cd frontend
npm run build
```

A full **manual testing checklist** is at [`docs/TESTING_CHECKLIST.md`](docs/TESTING_CHECKLIST.md).

---

## 🔮 Future Roadmap

- [ ] **Career Guidance Module** — Help learners explore career paths based on their subjects and interests
- [ ] **Lesson Plan Generator** — AI-generated lesson plans for teachers, aligned to CAPS curriculum
- [ ] **Real Tshivenda TTS** — Plug a custom or community-trained Tshivenda voice into `services/speech.py`
- [ ] **siSwati & isiNdebele** — Expand from 9 to all 11 official South African languages
- [ ] **Offline Mode** — PWA support with cached FAQ data for areas with poor connectivity
- [ ] **Database-backed history** — Swap file storage for Supabase or Postgres
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
