# DESIGN.md — Mira Coffee

## Identity & Voice
- **Brand Name:** Mira Coffee
- **Category:** Specialty Coffee & Artisan Eatery
- **Audience:** Pemilik kedai kopi, manager operasional, barista & kasir
- **Mood / Character:** Artisanal, tactile, grounded, warm, modern-craft, editorial
- **Visual Principle:** Material nyata (kayu warm oak, kertas kraft, espresso crema, matte ceramics). Menghindari elemen generik AI (tanpa gradien biru-ungu, tanpa glassmorphism berlebihan, tanpa glow neon).

## Color Palette
- **Base Canvas (Background):** `#FAF7F2` (Warm Milk Cream)
- **Secondary Canvas:** `#F3EDE2` (Soft Latte Surface)
- **Cards / Containers:** `#FFFFFF` (Clean Paper Card) & `#F9F6F0`
- **Primary Text & Headings:** `#1E1E1C` (Espresso Roast Charcoal)
- **Muted Text / Secondary:** `#6E675F` (Roasted Bean Dust)
- **Borders & Dividers:** `#E5DDD0` (Warm Sand Line)
- **Primary Accent:** `#B36528` (Caramel / Cinnamon Terracotta)
- **Primary Accent Hover:** `#99521E` (Deep Caramel)
- **Semantic Success / Normal Stock:** `#5B6647` (Olive / Matcha Green)
- **Semantic Warning / Low Stock:** `#C47227` (Warm Amber Amber)
- **Semantic Critical / Out of Stock / Waste:** `#A33B32` (Terracotta Brick Red)

## Typography
- **Display / Brand:** Plus Jakarta Sans / Outfit (Bold, Tight tracking, Clear character)
- **Interface / Body:** Inter (Regular, Medium, SemiBold)
- **Numbers / Inventory Ledger / Currency:** Inter / JetBrains Mono (Tabular Figures, font-mono for weights & values)

## Layout & Components
- **Density:** Compact & functional for inventory tables, spacious & touch-friendly for cashier tablet mode (min tap target 48px).
- **Border Radius:** Restrained hierarchy (`rounded-md` 6px for small badges, `rounded-xl` 12px for cards & modals, `rounded-2xl` 16px for cashier menu cards). No uniform pill buttons everywhere.
- **Shadows:** Subtle & grounded (`shadow-sm` with warm tint `rgba(30, 30, 28, 0.04)`), no large floating blurs.
- **Micro-interactions:** Taktil & instan (transition <= 150ms).

## Anti-Slop Dials
- **ENERGY:** 2 (Calm, confident, functional)
- **RHYTHM:** 2 (Structured, deliberate spacing scale)
- **MOTION:** 1 (Instant tactile micro-transitions, functional feedback only)
