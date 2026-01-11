# Kept Design System

A premium editorial design system for political accountability platforms, inspired by The Guardian, Politico, and Apple's design language.

---

## 🎨 Brand Colors

### Primary Palette
| Token | HSL | Hex | Usage |
|-------|-----|-----|-------|
| `--primary` | 222 47% 11% | #0F172A | Deep navy - headers, text, trust |
| `--accent` | 348 73% 36% | #9E1B34 | Latvian carmine - CTAs, highlights |
| `--background` | 210 20% 99% | #FAFBFC | Page background |
| `--foreground` | 222 47% 11% | #0F172A | Primary text |
| `--muted` | 210 20% 96% | #F1F5F9 | Subtle backgrounds |
| `--muted-foreground` | 215 16% 47% | #64748B | Secondary text |

### Status Colors
| Status | Token | HSL | Hex | Usage |
|--------|-------|-----|-----|-------|
| Kept | `--status-kept` | 160 84% 39% | #10B981 | Emerald green |
| Partially Kept | `--status-partially` | 38 92% 50% | #F59E0B | Amber |
| In Progress | `--status-progress` | 217 91% 60% | #3B82F6 | Blue |
| Broken | `--status-broken` | 350 89% 60% | #E11D48 | Rose red |
| Not Rated | `--status-unrated` | 215 16% 47% | #64748B | Slate gray |

### Party Colors (Latvian)
```css
--party-jv: 217 91% 40%;   /* Jaunā Vienotība - Blue */
--party-zzs: 142 71% 35%;  /* ZZS - Green */
--party-na: 348 73% 36%;   /* Nacionālā apvienība - Carmine */
--party-ap: 262 83% 58%;   /* Attīstībai/Par! - Purple */
--party-prog: 340 82% 52%; /* Progresīvie - Pink */
--party-lra: 25 95% 53%;   /* LRA - Orange */
--party-stab: 199 89% 48%; /* Stabilitātei! - Cyan */
--party-lpv: 45 93% 47%;   /* LPV - Yellow */
--party-sask: 271 81% 56%; /* Saskaņa - Violet */
```

---

## 📝 Typography

### Font Family
```css
font-family: "Inter", system-ui, sans-serif;
font-feature-settings: "cv11", "ss01";
```

### Font Weights
| Weight | Usage |
|--------|-------|
| 400 | Body text |
| 500 | Emphasis, labels |
| 600 | Subheadings, buttons |
| 700 | Headings |
| 800 | Hero headlines |

### Type Scale
| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 (Hero) | 3.5rem - 4rem | 700-800 | 1.1 |
| H2 | 2rem - 2.5rem | 700 | 1.2 |
| H3 | 1.25rem - 1.5rem | 600 | 1.3 |
| Body | 1rem | 400 | 1.6 |
| Small | 0.875rem | 400-500 | 1.5 |
| Caption | 0.75rem | 500 | 1.4 |

---

## 📐 Spacing & Layout

### Border Radius
```css
--radius: 0.75rem;      /* 12px - default */
--radius-sm: 0.5rem;    /* 8px */
--radius-md: 0.625rem;  /* 10px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-2xl: 1.25rem;  /* 20px */
```

### Container Widths
```css
.container-narrow { max-width: 896px; }  /* 4xl */
.container-wide { max-width: 1280px; }   /* 7xl */
```

### Shadows
```css
--shadow-sm: 0 1px 2px 0 hsl(222 47% 11% / 0.05);
--shadow-md: 0 4px 6px -1px hsl(222 47% 11% / 0.08), 
             0 2px 4px -2px hsl(222 47% 11% / 0.05);
--shadow-lg: 0 10px 15px -3px hsl(222 47% 11% / 0.08), 
             0 4px 6px -4px hsl(222 47% 11% / 0.05);
--shadow-xl: 0 20px 25px -5px hsl(222 47% 11% / 0.1), 
             0 8px 10px -6px hsl(222 47% 11% / 0.05);
```

