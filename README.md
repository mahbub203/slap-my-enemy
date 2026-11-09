# 🥊 SLAP MY ENEMY: BANGLADESH EDITION
## AI-Powered Virtual Stress Relief & Interactive Character Simulator

> **🌐 LIVE DEMO LINK: [https://mahbub203.github.io/slap-my-enemy/](https://mahbub203.github.io/slap-my-enemy/)**  
> **🎮 PLAY DIRECTLY IN YOUR BROWSER NOW: [https://mahbub203.github.io/slap-my-enemy/](https://mahbub203.github.io/slap-my-enemy/)**

[![Live Demo](https://img.shields.io/badge/PLAY_NOW-LIVE_DEMO-success?style=for-the-badge&logo=google-chrome&logoColor=white)](https://mahbub203.github.io/slap-my-enemy/)
[![GitHub Pages](https://img.shields.io/badge/Hosted_with-GitHub_Pages-blue?style=for-the-badge&logo=github)](https://mahbub203.github.io/slap-my-enemy/)
[![License](https://img.shields.io/badge/license-MIT-purple?style=for-the-badge)](LICENSE)

---

## 🌟 Key Features

### 1. 🎨 Full 2D Interactive Cartoon Arena (Primary Mode)
- **100% Crystal Clear Face:** Uploaded photos render at native high-DPI resolution without 3D geometric clipping, washouts, or distortion.
- **Guaranteed Headroom:** Generous top clearance ensuring HUD elements and reaction banners never obstruct the face or head.
- **Full Stylized Human Body:** Complete Bangladeshi attire with Panjabi/shirt, collar, golden buttons, belt, trousers, and modern sneakers.
- **Dynamic Ragdoll Spring Physics:** Head snap recoil, torso flinches, stumbling balance, and comical hit marks.

### 2. 🚶‍♂️ Living Dhaka Street & Bangladesh Environments
- **6 Authentic Bangladesh Scenarios:**
  1. **Dhaka City Street (ঢাকার রাস্তা):** Asphalt road, zebra crossing, cycle rickshaw, tong tea stall with animated rising steam particles.
  2. **Bangladeshi Village (সবুজ গ্রামবাংলা):** Mud courtyard, tin-roof hut, swaying coconut palms, and duck pond.
  3. **University Campus (বিশ্ববিদ্যালয় ক্যাম্পাস):** Curzon Hall-style colonial red-brick pillars, paved walkways, and benches.
  4. **Local Bazar (লোকাল কাঁচাবাজার):** Vegetable crates, colorful awnings, and market atmosphere.
  5. **Dhaka Rooftop (ঢাকার ছাদ ও গোধূলি):** Terracotta tiles, Gazi black water tank, clotheslines with drying lungi.
  6. **Eid Festival (ঈদ উৎসব ও মেলা):** Fairground stage, illuminated golden crescent moon, and animated fairy lights.
- **Animated 2D Pedestrians (মানুষের হাঁটাচলা):** Continuous natural walk cycles for elder in Panjabi/Lungi, youth in jeans/t-shirt, and shoppers carrying bazaar bags.
- **Moving Dhaka Green CNG Auto-Rickshaw:** Classic green baby taxi driving across the street with spinning wheels and headlight beams.

### 3. 🥊 First-Person Player Visual Attacks ("নিজের মার দেখা যাবে")
| # | Action | Hotkey | Player Attack Animation | Reaction VFX |
|---|---|---|---|---|
| 1 | **SLAP (থাপ্পড়)** | `1` / Swipe H | Giant 3D/2D player hand swooshes in from the side with wind trails | Cheek whip recoil, red handprint imprint, "চড়! SLAP!" comic starburst |
| 2 | **PUNCH (ঘুষি)** | `2` / Swipe V | Massive boxing glove thrusts forward from camera center | Heavy recoil, comic bump, band-aid, "ঘুষি! POW!" |
| 3 | **PUSH (ধাক্কা)** | `3` | Two player hands thrust forward together | Full-body stumble onto heels, "ধাক্কা! PUSH!" |
| 4 | **TOMATO (টমেটো)** | `4` | Player hand throws ripe tomato in a 3D arc | Splats on face with dripping red sauce, "টমেটো! SPLAT!" |
| 5 | **WATER (পানি)** | `5` | Water blaster nozzle sprays high-pressure water jet | Sparkling droplets, shivering wet dog shake, "পানি! SPLASH!" |
| 6 | **TICKLE (সুরসুরি)** | `6` | Two cartoon hands wiggle fingers on ribs | Hysterical laughter vibration, sparkles, "সুরসুরি! HEHE!" |
| 7 | **RESET (রিসেট)** | `R` | Golden aura bursts, clears all decals | Returns character to pristine idle pose |

### 4. 🌐 Multilingual Engine
- **3 Modes:** বাংলা (Bangla - Default), Banglish, English.
- Custom typography: *Noto Sans Bengali*, *Hind Siliguri*, and *Inter*.
- Over 100 context-aware Bangladeshi humorous quips and dialogue reactions.

### 5. 🔊 Procedural Web Audio Engine
- Synthesizer generated hits, combo chimes, and celebration fanfare without external MP3 dependencies.
- 6 Authentic Bangladeshi ambient soundscapes:
  - Rickshaw bell *"Tung-Tung"* & street traffic hum.
  - Village birdsong & gentle breeze.
  - University cafeteria banter & acoustic adda chords.
  - Vegetable vendor calls & market chatter.
  - Rooftop twilight breeze.
  - Eid festive melodies.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Three.js, HTML5 2D Canvas, Zustand, Lucide Icons, Canvas Confetti.
- **Backend:** Python 3.11+, Django 6.1+, Django REST Framework, Django CORS Headers, Pillow, python-dotenv, Google GenAI SDK (`google-genai`).
- **Database:** SQLite (local development), PostgreSQL ready.
- **Hosting / Deployment:** GitHub Pages (Live Frontend), Docker & Docker Compose.

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
- **Frontend App:** `http://localhost:5173` (Vite + React)
- **Backend API:** `http://127.0.0.1:8000/api/` (Django REST Framework)
- Automatic proxy forwarding from `http://localhost:5173/api/` to `http://127.0.0.1:8000/api/`

---

## 🧪 Testing

### Backend Unit Tests
```bash
python backend/manage.py test game_api
```
*(Expected output: 8/8 tests passed in < 0.4s).*

### Frontend Production Build
```bash
cd frontend
npm run build
```

---

## ⚖️ Safety & Ethical Guidelines
- **Fictional avatars only:** Designed strictly for humorous entertainment and virtual stress relief.
- **Non-graphic cartoon action:** No blood, realistic violence, or real-world threats.
- **Privacy First:** Uploaded images can be instantly wiped with the "Privacy Data Wipe" button.
