# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kommentio is an open-source comment widget system - a free, ad-free alternative to Disqus. The project is implemented as a Vanilla JavaScript embeddable widget with comprehensive admin dashboard and AI-powered spam filtering.

### Official Domain & Deployment
- **Primary Domain**: https://kommentio.tech
- **GitHub Pages**: https://xavierchoi.github.io/kommentio (backup)
- **Repository**: https://github.com/xavierchoi/kommentio

## Development Commands

```bash
npm run dev            # Start development server
npm run build          # Build demo page to ./dist
npm run build:widget   # Build production widget to ./dist/widget/kommentio.iife.js
npm run lint           # Run ESLint to check code quality  
npm run preview        # Preview production build locally
```

## Architecture & Key Patterns

### Widget Architecture
The core widget follows an embeddable pattern with auto-initialization:

```javascript
// Embeddable widget pattern
class Kommentio {
  constructor(options) {
    this.mockMode = !options.supabaseUrl; // Auto-fallback to mock
    this.init();
  }
}

// Auto-initialization from HTML attributes
<div data-kommentio data-site-id="site"></div>
<script src="kommentio.js"></script>
```

### Database Schema
- **sites**: Multi-tenant site management
- **comments**: Hierarchical comments (max 3 levels)
- **comment_likes**: User interactions  
- **spam_reports**: Community moderation
- **site_moderators**: Admin access control

### File Structure
```
kommentio/
├── src/
│   ├── kommentio.js          # Main widget (16KB)
│   └── api/admin-api.js      # Admin dashboard API
├── docs/                     # Demo pages and admin dashboard
├── database/migrations/      # Supabase schema
├── knowledge_base/           # Project documentation
├── tests/                    # Test files
└── dist/widget/             # Production build
```

## Critical Development Principles

### Anti-Hardcoding Policy
**ABSOLUTELY AVOID HARDCODING** - Always use configurable options, environment variables, or null defaults.

**Examples of FORBIDDEN hardcoding:**
- `supabaseUrl: 'https://specific-project.supabase.co'`
- `apiKey: 'sk-1234567890abcdef'`

**Correct patterns:**
- `supabaseUrl: target.dataset.supabaseUrl || null`
- `apiKey: process.env.VITE_API_KEY || null`

**Why this matters:**
- Hardcoded values break Mock mode and development environments
- Causes 400/401 API errors when services are unavailable
- Makes code non-portable across different environments

**When in doubt:** Always default to `null` and let the application gracefully fall back to Mock mode.

## Special Command Triggers

### Build Completion Command
If user says '빌드를 종료합니다.', ask user to commit and push current build. If user agrees, update `knowledge_base/LAST_PROJECT_STATUS.md` and add update log in `knowledge_base/UPDATE_LOG.md`.

### Code Testing Command  
If user says '코드 테스트를 실시합니다. CODE_TEST.md를 읽고 테스트를 시작하세요.', read `knowledge_base/CODE_TEST.md` file and follow the test procedures.

### Prompt Enhancement Command
If user's prompt starts with "EP:", read `knowledge_base/PROMPT_ENHANCER.md` and enhance the user's prompt following the guidelines.

## Knowledge Base Reading Triggers

### Project Status & Updates  
**Trigger**: When user asks about current status, recent changes, or version history, or when Claude needs to understand project status
**Read**: `knowledge_base/LAST_PROJECT_STATUS.md` and `knowledge_base/UPDATE_LOG.md`
**Important**: Always reference these files instead of the status information in this CLAUDE.md file for current project status

### OAuth & Authentication Setup
**Trigger**: When user asks about social login or OAuth setup
**Read**: `knowledge_base/twitter-oauth-setup-guide.md` and `knowledge_base/APPLE_OAUTH_SETUP_GUIDE.md`

### General Documentation
**Trigger**: When user asks about installation, usage, or features  
**Read**: `knowledge_base/README.md`

## Current Implementation Status

**⚠️ DEPRECATED**: This section is kept for historical reference only. 
**For current project status, always read**: `knowledge_base/LAST_PROJECT_STATUS.md` and `knowledge_base/UPDATE_LOG.md`

### Core Features ✅ COMPLETE
- Comment CRUD with hierarchical replies (3 levels)
- Real-time updates (Supabase Realtime + mock simulation)
- 7 social login providers (Google, GitHub, Facebook, X, Apple, LinkedIn, Kakao)
- Anonymous commenting support
- Like/dislike functionality
- Dark/light theme with runtime switching

