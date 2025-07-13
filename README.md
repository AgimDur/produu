# Produkt-Management-Anwendung

Eine umfassende Produkt-Management-Anwendung erstellt mit Next.js, TypeScript, Supabase und shadcn/ui.

## Tech Stack

- **Framework**: Next.js 14 (mit App Router)
- **Sprache**: TypeScript
- **Datenbank & Authentifizierung**: Supabase
- **Styling**: Tailwind CSS
- **UI Komponenten**: shadcn/ui
- **Hosting**: Vercel

## Features

- 🔐 Benutzerauthentifizierung mit Supabase Auth
- 📦 Vollständige CRUD-Operationen für Produkte
- 🎨 Moderne UI mit shadcn/ui Komponenten
- 📱 Responsive Design
- 🔒 Geschützte Routen mit Middleware
- ✅ Formularvalidierung mit Zod
- 💾 Echtzeit-Datenbankoperationen

## Setup

### 1. Supabase-Projekt einrichten

1. Erstelle ein neues Projekt auf [supabase.com](https://supabase.com)
2. Führe das SQL-Skript `supabase-setup.sql` in der Supabase SQL Editor aus
3. Aktiviere Email/Password Authentication in den Auth-Einstellungen
4. Erstelle einen Benutzer über die Supabase Auth UI oder API

### 2. Umgebungsvariablen konfigurieren

Erstelle eine `.env.local` Datei im Projektverzeichnis:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Abhängigkeiten installieren

```bash
npm install
```

### 4. Entwicklungsserver starten

```bash
npm run dev
```

Die Anwendung ist dann unter [http://localhost:3000](http://localhost:3000) verfügbar.

## Deployment auf Vercel

1. Push deinen Code zu GitHub
2. Verbinde dein Repository mit Vercel
3. Konfiguriere die Umgebungsvariablen in den Vercel-Projekteinstellungen:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Projektstruktur

```
src/
├── app/
│   ├── actions/          # Server Actions für CRUD-Operationen
│   ├── dashboard/        # Dashboard-Seiten
│   ├── globals.css       # Globale Styles
│   ├── layout.tsx        # Root Layout
│   ├── page.tsx          # Login-Seite
│   └── middleware.ts     # Authentifizierungs-Middleware
├── components/
│   ├── ui/               # shadcn/ui Komponenten
│   └── ProductForm.tsx   # Produkt-Formular-Komponente
├── lib/
│   └── supabase.ts       # Supabase-Client-Konfiguration
└── types/
    └── product.ts        # TypeScript-Typen
```

## Datenbankschema

Die `products` Tabelle enthält folgende Spalten:

- `id` (UUID, Primärschlüssel)
- `created_at` (timestamp with time zone)
- `name` (text, not null)
- `sku` (text, unique, not null)
- `ean13` (text, 13 Zeichen)
- `description` (text)
- `price` (integer, Preis in Cents, not null)
- `stock` (integer, not null)
- `category` (text, not null)

## Lizenz

MIT
