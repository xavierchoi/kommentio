<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# Market Research Report on External Comment Systems for Websites/Blogs

## 1. Research Overview

This research aims to analyze major open-source software for external comment systems for websites/blogs and identify market opportunities for developing and commercializing alternative software[^1]. The comment system market is expected to grow from USD 1.5 billion in 2024 to USD 3.8 billion by 2033, with a compound annual growth rate (CAGR) of 10.5%[^2]. This research provides detailed analysis of 7 major systems: Disqus, Utterances, Giscus, Remark42, Commento/Comentario, Cusdis, and Waline[^3][^1].

## 2. Market Status and Trends

The comment system market is experiencing rapid growth due to increasing online media content, growing demand for real-time user engagement, and rising importance of customer feedback[^1][^2]. In particular, demand for open-source alternatives is increasing due to growing concerns about privacy protection and rising preference for self-hosting[^4][^5].

## 3. Detailed Analysis of Major Comment Systems

### 3.1 Disqus

**Basic Information**

- A commercial service in a market-dominant position, the most widely used comment platform worldwide[^6][^7].

**Detailed Feature Analysis**


| Criteria | Details |
| :-- | :-- |
| **Pricing** | Free (with ads) / Plus $12/month (50K daily pageviews), Pro $115/month (150K daily pageviews), Business custom pricing[^6][^8] |
| **File Size** | Approximately 150-200KB (optimized with asynchronous loading)[^9] |
| **Social Logins** | 5 (Google, Facebook, X(Twitter), Apple, Microsoft)[^10] |
| **AI Spam Filtering** | Yes (Advanced automatic anti-spam filter based on Akismet)[^11] |
| **Dashboard Mobile Support** | Yes (Fully responsive design and dedicated mobile app)[^6] |
| **Data Ownership** | Disqus (WordPress sync backup supported)[^6] |
| **Real-time Updates** | Yes (Real-time comment system)[^6] |
| **Open Source** | No (Commercial service)[^6] |

**Advantages**

- Has the widest user base and recognition[^6]
- Provides stable service operation and continuous updates[^7]
- Offers comprehensive analytics dashboard and moderation panel[^6]

**Disadvantages**

- User experience degradation due to forced ads in free version[^12]
- Page loading speed issues due to third-party server dependency[^13]
- Continuous concerns about data ownership and privacy[^12]


### 3.2 Utterances

**Basic Information**

- A comment system utilizing GitHub Issues, gaining high popularity in the developer community since around 2018[^14][^15].

**Detailed Feature Analysis**


