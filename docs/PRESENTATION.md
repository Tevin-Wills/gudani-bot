# Gudani Bot — 5-Minute Demo Presentation

> **Talking points and demo flow for presenting Gudani Bot.**

---

## Slide 1: The Problem (1 minute)

### Language Barrier in South African Education

- South Africa has **11 official languages**, but most edtech tools only support English
- **78% of South Africans** speak a language other than English at home
- Learners in rural and township schools often struggle to understand English-only resources
- This creates an **invisible barrier** — students may understand the concept but not the language it's taught in
- Result: lower pass rates, disengagement, and inequity in education

**Key stat:** *"A child who learns in their home language for the first 6-8 years performs significantly better academically."* — UNESCO

---

## Slide 2: The Solution — Gudani Bot (1 minute)

### "Gudani! — Learn in your language"

- **Gudani** means "to learn" in Tshivenda
- AI-powered school chatbot that supports **9 South African languages**
- Students type in their own language — the bot understands and responds in that same language
- Aligned with the **CAPS curriculum** (Grades 1–12)

### Four core features:
1. **Chat** — Ask any homework or study question
2. **Quiz** — Test yourself across 10 subjects with instant feedback
3. **School FAQ** — Get instant answers about school fees, term dates, uniforms, etc.
4. **Announcements** — Translate school notices into all 9 languages with one click

---

## Slide 3: Live Demo (2 minutes)

### Demo Flow

#### 1. Chat in English (30s)
- Open Gudani Bot → Chat tab
- Type: *"What is photosynthesis?"*
- Show the response — clear, grade-appropriate explanation
- Point out the language badge showing "English"

#### 2. Switch to isiZulu (30s)
- Change language selector to **isiZulu**
- Type: *"Ngicela ungichazele nge-photosynthesis"*
- Show the response comes back **in isiZulu**
- Point out: "The bot detected isiZulu, translated internally, and responded in the learner's language"

#### 3. Take a Quick Quiz (30s)
- Switch to **Quiz** tab
- Select: Mathematics, Grade 9, 5 questions
- Answer 2-3 questions — show MCQ, true/false, fill-in-blank types
- Show instant feedback with explanation
- Show the animated score summary

#### 4. School FAQ (15s)
- Switch to **School Info** tab
- Tap a category card (e.g., "Fees")
- Tap a suggested question
- Show instant answer with "From FAQ" badge

#### 5. Announcement Generator (15s)
- Switch to **Notices** tab
- Tap "Fee reminder" template
- Click "Generate in all languages"
- Scroll through translations — show Copy button

---

## Slide 4: Technical Highlights (30 seconds)

### How it works under the hood

```
User (isiZulu) → Detect Language → Translate to English → LLM (Groq) → Translate back → User (isiZulu)
```

- **9 languages** with automatic detection
- **Groq API** (Llama 3.3 70B) — fast, free-tier AI
- **Google Translate API** — accurate translations for all 9 SA languages
- **100% free hosting** — Vercel (frontend) + Render (backend)
- **Responsive design** — works on phones, tablets, and desktops
- **Dark mode** — because students study at night too
- **No login required** — zero friction, instant access

### Tech stack (one line):
> React + FastAPI + Groq AI + Google Translate — deployed on Vercel & Render for free

---

## Slide 5: Future Vision (30 seconds)

### Where Gudani Bot is going

- **Voice input/output** — for younger learners and those with limited literacy
- **Career guidance** — "What can I study if I love Life Sciences?"
- **All 11 languages** — adding siSwati and isiNdebele
- **WhatsApp integration** — reach learners where they already are
- **Offline mode** — PWA for areas with poor connectivity
- **Teacher dashboard** — track student progress and manage content

### The bigger picture:

> *"Every child in South Africa should be able to ask a question and get a helpful answer — in the language they think in."*

---

## Q&A Prep

**Q: Why not just use Google Translate directly?**
A: Translation alone isn't enough. Gudani Bot *understands* the question, generates a grade-appropriate educational response, and *then* translates. It's a tutor, not a translator.

**Q: How accurate are the translations?**
A: We use Google Cloud Translation API, which has strong support for South African languages. For educational content, the translations are reliable. We always show a language badge so the user knows if translation was applied.

**Q: Can this work without internet?**
A: Currently requires internet. Offline mode with cached FAQ data is on the roadmap.

**Q: How much does it cost to run?**
A: Currently **$0/month**. Groq API free tier, Google Translate free tier (500K characters/month), Vercel free, Render free. Scales to paid tiers if needed.

**Q: Is the FAQ data real?**
A: It's demo data for "Gudani Demo School." In production, each school would customize their own FAQ data.

---

## Demo Checklist

Before presenting:

- [ ] Backend is running (check: visit `/api/health`)
- [ ] Frontend is running (check: visit `localhost:5173` or Vercel URL)
- [ ] Groq API key is set (chat will fail without it)
- [ ] Test one chat message to confirm everything works
- [ ] Have the app open in a browser, ready to demo
- [ ] Optional: open a second browser tab with dark mode for contrast
