/**
 * Kommentio - 오픈소스 댓글 위젯
 * 사용법: <div id="kommentio" data-site-id="your-site-id"></div>
 */

class Kommentio {
  constructor(options = {}) {
    this.version = '0.1.1';
    this.options = {
      siteId: null,
      theme: 'light', // 'light' | 'dark' | 'auto'
      language: 'ko',
      maxDepth: 3,
      allowAnonymous: true,
      supabaseUrl: null,
      supabaseKey: null,
      claudeApiKey: null, // 사용자가 제공하는 스팸 필터링용
      
      // 소셜 로그인 프로바이더 설정 (SVG 아이콘 기반)
      socialProviders: {
        google: { 
          enabled: true, 
          label: 'Google', 
          color: '#ffffff', 
          borderColor: '#dadce0',
          iconColor: '#4285f4',
          textColor: '#3c4043',
          hoverColor: '#f8f9fa'
        },
        github: { 
          enabled: true, 
          label: 'GitHub', 
          color: '#24292f', 
          borderColor: '#24292f',
          iconColor: '#ffffff',
          textColor: '#ffffff',
          hoverColor: '#32383f'
        },
        facebook: { 
          enabled: true, 
          label: 'Facebook', 
          color: '#1877f2', 
          borderColor: '#1877f2',
          iconColor: '#ffffff',
          textColor: '#ffffff',
          hoverColor: '#166fe5'
        },
        twitter: { 
          enabled: true, 
          label: 'X.com', 
          color: '#000000', 
          borderColor: '#000000',
          iconColor: '#ffffff',
          textColor: '#ffffff',
          hoverColor: '#272c30'
        },
        apple: { 
          enabled: false, 
          label: 'Apple', 
          color: '#000000', 
          borderColor: '#000000',
          iconColor: '#ffffff',
          textColor: '#ffffff',
          hoverColor: '#1d1d1f'
        },
        linkedin: { 
          enabled: false, 
          label: 'LinkedIn', 
          color: '#0a66c2', 
          borderColor: '#0a66c2',
          iconColor: '#ffffff',
          textColor: '#ffffff',
          hoverColor: '#004182'
        },
        kakao: { 
          enabled: true, 
          label: '카카오톡', 
          color: '#fee500', 
          borderColor: '#fee500',
          iconColor: '#000000',
          textColor: '#000000',
          hoverColor: '#fdd835'
        },
        line: { 
          enabled: true, 
          label: 'LINE', 
          color: '#00b900', 
          borderColor: '#00b900',
          iconColor: '#ffffff',
          textColor: '#ffffff',
          hoverColor: '#009900'
        }
      },
      
      ...options
    };

    this.container = null;
    this.comments = [];
    this.currentUser = null;
    this.supabase = null;
    
    this.init();
  }

  /**
   * 위젯 초기화
   */
  async init() {
    try {
      await this.loadSupabase();
      this.createContainer();
      this.attachStyles();
      this.render();
      this.attachEventListeners();
      
      console.log(`Kommentio v${this.version} initialized`);
    } catch (error) {
      console.error('Kommentio initialization failed:', error);
    }
  }

