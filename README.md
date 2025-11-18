# 🧠 Dipz Origin — Project Intelligence CLI (v1)

**Free Tier Edition**

A universal project-awareness engine for developers.  
Origin scans any project (frontend, backend, full-stack) and generates a clean structural report.

---

## 🚀 Features (Free Tier)

### 🔍 File Intelligence

- Total file count
- Route detection
- Basic schema detection
- Detects API folders
- Detects .env files
- Framework detection
- Dockerfile detection

### 🧩 AI-Ready Metadata

Origin generates:

```
docs/ai/bridge_summary.md
docs/ai/bridge.json
```

So AI tools (ChatGPT, Claude, etc.) instantly understand your project structure.

### 🧠 Developer Guidance

Each audit includes:

- Helpful hints
- Organization suggestions
- Recommended next steps

---

## 🛠 Pro Tier (SaaS — not included in this CLI)

The upcoming Pro Tier (via Origin SaaS) unlocks:

### ✔ Developer Behavior Learning

- Peak coding hours
- Flow vs reflection mode
- Session consistency tracking

### ✔ Pattern Engine

- Route drift
- Schema mismatch
- Cleanup frequency
- Stability score

### ✔ Ecosystem Mode

Map all sibling projects automatically.

### ✔ Auto-Fix Plans

Safe copy-paste fix suggestions.

\_These features are NOT included in the npm CLI — The npm package contains Free Tier only.

---

## 🚀 Installation

### Global Install (recommended)

```
npm install -g deep-origin-cli
```

### Local Install

```
npm install deep-origin-cli
```

---

## 🧪 Usage

### Run audit on current project

```
origin audit
```

### Run audit on another folder

```
origin audit ../my-project
```

### View CLI version

```
origin --version
```

---

## 📊 What Happens During Audit

When you run:

```
origin audit .
```

Origin generates:

### 1. File Intelligence

- Total files
- Detected API folders
- Detected schemas
- Dead/unused file indicators (Pro)
- Dockerfile detection

### 2. Backend Intelligence

- API routes
- Controller mapping (Pro)
- Schema fields

### 3. Environment Key Mapping

- Reads `.env` files
- Lists keys used
- Flags missing or unused keys

### 4. Framework Detection

- Next.js
- React
- Express
- NestJS
- Custom stacks

### 5. AI Bridge Generation

- Creates `bridge.json`
- Creates `bridge_summary.md`

These are used by AI tools to interpret the project properly.

---

## 📁 Folder Structure of Origin CLI

```
origin/
│
├── bin/
│   └── origin.js              # CLI entry
│
├── core/
│   └── (audit, flow, rhythm, scanner engines)
│
├── templates/
│   └── dipz.json              # Template manifest
│
├── dipz.json                  # CLI manifest
├── package.json               # CLI metadata
├── README.md                  # Documentation
└── node_modules/
```

---

## 🔒 Security & Privacy

- ✔ 100% read-only
- ✔ Does NOT modify your project
- ✔ Does NOT upload data
- ✔ Safe for enterprise environments
- ✔ Generates output only inside your project `/docs`

---

## 📘 License

MIT License — free for personal & commercial use.

---

## 💬 Support

GitHub repo coming soon.

---

# 🎉 Welcome to Origin

You now have a project intelligence engine that boosts clarity, speed, and focus.  
Whether you're a beginner or senior engineer — Origin helps you build with confidence.