### Advanced Features ✅ COMPLETE  
- AI spam filtering (Claude Haiku API integration)
- Complete admin dashboard (10 pages)
- Multi-site support with RLS security
- Mock mode (works without Supabase)
- Real-time notifications
- Mobile-responsive design

### Performance Metrics
- Bundle size: 16KB (target: <50KB) ⚡
- Gzipped: 5.59KB
- 60fps animations with auto-optimization
- Cross-browser compatibility (Chrome 90+, Firefox 88+, Safari 14+)

## Development Modes

### Mock Mode (Default)
- Works without Supabase configuration
- Simulates all features including real-time updates
- Auto-enables when no Supabase URL provided

### Production Mode
- Requires Supabase project setup
- Real authentication and data persistence
- Claude API integration for spam filtering

## Git Commit Standards

### Template
```
[AI] <type>: <description>

<detailed description of changes>
<performance impact if applicable>

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Commit Types
- **feat**: New feature implementation
- **fix**: Bug fixes and error resolution  
- **perf**: Performance optimizations
- **style**: UI/UX improvements
- **refactor**: Code restructuring
- **docs**: Documentation updates

### Workflow
1. Run `git status` and `git diff` to review changes
2. Check `git log --oneline -5` to match style
3. Use template with [AI] prefix and Co-Authored-By credit

## Critical Development Guidelines

### ABSOLUTELY PROHIBITED Changes
- Core widget architecture (src/kommentio.js constructor/init flow)
- Performance-critical systems (FPS monitoring, particle system)
- Modal system CSS (docs/admin-dashboard/styles/main.css lines 22-314) 
- Production build system (package.json scripts, Vite configs)
- Database schema (database/migrations/)

### HIGH-RISK Modification Areas
- CSS responsive design breakpoints
- Authentication & OAuth flows
- Real-time subscription handling

### Safe Modifications
- Landing page content and marketing copy
- Color schemes and visual styling (non-structural)
- Admin dashboard content and statistics
- Documentation and README files

## Testing Strategy

### Mock Mode Tests (30 seconds)
```bash
npm run dev  # Test widget functionality without backend
```

### Integration Tests (2 minutes)  
- Supabase connection tests
- OAuth flow verification
- AI spam filter testing

### Production Tests (5 minutes)
- End-to-end user scenarios
- Cross-browser compatibility
- Performance monitoring

**Test Files Available:**
- `test-widget.html` - Core widget functionality
- `test-supabase-real.html` - Database integration
- `test-realtime.html` - Real-time subscriptions
- `test-ai-spam-filter.html` - AI integration
- `test-performance-monitoring.html` - Performance validation

## Performance Standards

### FPS Monitoring
- **Target**: >55fps (Desktop), >30fps (Mobile)
- **Critical**: <25fps triggers auto-optimization
- **Auto-optimization**: Reduces particles, simplifies animations

### Bundle Size
- **Widget**: <50KB uncompressed (Current: 16KB ✅)
- **Gzipped**: <20KB (Current: 6KB ✅)  
- **Admin Dashboard**: <200KB total assets

### Memory Usage
- **Initial Load**: <50MB
- **After 5min**: <100MB  
- **Critical**: >200MB triggers optimization
- **Memory Leak**: >5MB/minute growth detection

## Key Integration Points

### Supabase Setup
1. Create Supabase project
2. Run database migrations from `database/migrations/`
3. Configure authentication providers
4. Set up RLS policies

### Social Login Configuration
Detailed setup guides available in knowledge_base/ for:
- X(Twitter) OAuth
- Apple OAuth (most complex)
- Google, GitHub, Facebook, LinkedIn, Kakao

### Environment Variables
```html
<div 
  data-kommentio
  data-site-id="your-site"
  data-supabase-url="https://xxx.supabase.co"
  data-supabase-key="your-anon-key"
  data-claude-api-key="your-claude-key"
></div>
```

## Emergency Recovery

If system breaks:
```bash
# Restore critical files
git checkout HEAD -- src/kommentio.js
git checkout HEAD -- dist/widget/kommentio.iife.js
git checkout HEAD -- docs/admin-dashboard/styles/main.css

# Rebuild clean
npm run build:widget
```

---

**⚠️ DEPRECATED STATUS**: This status is kept for historical reference only.
**For current project status, always read**: `knowledge_base/LAST_PROJECT_STATUS.md` and `knowledge_base/UPDATE_LOG.md`

**Historical Status**: v0.2.8 - Production-ready system with all PRD requirements completed. Zero hardcoding policy implemented with complete Mock mode fallback system.