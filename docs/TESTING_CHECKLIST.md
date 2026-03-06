# Gudani Bot — Final Testing Checklist

> Run through each item manually. Check the box when verified.
> Open the browser console (F12 → Console) before starting to catch any errors.

---

## 💬 Chat Feature

### Language Support (all 9 languages)

- [ ] Send a message in **English** → get English response
- [ ] Send a message in **isiZulu** (e.g., "Ngicela ungichazele nge-photosynthesis") → get isiZulu response
- [ ] Send a message in **Afrikaans** (e.g., "Wat is fotosintese?") → get Afrikaans response
- [ ] Send a message in **Sesotho** (e.g., "Photosynthesis ke eng?") → get Sesotho response
- [ ] Send a message in **Setswana** (e.g., "Photosynthesis ke eng?") → get Setswana response
- [ ] Send a message in **Sepedi** (e.g., "Photosynthesis ke eng?") → get Sepedi response
- [ ] Send a message in **Xitsonga** (e.g., "Photosynthesis i yini?") → get Xitsonga response
- [ ] Send a message in **Tshivenda** (e.g., "Photosynthesis ndi mini?") → get Tshivenda response
- [ ] Send a message in **isiXhosa** (e.g., "Yintoni i-photosynthesis?") → get isiXhosa response

### Grade Levels

- [ ] Change grade to **Grade 4** → responses should use simpler language
- [ ] Change grade to **Grade 12** → responses should be more detailed and advanced

### Chat Interactions

- [ ] Click **"Explain simpler"** on a bot response → get a simplified explanation
- [ ] Send **10+ messages** → conversation stays coherent (history maintained)
- [ ] Click the **clear chat** button (trash icon) → all messages reset, welcome screen returns
- [ ] Click a **quick-start card** on the welcome screen → sends the pre-filled message
- [ ] Language badge appears on both user and bot messages
- [ ] Translated messages show the **translation indicator** (asterisk on badge)

### Chat Error States

- [ ] Stop the backend → send a message → see "Gudani Bot is currently sleeping..." error
- [ ] Restart backend → send a message → normal response returns

---

## 📝 Quiz Feature

### Quiz Setup

- [ ] Subject dropdown loads with subjects from the API
- [ ] Select a **subject** and optional **topic**
- [ ] Change **number of questions** (5, 10, 15, 20) → button highlights
- [ ] Info bar shows current grade and language
- [ ] Click **"Start Quiz"** → spinner shows → quiz begins

### Answering Questions

- [ ] **Multiple choice** question displays with clickable options
- [ ] **True/False** question displays with two side-by-side buttons
- [ ] **Fill in the blank** question displays with text input + submit button
- [ ] Answer **correctly** → green feedback with explanation
- [ ] Answer **incorrectly** → red feedback with correct answer highlighted
- [ ] Progress bar advances after each question
- [ ] "Next Question" button appears after answering

### Quiz Results

- [ ] Complete a full quiz → **score summary** page displays
- [ ] Score ring **animates** (counts up from 0% to final score)
- [ ] Incorrect answers are **listed for review** with correct answers shown
- [ ] **Weak areas** or recommendation text is displayed
- [ ] Click **"Try Again"** → same quiz config restarts
- [ ] Click **"New Quiz"** → returns to setup screen

### Quiz in Other Languages

- [ ] Set language to isiZulu → start a quiz → questions appear in isiZulu
- [ ] Feedback and explanations also in isiZulu

---

## ❓ School FAQ

### Category Browsing

- [ ] Category chips appear at the top (All, Fees, Term Dates, etc.)
- [ ] Click **"All"** → category cards displayed in a grid
- [ ] Click a **category card** → suggestion questions for that category appear
- [ ] Click a **suggestion question** → answer appears in chat format

### FAQ Answers

- [ ] Ask **"How much are school fees?"** → get fee information
- [ ] Ask **"What is the school uniform?"** → get uniform info
- [ ] Ask **"When does the school term start?"** → get term dates
- [ ] Ask about **transport** → get transport info
- [ ] FAQ-sourced answers show **"From FAQ"** badge
- [ ] AI-generated answers show **"AI answer"** badge

### FAQ in Other Languages