  /**
   * 소셜 프로바이더 SVG 아이콘 생성
   */
  getSocialProviderIcon(provider, size = 20) {
    const icons = {
      google: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>`,
      github: `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0c4.42 0 8 3.58 8 8a8.1 8.1 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/></svg>`,
      facebook: `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="currentColor"><path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/></svg>`,
      twitter: `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="currentColor"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"/></svg>`,
      apple: `<svg width="100%" height="100%" viewBox="0 0 56 56" fill="none" style="border-radius: 50%; overflow: hidden;">
        <defs>
          <style>
            .apple-bg-light { fill: #ffffff; }
            .apple-logo-light { fill: #000000; }
            .apple-bg-dark { fill: #000000; }
            .apple-logo-dark { fill: #ffffff; }
            
            /* 라이트 모드 기본 - 검은 배경에 흰 로고 표시 (바뀜) */
            .apple-bg-light { display: none; }
            .apple-logo-light { display: none; }
            .apple-bg-dark { display: block; }
            .apple-logo-dark { display: block; }
            
            /* 다크 모드 시 - 흰 배경에 검은 로고 표시 (바뀜) */
            @media (prefers-color-scheme: dark) {
              .apple-bg-light { display: block; }
              .apple-logo-light { display: block; }
              .apple-bg-dark { display: none; }
              .apple-logo-dark { display: none; }
            }
            
            /* Kommentio 위젯 다크테마 대응 (바뀜) */
            .kommentio-widget[data-theme="dark"] .apple-bg-light { display: block; }
            .kommentio-widget[data-theme="dark"] .apple-logo-light { display: block; }
            .kommentio-widget[data-theme="dark"] .apple-bg-dark { display: none; }
            .kommentio-widget[data-theme="dark"] .apple-logo-dark { display: none; }
            
            .kommentio-widget[data-theme="light"] .apple-bg-light { display: none; }
            .kommentio-widget[data-theme="light"] .apple-logo-light { display: none; }
            .kommentio-widget[data-theme="light"] .apple-bg-dark { display: block; }
            .kommentio-widget[data-theme="light"] .apple-logo-dark { display: block; }
          </style>
          <!-- 원형 마스크 정의 -->
          <mask id="apple-circle-mask">
            <circle cx="28" cy="28" r="28" fill="white"/>
          </mask>
        </defs>
        <!-- 원형 마스크 적용된 그룹 -->
        <g mask="url(#apple-circle-mask)">
          <!-- 라이트 모드용 (흰 배경 + 검은 로고) -->
          <rect class="apple-bg-light" x="0" y="0" width="56" height="56"/>
          <g class="apple-logo-light" transform="translate(28, 28) scale(1.2) translate(-28, -28)">
            <path d="M28.2226562,20.3846154 C29.0546875,20.3846154 30.0976562,19.8048315 30.71875,19.0317864 C31.28125,18.3312142 31.6914062,17.352829 31.6914062,16.3744437 C31.6914062,16.2415766 31.6796875,16.1087095 31.65625,16 C30.7304687,16.0362365 29.6171875,16.640178 28.9492187,17.4494596 C28.421875,18.06548 27.9414062,19.0317864 27.9414062,20.0222505 C27.9414062,20.1671964 27.9648438,20.3121424 27.9765625,20.3604577 C28.0351562,20.3725366 28.1289062,20.3846154 28.2226562,20.3846154 Z M25.2929688,35 C26.4296875,35 26.9335938,34.214876 28.3515625,34.214876 C29.7929688,34.214876 30.109375,34.9758423 31.375,34.9758423 C32.6171875,34.9758423 33.4492188,33.792117 34.234375,32.6325493 C35.1132812,31.3038779 35.4765625,29.9993643 35.5,29.9389701 C35.4179688,29.9148125 33.0390625,28.9122695 33.0390625,26.0979021 C33.0390625,23.6579784 34.9140625,22.5588048 35.0195312,22.474253 C33.7773438,20.6382708 31.890625,20.5899555 31.375,20.5899555 C29.9804688,20.5899555 28.84375,21.4596313 28.1289062,21.4596313 C27.3554688,21.4596313 26.3359375,20.6382708 25.1289062,20.6382708 C22.8320312,20.6382708 20.5,22.5950413 20.5,26.2911634 C20.5,28.5861411 21.3671875,31.013986 22.4335938,32.5842339 C23.3476562,33.9129053 24.1445312,35 25.2929688,35 Z"/>
          </g>
          <!-- 다크 모드용 (검은 배경 + 흰 로고) -->
          <rect class="apple-bg-dark" x="0" y="0" width="56" height="56"/>
          <g class="apple-logo-dark" transform="translate(28, 28) scale(1.2) translate(-28, -28)">
            <path d="M28.2226562,20.3846154 C29.0546875,20.3846154 30.0976562,19.8048315 30.71875,19.0317864 C31.28125,18.3312142 31.6914062,17.352829 31.6914062,16.3744437 C31.6914062,16.2415766 31.6796875,16.1087095 31.65625,16 C30.7304687,16.0362365 29.6171875,16.640178 28.9492187,17.4494596 C28.421875,18.06548 27.9414062,19.0317864 27.9414062,20.0222505 C27.9414062,20.1671964 27.9648438,20.3121424 27.9765625,20.3604577 C28.0351562,20.3725366 28.1289062,20.3846154 28.2226562,20.3846154 Z M25.2929688,35 C26.4296875,35 26.9335938,34.214876 28.3515625,34.214876 C29.7929688,34.214876 30.109375,34.9758423 31.375,34.9758423 C32.6171875,34.9758423 33.4492188,33.792117 34.234375,32.6325493 C35.1132812,31.3038779 35.4765625,29.9993643 35.5,29.9389701 C35.4179688,29.9148125 33.0390625,28.9122695 33.0390625,26.0979021 C33.0390625,23.6579784 34.9140625,22.5588048 35.0195312,22.474253 C33.7773438,20.6382708 31.890625,20.5899555 31.375,20.5899555 C29.9804688,20.5899555 28.84375,21.4596313 28.1289062,21.4596313 C27.3554688,21.4596313 26.3359375,20.6382708 25.1289062,20.6382708 C22.8320312,20.6382708 20.5,22.5950413 20.5,26.2911634 C20.5,28.5861411 21.3671875,31.013986 22.4335938,32.5842339 C23.3476562,33.9129053 24.1445312,35 25.2929688,35 Z"/>
          </g>
        </g>
      </svg>`,
      linkedin: `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="currentColor"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/></svg>`,
      kakao: `<svg width="${size}" height="${size}" viewBox="0 0 512 512" fill="none" style="transform: scale(2.3);"><path fill="#FFEB3B" d="M289 513C268 513 247 513 226 513C224 512 224 512 223 511C209 508 195 506 182 502C164 497 147 490 131 481C115 472 100 461 87 449C75 437 63 425 53 412C37 392 25 369 16 345C10 328 5 310 3 291C3 290 2 290 1 289C1 268 1 246 1 225C2 224 3 223 3 223C4 217 5 210 6 204C11 177 21 151 35 127C50 102 69 81 91 62C105 50 120 39 136 31C163 16 192 6 223 3C224 3 224 2 225 1C246 1 267 1 288 1C289 2 290 3 291 3C298 4 306 5 313 6C337 12 361 21 383 33C399 42 414 52 427 65C438 75 447 85 457 97C471 113 482 131 491 151C501 174 508 198 511 223C511 224 512 224 513 225C513 246 513 267 513 288C512 289 511 290 511 290C510 297 509 303 508 310C503 337 493 363 479 387C464 412 445 433 423 452C409 464 394 475 378 484C350 498 322 508 291 511C290 511 290 512 289 513ZM412 219C401 188 380 166 353 150C311 126 266 120 219 129C182 135 150 151 125 179C102 205 92 235 99 270C105 299 121 321 143 338C152 345 162 351 172 357C168 371 163 385 159 400C157 404 156 409 156 413C155 418 158 419 162 418C166 416 170 414 173 412C190 400 207 388 224 377C227 375 231 374 233 374C254 376 274 376 295 372C329 365 360 351 384 326C413 296 424 261 412 219Z"/><path fill="#3F2823" d="M412 219C424 261 413 296 384 326C360 351 329 365 295 372C274 376 254 376 233 374C231 374 227 375 224 377C207 388 190 400 173 412C170 414 166 416 162 418C158 419 155 418 156 413C156 409 157 404 159 400C163 385 168 371 172 357C162 351 152 345 143 338C121 321 105 299 99 270C92 235 102 205 125 179C150 151 182 135 219 129C266 120 311 126 353 150C380 166 401 188 412 219ZM374 284C373 281 372 279 371 277C364 267 357 258 350 249C357 242 363 236 370 229C374 225 374 221 370 217C367 213 362 213 358 217C352 223 346 229 340 235C338 237 336 239 333 242C333 234 333 228 333 222C332 215 328 212 323 213C317 213 314 218 314 224C314 238 314 252 314 266C314 272 314 279 315 285C316 292 319 294 324 294C329 293 333 290 333 284C333 278 333 273 333 267C333 265 335 264 336 261C343 271 350 280 357 289C359 292 362 295 367 293C371 292 374 289 374 284ZM246 250C242 241 239 232 236 223C233 216 229 213 223 213C217 213 213 216 210 223C205 238 199 252 193 267C191 272 189 277 188 283C187 289 188 292 194 294C199 295 203 294 205 288C206 286 207 284 208 281C208 279 210 278 213 278C220 278 227 278 234 278C237 278 238 279 239 282C240 284 241 288 242 290C245 294 249 295 254 293C258 292 259 288 258 284C258 281 257 278 256 276C253 267 249 259 246 250ZM177 246C177 241 177 236 177 231C180 231 183 231 185 231C187 231 189 231 192 231C198 230 201 227 201 221C201 216 198 213 192 213C176 213 160 213 144 213C139 213 137 216 136 221C135 227 139 230 146 231C150 231 155 231 159 231C159 235 160 238 160 241C160 254 159 266 159 278C159 281 159 284 160 287C161 292 164 294 168 294C173 294 176 292 177 287C178 284 178 281 178 278C178 267 177 257 177 246ZM266 290C268 291 270 292 272 292C281 293 289 293 298 293C301 293 303 292 305 292C309 291 311 288 311 284C311 281 309 278 306 277C302 276 299 276 296 276C291 275 287 276 283 276C283 273 283 271 283 269C283 254 283 238 282 222C282 216 279 213 273 213C267 213 264 216 264 223C264 241 263 259 263 277C263 281 265 286 266 290Z"/><path fill="#FCE83B" d="M374 284C374 289 371 292 367 293C362 295 359 292 357 289C350 280 343 271 336 261C335 264 333 265 333 267C333 273 333 278 333 284C333 290 329 293 324 294C319 294 316 292 315 285C314 279 314 272 314 266C314 252 314 238 314 224C314 218 317 213 323 213C328 212 332 215 333 222C333 228 333 234 333 242C336 239 338 237 340 235C346 229 352 223 358 217C362 213 367 213 370 217C374 221 374 225 370 229C363 236 357 242 350 249C357 258 364 267 371 277C372 279 373 281 374 284Z"/><path fill="#FDE93B" d="M246 250C249 259 253 267 256 276C257 278 258 281 258 284C259 288 258 292 254 293C249 295 245 294 242 290C241 288 240 284 239 282C238 279 237 278 234 278C227 278 220 278 213 278C210 278 208 279 208 281C207 284 206 286 205 288C203 294 199 295 194 294C188 292 187 289 188 283C189 277 191 272 193 267C199 252 205 238 210 223C213 216 217 213 223 213C229 213 233 216 236 223C239 232 242 241 246 250ZM217 253C216 256 215 259 214 261C220 261 226 261 232 261C229 253 226 245 223 236C221 242 219 247 217 253Z"/><path fill="#FCE83B" d="M177 246C178 257 178 267 178 278C178 281 178 284 177 287C176 292 173 294 168 294C164 294 161 292 160 287C159 284 159 281 159 278C159 266 160 254 160 241C160 238 159 235 159 231C155 231 150 231 146 231C139 230 135 227 136 221C137 216 139 213 144 213C160 213 176 213 192 213C198 213 201 216 201 221C201 227 198 230 192 231C189 231 187 231 185 231C183 231 180 231 177 231C177 236 177 241 177 246Z"/><path fill="#FAE63A" d="M266 290C265 286 263 281 263 277C263 259 264 241 264 223C264 216 267 213 273 213C279 213 282 216 282 222C283 238 283 254 283 269C283 271 283 273 283 276C287 276 291 275 296 276C299 276 302 276 306 277C309 278 311 281 311 284C311 288 309 291 305 292C303 292 301 293 298 293C289 293 281 293 272 292C270 292 268 291 266 290Z"/><path fill="#483124" d="M217 253C219 247 221 242 223 236C226 245 229 253 232 261C226 261 220 261 214 261C215 259 216 256 217 253Z"/></svg>`,
      line: `<svg width="100%" height="100%" viewBox="0 0 320 320" fill="none">
        <circle fill="#4cc764" cx="160" cy="160" r="160"/>
        <path fill="#fff" d="M266.7,150.68c0-47.8-47.92-86.68-106.81-86.68s-106.81,38.89-106.81,86.68c0,42.85,38,78.73,89.33,85.52,3.48.75,8.21,2.29,9.41,5.27,1.08,2.7.7,6.93.35,9.66,0,0-1.25,7.54-1.52,9.14-.47,2.7-2.15,10.56,9.25,5.76,11.4-4.8,61.51-36.22,83.92-62.01h0c15.48-16.98,22.9-34.2,22.9-53.33Z"/>
        <g>
          <path fill="#4cc764" d="M231.17,178.28c1.13,0,2.04-.91,2.04-2.04v-7.58c0-1.12-.92-2.04-2.04-2.04h-20.39v-7.87h20.39c1.13,0,2.04-.91,2.04-2.04v-7.57c0-1.12-.92-2.04-2.04-2.04h-20.39v-7.87h20.39c1.13,0,2.04-.91,2.04-2.04v-7.57c0-1.12-.92-2.04-2.04-2.04h-30.01c-1.13,0-2.04.91-2.04,2.04v.04h0v46.54h0v.04c0,1.13.91,2.04,2.04,2.04h30.01Z"/>
          <path fill="#4cc764" d="M120.17,178.28c1.13,0,2.04-.91,2.04-2.04v-7.58c0-1.12-.92-2.04-2.04-2.04h-20.39v-37c0-1.12-.92-2.04-2.04-2.04h-7.58c-1.13,0-2.04.91-2.04,2.04v46.58h0v.04c0,1.13.91,2.04,2.04,2.04h30.01Z"/>
          <rect fill="#4cc764" x="128.62" y="127.58" width="11.65" height="50.69" rx="2.04" ry="2.04"/>
          <path fill="#4cc764" d="M189.8,127.58h-7.58c-1.13,0-2.04.91-2.04,2.04v27.69l-21.33-28.8c-.05-.07-.11-.14-.16-.21,0,0,0,0-.01-.01-.04-.04-.08-.09-.12-.13-.01-.01-.03-.02-.04-.03-.04-.03-.07-.06-.11-.09-.02-.01-.04-.03-.06-.04-.03-.03-.07-.05-.11-.07-.02-.01-.04-.03-.06-.04-.04-.02-.07-.04-.11-.06-.02-.01-.04-.02-.06-.03-.04-.02-.08-.04-.12-.05-.02,0-.04-.02-.07-.02-.04-.01-.08-.03-.12-.04-.02,0-.05-.01-.07-.02-.04,0-.08-.02-.12-.03-.03,0-.06,0-.09-.01-.04,0-.07-.01-.11-.01-.04,0-.07,0-.11,0-.02,0-.05,0-.07,0h-7.53c-1.13,0-2.04.91-2.04,2.04v46.62c0,1.13.91,2.04,2.04,2.04h7.58c1.13,0,2.04-.91,2.04-2.04v-27.68l21.35,28.84c.15.21.33.38.53.51,0,0,.02.01.02.02.04.03.08.05.13.08.02.01.04.02.06.03.03.02.07.03.1.05.03.02.07.03.1.04.02,0,.04.02.06.02.05.02.09.03.14.04,0,0,.02,0,.03,0,.17.04.35.07.53.07h7.53c1.13,0,2.04-.91,2.04-2.04v-46.62c0-1.13-.91-2.04-2.04-2.04Z"/>
        </g>
      </svg>`
    };
    
    return icons[provider] || '';
  }

