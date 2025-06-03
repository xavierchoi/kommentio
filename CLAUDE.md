# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kommentio is a **completed** open-source comment widget system - a free, ad-free alternative to Disqus. The project successfully implements all PRD requirements as a Vanilla JavaScript embeddable widget.

## Development Commands

```bash
npm run dev            # Start development server (http://localhost:3000)
npm run build          # Build demo page to ./dist
npm run build:widget   # Build production widget to ./dist/widget/kommentio.iife.js
npm run lint           # Run ESLint to check code quality  
npm run preview        # Preview production build locally
```

## Architecture & Key Patterns

### Tech Stack ✅ COMPLETED
- **Frontend**: Vanilla JavaScript (ES2022) + Vite
- **Styling**: Namespaced CSS (no external dependencies)
- **Backend**: Supabase (PostgreSQL + Realtime + Auth)
- **AI**: Claude Haiku API for spam filtering
- **Bundle**: Single 16KB file (5.59KB gzipped)

### Widget Architecture
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

### Database Schema ✅ COMPLETED
- **sites**: Multi-tenant site management
- **comments**: Hierarchical comments (max 3 levels)
- **comment_likes**: User interactions
- **spam_reports**: Community moderation
- **site_moderators**: Admin access control

### Current Implementation Status ✅ ALL COMPLETE

#### Core Features
- ✅ Comment CRUD with hierarchical replies (3 levels)
- ✅ Real-time updates (Supabase Realtime + mock simulation)
- ✅ Social login (Google, GitHub, Facebook + mock)
- ✅ Anonymous commenting support
- ✅ Like/dislike functionality
- ✅ Dark/light theme with runtime switching

#### Advanced Features  
- ✅ AI spam filtering (Claude Haiku API integration)
- ✅ Admin moderation API (complete dashboard API)
- ✅ Multi-site support with RLS security
- ✅ Mock mode (works without Supabase)
- ✅ Real-time notifications (toast alerts)
- ✅ Mobile-responsive design

#### Performance Optimizations
- ✅ Bundle size: 16KB (target: <50KB) ⚡
- ✅ CSS namespacing prevents conflicts
- ✅ Lazy loading of external dependencies
- ✅ Efficient DOM manipulation

## Development Modes

### Mock Mode (Default)
- Works without Supabase configuration
- Simulates all features including real-time updates
- Perfect for testing and demos
- Auto-enables when no Supabase URL provided

### Production Mode
- Requires Supabase project setup
- Real authentication and data persistence
- Claude API integration for spam filtering
- Full admin dashboard support

## File Structure

```
kommentio/
├── src/
│   ├── kommentio.js          # Main widget (all features)
│   └── api/
│       └── admin-api.js      # Complete admin dashboard API
├── database/
│   ├── migrations/           # Production-ready schema
│   │   ├── 001_create_comments_schema.sql
│   │   └── 002_setup_rls_policies.sql
│   └── seeds/
│       └── development_data.sql
├── dist/widget/
│   └── kommentio.iife.js     # Production bundle (16KB)
├── backup/react-src/         # Original React implementation
└── test-widget.html          # Live demo page
```

## Integration Examples

### Basic Embed
```html
<div data-kommentio></div>
<script src="kommentio.js"></script>
```

### Advanced Configuration
```html
<div 
  data-kommentio
  data-site-id="my-blog"
  data-theme="dark"
  data-language="ko"
  data-supabase-url="https://xxx.supabase.co"
  data-supabase-key="anon-key"
  data-claude-api-key="claude-key"
></div>
```

### Admin Dashboard Integration
```javascript
const adminAPI = new KommentioAdminAPI(supabaseUrl, supabaseKey);
await adminAPI.init();

// Get site statistics
const stats = await adminAPI.getDashboardStats();

// Moderate comments
await adminAPI.approveComment(commentId);
await adminAPI.markAsSpam(commentId);
```

## Production Deployment

### CDN Setup
1. Upload `dist/widget/kommentio.iife.js` to CDN
2. Update embed script src to CDN URL
3. Configure CORS for your domains

### Supabase Setup
1. Create new Supabase project
2. Run database migrations in order
3. Configure authentication providers
4. Set up RLS policies

### Environment Variables
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_CLAUDE_API_KEY=your-claude-key
```

## Key Implementation Details

### Spam Filtering
- Automatic Claude Haiku API integration
- Configurable spam threshold (default: 0.7)
- Graceful fallback when API unavailable
- Mock mode includes spam simulation

### Real-time Updates
- Supabase Realtime for production
- Simulated updates in mock mode
- Visual notifications for new comments
- Efficient comment tree rebuilding

### Security
- Row Level Security (RLS) on all tables
- XSS protection via content sanitization
- CSRF protection through Supabase
- API key validation and rate limiting

### Performance
- Lazy loading of Supabase SDK
- Efficient DOM diffing for updates
- CSS-in-JS with namespacing
- Minimal external dependencies

## Testing

### Manual Testing
```bash
npm run dev  # Test mock mode
# Open http://localhost:3000
# Try all features: login, comment, real-time updates
```

### Production Testing
1. Set up test Supabase project
2. Configure environment variables
3. Test real authentication flows
4. Verify admin dashboard integration

## Future Enhancements (Phase 2)
- Korean social login (Kakao, Line)
- Premium features (emoji reactions, GIF support)
- Advanced analytics dashboard
- Email notification system
- Comment threading improvements