/**
 * Kommentio 통합 번역 데이터
 * 8개 언어 번역을 포함한 단일 파일
 * 번들 크기 최적화를 위한 인라인 구조
 */

const KOMMENTIO_TRANSLATIONS = {
  ko: {
    "comment": {
      "writeComment": "댓글을 작성하세요...",
      "submitComment": "댓글 작성",
      "submitting": "작성 중...",
      "reply": "답글",
      "replying": "답글 작성 중...",
      "replyTo": "{{user}}님에게 답글",
      "like": "좋아요",
      "likes": "좋아요 {{count}}개",
      "anonymous": "익명",
      "timeAgo": {
        "justNow": "방금 전",
        "minutesAgo": "{{count}}분 전",
        "hoursAgo": "{{count}}시간 전",
        "daysAgo": "{{count}}일 전",
        "weeksAgo": "{{count}}주 전",
        "monthsAgo": "{{count}}개월 전",
        "yearsAgo": "{{count}}년 전"
      }
    },
    "auth": {
      "loginWith": "{{provider}}(으)로 로그인",
      "signIn": "로그인",
      "signOut": "로그아웃",
      "anonymous": "익명으로 댓글 작성",
      "loginRequired": "댓글을 작성하려면 로그인하세요",
      "providers": {
        "google": "Google",
        "apple": "Apple",
        "github": "GitHub",
        "twitter": "X.com",
        "facebook": "Facebook",
        "linkedin": "LinkedIn",
        "kakao": "Kakao"
      }
    },
    "messages": {
      "success": {
        "commentCreated": "댓글이 성공적으로 작성되었습니다! ✅",
        "commentDeleted": "댓글이 삭제되었습니다.",
        "commentLiked": "댓글에 좋아요를 눌렀습니다.",
        "commentUnliked": "좋아요를 취소했습니다."
      },
      "error": {
        "commentFailed": "댓글 작성에 실패했습니다.",
        "loginFailed": "로그인에 실패했습니다.",
        "loadFailed": "댓글을 불러오는데 실패했습니다.",
        "networkError": "네트워크 오류가 발생했습니다."
      },
      "spam": {
        "detected": "스팸으로 감지된 댓글입니다. 관리자 승인 후 게시됩니다. ⚠️",
        "reviewing": "관리자 검토 중인 댓글입니다."
      }
    },
    "placeholder": {
      "markdown": "**볼드**, *이탤릭*, `코드`, ```코드블록```, > 인용구, [링크](url) • Ctrl+Enter로 빠른 등록"
    },
    "tabs": {
      "write": "✏️ 작성",
      "preview": "👁️ 미리보기"
    },
    "keyboard": {
      "shortcuts": "Ctrl+Enter: 댓글 등록, Ctrl+Tab: 탭 전환, ESC: 작성 모드"
    }
  },

  en: {
    "comment": {
      "writeComment": "Write a comment...",
      "submitComment": "Post Comment",
      "submitting": "Posting...",
      "reply": "Reply",
      "replying": "Replying...",
      "replyTo": "Reply to {{user}}",
      "like": "Like",
      "likes": "{{count}} likes",
      "anonymous": "Anonymous",
      "timeAgo": {
        "justNow": "just now",
        "minutesAgo": "{{count}} minutes ago",
        "hoursAgo": "{{count}} hours ago",
        "daysAgo": "{{count}} days ago",
        "weeksAgo": "{{count}} weeks ago",
        "monthsAgo": "{{count}} months ago",
        "yearsAgo": "{{count}} years ago"
      }
    },
    "auth": {
      "loginWith": "Sign in with {{provider}}",
      "signIn": "Sign In",
      "signOut": "Sign Out",
      "anonymous": "Comment anonymously",
      "loginRequired": "Please sign in to leave a comment",
      "providers": {
        "google": "Google",
        "apple": "Apple",
        "github": "GitHub",
        "twitter": "X.com",
        "facebook": "Facebook",
        "linkedin": "LinkedIn",
        "kakao": "Kakao"
      }
    },
    "messages": {
      "success": {
        "commentCreated": "Comment posted successfully! ✅",
        "commentDeleted": "Comment deleted.",
        "commentLiked": "Comment liked.",
        "commentUnliked": "Like removed."
      },
      "error": {
        "commentFailed": "Failed to post comment.",
        "loginFailed": "Login failed.",
        "loadFailed": "Failed to load comments.",
        "networkError": "Network error occurred."
      },
      "spam": {
        "detected": "Comment flagged as spam. Pending admin approval. ⚠️",
        "reviewing": "Comment under admin review."
      }
    },
    "placeholder": {
      "markdown": "**bold**, *italic*, `code`, ```code block```, > quote, [link](url) • Ctrl+Enter to post"
    },
    "tabs": {
      "write": "✏️ Write",
      "preview": "👁️ Preview"
    },
    "keyboard": {
      "shortcuts": "Ctrl+Enter: Post, Ctrl+Tab: Switch tabs, ESC: Write mode"
    }
  },

  ja: {
    "comment": {
      "writeComment": "コメントを書く...",
      "submitComment": "コメント投稿",
      "submitting": "投稿中...",
      "reply": "返信",
      "replying": "返信中...",
      "replyTo": "{{user}}さんに返信",
      "like": "いいね",
      "likes": "いいね{{count}}個",
      "anonymous": "匿名",
      "timeAgo": {
        "justNow": "たった今",
        "minutesAgo": "{{count}}分前",
        "hoursAgo": "{{count}}時間前",
        "daysAgo": "{{count}}日前",
        "weeksAgo": "{{count}}週間前",
        "monthsAgo": "{{count}}ヶ月前",
        "yearsAgo": "{{count}}年前"
      }
    },
    "auth": {
      "loginWith": "{{provider}}でログイン",
      "signIn": "ログイン",
      "signOut": "ログアウト",
      "anonymous": "匿名でコメント",
      "loginRequired": "コメントするにはログインしてください",
      "providers": {
        "google": "Google",
        "apple": "Apple",
        "github": "GitHub",
        "twitter": "X.com",
        "facebook": "Facebook",
        "linkedin": "LinkedIn",
        "kakao": "Kakao"
      }
    },
    "messages": {
      "success": {
        "commentCreated": "コメントが正常に投稿されました！ ✅",
        "commentDeleted": "コメントが削除されました。",
        "commentLiked": "コメントにいいねしました。",
        "commentUnliked": "いいねを取り消しました。"
      },
      "error": {
        "commentFailed": "コメントの投稿に失敗しました。",
        "loginFailed": "ログインに失敗しました。",
        "loadFailed": "コメントの読み込みに失敗しました。",
        "networkError": "ネットワークエラーが発生しました。"
      },
      "spam": {
        "detected": "スパムとして検出されました。管理者の承認後に公開されます。 ⚠️",
        "reviewing": "管理者による審査中のコメントです。"
      }
    },
    "placeholder": {
      "markdown": "**太字**, *斜体*, `コード`, ```コードブロック```, > 引用, [リンク](url) • Ctrl+Enterで投稿"
    },
    "tabs": {
      "write": "✏️ 作成",
      "preview": "👁️ プレビュー"
    },
    "keyboard": {
      "shortcuts": "Ctrl+Enter: 投稿, Ctrl+Tab: タブ切替, ESC: 作成モード"
    }
  },

  zh: {
    "comment": {
      "writeComment": "写评论...",
      "submitComment": "发表评论",
      "submitting": "发表中...",
      "reply": "回复",
      "replying": "回复中...",
      "replyTo": "回复 {{user}}",
      "like": "点赞",
      "likes": "{{count}} 个赞",
      "anonymous": "匿名",
      "timeAgo": {
        "justNow": "刚刚",
        "minutesAgo": "{{count}} 分钟前",
        "hoursAgo": "{{count}} 小时前",
        "daysAgo": "{{count}} 天前",
        "weeksAgo": "{{count}} 周前",
        "monthsAgo": "{{count}} 个月前",
        "yearsAgo": "{{count}} 年前"
      }
    },
    "auth": {
      "loginWith": "使用 {{provider}} 登录",
      "signIn": "登录",
      "signOut": "退出",
      "anonymous": "匿名评论",
      "loginRequired": "请登录后发表评论",
      "providers": {
        "google": "Google",
        "apple": "Apple",
        "github": "GitHub",
        "twitter": "X.com",
        "facebook": "Facebook",
        "linkedin": "LinkedIn",
        "kakao": "Kakao"
      }
    },
    "messages": {
      "success": {
        "commentCreated": "评论发表成功！ ✅",
        "commentDeleted": "评论已删除。",
        "commentLiked": "已点赞评论。",
        "commentUnliked": "已取消点赞。"
      },
      "error": {
        "commentFailed": "评论发表失败。",
        "loginFailed": "登录失败。",
        "loadFailed": "评论加载失败。",
        "networkError": "网络错误。"
      },
      "spam": {
        "detected": "评论被标记为垃圾内容，等待管理员审核。 ⚠️",
        "reviewing": "评论正在管理员审核中。"
      }
    },
    "placeholder": {
      "markdown": "**粗体**, *斜体*, `代码`, ```代码块```, > 引用, [链接](url) • Ctrl+Enter 发表"
    },
    "tabs": {
      "write": "✏️ 编写",
      "preview": "👁️ 预览"
    },
    "keyboard": {
      "shortcuts": "Ctrl+Enter: 发表, Ctrl+Tab: 切换标签, ESC: 编写模式"
    }
  },

  es: {
    "comment": {
      "writeComment": "Escribe un comentario...",
      "submitComment": "Publicar Comentario",
      "submitting": "Publicando...",
      "reply": "Responder",
      "replying": "Respondiendo...",
      "replyTo": "Responder a {{user}}",
      "like": "Me gusta",
      "likes": "{{count}} me gusta",
      "anonymous": "Anónimo",
      "timeAgo": {
        "justNow": "hace un momento",
        "minutesAgo": "hace {{count}} minutos",
        "hoursAgo": "hace {{count}} horas",
        "daysAgo": "hace {{count}} días",
        "weeksAgo": "hace {{count}} semanas",
        "monthsAgo": "hace {{count}} meses",
        "yearsAgo": "hace {{count}} años"
      }
    },
    "auth": {
      "loginWith": "Iniciar sesión con {{provider}}",
      "signIn": "Iniciar Sesión",
      "signOut": "Cerrar Sesión",
      "anonymous": "Comentar anónimamente",
      "loginRequired": "Por favor inicia sesión para comentar",
      "providers": {
        "google": "Google",
        "apple": "Apple",
        "github": "GitHub",
        "twitter": "X.com",
        "facebook": "Facebook",
        "linkedin": "LinkedIn",
        "kakao": "Kakao"
      }
    },
    "messages": {
      "success": {
        "commentCreated": "¡Comentario publicado con éxito! ✅",
        "commentDeleted": "Comentario eliminado.",
        "commentLiked": "Te gusta este comentario.",
        "commentUnliked": "Ya no te gusta este comentario."
      },
      "error": {
        "commentFailed": "Error al publicar el comentario.",
        "loginFailed": "Error al iniciar sesión.",
        "loadFailed": "Error al cargar los comentarios.",
        "networkError": "Error de red."
      },
      "spam": {
        "detected": "Comentario marcado como spam. Pendiente de aprobación del administrador. ⚠️",
        "reviewing": "Comentario bajo revisión del administrador."
      }
    },
    "placeholder": {
      "markdown": "**negrita**, *cursiva*, `código`, ```bloque de código```, > cita, [enlace](url) • Ctrl+Enter para publicar"
    },
    "tabs": {
      "write": "✏️ Escribir",
      "preview": "👁️ Vista previa"
    },
    "keyboard": {
      "shortcuts": "Ctrl+Enter: Publicar, Ctrl+Tab: Cambiar pestañas, ESC: Modo escritura"
    }
  },

  fr: {
    "comment": {
      "writeComment": "Écrire un commentaire...",
      "submitComment": "Publier le Commentaire",
      "submitting": "Publication...",
      "reply": "Répondre",
      "replying": "Réponse en cours...",
      "replyTo": "Répondre à {{user}}",
      "like": "J'aime",
      "likes": "{{count}} j'aime",
      "anonymous": "Anonyme",
      "timeAgo": {
        "justNow": "à l'instant",
        "minutesAgo": "il y a {{count}} minutes",
        "hoursAgo": "il y a {{count}} heures",
        "daysAgo": "il y a {{count}} jours",
        "weeksAgo": "il y a {{count}} semaines",
        "monthsAgo": "il y a {{count}} mois",
        "yearsAgo": "il y a {{count}} ans"
      }
    },
    "auth": {
      "loginWith": "Se connecter avec {{provider}}",
      "signIn": "Se Connecter",
      "signOut": "Se Déconnecter",
      "anonymous": "Commenter anonymement",
      "loginRequired": "Veuillez vous connecter pour commenter",
      "providers": {
        "google": "Google",
        "apple": "Apple",
        "github": "GitHub",
        "twitter": "X.com",
        "facebook": "Facebook",
        "linkedin": "LinkedIn",
        "kakao": "Kakao"
      }
    },
    "messages": {
      "success": {
        "commentCreated": "Commentaire publié avec succès ! ✅",
        "commentDeleted": "Commentaire supprimé.",
        "commentLiked": "Commentaire aimé.",
        "commentUnliked": "J'aime retiré."
      },
      "error": {
        "commentFailed": "Échec de la publication du commentaire.",
        "loginFailed": "Échec de la connexion.",
        "loadFailed": "Échec du chargement des commentaires.",
        "networkError": "Erreur réseau."
      },
      "spam": {
        "detected": "Commentaire signalé comme spam. En attente d'approbation de l'administrateur. ⚠️",
        "reviewing": "Commentaire en cours de révision par l'administrateur."
      }
    },
    "placeholder": {
      "markdown": "**gras**, *italique*, `code`, ```bloc de code```, > citation, [lien](url) • Ctrl+Entrée pour publier"
    },
    "tabs": {
      "write": "✏️ Écrire",
      "preview": "👁️ Aperçu"
    },
    "keyboard": {
      "shortcuts": "Ctrl+Entrée : Publier, Ctrl+Tab : Changer d'onglet, ESC : Mode écriture"
    }
  },

  de: {
    "comment": {
      "writeComment": "Kommentar schreiben...",
      "submitComment": "Kommentar Veröffentlichen",
      "submitting": "Wird veröffentlicht...",
      "reply": "Antworten",
      "replying": "Antwortet...",
      "replyTo": "Antwort an {{user}}",
      "like": "Gefällt mir",
      "likes": "{{count}} Gefällt mir",
      "anonymous": "Anonym",
      "timeAgo": {
        "justNow": "gerade eben",
        "minutesAgo": "vor {{count}} Minuten",
        "hoursAgo": "vor {{count}} Stunden",
        "daysAgo": "vor {{count}} Tagen",
        "weeksAgo": "vor {{count}} Wochen",
        "monthsAgo": "vor {{count}} Monaten",
        "yearsAgo": "vor {{count}} Jahren"
      }
    },
    "auth": {
      "loginWith": "Mit {{provider}} anmelden",
      "signIn": "Anmelden",
      "signOut": "Abmelden",
      "anonymous": "Anonym kommentieren",
      "loginRequired": "Bitte melden Sie sich an, um zu kommentieren",
      "providers": {
        "google": "Google",
        "apple": "Apple",
        "github": "GitHub",
        "twitter": "X.com",
        "facebook": "Facebook",
        "linkedin": "LinkedIn",
        "kakao": "Kakao"
      }
    },
    "messages": {
      "success": {
        "commentCreated": "Kommentar erfolgreich veröffentlicht! ✅",
        "commentDeleted": "Kommentar gelöscht.",
        "commentLiked": "Kommentar gefällt Ihnen.",
        "commentUnliked": "Gefällt mir entfernt."
      },
      "error": {
        "commentFailed": "Kommentar konnte nicht veröffentlicht werden.",
        "loginFailed": "Anmeldung fehlgeschlagen.",
        "loadFailed": "Kommentare konnten nicht geladen werden.",
        "networkError": "Netzwerkfehler aufgetreten."
      },
      "spam": {
        "detected": "Kommentar als Spam markiert. Wartet auf Administrator-Genehmigung. ⚠️",
        "reviewing": "Kommentar wird vom Administrator überprüft."
      }
    },
    "placeholder": {
      "markdown": "**fett**, *kursiv*, `code`, ```codeblock```, > zitat, [link](url) • Strg+Enter zum Veröffentlichen"
    },
    "tabs": {
      "write": "✏️ Schreiben",
      "preview": "👁️ Vorschau"
    },
    "keyboard": {
      "shortcuts": "Strg+Enter: Veröffentlichen, Strg+Tab: Tabs wechseln, ESC: Schreibmodus"
    }
  },

  pt: {
    "comment": {
      "writeComment": "Escreva um comentário...",
      "submitComment": "Publicar Comentário",
      "submitting": "Publicando...",
      "reply": "Responder",
      "replying": "Respondendo...",
      "replyTo": "Responder a {{user}}",
      "like": "Curtir",
      "likes": "{{count}} curtidas",
      "anonymous": "Anônimo",
      "timeAgo": {
        "justNow": "agora mesmo",
        "minutesAgo": "{{count}} minutos atrás",
        "hoursAgo": "{{count}} horas atrás",
        "daysAgo": "{{count}} dias atrás",
        "weeksAgo": "{{count}} semanas atrás",
        "monthsAgo": "{{count}} meses atrás",
        "yearsAgo": "{{count}} anos atrás"
      }
    },
    "auth": {
      "loginWith": "Entrar com {{provider}}",
      "signIn": "Entrar",
      "signOut": "Sair",
      "anonymous": "Comentar anonimamente",
      "loginRequired": "Por favor, entre para comentar",
      "providers": {
        "google": "Google",
        "apple": "Apple",
        "github": "GitHub",
        "twitter": "X.com",
        "facebook": "Facebook",
        "linkedin": "LinkedIn",
        "kakao": "Kakao"
      }
    },
    "messages": {
      "success": {
        "commentCreated": "Comentário publicado com sucesso! ✅",
        "commentDeleted": "Comentário excluído.",
        "commentLiked": "Comentário curtido.",
        "commentUnliked": "Curtida removida."
      },
      "error": {
        "commentFailed": "Falha ao publicar o comentário.",
        "loginFailed": "Falha no login.",
        "loadFailed": "Falha ao carregar comentários.",
        "networkError": "Erro de rede."
      },
      "spam": {
        "detected": "Comentário marcado como spam. Aguardando aprovação do administrador. ⚠️",
        "reviewing": "Comentário sob revisão do administrador."
      }
    },
    "placeholder": {
      "markdown": "**negrito**, *itálico*, `código`, ```bloco de código```, > citação, [link](url) • Ctrl+Enter para publicar"
    },
    "tabs": {
      "write": "✏️ Escrever",
      "preview": "👁️ Visualizar"
    },
    "keyboard": {
      "shortcuts": "Ctrl+Enter: Publicar, Ctrl+Tab: Trocar abas, ESC: Modo de escrita"
    }
  }
};

// 모듈 exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KOMMENTIO_TRANSLATIONS;
} else if (typeof window !== 'undefined') {
  window.KOMMENTIO_TRANSLATIONS = KOMMENTIO_TRANSLATIONS;
}