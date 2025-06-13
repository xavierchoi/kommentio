# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
Before you start any session, you must read some markdown files to understand last updates and reminds. All project documentation is now organized in the knowledge_base/ folder (except this CLAUDE.md file):

## 📚 Knowledge Base Reading Triggers

### 🎯 Project Foundation & Goals
**Trigger**: When user asks about project purpose, goals, competitors, or requirements
**Read**: `knowledge_base/comment_system_prd.md` - Complete Product Requirements Document
**Read**: `knowledge_base/competitor_research.md` - Competitor analysis and research

### 📊 Project Status & Updates  
**Trigger**: When user asks about current status, recent changes, or version history
**Read**: `knowledge_base/LAST_PROJECT_STATUS.md` - Current project state and achievements
**Read**: `knowledge_base/UPDATE_LOG.md` - Detailed version history and changelog

### 🧪 Testing & Quality Assurance
**Trigger**: When user mentions testing, QA, debugging, or code verification
**Read**: `knowledge_base/CODE_TEST.md` - Comprehensive testing methodology and procedures

### 🔐 OAuth & Authentication Setup
**Trigger**: When user asks about social login, OAuth setup, or authentication issues
**Read**: `knowledge_base/twitter-oauth-setup-guide.md` - X(Twitter) OAuth implementation guide  
**Read**: `knowledge_base/APPLE_OAUTH_SETUP_GUIDE.md` - Apple OAuth setup and Mock mode strategy

### ✨ Prompt Enhancement & AI Optimization
**Trigger**: When user prompt starts with "EP:" or mentions prompt improvement
**Read**: `knowledge_base/PROMPT_ENHANCER.md` - AI prompt enhancement guidelines and patterns

### 📖 General Documentation & User Guide
**Trigger**: When user asks about installation, usage, features, or general documentation
**Read**: `knowledge_base/README.md` - Complete user guide, features, and setup instructions

## 🚨 Critical File Location Reminder
**IMPORTANT**: CLAUDE.md must ALWAYS remain in the project root directory. All other documentation is organized in knowledge_base/ folder for better structure.

## 🔧 Special Command Triggers

### Build Completion Command
If user says '빌드를 종료합니다.", ask user to commit and push current build. If user agree with that, you must update(e.g. latest todo list) `knowledge_base/LAST_PROJECT_STATUS.md` and add update log in `knowledge_base/UPDATE_LOG.md`. please name the current version of build as possible as minor number(e.g. v0.1.0 to v0.1.1). After this, ask user to commit and push this project again.

### Code Testing Command  
If user says '코드 테스트를 실시합니다. CODE_TEST.md를 읽고 테스트를 시작하세요.", read `knowledge_base/CODE_TEST.md` file and follow the prompts in the file to run code tests.

### Prompt Enhancement Command

If the user's prompt starts with “EP:”, then the user wants to enhance the prompt. Read the `knowledge_base/PROMPT_ENHANCER.md` file and follow the guidelines to enhance the user's prompt. Show the user the enhancement and get their permission to run it before taking action on the enhanced prompt. The enhanced prompts will follow the language of the original prompt (e.g., Korean prompt input will output Korean prompt enhancements, English prompt input will output English prompt enhancements, etc.)

During developing with user, if you learn very important thing which need to remember and remind everytime, please add the contents which contains what's your mistakes and what you learn from the mistakes in CLAUDE.md file.

## Git Commit Message Standards for AI-Assisted Development

### Commit Message Template
```
[AI] <type>: <description>

<detailed description of changes>
<performance impact if applicable>
<testing notes if applicable>

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Commit Types
- **feat**: New feature implementation
- **fix**: Bug fixes and error resolution
- **perf**: Performance optimizations
- **style**: UI/UX improvements and styling
- **refactor**: Code restructuring without functionality change
- **docs**: Documentation updates
- **test**: Testing additions or modifications
- **build**: Build system or dependency changes

### AI-Specific Commit Standards
1. **Always use [AI] prefix** for Claude Code assisted commits
2. **Include specific file changes** in description
3. **Document performance impact** for optimization commits
4. **Reference line numbers** for targeted fixes
5. **Include testing verification** when applicable

### Examples
```bash
# Performance optimization
[AI] perf: optimize particle system for 50% better FPS