  /**
   * Supabase 클라이언트 로드 및 초기화
   */
  async loadSupabase() {
    // Supabase 설정이 없으면 mock 모드로 동작
    if (!this.options.supabaseUrl || !this.options.supabaseKey) {
      console.warn('Supabase configuration not found. Running in mock mode.');
      this.mockMode = true;
      this.initMockData();
      return;
    }

    try {
      // Supabase SDK 동적 로드 (CDN)
      if (!window.supabase) {
        await this.loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
      }

      this.supabase = window.supabase.createClient(
        this.options.supabaseUrl,
        this.options.supabaseKey
      );

      // 현재 사용자 확인 (Supabase + 커스텀 로그인)
      const { data: { user } } = await this.supabase.auth.getUser();
      
      // 커스텀 로그인 사용자 확인 (카카오, 라인)
      const customUser = localStorage.getItem('kommentio_custom_user');
      
      if (user) {
        this.currentUser = user;
      } else if (customUser) {
        this.currentUser = JSON.parse(customUser);
      }
      
      this.mockMode = false;
    } catch (error) {
      console.warn('Failed to connect to Supabase. Falling back to mock mode.', error);
      this.mockMode = true;
      this.initMockData();
    }
  }

  /**
   * 외부 스크립트 동적 로드
   */
  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * 위젯 컨테이너 생성
   */
  createContainer() {
    // data-kommentio 속성을 가진 요소 찾기
    const target = document.querySelector('[data-kommentio]') || 
                   document.getElementById('kommentio');
    
    if (!target) {
      throw new Error('Kommentio container not found. Add <div data-kommentio></div> to your page.');
    }

    // 사이트 ID 추출
    this.options.siteId = target.dataset.siteId || target.dataset.kommentio || window.location.hostname;
    
    // 컨테이너 설정
    this.container = target;
    this.container.className = 'kommentio-widget';
    this.container.setAttribute('data-theme', this.options.theme);
  }

