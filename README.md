# 🌐 CodeCards Dashboard

Web-based flashcard management system with analytics and practice mode. Part of the CodeCards project for WeMakeDevs Hackathon 2024.

**Live Demo**: [https://codecard-dashboard.vercel.app/](https://codecard-dashboard-mm6b.vercel.app/)

---

## 🎯 Overview

This is the web dashboard companion to the CodeCards Chrome extension. It provides a full-featured interface for managing flashcards, viewing analytics, and practicing with quiz mode.

---

## ✨ Features

- 📊 **Statistics Dashboard** - Visual overview with card counts
- 📈 **Interactive Pie Chart** - Category distribution (Chart.js)
- 🎯 **Practice Mode** - Quiz yourself and track progress
- ➕ **Add Cards** - Create custom flashcards
- ✏️ **Edit/Delete** - Full card management
- 🔍 **Search & Filter** - Find cards by category or keyword
- 📥 **Export/Import** - Sync with Chrome extension
- 📱 **Responsive Design** - Works on all devices

---

## 🛠️ Tech Stack

- **HTML5, CSS3, JavaScript** (Vanilla - no frameworks)
- **Chart.js** - Data visualization
- **LocalStorage API** - Client-side persistence
- **Vercel** - Deployment platform

---

## 🚀 Local Development

1. Clone the repository
```bash
git clone https://github.com/ishekaa12/codecard-dashboard.git
cd codecard-dashboard
```

2. Open `index.html` in your browser
```bash
# Or use a local server
python -m http.server 8000
# Then visit: http://localhost:8000
```

That's it! No build process needed.

---

## 📦 Deployment on Vercel

This project is deployed on Vercel for the hackathon prize track.

**Deploy your own:**
1. Fork this repository
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your fork
5. Click "Deploy"
6. Done! ✅

**Why Vercel?**
- Zero configuration needed
- Automatic HTTPS and CDN
- Git integration for auto-deploys
- Perfect for static sites

---

## 📁 File Structure

```
codecard-dashboard/
├── index.html          # Main page structure
├── style.css           # Styling and responsive design
├── app.js              # Core logic and Chart.js integration
└── README.md          # This file
```

---

## 🔄 Syncing with Extension

1. **From Extension to Dashboard:**
   - Open extension → Export Cards → Download JSON
   - Open dashboard → Import Cards → Select file

2. **From Dashboard to Extension:**
   - Dashboard → Export Cards → Download JSON
   - Extension new tab → Sync button → Import Cards

---

## 🎓 Key Learnings

- **Vercel Deployment**: Zero-config deployment workflow
- **Chart.js Integration**: Creating interactive data visualizations
- **LocalStorage**: Client-side data persistence patterns
- **Responsive Design**: Mobile-first CSS with Grid/Flexbox
- **Export/Import UX**: User-friendly data portability

---

## 📊 Stats

- **Deployment Time**: < 1 minute on Vercel
- **Load Time**: < 2 seconds (Vercel CDN)
- **Lines of Code**: ~600 (HTML + CSS + JS)
- **Bundle Size**: < 50KB (no dependencies except Chart.js)

---

## 🏆 Hackathon Submission

**Prize Track**: Vercel Deployment Award ($2,000)

This dashboard demonstrates successful deployment on Vercel with:
- ✅ Live, accessible URL
- ✅ HTTPS and performance optimization
- ✅ Automatic deployments from Git
- ✅ Zero configuration required

---

## 🔗 Related

- **Chrome Extension Repo**: [github.com/ishekaa12/codecards](https://github.com/ishekaa12/codecards)
- **Demo Video**: [Link to video]

---

**Built for WeMakeDevs Hackathon 2025** | Deployed on Vercel 🚀