- Reduced particle count from 12→6 for better performance
- Slowed animation speeds: 20s→35s cycle, 30s→60s background
- Added FPS monitoring with 5-second intervals
- Mobile devices get 45s cycle + 0.2 opacity optimization

Files: docs/index.html:1184-1203, 1462-1530
Performance: 50% CPU usage reduction, stable 60fps on low-end devices

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

```bash
# UI fix
[AI] fix: resolve navigation overlap at 1333x819 resolution

- Fixed nav.nav-premium covering div.hero-badge issue
- Adjusted .hero-premium padding-top: 2rem→120px desktop, 100px mobile
- Ensures perfect visual separation across all screen sizes

Files: docs/index.html:383, 779
Testing: Verified on 1333x819, 1920x1080, mobile viewports

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Commit Workflow
1. **Before committing**: Run `git status` and `git diff` to review changes
2. **Check recent commits**: `git log --oneline -5` to match style
3. **Use template**: Follow AI commit message template exactly
4. **Include Co-Authored-By**: Always credit Claude collaboration


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

## 🚨 Critical Development Guidelines - NEVER MODIFY

### ⚠️ ABSOLUTELY PROHIBITED Changes
These elements are CRITICAL to system stability and MUST NEVER be modified:

#### 1. Core Widget Architecture (src/kommentio.js)
**NEVER TOUCH:**
- `class Kommentio` constructor signature and initialization flow
- `mockMode` detection logic and fallback system  
- `init()` method core structure and error handling
- `render()` method DOM creation and CSS injection patterns
- CSS namespacing system (`.kommentio-widget` prefix)
- Provider authentication flow and token handling

**WHY:** These are the foundational systems that keep the widget working across all environments.

#### 2. Performance-Critical Systems
**NEVER MODIFY:**
- FPS monitoring and auto-optimization code in docs/index.html
- Particle system GPU acceleration settings
- `will-change`, `transform3d`, and `backface-visibility` optimizations
- Mouse tracking performance throttling (33ms intervals)
- Mobile detection and animation fallbacks

**WHY:** These optimizations took extensive testing to achieve stable 60fps performance.

#### 3. Modal System (docs/admin-dashboard/styles/main.css)
**NEVER CHANGE:**
- `.modal-overlay` and `.modal` positioning and z-index values
- `!important` declarations in modal CSS (lines 22-314)
- Inline styling patterns in Components.js modal creation
- Modal backdrop-filter and browser compatibility hacks

**WHY:** The modal system was carefully engineered to work without CSS framework dependencies.

#### 4. Production Build System
**NEVER MODIFY:**
- `package.json` build scripts and dependencies
- Vite configuration for IIFE bundle generation
- `dist/widget/kommentio.iife.js` manual editing
- GitHub Pages deployment workflow

**WHY:** Any changes could break the production deployment pipeline.

#### 5. Database Schema & API (database/migrations/)
**NEVER ALTER:**
- RLS (Row Level Security) policies
- Table relationships and foreign key constraints  
- Supabase realtime subscription configurations
- Authentication provider configurations

**WHY:** These are production database structures that could cause data loss.

### ⚠️ HIGH-RISK Modification Areas
Proceed with EXTREME CAUTION:

#### 1. CSS Responsive Design
- Media query breakpoints (768px, 1024px boundaries)
- Touch target minimum sizes (44px standard)
- Sidebar navigation responsive behavior
- Mobile gesture handling systems

#### 2. Authentication & OAuth
- Social provider configuration arrays
- OAuth callback URLs and domain settings
- Token validation and refresh logic
- Mock mode authentication simulation

#### 3. Real-time Systems  
- Supabase subscription handling
- WebSocket connection management
- Comment update broadcasting
- Error recovery and reconnection logic

### ⚡ Safe Modification Guidelines

#### ✅ SAFE to Modify:
- Landing page content and marketing copy
- Color schemes and visual styling (non-structural)
- Admin dashboard content and statistics
- Documentation and README files
- Test files and development utilities

#### ✅ SAFE with Testing:
- Comment rendering templates
- Form validation messages
- Animation timing values (with performance testing)
- Social provider styling and icons
- Error messages and user feedback

### 🔍 Before Making ANY Changes:

1. **Search for Dependencies**: Use anchor comments to find all related code
2. **Test in Mock Mode**: Verify changes work without Supabase
3. **Performance Check**: Monitor FPS impact of visual changes
4. **Cross-Browser Test**: Verify in Chrome, Firefox, Safari
5. **Mobile Test**: Check responsive behavior on actual devices

### 🚨 Emergency Recovery Commands

If something breaks:

```bash
# Restore production widget
git checkout HEAD -- dist/widget/kommentio.iife.js

