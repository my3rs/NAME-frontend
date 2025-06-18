# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a SvelteKit 5 blog/CMS frontend application called "NAME-frontend" - a Chinese blog platform with dual interfaces: a public blog frontend and an admin backend interface.

**Tech Stack**: SvelteKit 5 + TypeScript + Tailwind CSS + shadcn-svelte + Axios + JWT Auth

## Common Commands

```bash
# Development
npm run dev                    # Start development server (http://localhost:5173)
npm run build                  # Build for production
npm run preview               # Preview production build

# Code Quality
npm run check                 # Type check and lint
npm run check:watch          # Watch mode for type checking
```

## Architecture Overview

### Route Group Structure
- `(front)/` - Public blog interface (home, posts, pagination)
- `(backend)/` - Admin interface (posts, categories, tags, users management) 
- `login/` - Authentication pages
- `settings/` - Configuration pages

### Key Directories
- `src/lib/api.ts` - Centralized API functions for backend communication
- `src/lib/model.ts` - TypeScript data models (Post, User, Comment, Tag, Category)
- `src/lib/scheme.ts` - Zod validation schemas
- `src/lib/stores/` - Svelte stores for global state (auth, posts)
- `src/lib/components/ui/` - shadcn-svelte components
- `src/lib/components/ui/custom/` - Custom UI components

### Authentication System
- JWT-based with automatic refresh using axios-jwt
- Tokens stored in localStorage, refreshed 5 minutes before expiration
- Role-based access (Admin/Reader) with layout-level guards
- Backend routes use `export const ssr = false` for client-side auth

### API Communication
- Base URL: `http://localhost:8000/api/v1` (development)
- RESTful endpoints with CRUD operations
- Automatic JWT token handling via axios interceptors
- Batch operations support for admin functions

### State Management Patterns
- `currentUser` store for authentication state
- `posts` and `pagination` stores for content management
- Server-side loading with `+page.ts` files
- Client-side state for admin interfaces

### UI Component Patterns
- shadcn-svelte component library (New York style)
- Responsive sidebar layouts for both frontend and backend
- Custom components follow `/ui/custom/` naming convention
- Dark mode support with CSS custom properties
- Form handling with Formsnap + Zod validation

### Content Management
- Markdown content with Carta-md editor and svelte-markdown renderer
- Comment system with threaded replies and approval workflow
- Tag and category management with hierarchical support
- Post status management (Draft, Published, Archived)

## Development Notes

- Backend API expected to run on port 8000 during development
- SSR disabled for admin routes requiring authentication
- Mobile-responsive design with Tailwind breakpoints
- TypeScript strict mode enabled with comprehensive type definitions