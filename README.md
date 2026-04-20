# 🫓 Bhopal Roti Services

> **Premium hand-rolled roti delivery website** — A stunning, conversion-optimised landing page with cinematic roti animations.

![Preview](https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=flat-square)
![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

---

## ✨ Features

### 🎨 Design
- **Dark hero** with warm terracotta + saffron palette — premium Indian aesthetic
- **Cormorant Garamond** display font for a luxury editorial feel
- Grain texture overlay for depth
- Glassmorphism & subtle backdrop blur nav

### 🫓 Cinematic Roti Animation
- **Canvas-based** 3D-perspective rotating chapatis
- Realistic tawa char spots, sheen highlights, edge borders
- **Steam particle system** — wisps rise from each roti
- Depth sorting (painter's algorithm) for parallax layering
- Responsive count — fewer rotis on smaller screens
- Pauses when tab is hidden (performance optimisation)

### 📱 Sections
| Section | Description |
|---|---|
| **Hero** | Full-screen dark hero with animated rotis + trust badges |
| **Marquee** | Scrolling feature strip |
| **How It Works** | 3-step process with tilt-hover cards |
| **Subscription Plans** | 3-tier pricing with meal toggle (Lunch/Dinner/Both) + animated price roll |
| **Single Order** | Interactive order builder — type, quantity, add-ons, live price |
| **Testimonials** | Auto-advancing carousel with manual controls |
| **CTA Banner** | Offer strip with live countdown timer |
| **Footer** | Links, social, FSSAI licence |

### ⚡ Interactions
- **Custom cursor** with follower ring
- **3D card tilt** on plan + step cards
- **Animated number roll** when toggling meal plans
- **Order modal** with spinning roti confirmation
- **Scroll reveal** with staggered delays
- **Countdown timer** persisted in localStorage

---

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/bhopal-roti-services.git
cd bhopal-roti-services

# Open directly in browser — no build step needed!
open index.html
# or
npx serve .
```

**Zero dependencies.** Pure HTML + CSS + Vanilla JS. No framework, no bundler.

---

## 📁 File Structure

```
bhopal-roti-services/
├── index.html              # Main landing page
├── css/
│   └── styles.css          # All styles (variables, components, responsive)
├── js/
│   ├── roti-animation.js   # Canvas roti + steam animation engine
│   └── main.js             # Interactions, pricing logic, carousel
└── README.md
```

---

## 🎯 Conversion Features

- **Urgency**: Live countdown timer on offer banner
- **Social proof**: Star ratings + location-specific testimonials
- **Anchoring**: Crossed-out original prices showing savings %
- **Featured plan**: Family plan elevated + badge for most popular
- **Friction reduction**: Live order summary updates as user configures
- **Trust signals**: FSSAI licence, freshness guarantee badge, delivery ETA

---

## 🛠 Customisation

### Change prices
Edit `js/main.js` → `PRICES` object:
```js
const PRICES = { plain: 15, ghee: 18, missi: 20, multigrain: 22 };
```

### Change subscription prices
Edit `index.html` → `data-lunch`, `data-dinner`, `data-both` attributes on `.price-amount` elements.

### Change brand colours
Edit `css/styles.css` → `:root` variables:
```css
:root {
  --saffron:    #E8811A;
  --earth:      #7C2D12;
  --cream:      #FDF6EC;
  --char:       #1C0A00;
}
```

### Adjust roti count / size
Edit `js/roti-animation.js` → `init()`:
```js
const count = Math.min(8, Math.floor(W / 130)); // tweak divisor
```

---

## 📦 Deployment

Works out-of-the-box on:
- **GitHub Pages** — push and enable Pages in repo settings
- **Netlify** — drag & drop the folder
- **Vercel** — `vercel --prod`
- **Any static host**

---

## 📄 License

MIT © 2026 Bhopal Roti Services

---

*Made with ❤️ in Bhopal, MP 🇮🇳*