# Restore core widget
git checkout HEAD -- src/kommentio.js

# Restore modal system  
git checkout HEAD -- docs/admin-dashboard/styles/main.css

# Rebuild clean
npm run build:widget
```

### 📝 Change Documentation Requirements

For ANY modification outside the "Safe" zones:

1. Document the change reason in commit message
2. Update this CLAUDE.md with lessons learned
3. Test the change in multiple environments
4. Update relevant anchor comments if structure changes
5. Run performance monitoring before/after

**REMEMBER: When in doubt, DON'T change it. The current system works perfectly and has been extensively tested. Most "improvements" can break critical functionality.**

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

## 🧪 Comprehensive Testing Strategy

### Mock Mode vs Production Testing Framework

#### 1. Test Environment Architecture

```
Testing Hierarchy:
├── Mock Mode (Development/CI)
│   ├── Widget functionality tests
│   ├── UI/UX behavior validation  
│   ├── Performance benchmarking
│   └── Cross-browser compatibility
├── Supabase Integration (Staging)
│   ├── Database schema validation
│   ├── Real-time subscription tests
│   ├── Authentication flow verification
│   └── API endpoint stress testing
└── Production (Live Environment)
    ├── End-to-end user scenarios
    ├── Performance monitoring
    ├── Error tracking & analytics
    └── Social OAuth verification
```

#### 2. Automated Testing Suite

**Mock Mode Tests (Fast Feedback Loop)**
```bash
# Quick development tests - 30 seconds
npm run test:mock
# Runs: Widget loading, UI rendering, Mock auth, Comment CRUD

npm run test:performance
# Runs: FPS monitoring, Memory usage, Bundle size validation

npm run test:responsive  
# Runs: Mobile/tablet/desktop viewport testing
```

**Integration Tests (Comprehensive)**
```bash
# Supabase connection tests - 2 minutes
npm run test:supabase
# Runs: Database connectivity, RLS policies, Real-time subscriptions

npm run test:oauth
# Runs: All social provider authentication flows

