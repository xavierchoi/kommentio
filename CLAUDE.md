# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
Before you start any session, you must read some markdown files to understand last updates and reminds:
To remind what this project's Goal: comment_system_prd.md
To learn about what this project's competitors and research of their specifics: competitor_research.md
To check last status of this project: LAST_PROJECT_STATUS.md
To read or add update log: UPDATE_LOG.md

If user says '빌드를 종료합니다.", ask user to commit and push current build. If user agree with that, you must update(e.g. latest todo list) LAST_PROJECT_STATUS.md and add update log in UPDATE_LOG.md. please name the current version of build as possible as minor number(e.g. v0.1.0 to v0.1.1). After this, ask user to commit and push this project again.

If user says '코드 테스트를 실시합니다. CODE_TEST.md를 읽고 테스트를 시작하세요.", read CODE_TEST.md file and follow the prompts in the file to run code tests.

If the user's prompt starts with “EP:”, then the user wants to enhance the prompt. Read the PROMPT_ENHANCER.md file and follow the guidelines to enhance the user's prompt. Show the user the enhancement and get their permission to run it before taking action on the enhanced prompt. The enhanced prompts will follow the language of the original prompt (e.g., Korean prompt input will output Korean prompt enhancements, English prompt input will output English prompt enhancements, etc.)

During developing with user, if you learn very important thing which need to remember and remind everytime, please add the contents which contains what's your mistakes and what you learn from the mistakes in CLAUDE.md file.


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

## Critical UI/UX Implementation Lessons Learned

### Modal Implementation Mistakes & Solutions
**Background**: During admin dashboard modal development, multiple implementation failures led to important insights.

**Key Mistakes Made**:
1. **CSS Priority Issues**: Failed to use `!important` for style overrides, causing conflicts with existing styles
2. **Positioning Problems**: Incorrect modal centering and z-index management
3. **Detail Neglect**: Missing small but critical UI details like footer border connections
4. **Incomplete Testing**: Not thoroughly testing visual consistency across different states

**Critical Lessons**:
1. **Pixel-Perfect Details Matter**: Small visual inconsistencies (like disconnected borders) significantly impact perceived quality
2. **User Feedback is Essential**: Screenshots and specific visual feedback are more valuable than technical descriptions
3. **CSS Namespacing**: Always use strong CSS specificity (`!important`, detailed selectors) to prevent style conflicts
4. **Iterative Refinement**: Perfect UI requires multiple feedback cycles, not single implementation attempts
5. **Visual Debugging**: Always verify final implementation matches expected visual design exactly

**Implementation Pattern for Future Modals**:
```css
/* Always use strong specificity */
.modal .modal-footer {
  margin: 0 -24px !important; /* Extend borders to modal edges */
  padding: 16px 24px !important; /* Maintain internal spacing */
  border-top: 1px solid #e5e7eb !important; /* Consistent visual separation */
}
```

**Remember**: UI/UX excellence requires both technical competence AND meticulous attention to visual details. Never assume implementation is complete without user validation.

### CSS Framework Dependencies & Debugging Mistakes & Solutions
**Background**: During admin dashboard UI implementation, implemented beautiful Tailwind CSS styling that appeared as plain text due to missing dependencies.

**Key Mistakes Made**:
1. **Code vs Reality Gap**: Assumed elaborate Tailwind CSS classes would render properly without verifying framework was loaded
2. **Wrong Problem Analysis**: When user reported "plain text" styling, incorrectly analyzed code instead of checking actual rendering
3. **Dependency Oversight**: Used Tailwind classes (`bg-gradient-to-br`, `rounded-xl`, `flex-col`) without ensuring Tailwind CSS was available
4. **User Feedback Misinterpretation**: When user said "not decorative, just plain text", initially defended code instead of investigating actual display

