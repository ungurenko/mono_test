# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Моно-ассистент is a web application that transforms raw transcriptions into structured study notes (конспекты) using Google's Gemini AI. Russian language interface.

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Production build to dist/
npm run preview      # Preview production build
```

**Prerequisite:** Set `GEMINI_API_KEY` in `.env.local`

## Architecture

### Tech Stack
- React 19 + TypeScript (strict mode)
- Vite 6 build tool
- Tailwind CSS (via CDN with custom theme in index.html)
- jsPDF for PDF generation
- Google Gemini API (`gemini-3-flash-preview` model)

### Data Flow
1. User uploads .txt file → DropZone component
2. User selects topic and compression mode (STANDARD/DETAILED)
3. App.tsx orchestrates status flow: IDLE → ANALYZING → STRUCTURING → REVIEW → COMPLETED
4. geminiService calls Gemini API with dynamic prompts from localStorage
5. ResultViewer displays Markdown output with PDF download options (CLASSIC/ACADEMIC/CREATIVE styles)

### Service Layer (`services/`)
- **geminiService.ts** - Gemini API integration, prompt construction, token usage logging
- **pdfService.ts** - Markdown parsing and PDF rendering with three visual styles
- **storageService.ts** - LocalStorage wrapper for stats and configurable prompts

### State Management
Single `ProcessingState` interface in App.tsx manages all app state via React hooks. No external state library.

### Styling
Custom Tailwind theme defined in `<script>` block within index.html. Color palette uses `mono-*` prefix (mono-base, mono-text, mono-lavender, mono-sage).

## Key Files
- `App.tsx` - Main orchestrator with workflow logic
- `types.ts` - All TypeScript types, enums, interfaces
- `components/AdminPanel.tsx` - Prompt editing and usage statistics
- `components/ResultViewer.tsx` - Output display and PDF generation UI