npm run test:ai
# Runs: Claude API spam filtering with test cases
```

**Production Validation (Live Environment)**
```bash
# End-to-end user scenarios - 5 minutes
npm run test:e2e
# Runs: Complete user journeys, Cross-browser tests, Performance monitoring
```

#### 3. Test File Organization

**Available Test Files:**
- `test-widget.html` - Core widget functionality (Mock mode)
- `test-supabase-real.html` - Database integration testing
- `test-realtime.html` - Real-time subscription validation
- `test-ai-spam-filter.html` - AI integration testing
- `test-twitter-oauth.html` - OAuth provider verification
- `test-performance-monitoring.html` - Performance validation
- `test-production-stability.html` - End-to-end stability testing

#### 4. Testing Checklist by Component

**Widget Core (src/kommentio.js)**
- [ ] Mock mode initialization
- [ ] Supabase connection handling
- [ ] CSS injection and namespacing
- [ ] Error recovery and fallbacks
- [ ] Social provider configuration
- [ ] Comment rendering and updates

**Performance Systems (docs/index.html)**
- [ ] FPS monitoring accuracy
- [ ] Auto-optimization triggers
- [ ] GPU acceleration effectiveness
- [ ] Mobile performance degradation
- [ ] Memory leak detection

**Admin Dashboard (docs/admin-dashboard/)**
- [ ] Modal system functionality
- [ ] Responsive navigation behavior
- [ ] Touch gesture compatibility
- [ ] Cross-browser CSS rendering
- [ ] JavaScript functionality integrity

**Database Integration**
- [ ] RLS policy enforcement
- [ ] Real-time subscription stability
- [ ] Authentication token validation
- [ ] Comment hierarchical structure
- [ ] Multi-site isolation

#### 5. CI/CD Testing Pipeline

**Pre-commit Checks:**
```bash
1. npm run lint           # Code quality
2. npm run test:mock      # Quick functionality check
3. npm run build:widget   # Bundle generation
4. Size check < 50KB      # Performance requirement
```

**Pre-deployment Validation:**
```bash
1. npm run test:supabase   # Database integration
2. npm run test:oauth      # Authentication flows  
3. npm run test:performance # FPS/memory validation
4. npm run test:e2e        # Complete user scenarios
```

#### 6. Manual Testing Protocols

**Daily Development Testing:**
1. Load `test-widget.html` - Verify basic functionality
2. Test responsive behavior - Chrome DevTools
3. Check console for errors - Zero tolerance policy
4. Validate performance - >60fps requirement

**Weekly Integration Testing:**
1. Supabase connection test - Real database
2. OAuth flow verification - All 7 providers
3. AI spam filter accuracy - Sample content tests
4. Cross-browser validation - Chrome, Firefox, Safari

**Release Testing:**
1. Production deployment test - GitHub Pages
2. Complete user journey - Anonymous to authenticated
3. Performance benchmark - Before/after comparison
4. Error monitoring setup - Real-time alerts

#### 7. Performance Testing Standards

**FPS Monitoring Requirements:**
- Desktop: Maintain >55fps consistently
- Mobile: Maintain >30fps minimum
- Auto-optimization trigger: <25fps for 5+ seconds
- Recovery validation: Return to >45fps within 10 seconds

**Memory Usage Limits:**
- Initial load: <50MB heap usage
- After 5 minutes usage: <100MB heap usage
- Memory leak detection: <5MB growth per minute
- Garbage collection efficiency: >80% recovery rate

**Bundle Size Monitoring:**
- Widget file: <50KB uncompressed (current: 16KB ✅)
- Gzipped size: <20KB (current: 6KB ✅)
- Admin dashboard: <200KB total assets
- Landing page: <500KB including images

#### 8. Error Handling Testing

**Mock Mode Error Scenarios:**
- Invalid configuration data
- Network connectivity issues
- Malformed user input
- Theme switching failures
- Social provider unavailability

**Production Error Scenarios:**
- Supabase service interruption
- Claude API rate limiting
- OAuth provider failures
- Database connection timeout
- Real-time subscription drops

#### 9. Browser Compatibility Matrix

**Primary Support (100% functionality):**
- Chrome 90+ (Desktop/Mobile)
- Firefox 88+ (Desktop/Mobile)  
- Safari 14+ (Desktop/Mobile)
- Edge 90+ (Desktop)

**Secondary Support (Core functionality):**
- Chrome 80+ (Basic features)
- Firefox 78+ (Basic features)
- Safari 13+ (Basic features)

**Testing Tools:**
- BrowserStack for automated testing
- Local device testing for primary browsers
- Performance validation on 3G networks
- Accessibility testing with screen readers

#### 10. Test Data Management

**Mock Mode Data:**
- Consistent test dataset for reproducible results
- Multiple user personas (anonymous, authenticated, admin)
- Various comment scenarios (normal, spam, replies)
- Performance stress test data (100+ comments)

**Staging Environment:**
- Isolated test database
- Test social OAuth applications
- Rate-limited Claude API testing
- Real-time subscription load testing

**Production Testing:**
- Read-only monitoring
- Anonymous usage tracking
- Error rate monitoring
- Performance metrics collection

This comprehensive testing strategy ensures system reliability across all environments while maintaining development velocity through smart test automation and clear testing protocols.

## ⚡ Performance Monitoring Standards

### Real-time Performance Monitoring Framework

#### 1. Core Performance Metrics

**FPS (Frames Per Second) Monitoring**
```javascript
// 🔍 ANCHOR_SEARCH: Performance Monitoring Implementation
class PerformanceMonitor {
  constructor() {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fpsHistory = [];
    this.memoryHistory = [];
    this.alertThresholds = {
      fps: { critical: 25, warning: 45, target: 60 },
      memory: { critical: 200, warning: 100, target: 50 },
      loadTime: { critical: 3000, warning: 1500, target: 500 }
    };
  }
}
```

**Memory Usage Tracking**
```javascript
// Memory monitoring with leak detection
trackMemoryUsage() {
  if (performance.memory) {
    return {
      used: performance.memory.usedJSHeapSize / 1024 / 1024, // MB
      total: performance.memory.totalJSHeapSize / 1024 / 1024,
      limit: performance.memory.jsHeapSizeLimit / 1024 / 1024
    };
  }
  return null;
}
```

#### 2. Performance Standards & Thresholds

**FPS Performance Targets:**
- **Excellent**: >55fps (Green status)
- **Good**: 45-55fps (Yellow status)  
- **Poor**: 25-45fps (Orange status)
- **Critical**: <25fps (Red status + auto-optimization)

**Memory Usage Limits:**
- **Initial Load**: <50MB (Target)
- **After 5min**: <100MB (Warning threshold)
- **Critical**: >200MB (Immediate optimization)
- **Memory Leak**: >5MB/minute growth

**Bundle Size Standards:**
- **Widget**: <50KB uncompressed (Current: 16KB ✅)
- **Gzipped**: <20KB (Current: 6KB ✅)
- **Admin Dashboard**: <200KB total assets
- **Landing Page**: <500KB including images

#### 3. Developer Tools Integration

**Browser DevTools Integration:**
```javascript
// Performance monitoring with DevTools integration
class DevToolsIntegration {
  startProfiling() {
    // Start performance measurement
    performance.mark('kommentio-start');
    console.time('Kommentio Load Time');
    
    // Enable FPS monitoring
    this.fpsMonitor.start();
    
    // Track memory usage
    this.memoryMonitor.start();
  }
  
