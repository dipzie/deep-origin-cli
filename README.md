# 🧠 Dipz Origin CLI  
### Free Tier — Structural Intelligence for Developers
*A local-first audit engine that reveals your project’s structure in seconds.*

Origin scans your project locally and generates an **AI-ready summary**:  
clean, safe, and instantly readable by any AI assistant.

Works for all JS/TS stacks:  
**React, Vite, Next.js, Vue, Svelte, Express, and plain JS/TS repos.**

---

<p align="center">
<img src="https://img.shields.io/npm/v/deep-origin-cli?label=version&color=purple" />
<img src="https://img.shields.io/npm/dw/deep-origin-cli?color=blueviolet" />
<img src="https://img.shields.io/npm/l/deep-origin-cli?color=brightgreen" />
</p>

---

# ⭐ Why Origin Exists

Developers constantly need to know:

- “What’s inside this project?”
- “Where are my pages, components, and features?”
- “Is something misplaced?”
- “Are there unused files or dependencies?”
- “What should I fix before shipping?”

Origin answers all of this instantly — **without opening any file**.

It produces a structured report:

```
📊 Running Origin Lite Audit…
✔ Project loaded
✔ Scanning complete
✨ Audit complete — insight ready!
```

And saves it here:

```
docs/ai/bridge_summary.md
```

This gives you clarity even in messy, old, or brand-new projects.

---

# 🚀 Quick Start

### Install globally:
```bash
npm install -g deep-origin-cli
```

Or as a dev dependency:
```bash
npm install -D deep-origin-cli
```

---

# ▶️ Run your first audit
```bash
origin audit
```

What happens:

1. Scans your project folders  
2. Detects components, pages, features, UI systems  
3. Finds duplicates, dead files, and unused dependencies  
4. Generates `docs/ai/bridge_summary.md`  
5. Writes a clean JSON snapshot to `docs/audit_history/`

Example:

```
✨ Origin Lite Mode Audit
✔ Project loaded
✔ Base scanning complete
📄 Summary saved
```

---

# 📁 Generated Files

Origin adds a safe, sandboxed docs area:

```
docs/
  ai/
    bridge_summary.md     ← human-friendly Lite summary
  audit_history/
    audit_XXXX.json       ← raw tree snapshot
```

Nothing is uploaded.  
Everything stays on your machine.

---

# 🧩 What Lite Mode Detects (Free)

Origin Lite gives you **real, useful intelligence**:

### ✅ Structural previews  
- Components (capped preview)  
- Pages (capped preview)  
- Features folder detection  
- UI libraries (MUI, Tailwind, shadcn, etc.)

### ✅ Architecture sanity checks  
- Deep folder nesting (Lite → 1 specific hint only)  
- Components accidentally placed in `/src/pages`  
- Basic health score

### ✅ Lite Problem Detection  
- Duplicate components (preview only)  
- Dead/unused files (preview only)  
- Unused dependencies (preview only)  
- Component import relationships (Lite → shallow, capped)

All previews are **stable + capped**, protected by hashing so they cannot be “abused” to reveal the full list.

---

# 🕹 Progression System (Gamified)

Origin encourages better architecture:

| Structure Found | Level |
|-----------------|--------|
| Project detected | Level 1: Minimal |
| `/src/components` | Level 2: Component Awareness |
| `/src/pages` | Level 3: Page Awareness |
| `/src/features` | Level 4: Feature Architecture |

This helps new developers improve naturally.

---

# 🔒 Pro Tier (Coming Soon)

Free gives you the high-value basics.  
Pro unlocks the *real* power:

| Feature | Free | Pro |
|--------|------|-----|
| Local audit | ✅ | ✅ |
| Component/page preview | Capped | Full |
| Duplicate files | Capped | Full map |
| Unused dependencies | Capped | Full dependency graph |
| Feature boundaries | ❌ | ✅ |
| Full architecture map | ❌ | ✅ |
| Component tree | ❌ | ✅ |
| Circular dependencies | ❌ | ✅ |
| Full drift timeline | ❌ | 🔥 |
| Multi-project intelligence | ❌ | 🔥 |
| Origin Brain v2 | ❌ | 🔥 |

Pro remains fully local — but far deeper.

---

# 🟣 Hidden Founder Lore

Try:
```
origin unlock dipz
```

Most users will see:

```
🟣 Access Denied
“dipz” privilege token is restricted to Founder instances.
```

A tiny tease of deeper layers.

Founder Mode is **private** and not part of the public product.

---

# 📦 Commands

### `origin audit`  
Run a full structural audit (Lite Mode).

### `origin unlock dipz`  
Lore command — readonly, for branding.

---

# 🛡 Privacy — Local First

Origin does **zero** uploading.  
No logs, no telemetry, no servers.

All processing happens on **your machine only**.

---

# 🔧 Supported Projects

Origin works on any project with a `src` folder:

- React (CRA, Vite, Next.js App/Pages)
- Vue
- Svelte / SvelteKit
- Astro
- Node / Express
- Vanilla TS/JS apps

---

# 📬 Feedback & Issues

GitHub Issues:  
👉 https://github.com/dipzie/deep-origin-cli

---

# 📜 License

MIT License © dipz