---

## 🧩 Components

### Status Badge
```tsx
<span className="status-badge status-kept">
  <CheckCircle2 size={12} />
  <span>Kept</span>
</span>

/* Classes: status-kept, status-partially, status-progress, status-broken, status-unrated */
/* Sizes: sm (px-2 py-0.5 text-[10px]), md (px-2.5 py-1 text-xs), lg (px-3 py-1.5 text-sm) */
```

### Party Badge
```tsx
<span 
  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-medium text-xs"
  style={{ backgroundColor: `${party.color}15`, color: party.color }}
>
  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: party.color }} />
  <span>{party.abbreviation}</span>
</span>
```

### Card with Hover Effect
```tsx
<Card className="group border-border/50 hover:shadow-elevated hover:border-border transition-all duration-300">
  <CardContent className="p-5">
    {/* Card hover: -translate-y-1 shadow-lg */}
  </CardContent>
</Card>
```

### Progress Bar (Status Distribution)
```tsx
<div className="h-2 bg-muted rounded-full overflow-hidden flex">
  <div className="h-full bg-status-kept" style={{ width: `${keptPercent}%` }} />
  <div className="h-full bg-status-progress" style={{ width: `${progressPercent}%` }} />
  <div className="h-full bg-status-broken" style={{ width: `${brokenPercent}%` }} />
</div>
```

---

## ✨ Animations

### Framer Motion Presets
```tsx
// Fade up on scroll
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4 }}

// Staggered children
transition={{ duration: 0.4, delay: index * 0.05 }}

// Scale in
initial={{ opacity: 0, scale: 0.9 }}
animate={{ opacity: 1, scale: 1 }}
```

### CSS Keyframes
```css
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
```

### Stagger Classes
```css
.stagger-1 { animation-delay: 0.1s; }
.stagger-2 { animation-delay: 0.2s; }
.stagger-3 { animation-delay: 0.3s; }
```

---

## 📊 Data Visualization

### Pie Chart Colors
```tsx
const COLORS = {
  kept: 'hsl(160, 84%, 39%)',
  partiallyKept: 'hsl(38, 92%, 50%)',
  inProgress: 'hsl(217, 91%, 60%)',
  broken: 'hsl(350, 89%, 60%)',
  notRated: 'hsl(215, 16%, 47%)',
};
```

### Animated Counter
```tsx
// Smooth count-up animation with easeOutCubic
const easedProgress = 1 - Math.pow(1 - progress, 3);
setDisplayValue(Math.round(targetValue * easedProgress));
```

---

## 🌍 Localization

| Setting | Value |
|---------|-------|
| Primary Language | Latvian (lv) |
| Date Format | DD.MM.YYYY (European) |
| Number Format | 1 000 000 (space separator) |
| Future Languages | English (en), Russian (ru) |

---

## 📱 Responsive Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Laptop */
xl: 1280px  /* Desktop */
2xl: 1400px /* Large desktop */
```

---

## 🎯 Design Principles

1. **Whitespace-heavy** — Generous padding (p-5, p-6, p-8) for breathing room
2. **Subtle shadows** — Soft elevation, not harsh drop shadows
3. **Card-based UI** — Content in bordered cards with hover effects
4. **Color-coded status** — Immediate visual recognition of promise states
5. **Editorial aesthetic** — Clean, trustworthy, like premium news sites
6. **Mobile-first** — Responsive grids, collapsible filters

---

## 💡 Usage Notes

- Always use semantic tokens (`bg-background`, `text-foreground`) not raw colors
- All colors must be HSL format in CSS variables
- Use `border-border/50` for subtle card borders
- Apply `transition-all duration-300` for smooth hover effects
- Status badges should always include icons for accessibility

---

*Design System v1.0 — Kept: Latvian Political Promise Tracker*