  endProfiling() {
    performance.mark('kommentio-end');
    console.timeEnd('Kommentio Load Time');
    
    performance.measure('kommentio-duration', 'kommentio-start', 'kommentio-end');
    
    // Generate performance report
    this.generateReport();
  }
}
```

**Chrome DevTools Performance Panel:**
```javascript
// Integration with Chrome DevTools Performance API
if (window.chrome && chrome.devtools) {
  chrome.devtools.performance.onProfilingStarted.addListener(() => {
    console.log('🔍 DevTools profiling started - Kommentio monitoring active');
  });
}
```

#### 4. Automated Performance Alerts

**Real-time Alert System:**
```javascript
class PerformanceAlerts {
  checkThresholds(metrics) {
    // FPS alerts
    if (metrics.fps < 25) {
      this.triggerAlert('critical', 'FPS dropped below 25', metrics.fps);
      this.triggerAutoOptimization();
    } else if (metrics.fps < 45) {
      this.triggerAlert('warning', 'FPS below optimal range', metrics.fps);
    }
    
    // Memory alerts
    if (metrics.memory.used > 200) {
      this.triggerAlert('critical', 'Memory usage critical', metrics.memory.used);
    } else if (metrics.memory.used > 100) {
      this.triggerAlert('warning', 'High memory usage detected', metrics.memory.used);
    }
    
    // Memory leak detection
    if (this.detectMemoryLeak(metrics.memory)) {
      this.triggerAlert('critical', 'Memory leak detected', metrics.memory.growth);
    }
  }
}
```

#### 5. Performance Testing Commands

**NPM Script Integration:**
```json
{
  "scripts": {
    "perf:monitor": "node scripts/performance-monitor.js",
    "perf:test": "node scripts/performance-test.js",
    "perf:baseline": "node scripts/create-baseline.js",
    "perf:compare": "node scripts/compare-performance.js",
    "perf:report": "node scripts/generate-report.js",
    "perf:ci": "npm run perf:test && npm run perf:compare"
  }
}
```

**Development Workflow:**
```bash
# Daily development monitoring
npm run perf:monitor        # Real-time FPS/memory tracking

# Before commits
npm run perf:test          # Quick performance validation

# Weekly baseline updates  
npm run perf:baseline      # Create new performance baseline

# Release comparison
npm run perf:compare       # Compare with previous version