**Critical Lessons**:
1. **Environment First**: Always verify CSS framework/dependencies are loaded BEFORE implementing styling
2. **Visual Verification**: Code appearance ≠ actual rendering. Always check real browser output
3. **Listen to User Experience**: When users describe visual issues, trust their experience over code analysis
4. **Screenshot Requests**: When user asks to "check images not code", immediately comply - they see the real problem
5. **Dependency Chain**: CSS framework → styling code → visual result. Break in chain = broken styling

**Debugging Process for UI Issues**:
```bash
# 1. Check dependencies first
- Verify CSS framework loaded (Tailwind, Bootstrap, etc.)
- Check for console errors
- Confirm stylesheet links work

# 2. Visual verification
- View actual rendered page
- Compare with expected design
- Screenshot comparison

# 3. User feedback priority
- Screenshots > code analysis
- User experience > technical assumptions
- Real rendering > code review
```

**Implementation Pattern for Future Styling**:
```html
<!-- 1. Ensure framework dependency FIRST -->
<script src="https://cdn.tailwindcss.com"></script>
<!-- 2. THEN implement styling code -->
<div class="bg-gradient-to-br from-blue-500 to-indigo-600">...</div>
```

**Remember**: Beautiful code is meaningless if CSS dependencies aren't loaded. Always verify the complete rendering pipeline: Dependencies → Code → Visual Output → User Experience.

### Global Modal System Fix & Lessons
**Background**: User reported modal display issues where text content appeared broken in screenshot. Investigation revealed multiple CSS conflicts and dependencies issues.

**Key Mistakes Made**:
1. **Modal Definition Conflicts**: Multiple modal implementations existed in Components.js causing inconsistent behavior
2. **CSS Dependency Issues**: Relied on external CSS frameworks (Tailwind) that weren't always loaded
3. **Style Override Failures**: Insufficient use of `!important` declarations for modal styling
4. **Text Rendering Problems**: Modal content appeared as broken text due to styling conflicts

**Critical Solutions Implemented**:
1. **Complete Inline Styling**: Eliminated all CSS class dependencies by using comprehensive inline styles with `!important`
2. **Unified Modal System**: Removed duplicate modal definitions and created single premium modal component
3. **Font & Layout Guarantees**: Ensured all text rendering with explicit font-family, line-height, and color declarations
4. **Global Application**: Fixed modal system applies to ALL pages automatically (comments, users, settings, etc.)

**Implementation Pattern for Modals**:
```javascript
// Always use complete inline styling for modals
modalElement.style.cssText = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  color: #1e293b !important;
  line-height: 1.6 !important;
  // ... all other styles with !important
`;
```

**Remember**: Modal systems must be completely self-contained with inline styles to guarantee consistent rendering across all environments and CSS framework states.

## Design System Requirements

### Responsive Design Mandate
**CRITICAL RULE**: 모든 프론트엔드 디자인은 적응형 디자인을 활용하여 데스크톱 뷰, 태블릿 뷰, 모바일 뷰를 최적화해야 한다.

**Implementation Requirements**:
1. **Desktop First**: Design for desktop (1920px+) with full feature access
2. **Tablet Optimization**: Adapt layouts for tablets (768px-1024px) with touch-friendly interfaces  
3. **Mobile Responsive**: Ensure usability on mobile devices (320px-767px) with optimized navigation
4. **Breakpoint Standards**: Use consistent breakpoints across all components
5. **Touch Targets**: Minimum 44px touch targets for mobile interactions
6. **Content Priority**: Show most important content first on smaller screens

**Responsive Patterns to Follow**:
```css
/* Desktop First Approach */
.component { /* Desktop styles */ }

@media (max-width: 1024px) { /* Tablet */ }
@media (max-width: 768px) { /* Mobile */ }
```

**Testing Requirements**:
- Test on actual devices when possible
- Use browser developer tools for responsive testing
- Verify touch interactions on mobile
- Ensure readable text sizes across all devices
- Confirm navigation accessibility on small screens

## Future Enhancements (Phase 2)
- Korean social login (Kakao, Line)
- Premium features (emoji reactions, GIF support)
- Advanced analytics dashboard
- Email notification system
- Comment threading improvements