  /**
   * CSS 스타일 첨부
   */
  attachStyles() {
    if (document.getElementById('kommentio-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'kommentio-styles';
    styles.textContent = this.getStyles();
    document.head.appendChild(styles);
  }

  /**
   * 위젯 CSS 스타일 (Tailwind 기반, 네임스페이스 적용)
   */
  getStyles() {
    return `
      .kommentio-widget {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 100%;
        margin: 0 auto;
        --kommentio-bg: #ffffff;
        --kommentio-text: #1f2937;
        --kommentio-border: #e5e7eb;
        --kommentio-primary: #3b82f6;
        --kommentio-secondary: #6b7280;
      }

      .kommentio-widget[data-theme="dark"] {
        --kommentio-bg: #1f2937;
        --kommentio-text: #f9fafb;
        --kommentio-border: #374151;
        --kommentio-primary: #60a5fa;
        --kommentio-secondary: #9ca3af;
      }

      .kommentio-container {
        background: var(--kommentio-bg);
        color: var(--kommentio-text);
        border: 1px solid var(--kommentio-border);
        border-radius: 8px;
        padding: 1.5rem;
      }

      .kommentio-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--kommentio-border);
      }

      .kommentio-title {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0;
      }

      .kommentio-auth {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
      }

      /* 🎨 새로운 원형 소셜 로그인 시스템 */
      .kommentio-social-login {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(48px, 1fr));
        gap: 12px;
        margin-bottom: 1rem;
        max-width: 400px;
        justify-content: center;
      }

      .kommentio-btn {
        padding: 0.5rem 1rem;
        border: 1px solid var(--kommentio-border);
        border-radius: 6px;
        background: var(--kommentio-bg);
        color: var(--kommentio-text);
        cursor: pointer;
        font-size: 0.875rem;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        min-width: fit-content;
      }

      .kommentio-btn:hover {
        background: var(--kommentio-border);
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .kommentio-btn:focus {
        outline: 2px solid var(--kommentio-primary);
        outline-offset: 2px;
      }

      .kommentio-btn-primary {
        background: var(--kommentio-primary);
        color: white;
        border-color: var(--kommentio-primary);
      }

      /* 🔥 프리미엄 원형 소셜 로그인 버튼 */
      .kommentio-btn-social {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 1px solid;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        position: relative;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        min-width: 48px;
        min-height: 48px;
        overflow: hidden;
      }

      /* Apple 아이콘은 전체 크기 + 원형 마스크 (Apple 가이드라인 준수) */
      .kommentio-btn-apple svg {
        /* 스케일링 제거 - Apple 로고가 이제 100% 크기로 원형 마스크 적용됨 */
      }

      .kommentio-btn-social:hover {
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }

      .kommentio-btn-social:active {
        transform: translateY(0) scale(0.98);
        transition: transform 0.1s ease;
      }

      .kommentio-btn-social:focus {
        outline: 3px solid var(--kommentio-primary);
        outline-offset: 2px;
      }

      /* Google 브랜딩 가이드라인 준수 */
      .kommentio-btn-google {
        background: #ffffff;
        border-color: #dadce0;
        color: #3c4043;
      }

      .kommentio-btn-google:hover {
        background: #f8f9fa;
        border-color: #dadce0;
        box-shadow: 0 8px 25px rgba(60, 64, 67, 0.15);
      }

      .kommentio-btn-github {
        background: #24292f;
        border-color: #24292f;
        color: #ffffff;
      }

      .kommentio-btn-github:hover {
        background: #32383f;
        border-color: #32383f;
      }

      .kommentio-btn-facebook {
        background: #1877f2;
        border-color: #1877f2;
        color: #ffffff;
      }

      .kommentio-btn-facebook:hover {
        background: #166fe5;
        border-color: #166fe5;
      }

      .kommentio-btn-twitter {
        background: #000000;
        border-color: #000000;
        color: #ffffff;
      }

      .kommentio-btn-twitter:hover {
        background: #272c30;
        border-color: #272c30;
      }

      .kommentio-btn-apple {
        background: #000000;
        border: none;
        color: #ffffff;
      }

      .kommentio-btn-apple:hover {
        background: #1d1d1f;
        border: none;
      }

      .kommentio-btn-linkedin {
        background: #0a66c2;
        border-color: #0a66c2;
        color: #ffffff;
      }

      .kommentio-btn-linkedin:hover {
        background: #004182;
        border-color: #004182;
      }

      .kommentio-btn-kakao {
        background: #fee500;
        border: none;
        color: #000000;
      }

      .kommentio-btn-kakao:hover {
        background: #fdd835;
        border: none;
      }

      .kommentio-btn-line {
        background: #00b900;
        border: none;
        color: #ffffff;
      }

      .kommentio-btn-line:hover {
        background: #009900;
        border: none;
      }

      .kommentio-user-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: var(--kommentio-secondary);
      }

      .kommentio-logout-btn {
        padding: 0.25rem 0.75rem;
        font-size: 0.75rem;
        background: transparent;
        border: 1px solid var(--kommentio-border);
        color: var(--kommentio-secondary);
      }

      .kommentio-form {
        margin-bottom: 2rem;
      }

      .kommentio-textarea {
        width: 100%;
        min-height: 100px;
        padding: 0.75rem;
        border: 1px solid var(--kommentio-border);
        border-radius: 6px;
        background: var(--kommentio-bg);
        color: var(--kommentio-text);
        resize: vertical;
        font-family: inherit;
      }

      .kommentio-comments {
        space-y: 1rem;
      }

      .kommentio-comment {
        border: 1px solid var(--kommentio-border);
        border-radius: 6px;
        padding: 1rem;
        margin-bottom: 1rem;
      }

      .kommentio-comment-nested {
        margin-left: 2rem;
        margin-top: 1rem;
      }

      .kommentio-comment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }

      .kommentio-author {
        font-weight: 600;
        color: var(--kommentio-primary);
      }

      .kommentio-timestamp {
        color: var(--kommentio-secondary);
        font-size: 0.875rem;
      }

      .kommentio-content {
        line-height: 1.6;
        margin-bottom: 0.75rem;
      }

      .kommentio-actions {
        display: flex;
        gap: 1rem;
        font-size: 0.875rem;
      }

      .kommentio-action {
        color: var(--kommentio-secondary);
        cursor: pointer;
        transition: color 0.2s;
      }

      .kommentio-action:hover {
        color: var(--kommentio-primary);
      }

      .kommentio-loading {
        text-align: center;
        padding: 2rem;
        color: var(--kommentio-secondary);
      }

      .kommentio-error {
        background: #fef2f2;
        color: #dc2626;
        padding: 1rem;
        border-radius: 6px;
        margin-bottom: 1rem;
      }

      /* 반응형 디자인 - Desktop First 접근법 */
      
      /* 태블릿 최적화 (1024px 이하) */
      @media (max-width: 1024px) {
        .kommentio-header {
          flex-direction: column;
          gap: 1rem;
          align-items: stretch;
        }
        
        /* 태블릿에서 소셜 로그인 최적화 */
        .kommentio-social-login {
          grid-template-columns: repeat(auto-fit, minmax(56px, 1fr));
          gap: 16px;
          justify-content: center;
          max-width: 450px;
        }
        
        .kommentio-btn-social {
          width: 56px;
          height: 56px;
          min-width: 56px;
          min-height: 56px;
        }
        
        /* 태블릿에서 Apple 아이콘 (원형 마스크 적용으로 스케일링 불필요) */
        .kommentio-btn-apple svg {
          /* 스케일링 제거 - 100% 크기 + 원형 마스크로 처리 */
        }
        
        .kommentio-textarea {
          min-height: 100px;
        }
      }
      
      /* 모바일 최적화 (768px 이하) */
      @media (max-width: 768px) {
        .kommentio-container {
          padding: 1rem;
          border-radius: 8px;
          margin: 0.5rem;
        }
        
        .kommentio-title {
          font-size: 1.125rem;
          margin-bottom: 1rem;
        }
        
        .kommentio-widget {
          font-size: 16px; /* iOS 줌 방지 */
        }
        
        .kommentio-textarea {
          font-size: 16px; /* iOS 줌 방지 */
          min-height: 120px;
          padding: 12px;
        }
        
        .kommentio-comment-nested {
          margin-left: 1rem; /* 모바일에서 중첩 간격 줄임 */
        }
        
        .kommentio-comment-nested .kommentio-comment-nested {
          margin-left: 0.5rem; /* 3단계 중첩 더 줄임 */
        }
        
        .kommentio-author {
          font-size: 0.875rem;
        }
        
        .kommentio-timestamp {
          font-size: 0.75rem;
        }
        
        .kommentio-actions {
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .kommentio-btn-action {
          min-height: 44px;
          min-width: 44px;
          padding: 8px 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        
        .kommentio-notification {
          left: 10px !important;
          right: 10px !important;
          top: 10px !important;
          width: auto !important;
          font-size: 0.875rem;
        }
      }
      
      /* 소형 모바일 (640px 이하) */
      @media (max-width: 640px) {
        .kommentio-container {
          padding: 0.75rem;
          margin: 0.25rem;
        }
        
        /* 모바일에서 소셜 로그인 2열 그리드 */
        .kommentio-social-login {
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          justify-content: center;
          max-width: 300px;
          margin: 0 auto 1rem auto;
        }
        
        .kommentio-btn-social {
          width: 56px;
          height: 56px;
          min-width: 56px;
          min-height: 56px;
          justify-self: center;
        }
        
        /* 모바일에서 Apple 아이콘 (원형 마스크 적용으로 스케일링 불필요) */
        .kommentio-btn-apple svg {
          /* 스케일링 제거 - 100% 크기 + 원형 마스크로 처리 */
        }
        
        .kommentio-comment {
          border-left: none;
          border-right: none;
          border-radius: 0;
          margin-left: -0.75rem;
          margin-right: -0.75rem;
          padding-left: 0.75rem;
          padding-right: 0.75rem;
        }
        
        .kommentio-comment-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.25rem;
        }
        
        .kommentio-form {
          padding: 0.75rem;
        }
        
        .kommentio-form-actions {
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .kommentio-btn {
          width: 100%;
          min-height: 44px;
          justify-content: center;
        }
      }
      
      /* 초소형 모바일 (480px 이하) */
      @media (max-width: 480px) {
        .kommentio-title {
          font-size: 1rem;
        }
        
        .kommentio-comment-nested {
          margin-left: 0.5rem;
        }
        
        .kommentio-comment-nested .kommentio-comment-nested {
          margin-left: 0.25rem;
        }
        
        .kommentio-author {
          font-size: 0.8125rem;
        }
        
        .kommentio-timestamp {
          font-size: 0.6875rem;
        }
        
        .kommentio-textarea {
          min-height: 100px;
          padding: 10px;
        }
      }
      
      /* 터치 친화적 인터페이스 */
      @media (hover: none) and (pointer: coarse) {
        .kommentio-btn:hover {
          transform: none; /* 터치 디바이스에서 호버 효과 제거 */
        }
        
        .kommentio-btn:active {
          transform: scale(0.98);
          transition: transform 0.1s ease;
        }
        
        /* 소셜 버튼 터치 최적화 */
        .kommentio-btn-social:hover {
          transform: none;
          box-shadow: none;
        }
        
        .kommentio-btn-social:active {
          transform: scale(0.95);
          transition: transform 0.1s ease;
        }
        
        .kommentio-comment-actions button:hover {
          background: transparent;
        }
        
        .kommentio-comment-actions button:active {
          background: var(--kommentio-bg-secondary);
          border-radius: 4px;
        }
      }
      
      /* 가로 모드 최적화 */
      @media (max-height: 500px) and (orientation: landscape) {
        .kommentio-container {
          padding: 0.5rem;
        }
        
        .kommentio-textarea {
          min-height: 80px;
        }
        
        .kommentio-title {
          font-size: 1rem;
          margin-bottom: 0.5rem;
        }
      }
    `;
  }

  /**
   * 위젯 렌더링
   */
  render() {
    this.container.innerHTML = `
      <div class="kommentio-container">
        <header class="kommentio-header">
          <h3 class="kommentio-title">댓글</h3>
          <div class="kommentio-auth">
            ${this.renderAuthButtons()}
          </div>
        </header>
        
        ${this.renderCommentForm()}
        
        <div class="kommentio-comments" id="kommentio-comments">
          <div class="kommentio-loading">댓글을 불러오는 중...</div>
        </div>
      </div>
    `;

    // 댓글 로드
    this.loadComments();
  }

  /**
   * 인증 버튼 렌더링
   */
  renderAuthButtons() {
    if (this.currentUser) {
      return `
        <div class="kommentio-user-info">
          <span>안녕하세요, ${this.currentUser.user_metadata?.name || this.currentUser.email}</span>
          <button class="kommentio-btn kommentio-logout-btn" onclick="kommentio.logout()">로그아웃</button>
        </div>
      `;
    }

    // 활성화된 소셜 프로바이더들만 필터링
    const enabledProviders = Object.entries(this.options.socialProviders)
      .filter(([, config]) => config.enabled);

    if (enabledProviders.length === 0) {
      return '<p class="kommentio-text-secondary">로그인 옵션이 설정되지 않았습니다.</p>';
    }

    const socialButtons = enabledProviders.map(([provider, config], index) => {
      return `
        <button 
          class="kommentio-btn kommentio-btn-social kommentio-btn-${provider}" 
          onclick="kommentio.login('${provider}')"
          title="${config.label}로 로그인"
          aria-label="${config.label}로 로그인"
          tabindex="${index === 0 ? '0' : '-1'}"
          role="button"
        >
          ${this.getSocialProviderIcon(provider, 24)}
        </button>
      `;
    }).join('');

    return `
      <div class="kommentio-social-login">
        ${socialButtons}
      </div>
    `;
  }

  /**
   * 소셜 프로바이더 설정 업데이트
   */
  updateSocialProviders(providerSettings) {
    Object.assign(this.options.socialProviders, providerSettings);
    this.render(); // UI 즉시 업데이트
  }

  /**
   * 특정 소셜 프로바이더 활성화/비활성화
   */
  toggleSocialProvider(provider, enabled) {
    if (this.options.socialProviders[provider]) {
      this.options.socialProviders[provider].enabled = enabled;
      this.render();
    }
  }

  /**
   * 댓글 작성 폼 렌더링
   */
  renderCommentForm() {
    if (!this.currentUser && !this.options.allowAnonymous) {
      return '<p class="kommentio-text-secondary">댓글을 작성하려면 로그인해주세요.</p>';
    }

    return `
      <form class="kommentio-form" onsubmit="kommentio.handleSubmit(event)">
        <textarea 
          class="kommentio-textarea" 
          placeholder="댓글을 입력하세요..."
          required
        ></textarea>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.75rem;">
          <small class="kommentio-text-secondary">Markdown 문법을 지원합니다.</small>
          <button type="submit" class="kommentio-btn kommentio-btn-primary">댓글 작성</button>
        </div>
      </form>
    `;
  }

  /**
   * Mock 데이터 초기화
   */
  initMockData() {
    this.mockComments = [
      {
        id: 'mock-1',
        site_id: this.options.siteId,
        page_url: window.location.pathname,
        content: 'Kommentio 정말 좋네요! Disqus보다 훨씬 빠르고 깔끔한 것 같아요. 👍',
        parent_id: null,
        depth: 0,
        author_name: '김개발',
        author_email: 'dev@example.com',
        likes_count: 5,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        children: []
      },
      {
        id: 'mock-2',
        site_id: this.options.siteId,
        page_url: window.location.pathname,
        content: '오픈소스라서 더욱 신뢰가 갑니다. 광고도 없고 완전 무료라니 최고예요!',
        parent_id: null,
        depth: 0,
        author_name: '박코더',
        author_email: 'coder@example.com',
        likes_count: 3,
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        children: []
      },
      {
        id: 'mock-3',
        site_id: this.options.siteId,
        page_url: window.location.pathname,
        content: '맞아요! 로딩 속도가 정말 빨라요. React 없이 Vanilla JS로 만든 덕분인 것 같아요.',
        parent_id: 'mock-1',
        depth: 1,
        author_name: '최성능',
        author_email: 'performance@example.com',
        likes_count: 2,
        created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        children: []
      },
      {
        id: 'mock-4',
        site_id: this.options.siteId,
        page_url: window.location.pathname,
        content: '정말 인상적인 프로젝트네요! PRD 명세대로 잘 구현되고 있는 것 같아요. 🚀',
        parent_id: null,
        depth: 0,
        author_name: '프로젝트매니저',
        author_email: 'pm@example.com',
        likes_count: 4,
        created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        children: []
      }
    ];
  }

  /**
   * 댓글 로드
   */
  async loadComments() {
    if (this.mockMode) {
      // Mock 모드에서는 로컬 데이터 사용
      this.comments = this.buildCommentTree(this.mockComments);
      this.renderComments();
      return;
    }

    try {
      const { data: comments, error } = await this.supabase
        .from('comments')
        .select('*')
        .eq('site_id', this.options.siteId)
        .eq('page_url', window.location.pathname)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) throw error;

      this.comments = this.buildCommentTree(comments || []);
      this.renderComments();
    } catch (error) {
      console.error('Failed to load comments:', error);
      this.renderError('댓글을 불러오는데 실패했습니다.');
    }
  }

  /**
   * 댓글 트리 구조 생성 (계층형)
   */
  buildCommentTree(comments) {
    const commentMap = {};
    const rootComments = [];

    // 모든 댓글을 맵에 저장
    comments.forEach(comment => {
      comment.children = [];
      commentMap[comment.id] = comment;
    });

    // 부모-자식 관계 설정
    comments.forEach(comment => {
      if (comment.parent_id && commentMap[comment.parent_id]) {
        commentMap[comment.parent_id].children.push(comment);
      } else {
        rootComments.push(comment);
      }
    });

    return rootComments;
  }

  /**
   * 댓글 목록 렌더링
   */
  renderComments() {
    const container = document.getElementById('kommentio-comments');
    
    if (this.comments.length === 0) {
      container.innerHTML = '<p class="kommentio-text-secondary">첫 번째 댓글을 작성해보세요!</p>';
      return;
    }

    container.innerHTML = this.comments.map(comment => this.renderComment(comment)).join('');
  }

  /**
   * 개별 댓글 렌더링 (재귀적으로 답글 포함)
   */
  renderComment(comment, depth = 0) {
    const isNested = depth > 0;
    const canReply = depth < this.options.maxDepth;

    return `
      <div class="kommentio-comment ${isNested ? 'kommentio-comment-nested' : ''}" data-comment-id="${comment.id}">
        <div class="kommentio-comment-header">
          <span class="kommentio-author">${comment.author_name || '익명'}</span>
          <span class="kommentio-timestamp">${this.formatDate(comment.created_at)}</span>
        </div>
        
        <div class="kommentio-content">${this.sanitizeContent(comment.content)}</div>
        
        <div class="kommentio-actions">
          <span class="kommentio-action" onclick="kommentio.likeComment('${comment.id}')">
            👍 ${comment.likes || 0}
          </span>
          ${canReply ? `<span class="kommentio-action" onclick="kommentio.replyTo('${comment.id}')">답글</span>` : ''}
        </div>
        
        ${comment.children.map(child => this.renderComment(child, depth + 1)).join('')}
      </div>
    `;
  }

  /**
   * 날짜 포맷팅
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '방금 전';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
    
    return date.toLocaleDateString('ko-KR');
  }

  /**
   * 컨텐츠 안전화 (XSS 방지)
   */
  sanitizeContent(content) {
    return content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\n/g, '<br>');
  }