| Criteria | Details |
| :-- | :-- |
| **Pricing** | Completely free[^14] |
| **File Size** | Approximately 5-10KB (Very lightweight based on GitHub Issues)[^14][^15] |
| **Social Logins** | 1 (GitHub only)[^14] |
| **AI Spam Filtering** | No (Relies on GitHub's basic spam management)[^16] |
| **Dashboard Mobile Support** | Yes (Utilizes GitHub Issues interface)[^17] |
| **Data Ownership** | User (Stored in GitHub Issues)[^14] |
| **Real-time Updates** | Limited (GitHub Issues update method)[^16] |
| **Open Source** | Yes[^14] |

**Advantages**

- Completely free service with no ads[^14]
- Provides very fast loading speed[^14]
- Easy code block writing with markdown support[^16]

**Disadvantages**

- Limited general user accessibility due to mandatory GitHub account[^14]
- Unsuitable for non-developer targeted sites[^16]
- Lacks automated spam filtering features[^16]


### 3.3 Giscus

**Basic Information**

- A next-generation comment system utilizing GitHub Discussions, with full-scale development starting from 2021[^18][^19].

**Detailed Feature Analysis**


| Criteria | Details |
| :-- | :-- |
| **Pricing** | Completely free[^18] |
| **File Size** | Approximately 15-25KB (Lightweight based on GitHub Discussions)[^20] |
| **Social Logins** | 1 (GitHub only)[^18] |
| **AI Spam Filtering** | No (Utilizes GitHub's basic management tools)[^18] |
| **Dashboard Mobile Support** | Yes (GitHub Discussions interface)[^19] |
| **Data Ownership** | User (Stored in GitHub Discussions)[^18] |
| **Real-time Updates** | Yes (GitHub Discussions real-time features)[^18] |
| **Open Source** | Yes[^18] |

**Advantages**

- Can utilize rich features of Discussions (categories, reactions, etc.)[^21]
- Supports multi-language and custom themes[^18]
- Easy installation without need for database[^20]

**Disadvantages**

- Still has GitHub account dependency issues[^18]
- Restrictive public repository requirement[^19]
- Relatively new project with insufficient stability verification[^18]


### 3.4 Remark42

**Basic Information**

- A privacy-focused self-hosted comment engine developed in Go language[^22][^23].

**Detailed Feature Analysis**


| Criteria | Details |
| :-- | :-- |
| **Pricing** | Completely free (self-hosted)[^22] |
| **File Size** | Approximately 50-80KB (lightweight UI)[^24] |
| **Social Logins** | 8 (Google, Facebook, Microsoft, GitHub, Apple, Yandex, Patreon, Telegram)[^22] |
| **AI Spam Filtering** | Yes (Built-in spam filtering system)[^22] |
| **Dashboard Mobile Support** | Yes (White/dark theme support)[^23] |
| **Data Ownership** | User (Complete self-ownership)[^22] |
| **Real-time Updates** | Yes (Real-time comments and notification system)[^22] |
| **Open Source** | Yes[^22] |

**Advantages**

- Provides the most diverse social login options[^22]
- Enables complete data ownership and privacy protection[^22]
- Offers rich features and administrator tools[^23]

**Disadvantages**

- Server management and maintenance burden[^24]
- Technical complexity in initial setup[^24]
- Individual responsibility for spam management required[^25]


### 3.5 Commento/Comentario

**Basic Information**

- A self-hosted comment system developed as an alternative to Disqus, with Comentario being its successor project[^26][^27].

**Detailed Feature Analysis**


| Criteria | Details |
| :-- | :-- |
| **Pricing** | $10/month or $99/year (up to 50K daily pageviews)[^26] |
| **File Size** | Approximately 11KB (JavaScript and CSS)[^4] |
| **Social Logins** | OAuth social login support (exact number unclear)[^28] |
| **AI Spam Filtering** | Yes (Akismet integration possible)[^29] |
| **Dashboard Mobile Support** | Yes (Moderation tools and email management)[^28] |
| **Data Ownership** | User (No tracking)[^26] |
| **Real-time Updates** | Yes (Real-time comment updates)[^28] |
| **Open Source** | Yes (Comentario)[^27] |

**Advantages**

- Provides intuitive user interface[^28]
- Active development and maintenance[^27]
- Privacy-focused design with no user tracking[^4]

**Disadvantages**

- Requires database management[^30]
- Development has slowed and is essentially discontinued[^27]
- Relatively high resource requirements[^30]


### 3.6 Cusdis

**Basic Information**

- A lightweight comment system emphasizing privacy, developed as a direct alternative to Disqus[^31][^32].

**Detailed Feature Analysis**


| Criteria | Details |
| :-- | :-- |
| **Pricing** | Free (cloud) / Pro $12/year (unlimited)[^31] |
| **File Size** | Ultra-lightweight SDK under 5KB (gzipped)[^31] |
| **Social Logins** | 0 (Email-based only)[^31] |
| **AI Spam Filtering** | Limited (Basic spam management)[^32] |
| **Dashboard Mobile Support** | Yes (Simple approval and management interface)[^31] |
| **Data Ownership** | User (Privacy-focused, no tracking)[^31] |
| **Real-time Updates** | Yes (Fast approval system)[^31] |
| **Open Source** | Yes[^31] |

**Advantages**

- Provides very fast loading speed and the lightest structure[^31]
- Enables complete privacy protection without user tracking[^32]
- Offers easy integration process and free cloud option[^31]

**Disadvantages**

- Provides relatively limited features[^33]
- No social login options at all[^31]
- Limited support due to small community size[^32]


### 3.7 Waline

**Basic Information**

- A serverless comment system developed primarily in China, supporting various deployment platforms[^34][^35].

**Detailed Feature Analysis**


| Criteria | Details |
| :-- | :-- |
| **Pricing** | Free (serverless deployment)[^34] |
| **File Size** | 53KB (gzipped, full client size)[^34][^36] |
| **Social Logins** | Various (Twitter, Facebook, GitHub, etc. supported)[^37] |
| **AI Spam Filtering** | Yes (Includes spam blocking and security features)[^34] |
| **Dashboard Mobile Support** | Yes (Admin dashboard provided)[^34] |
| **Data Ownership** | User (User control with various database options)[^34] |
| **Real-time Updates** | Yes (Real-time comments and notifications)[^34] |
| **Open Source** | Yes[^35] |

**Advantages**

- Provides various deployment and database options[^37]
- Offers clean UI design and comprehensive features[^34]
- Free cloud service support available[^38]

**Disadvantages**

- Relatively complex initial setup required[^37]
- Limited documentation in English[^37]
- Community size limitations outside Asian regions[^37]


## 4. Comprehensive Comparative Analysis

### 4.1 Performance and Technical Characteristics Comparison

| System | File Size | Loading Speed | Technical Complexity |
| :-- | :-- | :-- | :-- |
| Cusdis | <5KB | Highest | Lowest |
| Utterances | 5-10KB | Very Fast | Low |
| Giscus | 15-25KB | Fast | Low |
| Commento | ~11KB | Fast | Medium |
| Remark42 | 50-80KB | Average | High |
| Waline | 53KB | Average | Medium |
| Disqus | 150-200KB | Slow | Low |

### 4.2 Features and Usability Comparison

| System | Social Logins | AI Spam Filter | Real-time Updates | Mobile Support |
| :-- | :-- | :-- | :-- | :-- |
| Remark42 | 8 | ✅ | ✅ | ✅ |
| Disqus | 5 | ✅ | ✅ | ✅ |
| Waline | Multiple | ✅ | ✅ | ✅ |
| Commento | Multiple | ✅ | ✅ | ✅ |
| Giscus | 1 | ❌ | ✅ | ✅ |
| Utterances | 1 | ❌ | Limited | ✅ |
| Cusdis | 0 | Limited | ✅ | ✅ |

### 4.3 Business Model and Data Ownership Comparison

| System | Pricing Model | Data Ownership | Open Source | Commercial Support |
| :-- | :-- | :-- | :-- | :-- |
| Disqus | Premium | Limited | ❌ | ✅ |
| Commento | Subscription | Complete | ✅ | ✅ |
| Cusdis | Premium | Complete | ✅ | Limited |
| Remark42 | Free | Complete | ✅ | ❌ |
| Utterances | Free | Complete | ✅ | ❌ |
| Giscus | Free | Complete | ✅ | ❌ |
| Waline | Free | Complete | ✅ | ❌ |

## 5. Market Opportunities and Development Direction

### 5.1 Market Gap Analysis

The major gaps identified in the current comment system market are as follows[^1][^2]:

1. **Eliminating Technical Entry Barriers**: GitHub-based systems are limited to developers only, and self-hosting solutions have high technical entry barriers[^14][^24].
2. **Balanced Functionality**: There is a lack of solutions that simultaneously provide lightness and rich functionality[^31][^22].
3. **Localization Specialization**: There is demand for specialized features for non-English users including Korean, and local social platform integration services[^37].

### 5.2 Successful Alternative Software Development Strategy

**Key Competitive Advantage Elements**

1. **Hybrid Approach**: Provide flexible deployment options combining advantages of cloud and self-hosting[^34][^31]
2. **Enhanced User Experience**: Optimized file size in the 5-15KB range and intuitive setup process[^31][^9]
3. **Comprehensive Features**: Support all of AI spam filtering, various social logins, and real-time updates[^22][^34]

**Differentiation Points**

- Full Korean language support and integration with domestic social platforms like Naver and Kakao[^37]
- Balance of optimized performance in the 15-25KB range and rich features[^20][^36]
- Dual strategy of enterprise SaaS and personal open-source versions[^26][^31]


## 6. Conclusion and Recommendations

The comment system market is showing continuous growth, with increasing demand particularly for privacy protection and performance optimization[^2][^1]. Current major players in the market each have unique strengths and limitations, creating market opportunities for new solutions that combine their advantages and address their shortcomings.

For successful alternative software development, a strategy focusing on lightness (10-20KB), rich functionality (AI spam filtering, various social logins), user-friendliness (easy setup, intuitive UI), and localization specialization (Korean language support, domestic platform integration) is necessary[^31][^22][^34]. In particular, a balanced approach that reduces technical complexity while providing enterprise-grade features is analyzed to secure competitive advantage in the market[^1][^2].

<div style="text-align: center">⁂</div>

[^1]: https://www.theinsightpartners.com/research/commenting-systems-market-size-and-share

[^2]: https://www.linkedin.com/pulse/commenting-systems-market-significance-strategic-cikkf/

[^3]: https://deployn.de/en/blog/self-hosted-comment-systems/

[^4]: https://reclaimthenet.org/commento-comment-tool-disqus-alternative-privacy

[^5]: https://discourse.gohugo.io/t/any-advice-for-comment-system-different-from-disqus/42313

[^6]: https://about.disqus.com/disqus-101/getting-started-with-disqus

[^7]: https://reigntheme.com/best-wordpress-comment-plugins/

[^8]: https://www.saasworthy.com/product/disqus-platform/pricing

[^9]: https://servebolt.com/articles/wordpress-comment-plugins/

[^10]: https://blog.disqus.com/two-new-social-login-options-apple-microsoft

[^11]: https://help.disqus.com/en/articles/1717074-dealing-with-spam

[^12]: https://blog.atlanticwebworks.com/blog/which-commenting-platform-is-the-best

[^13]: https://kinsta.com/blog/wordpress-comments/

[^14]: https://utteranc.es

[^15]: https://florimond.dev/en/posts/2020/07/utterances-comments-personal-sites-github

[^16]: https://asmeurer.com/blog/posts/switching-to-utterances-comments/

[^17]: https://jupyterbook.org/interactive/comments/utterances.html

[^18]: https://github.com/giscus/giscus

[^19]: https://giscus.app

[^20]: https://gourav.io/blog/add-comments-to-site

[^21]: https://dev.to/ayoub_khial/add-reactivity-to-your-nextjs-blog-using-giscus-146l

[^22]: https://remark42.com

[^23]: https://leviwheatcroft.github.io/selfhosted-awesome-unlist/remark42.html

[^24]: https://geekscircuit.com/self-hosted/

[^25]: https://stackoverflow.com/questions/57193009/how-to-login-as-admin-without-social-login-on-remark42-commenting-system

[^26]: https://commento.io/pricing

[^27]: https://www.reddit.com/r/selfhosted/comments/upgum5/commento_a_self_hosted_comment_system_for_websites/

[^28]: https://commento.io

[^29]: https://retired.re-ynd.com/2021/commento-in-jekyll/

[^30]: https://lab.uberspace.de/guide_commento/

[^31]: https://cusdis.com

[^32]: https://euro-stack.com/solutions/cusdis

[^33]: https://www.lilbigthings.com/post/the-best-commenting-tools-for-webflow-features-pricing-pros-cons-and-recommendations

[^34]: https://waline.js.org/en/

[^35]: https://github.com/walinejs/waline

[^36]: https://waline.js.org/en/reference/client/file.html

[^37]: https://discourse.gohugo.io/t/waline-another-comment-system-for-static-site/37896

[^38]: https://kylelin1998.com/en/post/4cbe13de-510b-4c13-9d92-a08d09a2b28e/

[^39]: https://alternativeto.net/software/disqus/?p=5

[^40]: https://arena.im/arena-comparisons/commento-io-vs-arena-comment-system/

[^41]: https://hyvor.com/blog/disqus-alternatives

[^42]: https://medevel.com/17-commenting-systems-open-source/

[^43]: https://www.wix.com/app-market/web-solution/comments-widget

[^44]: https://www.commoninja.com/blog/top-comments-widgets-plugins

[^45]: https://www.hongkiat.com/blog/3rdparty-comment-discuss-systems-reviewed/

[^46]: https://github.com/andrewljohnson/CommentWidget

[^47]: https://www.freshtechtips.com/2022/02/comment-software-for-blogs.html

[^48]: https://disqus.com/pricing/

[^49]: https://arena.im/arena-comparisons/disqus-vs-arena-comment-system-comparison/

[^50]: https://visualping.io/pages/disqus-pricing-alerts-4896143

[^51]: https://blog.disqus.com/disqus-polls-are-here-and-available-to-all-publishers

[^52]: https://stackoverflow.com/questions/38177858/filesize-of-javascript-is-different-by-its-location-local-or-server

[^53]: https://stackoverflow.com/questions/20624141/how-long-javascript-file-can-be-in-practice

[^54]: https://franklinjl.org/extras/utterances/

[^55]: https://datascientistforai.github.io/DataScienceStudy/interactive/comments/utterances.html

[^56]: https://github.com/topics/filesize?l=javascript

[^57]: https://www.codewalnut.com/tutorials/how-to-comment-on-a-github-issue

[^58]: https://docs.github.com/en/enterprise-server@3.12/authentication/keeping-your-account-and-data-secure/about-authentication-to-github

[^59]: https://stackoverflow.com/questions/1606842/how-can-i-get-a-files-upload-size-using-simple-javascript

[^60]: https://gist.github.com/kjk/00f373cc0a4f34903ce747b4462a6ed8

[^61]: https://www.patrickthurmond.com/blog/2023/12/11/commenting-is-available-now-thanks-to-giscus

[^62]: https://byanko55.github.io/comment system.html

[^63]: https://dev.to/coderatul/embed-github-discussion-anywhere--2l42

[^64]: https://github.com/marketplace/actions/compute-js-bundle-size

[^65]: https://velog.io/@hyunju-song/소셜로그인기능구현2Github-Social-Login-구현

[^66]: https://coder.social/giscus/giscus

[^67]: https://github.com/umputun/remark42

[^68]: https://www.hleroy.com/2023/11/adding-a-remark42-comment-system-to-my-statically-generated-blog/

[^69]: https://www.jetbrains.com/help/rider/Configuring_File_Size_Limit.html

[^70]: https://www.g2.com/products/remarkbox/pricing

[^71]: https://github.com/plasmobit/remark

[^72]: https://remark42.com/docs/getting-started/installation/

[^73]: https://github.com/adtac/commento

[^74]: https://www.saasworthy.com/product/commented-io/pricing

[^75]: https://es.wordpress.org/plugins/oa-social-login/

[^76]: https://codeengineered.com/blog/09/12/managing-comment-spam/

[^77]: https://msfjarvis.dev/posts/integrating-comments-in-hugo-sites-with-commento/

[^78]: https://opencollective.com/cusdis

[^79]: https://blog.cusdis.com/announcing-cusdis-pro/

[^80]: https://10web.io/wordpress-plugin/disqus-comment-system/pricing/

[^81]: https://github.com/avoidwork/filesize.js

[^82]: https://auth0.com/learn/social-login

[^83]: https://getpublii.com/docs/cusdis-comments.html

[^84]: https://www.npmjs.com/package/filesize

[^85]: https://waline.js.org/en/guide/get-started/

[^86]: https://learn.wisenet.co/social-login-on-portal/

[^87]: https://github.com/Tritonix711/Spam-Filter-AI

[^88]: https://endgameviable.com/dev/2024/08/new-comment-systems/

[^89]: https://betterblogcomments.com/blogs/guides/top-6-shopify-blog-comment-apps-2024

[^90]: https://www.kevinmuldoon.com/third-party-commenting-systems/

[^91]: https://bloggerspassion.com/list-of-high-quality-blog-commenting-sites/

[^92]: https://elfsight.com/alternatives/html-comment-box/

[^93]: https://crocoblock.com/blog/best-wordpress-comments-plugins/

[^94]: https://gtmetrix.com/minify-javascript.html

[^95]: https://about.codecov.io/blog/8-ways-to-optimize-your-javascript-bundle-size/

[^96]: https://stackoverflow.com/questions/65491/what-is-the-best-method-to-reduce-the-size-of-my-javascript-and-css-files

[^97]: https://www.sitepoint.com/optimizing-javascript-files/

[^98]: https://www.nearsure.com/blog/javascript-files

[^99]: https://world.optimizely.com/blogs/sarahs-blog/dates/2025/6/javascript-sdk-v6-lightest-most-efficient-sdk-yet-/

[^100]: https://www.debugbear.com/blog/chat-widget-site-performance

[^101]: https://dev.to/ped4enko/top-10-micro-sized-javascript-libraries-aa9

[^102]: https://jscompress.com