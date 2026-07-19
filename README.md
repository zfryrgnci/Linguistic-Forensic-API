<div align="center">
  <img src="https://img.shields.io/badge/Status-Active-success.svg?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/Architecture-AI_First-purple.svg?style=for-the-badge" alt="Architecture" />

  <h1>🕵️ Forensic Linguist & Media Bias Detector</h1>
  <p><em>A high-precision Linguistic Forensic API to detect media bias, rhetorical manipulation, and logical fallacies.</em></p>
</div>

---

## 🚀 Overview

The **Forensic Linguist & Media Bias Detector** is an advanced AI sandbox designed to ingest editorial text, political statements, or corporate press releases, and output an objective analysis of rhetorical manipulation. 

Powered by Google's `gemini-3.5-flash` model, it leverages a strict linguistic taxonomy to identify things like "Loaded Language", "Sensationalism", and "Ad Hominem" attacks, providing users with a "Forensic Integrity Meter" score.

## ✨ Key Features
- 🧠 **Forensic AI Engine**: Scans unstructured text for 9 distinct types of logical fallacies and emotional triggers.
- 🎨 **Premium Sandbox UI**: A hacker-style, dark-mode terminal aesthetic built with React, Tailwind v4, and Framer Motion.
- 📊 **Objectivity Scoring**: Instantly calculates a 0-100% "Forensic Integrity Meter" neutrality score.
- ⚡ **Interactive Highlight Blueprint**: Click highlighted text in the source document to see the exact linguistic breakdown and severity.

## 🛠 Tech Stack
- **Frontend**: React 19, TailwindCSS v4, Vite, Lucide Icons, Framer Motion.
- **Backend**: Node.js, Express, TypeScript.
- **AI Core**: `@google/genai` (Gemini API) enforcing rigorous JSON schema compliance.

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js (v24+)
- A Free [Google Gemini API Key](https://aistudio.google.com/)

### 2. Setup
Clone the repo and configure the environment:
```bash
git clone https://github.com/zfryrgnci/forensic-linguist-bias-detector.git
cd forensic-linguist-bias-detector
npm install
```

Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_free_api_key_here
```

### 3. Run Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to access the AI workspace.

## 🧪 Testing Suite
This project implements `Vitest` and `Supertest` for backend route validation:
```bash
npm run test
```

## 🤝 Open Source
Created by [Zafer Yorganci](https://github.com/zfryrgnci). Feel free to fork, star, and use this to optimize your academic or journalistic analysis pipelines!