# CI/CD integration
npm run perf:ci           # Automated performance testing
```

#### 6. Performance Metrics Dashboard

**Real-time Metrics Display:**
```javascript
// Live performance dashboard
class PerformanceDashboard {
  render() {
    return `
      <div class="performance-dashboard">
        <div class="metric-card fps-card ${this.getFPSStatus()}">
          <h3>FPS</h3>
          <div class="value">${this.currentFPS}</div>
          <div class="target">Target: 60fps</div>
        </div>
        
        <div class="metric-card memory-card ${this.getMemoryStatus()}">
          <h3>Memory</h3>
          <div class="value">${this.currentMemory}MB</div>
          <div class="target">Target: <50MB</div>
        </div>
        
        <div class="metric-card bundle-card">
          <h3>Bundle Size</h3>
          <div class="value">${this.bundleSize}KB</div>
          <div class="target">Target: <50KB</div>
        </div>
      </div>
    `;
  }
}
```

#### 7. Performance Regression Detection

**Automated Regression Testing:**
```javascript
// Performance regression detection
class RegressionDetector {
  compareWithBaseline(currentMetrics, baseline) {
    const regressions = [];
    
    // FPS regression check (>10% drop is critical)
    if (currentMetrics.fps < baseline.fps * 0.9) {
      regressions.push({
        type: 'fps',
        severity: 'critical',
        current: currentMetrics.fps,
        baseline: baseline.fps,
        percentage: ((baseline.fps - currentMetrics.fps) / baseline.fps * 100).toFixed(1)
      });
    }
    
    // Memory regression check (>20% increase is warning)
    if (currentMetrics.memory > baseline.memory * 1.2) {
      regressions.push({
        type: 'memory',
        severity: 'warning',
        current: currentMetrics.memory,
        baseline: baseline.memory,
        percentage: ((currentMetrics.memory - baseline.memory) / baseline.memory * 100).toFixed(1)
      });
    }
    
    return regressions;
  }
}
```

#### 8. Cross-Browser Performance Testing

**Multi-Browser Monitoring:**
```javascript
// Browser-specific performance tracking
const BrowserMetrics = {
  chrome: { target_fps: 60, memory_limit: 100 },
  firefox: { target_fps: 55, memory_limit: 120 },
  safari: { target_fps: 50, memory_limit: 80 },
  edge: { target_fps: 58, memory_limit: 110 }
};

// Adjust expectations based on browser
function getBrowserBaseline() {
  const browser = detectBrowser();
  return BrowserMetrics[browser] || BrowserMetrics.chrome;
}
```

#### 9. Mobile Performance Standards

**Mobile-Specific Metrics:**
```javascript
// Mobile performance optimization
class MobilePerformanceMonitor extends PerformanceMonitor {
  constructor() {
    super();
    this.isMobile = this.detectMobile();
    
    if (this.isMobile) {
      // Lower expectations for mobile devices
      this.alertThresholds = {
        fps: { critical: 15, warning: 25, target: 30 },
        memory: { critical: 150, warning: 75, target: 30 },
        loadTime: { critical: 5000, warning: 3000, target: 1500 }
      };
    }
  }
}
```

#### 10. Performance Optimization Triggers

**Auto-Optimization System:**
```javascript
// Automatic performance optimization
class AutoOptimizer {
  optimize(severity) {
    switch(severity) {
      case 'critical':
        // Disable all animations
        this.disableAnimations();
        // Remove particles
        this.removeParticles();
        // Reduce polling intervals
        this.reducePolling();
        break;
        
      case 'warning':
        // Reduce animation complexity
        this.simplifyAnimations();
        // Reduce particle count
        this.reduceParticles();
        break;
    }
    
    // Re-test performance after optimization
    setTimeout(() => this.validateOptimization(), 5000);
  }
}
```

#### 11. Performance Reporting

**Comprehensive Performance Reports:**
```javascript
// Generate detailed performance reports
class PerformanceReporter {
  generateReport() {
    return {
      timestamp: new Date().toISOString(),
      metrics: {
        fps: this.getAverageFPS(),
        memory: this.getPeakMemory(),
        loadTime: this.getLoadTime(),
        bundleSize: this.getBundleSize()
      },
      browser: this.getBrowserInfo(),
      device: this.getDeviceInfo(),
      regressions: this.getRegressions(),
      optimizations: this.getOptimizationsApplied(),
      recommendations: this.getRecommendations()
    };
  }
}
```

#### 12. CI/CD Performance Integration

**Automated Performance Testing in CI:**
```yaml
# GitHub Actions performance testing
name: Performance Tests
on: [push, pull_request]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run performance tests
        run: npm run perf:ci
      
      - name: Check performance regression
        run: npm run perf:compare
      
      - name: Comment performance results
        uses: actions/github-script@v6
        with:
          script: |
            // Post performance results as PR comment
```

This performance monitoring framework provides real-time insights, automated optimization, and comprehensive testing to ensure Kommentio maintains excellent performance across all environments and devices.

## Future Enhancements (Phase 2)
- Korean social login (Kakao, Line)
- Premium features (emoji reactions, GIF support)
- Advanced analytics dashboard
- Email notification system
- Comment threading improvements