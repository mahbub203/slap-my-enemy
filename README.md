# 🥊 SLAP MY ENEMY
## AI-Powered Virtual Stress Relief & Interactive Character Simulator

> Transform your daily frustrations into an entertaining, fictional, cartoon 3D game avatar and interact inside a real-time virtual colosseum.

---

## 🌟 Key Features

### 1. Photo Upload & Customization System
- **Supported Formats:** JPG, JPEG, PNG, and WEBP.
- **Drag-and-Drop Uploader:** Intuitive drag-and-drop or file picker with client and server validation (max 10MB).
- **Interactive Image Editor:** Rotate 90°, flip horizontally, adjust brightness, contrast, and saturation, with circular avatar preview guides.
- **Preset Rivals:** Immediate 1-click test characters ("Grumpy Boss", "Toxic Teammate", "Monday Alarm") for users who prefer not to upload photos.
- **Explicit Consent Mandate:** Explicit consent checkbox required prior to avatar generation.

### 2. Stylized AI Character Generation
- **5 Fictional Game Aesthetics:**
  1. **Cartoon 3D:** Pixar/Dreamworks style with warm glossy lighting and soft curves.
  2. **Funny Caricature:** Comedic center-bulge magnification, exaggerated expressions, and rosy blush.
  3. **16-Bit Pixel Art:** Chunky retro arcade fighter aesthetic with quantized color palettes.
  4. **Comic Book Pop-Art:** Bold ink outlines, high-contrast shadows, and Ben-Day pop dots.
  5. **Low-Poly Game:** Modern indie polygon mesh facets with sharp faceted shading.
- **Dual Engine Architecture:**
  - **Modular Cloud AI:** Integrated with Google GenAI SDK (`google-genai`).
  - **Offline Algorithmic Caricature Engine:** Instant, 100% resilient fallback using HTML5 Canvas & Python Pillow pixel filters. Never fails even without API keys!
- **Ethical Safeguards:** Generates strictly fictional cartoon game avatars; does not produce realistic deepfakes or real-world photographs.

### 3. Interactive 3D Virtual Colosseum
- **Three.js Powered Arena:** Cyberpunk lighting, neon stage rings, overhead spotlight, soft shadows, and floating energy pillars.
- **Articulated Humanoid Model:** Head, neck, chest, shoulders, arms, hands, legs, and feet with joint animations.
- **Dynamic Face Texturing:** Real-time face projection with expression states (*neutral*, *shocked*, *dizzy*, *funny_smile*, *crying_laugh*).
- **Camera Controls:** Orbit and tilt controls with mouse drag, touch gestures, and double-click auto-centering.

### 4. 7 Non-Graphic Entertainment Actions
| # | Action | Hotkey | VFX & Physics | Audio Effect |
|---|---|---|---|---|
| 1 | **SLAP** | `1` | Head whip sideways, spring recoil, hit sparks | Crisp smack transient |
| 2 | **PUNCH** | `2` | Heavy backward knockback, screen shake, comic sparks | Deep sub-bass boom & crunch |
| 3 | **PUSH** | `3` | Backward heel stumble, windmilling arms | Gusting air swoosh |
| 4 | **THROW A TOMATO** | `4` | 3D tomato projectile in parabolic arc, 40 red splash particles, facial splat decal | Wet squelch & squish |
| 5 | **WATER SPLASH** | `5` | Water spray blast, sparkling blue droplets, dog-like head shimmy | Bubbly water splash |
| 6 | **TICKLE** | `6` | Jittering giggle vibration, floating sparkles | Playful high-pitch arpeggio |
| 7 | **RESET** | `R` / `7` | 360° victory jump spin, clears all decals & dizziness | Rising reset chime |

### 5. Game Mechanics & Sound
- **Web Audio Procedural Synthesizer:** Zero external audio file dependencies; zero missing asset 404s or network lag. Includes an optional background arena synth-groove beat.
- **Dynamic Combo System:** Streak multiplier up to 5x with combo timer and chimes.
- **Stress Relief Progress Meter:** Visual indicator from 0% to 100% stress relief.
- **7 Unlockable Badges:** First Strike, Combo Maestro, Tomato Toss Master, Hydro Cannon, Tickle Tactician, Stress Free Zone, Relentless Reliever.
- **Humorous Reaction Messages:** Over 25 context-aware comic reactions from the character.
- **Direct Swipe Gestures:** Swipe horizontally to slap, swipe vertically to punch!

### 6. Privacy & Security
- **Temporary Sessions:** Media files are isolated by session ID.
- **One-Click Deletion:** "Delete Session & Avatar Data" wipes all files from the server disk and local storage immediately.
- **No Third-Party Tracking:** Photos are never published, shared, or indexed.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Three.js, Zustand, Lucide Icons, Canvas Confetti.
- **Backend:** Python 3.11+, Django 6.1+, Django REST Framework, Django CORS Headers, Pillow, python-dotenv, Google GenAI SDK (`google-genai`).
- **Database:** SQLite (default for development), PostgreSQL-ready.
- **Deployment:** Docker & Docker Compose.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js >= 18
- Python >= 3.10
- Git

### 1. Single Command (Both Backend & Frontend)
From the project root:
```bash
npm run dev
```
*(Or on Windows, simply double-click `run.bat` or run `.\start-all.ps1`).*

This concurrently starts:
- **Backend API:** `http://127.0.0.1:8000` (Django REST Framework)
- **Frontend App:** `http://localhost:5173` (Vite + React)
- Automatic proxy forwarding from `http://localhost:5173/api/` to `http://127.0.0.1:8000/api/`

---

### 2. Running Individual Services (Optional)

#### Frontend Only
```bash
npm run dev:frontend
```

#### Backend Only
```bash
npm run dev:backend
```

---

## 🧪 Testing

### Backend Unit Tests
Run the Django test suite covering image validation, 5 character styles, consent enforcement, healthcheck, and disk deletion:
```bash
cd backend
python manage.py test game_api
```
*(Expected output: 7 passed tests in < 1 second).*

### Frontend Build Verification
Verify TypeScript compilation and production bundling:
```bash
cd frontend
npm run build
```

---

## 🐳 Docker Deployment

To build and run the entire stack with Docker Compose:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health/` | Health check & AI mode detection |
| `POST` | `/api/characters/generate/` | Upload photo & generate stylized 3D avatar |
| `GET` | `/api/characters/<uuid:id>/` | Fetch character configuration |
| `DELETE` | `/api/characters/<uuid:id>/` | Permanently delete character & wipe media from disk |
| `POST` | `/api/characters/cleanup-session/` | Delete all avatars associated with a session ID |
| `POST` | `/api/sessions/update-stats/` | Update score, max combo, and total hits |

---

## ⚖️ Safety & Ethical Guidelines
- **Fictional avataring only:** The system deliberately prevents the generation of photorealistic deepfakes.
- **Non-graphic entertainment:** No realistic injuries, blood, or real-world threats.
- **Consent-first:** Character generation is blocked unless the user explicitly checks the consent agreement.