- [ ] Set language to Setswana → ask about term dates → get response in Setswana

### FAQ Edge Cases

- [ ] Ask something **not in the FAQ** (e.g., "Does the school have a swimming pool?") → get an AI-generated response or "contact the office" message
- [ ] After bot responds, **suggestion chips** appear for related questions

---

## 📢 Announcements

### Templates

- [ ] **Before typing**: template cards displayed in a prominent grid
- [ ] Click **"Fee reminder"** → textarea pre-fills with template text
- [ ] Click **"Parent meeting"** → textarea pre-fills
- [ ] Click **"School closure"** → textarea pre-fills
- [ ] Click **"Exam timetable"** → textarea pre-fills
- [ ] **After typing**: templates collapse to compact chip buttons

### Generation

- [ ] Type a custom notice → click **"Generate in all languages"**
- [ ] Spinner shows while generating
- [ ] **9 translation cards** appear (one per language)
- [ ] Each card shows the **native language name** (e.g., isiZulu, Tshivenda)

### Tone

- [ ] Set tone to **Formal** → translations use formal register
- [ ] Set tone to **Casual** → translations use conversational register

### Copy

- [ ] Click **"Copy"** on a single language → text copied to clipboard, button shows **"Copied! ✓"** for 2 seconds
- [ ] Click **"Copy All"** → all translations copied, button shows **"Copied! ✓"**
- [ ] Paste copied text somewhere to verify content is correct

---

## ⚙️ Settings

- [ ] **Language selector** shows all 9 languages with native names (isiZulu, not Zulu)
- [ ] Selecting a language **updates the header dropdown** and welcome message
- [ ] **Grade slider** moves from 1 to 12
- [ ] Grade number labels are clickable
- [ ] **Dark mode toggle** switches the entire app to dark theme
- [ ] Dark mode toggle button text updates (shows current mode)

---

## 📱 Responsive Design

### Mobile (< 768px) — resize browser or use DevTools

- [ ] Sidebar becomes a **bottom tab bar** with icons and labels
- [ ] Chat input is **fixed to the bottom** of the screen
- [ ] Message bubbles take **full width** (90%)
- [ ] Quiz setup form is scrollable and usable
- [ ] Fill-in-blank input **stacks vertically** on mobile
- [ ] Announcement translations are **single-column**
- [ ] Category cards in FAQ are **single-column**
- [ ] No horizontal scrolling on any page

### Desktop (> 768px)

- [ ] Sidebar is visible on the left
- [ ] Expanding sidebar (> 1024px) shows tab labels
- [ ] Content area takes remaining width

---

## 🎨 Visual & Interactions

- [ ] **Tab transitions**: switching tabs has a subtle fade-in animation
- [ ] **Message bubbles**: user messages slide in from right, bot from left
- [ ] **Typing indicator**: three dots bounce while waiting for response
- [ ] **Score ring**: percentage counts up with animation
- [ ] **Skeleton loading**: quiz setup shows shimmer placeholders while loading subjects
- [ ] **Wake-up overlay**: if backend is cold, shows pulsing "G" logo with "Gudani is waking up..."
- [ ] Wake-up overlay **fades out** once backend responds

---

## ♿ Accessibility

- [ ] **Tab through** the entire app using keyboard → focus ring visible on all interactive elements
- [ ] **Screen reader**: buttons have descriptive aria-labels (check with browser accessibility inspector)
- [ ] **Color contrast**: text is readable in both light and dark modes
- [ ] **Error messages** have `role="alert"` (check in DevTools)

---

## 🔧 Technical

- [ ] Open browser console (F12) → **no errors** during normal use
- [ ] Check Network tab → API calls return **200 status**
- [ ] Health check: visit `/api/health` → `{"status": "ok", "name": "Gudani Bot"}`
- [ ] Ping: visit `/api/ping` → `{"pong": true}`
- [ ] Keep-alive: after 13 minutes, console shows `[gudani] ping: {pong: true}`

---

## ✅ Final Sign-Off

- [ ] All features working as expected
- [ ] No console errors
- [ ] Tested on mobile and desktop
- [ ] Tested in at least 3 languages
- [ ] Dark mode tested

**Tester:** ___________________
**Date:** ___________________
**Status:** PASS / FAIL