  /**
   * 에러 렌더링
   */
  renderError(message) {
    const container = document.getElementById('kommentio-comments');
    container.innerHTML = `<div class="kommentio-error">${message}</div>`;
  }

  /**
   * 이벤트 리스너 등록
   */
  attachEventListeners() {
    // 키보드 네비게이션 지원
    this.container.addEventListener('keydown', (e) => {
      // Tab 키로 소셜 로그인 버튼 간 이동
      if (e.key === 'Tab') {
        this.handleTabNavigation(e);
      }
      
      // Enter 키 또는 Space 키로 버튼 활성화
      if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('kommentio-btn-social')) {
        e.preventDefault();
        e.target.click();
      }
      
      // Escape 키로 포커스 제거
      if (e.key === 'Escape') {
        e.target.blur();
      }
    });

    if (this.mockMode) {
      // Mock 모드에서는 실시간 업데이트 시뮬레이션
      this.simulateRealtimeUpdates();
    } else if (this.supabase) {
      // 실제 Supabase Realtime 구독
      this.supabase
        .channel('comments')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'comments',
            filter: `site_id=eq.${this.options.siteId}`
          }, 
          (payload) => {
            console.log('Real-time update:', payload);
            this.loadComments();
          }
        )
        .subscribe();
    }
  }

  /**
   * Tab 키 네비게이션 처리
   */
  handleTabNavigation(e) {
    const socialButtons = this.container.querySelectorAll('.kommentio-btn-social');
    const currentIndex = Array.from(socialButtons).indexOf(e.target);
    
    if (socialButtons.length === 0) return;
    
    // Shift + Tab으로 역순 이동
    if (e.shiftKey) {
      if (currentIndex === 0) {
        e.preventDefault();
        socialButtons[socialButtons.length - 1].focus();
      }
    } else {
      // Tab으로 순차 이동
      if (currentIndex === socialButtons.length - 1) {
        e.preventDefault();
        socialButtons[0].focus();
      }
    }
  }

  /**
   * Mock 모드에서 실시간 업데이트 시뮬레이션
   */
  simulateRealtimeUpdates() {
    // 30초마다 새로운 댓글 추가 (데모용)
    setInterval(() => {
      if (Math.random() > 0.7) { // 30% 확률로 새 댓글
        const randomComments = [
          '실시간 업데이트 테스트입니다! 👋',
          'Mock 모드에서도 실시간 기능이 잘 동작하네요!',
          '새로운 댓글이 자동으로 추가되었습니다.',
          'Kommentio 실시간 업데이트 데모 중...',
          '이 댓글은 30초마다 자동으로 생성됩니다.'
        ];
        
        const randomNames = ['실시간테스터', '자동댓글봇', 'Mock사용자', '데모계정'];
        
        const newComment = {
          id: 'mock-realtime-' + Date.now(),
          site_id: this.options.siteId,
          page_url: window.location.pathname,
          content: randomComments[Math.floor(Math.random() * randomComments.length)],
          parent_id: null,
          depth: 0,
          author_name: randomNames[Math.floor(Math.random() * randomNames.length)],
          author_email: 'realtime@example.com',
          likes_count: Math.floor(Math.random() * 5),
          created_at: new Date().toISOString(),
          children: []
        };
        
        this.mockComments.push(newComment);
        this.comments = this.buildCommentTree(this.mockComments);
        this.renderComments();
        
        // 새 댓글 추가 알림
        this.showNotification('새 댓글이 추가되었습니다! 🔄');
      }
    }, 30000); // 30초
  }

  /**
   * 알림 표시
   */
  showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #3b82f6;
      color: white;
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 14px;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // CSS 애니메이션 추가
    if (!document.getElementById('kommentio-notification-styles')) {
      const styles = document.createElement('style');
      styles.id = 'kommentio-notification-styles';
      styles.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(styles);
    }
    
    // 3초 후 자동 제거
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  /**
   * 댓글 작성 핸들러
   */
  async handleSubmit(event) {
    event.preventDefault();
    const textarea = event.target.querySelector('textarea');
    const content = textarea.value.trim();
    
    if (!content) return;

    try {
      await this.createComment(content);
      textarea.value = '';
    } catch (error) {
      console.error('Failed to create comment:', error);
      alert('댓글 작성에 실패했습니다.');
    }
  }

  /**
   * Claude API로 스팸 검사
   */
  async checkSpamWithClaude(content) {
    if (!this.options.claudeApiKey) {
      return { spam_score: 0.0, reason: 'Claude API key not provided', is_spam: false };
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.options.claudeApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 100,
          messages: [{
            role: 'user',
            content: `다음 댓글이 스팸인지 분석해주세요. 0.0(정상)에서 1.0(스팸) 사이의 점수와 간단한 이유를 JSON 형태로 응답해주세요:

댓글: "${content}"

응답 형식:
{
  "spam_score": 0.8,
  "reason": "상업적 링크 포함"
}`
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API 호출 실패: ${response.status}`);
      }

      const result = await response.json();
      const analysis = JSON.parse(result.content[0].text);
      
      return {
        spam_score: analysis.spam_score,
        reason: analysis.reason,
        is_spam: analysis.spam_score > 0.7
      };
    } catch (error) {
      console.warn('Claude API 스팸 검사 실패:', error);
      // API 실패 시 기본값 반환 (댓글은 게시되지만 스팸 점수 없음)
      return {
        spam_score: 0.0,
        reason: 'API 호출 실패',
        is_spam: false
      };
    }
  }

  /**
   * 댓글 생성
   */
  async createComment(content, parentId = null) {
    if (this.mockMode) {
      // Mock 모드에서는 스팸 시뮬레이션
      const mockSpamCheck = Math.random() > 0.9; // 10% 확률로 스팸 감지
      const newComment = {
        id: 'mock-' + Date.now(),
        site_id: this.options.siteId,
        page_url: window.location.pathname,
        content: content,
        parent_id: parentId,
        depth: parentId ? 1 : 0,
        author_name: this.currentUser?.user_metadata?.name || this.currentUser?.email || '익명',
        author_email: this.currentUser?.email || null,
        likes_count: 0,
        spam_score: mockSpamCheck ? 0.8 : 0.1,
        spam_reason: mockSpamCheck ? 'Mock 스팸 감지' : null,
        is_spam: mockSpamCheck,
        created_at: new Date().toISOString(),
        children: []
      };
      
      this.mockComments.push(newComment);
      this.comments = this.buildCommentTree(this.mockComments);
      this.renderComments();
      
      if (mockSpamCheck) {
        this.showNotification('스팸으로 감지된 댓글입니다. 관리자 승인 후 게시됩니다. ⚠️');
      }
      return;
    }

    // 실제 모드에서는 Claude API로 스팸 검사
    let spamData = { spam_score: 0.0, reason: null, is_spam: false };
    
    if (this.options.claudeApiKey) {
      try {
        spamData = await this.checkSpamWithClaude(content);
      } catch (error) {
        console.warn('스팸 검사 중 오류 발생:', error);
      }
    }

    const { error } = await this.supabase
      .from('comments')
      .insert({
        site_id: this.options.siteId,
        page_url: window.location.pathname,
        content: content,
        parent_id: parentId,
        author_id: this.currentUser?.id,
        author_name: this.currentUser?.user_metadata?.name || this.currentUser?.email || '익명',
        author_email: this.currentUser?.email,
        spam_score: spamData.spam_score,
        spam_reason: spamData.reason,
        is_spam: spamData.is_spam,
        is_approved: !spamData.is_spam // 스팸이 아니면 자동 승인
      });

    if (error) throw error;

    // 스팸으로 감지된 경우 알림
    if (spamData.is_spam) {
      this.showNotification('스팸으로 감지된 댓글입니다. 관리자 승인 후 게시됩니다. ⚠️');
    } else {
      this.showNotification('댓글이 성공적으로 게시되었습니다! ✅');
    }
  }

  /**
   * Supabase 프로바이더 매핑
   */
  getSupabaseProvider(provider) {
    const providerMap = {
      'google': 'google',
      'github': 'github', 
      'facebook': 'facebook',
      'twitter': 'twitter',
      'apple': 'apple',
      'linkedin': 'linkedin',
      'kakao': 'kakao',
      'line': 'line'
    };

    return providerMap[provider] || provider;
  }

  /**
   * 프로바이더별 추가 옵션 설정
   */
  getProviderOptions(provider) {
    const baseOptions = {
      redirectTo: window.location.href
    };

    // 프로바이더별 특별 설정
    switch (provider) {
      case 'apple':
        return {
          ...baseOptions,
          scopes: 'name email'
        };
      case 'linkedin':
        return {
          ...baseOptions,
          scopes: 'r_liteprofile r_emailaddress'
        };
      case 'kakao':
        return {
          ...baseOptions,
          scopes: 'profile_nickname profile_image account_email'
        };
      case 'line':
        return {
          ...baseOptions,
          scopes: 'profile openid email'
        };
      default:
        return baseOptions;
    }
  }

  /**
   * 로그인
   */
  async login(provider) {
    const providerConfig = this.options.socialProviders[provider];
    
    if (!providerConfig || !providerConfig.enabled) {
      alert('지원하지 않는 로그인 방식입니다.');
      return;
    }

    if (this.mockMode) {
      // Mock 모드에서는 가짜 사용자 생성
      this.currentUser = {
        id: 'mock-user-' + Date.now(),
        email: `${provider}user@example.com`,
        user_metadata: {
          name: `${providerConfig.label} 사용자`,
          avatar_url: `https://ui-avatars.com/api/?name=${providerConfig.icon}&background=3b82f6&color=fff`,
          provider: provider
        }
      };
      
      this.showNotification(`${providerConfig.label} 로그인 완료! (Mock 모드) 🎉`);
      this.render(); // UI 업데이트
      return;
    }

    try {
      // 한국 소셜 로그인 (카카오, 라인)은 커스텀 구현
      if (provider === 'kakao' || provider === 'line') {
        await this.handleKoreanSocialLogin(provider);
        return;
      }

      const supabaseProvider = this.getSupabaseProvider(provider);
      const providerOptions = this.getProviderOptions(provider);

      const { error } = await this.supabase.auth.signInWithOAuth({
        provider: supabaseProvider,
        options: providerOptions
      });
      
      if (error) throw error;
      
      this.showNotification(`${providerConfig.label} 로그인 중... 🔄`);
      
    } catch (error) {
      console.error('Login failed:', error);
      
      // 프로바이더별 에러 메시지
      let errorMessage = '로그인에 실패했습니다.';
      if (error.message?.includes('not supported')) {
        errorMessage = `${providerConfig.label} 로그인이 아직 설정되지 않았습니다. 관리자에게 문의하세요.`;
      }
      
      alert(errorMessage);
    }
  }

  /**
   * 로그아웃
   */
  async logout() {
    if (this.mockMode) {
      this.currentUser = null;
      this.render();
      return;
    }

    try {
      await this.supabase.auth.signOut();
      
      // 커스텀 로그인 정보도 정리 (카카오, 라인)
      localStorage.removeItem('kommentio_custom_user');
      localStorage.removeItem('kommentio_custom_token');
      
      this.currentUser = null;
      this.render();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  /**
   * 한국 소셜 로그인 (카카오, 라인) 커스텀 처리
   */
  async handleKoreanSocialLogin(provider) {
    const providerConfig = this.options.socialProviders[provider];
    
    try {
      if (provider === 'kakao') {
        await this.handleKakaoLogin();
      } else if (provider === 'line') {
        await this.handleLineLogin();
      }
    } catch (error) {
      console.error(`${provider} login failed:`, error);
      alert(`${providerConfig.label} 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.`);
    }
  }

  /**
   * 카카오 로그인 처리
   */
  async handleKakaoLogin() {
    const kakaoConfig = this.getKakaoConfig();
    
    if (!kakaoConfig.apiKey) {
      this.showNotification('카카오 로그인 설정이 필요합니다. 관리자에게 문의하세요.', 'error');
      return;
    }

    // 카카오 SDK 로드
    await this.loadKakaoSDK();
    
    return new Promise((resolve, reject) => {
      window.Kakao.Auth.login({
        success: async (authObj) => {
          try {
            // 카카오 사용자 정보 가져오기
            window.Kakao.API.request({
              url: '/v2/user/me',
              success: async (userInfo) => {
                // Supabase 커스텀 토큰으로 로그인
                await this.loginWithKakaoUser(userInfo, authObj.access_token);
                resolve();
              },
              fail: reject
            });
          } catch (error) {
            reject(error);
          }
        },
        fail: reject
      });
    });
  }

  /**
   * 라인 로그인 처리
   */
  async handleLineLogin() {
    const lineConfig = this.getLineConfig();
    
    if (!lineConfig.clientId) {
      this.showNotification('LINE 로그인 설정이 필요합니다. 관리자에게 문의하세요.', 'error');
      return;
    }

    // LINE 로그인 URL 생성
    const lineLoginUrl = this.generateLineLoginUrl(lineConfig);
    
    // 팝업으로 LINE 로그인 처리
    return new Promise((resolve, reject) => {
      const popup = window.open(lineLoginUrl, 'line-login', 'width=400,height=600');
      
      // 메시지 리스너로 로그인 결과 받기
      const messageListener = async (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'LINE_LOGIN_SUCCESS') {
          window.removeEventListener('message', messageListener);
          popup.close();
          
          try {
            await this.loginWithLineUser(event.data.userInfo, event.data.accessToken);
            resolve();
          } catch (error) {
            reject(error);
          }
        } else if (event.data.type === 'LINE_LOGIN_ERROR') {
          window.removeEventListener('message', messageListener);
          popup.close();
          reject(new Error(event.data.error));
        }
      };
      
      window.addEventListener('message', messageListener);
      
      // 팝업이 닫히면 취소로 처리
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          reject(new Error('로그인이 취소되었습니다.'));
        }
      }, 1000);
    });
  }

  /**
   * 카카오 SDK 로드
   */
  async loadKakaoSDK() {
    if (window.Kakao) return;
    
    await this.loadScript('https://developers.kakao.com/sdk/js/kakao.js');
    
    const kakaoConfig = this.getKakaoConfig();
    window.Kakao.init(kakaoConfig.apiKey);
  }

  /**
   * 카카오 설정 가져오기
   */
  getKakaoConfig() {
    return {
      apiKey: this.options.kakaoApiKey || process.env.VITE_KAKAO_API_KEY,
      redirectUri: `${window.location.origin}/auth/kakao/callback`
    };
  }

  /**
   * 라인 설정 가져오기
   */
  getLineConfig() {
    return {
      clientId: this.options.lineClientId || process.env.VITE_LINE_CLIENT_ID,
      redirectUri: `${window.location.origin}/auth/line/callback`
    };
  }

  /**
   * 라인 로그인 URL 생성
   */
  generateLineLoginUrl(config) {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      state: Math.random().toString(36).substring(7),
      scope: 'profile openid email'
    });
    
    return `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
  }

  /**
   * 카카오 사용자로 Supabase 로그인
   */
  async loginWithKakaoUser(userInfo, accessToken) {
    // 사용자 정보 변환
    const userData = {
      id: `kakao_${userInfo.id}`,
      email: userInfo.kakao_account?.email || `kakao_${userInfo.id}@kakao.local`,
      user_metadata: {
        name: userInfo.kakao_account?.profile?.nickname || '카카오 사용자',
        avatar_url: userInfo.kakao_account?.profile?.profile_image_url,
        provider: 'kakao',
        provider_id: userInfo.id.toString(),
        full_name: userInfo.kakao_account?.profile?.nickname
      }
    };

    // Supabase에 커스텀 사용자로 로그인
    await this.loginWithCustomUser(userData, accessToken);
    this.showNotification('카카오 로그인 완료! 🎉');
  }

  /**
   * 라인 사용자로 Supabase 로그인
   */
  async loginWithLineUser(userInfo, accessToken) {
    // 사용자 정보 변환
    const userData = {
      id: `line_${userInfo.userId}`,
      email: userInfo.email || `line_${userInfo.userId}@line.local`,
      user_metadata: {
        name: userInfo.displayName || 'LINE 사용자',
        avatar_url: userInfo.pictureUrl,
        provider: 'line',
        provider_id: userInfo.userId,
        full_name: userInfo.displayName
      }
    };

    // Supabase에 커스텀 사용자로 로그인
    await this.loginWithCustomUser(userData, accessToken);
    this.showNotification('LINE 로그인 완료! 💚');
  }

  /**
   * 커스텀 사용자로 Supabase 로그인
   */
  async loginWithCustomUser(userData, accessToken) {
    try {
      // 실제 환경에서는 백엔드 서버에서 JWT 토큰 생성이 필요
      // 여기서는 간단한 구현으로 로컬 저장소 사용
      
      // 현재 사용자 설정
      this.currentUser = {
        id: userData.id,
        email: userData.email,
        user_metadata: userData.user_metadata
      };

      // 로컬 저장소에 저장 (실제 환경에서는 Supabase JWT 토큰 사용)
      localStorage.setItem('kommentio_custom_user', JSON.stringify(this.currentUser));
      localStorage.setItem('kommentio_custom_token', accessToken);
      
      // UI 업데이트
      this.render();
      
    } catch (error) {
      console.error('Custom login failed:', error);
      throw error;
    }
  }

  /**
   * 댓글 좋아요
   */
  async likeComment(commentId) {
    try {
      // 좋아요 카운트 증가 로직
      const { error } = await this.supabase.rpc('increment_likes', { comment_id: commentId });
      if (error) throw error;
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  }

  /**
   * 답글 작성
   */
  replyTo(commentId) {
    // 답글 UI 표시 로직
    console.log('Reply to comment:', commentId);
    // TODO: 구현 예정
  }
}

// 전역 인스턴스
let kommentio;

// 자동 초기화 (DOM 로드 후)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoInit);
} else {
  autoInit();
}

function autoInit() {
  const target = document.querySelector('[data-kommentio]');
  if (target) {
    const options = {
      siteId: target.dataset.siteId,
      theme: target.dataset.theme || 'light',
      language: target.dataset.language || 'ko',
      supabaseUrl: target.dataset.supabaseUrl,
      supabaseKey: target.dataset.supabaseKey,
      claudeApiKey: target.dataset.claudeApiKey
    };
    
    kommentio = new Kommentio(options);
    
    // 인스턴스 생성 후 즉시 전역 객체에 할당
    window.kommentio = kommentio;
    
    // 디버깅용 로그
    console.log('✅ Kommentio 위젯 초기화 완료!', window.kommentio);
  }
}

// 전역 접근을 위한 window 객체에 추가
window.Kommentio = Kommentio;

// 초기에는 null로 설정, autoInit에서 실제 인스턴스 할당
window.kommentio = null;

// 위젯 로딩 대기 및 안전한 함수 실행을 위한 헬퍼
window.waitForKommentio = function(callback, timeout = 5000) {
  const startTime = Date.now();
  
  function check() {
    if (window.kommentio && window.kommentio.updateSocialProviders) {
      console.log('✅ Kommentio 위젯 준비 완료!');
      callback(window.kommentio);
      return;
    }
    
    if (Date.now() - startTime > timeout) {
      console.error('❌ Kommentio 위젯 로딩 타임아웃');
      alert('위젯 로딩이 너무 오래 걸립니다. 페이지를 새로고침해주세요.');
      return;
    }
    
    setTimeout(check, 50); // 50ms마다 확인
  }
  
  check();
};