// Local examples and honest omission fallbacks. Phase 5 supplies final content.
export const DIVISION_GROUPS = {
  engineering: {
    title: {
      en: 'Engineering & Design',
      ar: 'الهندسة والتصميم'
    }
  },
  strategy: {
    title: {
      en: 'Business & Management',
      ar: 'الأعمال والإدارة'
    }
  },
  specialist: {
    title: {
      en: 'Specialist Advice',
      ar: 'الاستشارات التخصصية'
    }
  }
};

export const FIXTURES = {
  en: {
    hero: {
      title: 'A clearer way forward.',
      body: 'Engineering, business and specialist advice. A fresh perspective on your next move.',
      cta: 'Request your free call',
      helper: '15 minutes. No fee. We’ll agree a time with you.'
    },
    about: {
      title: 'Connect the details.\nSee what comes next.',
      body: 'A project, a business, or a question you need to resolve. Start where you are. We help you connect the details and see what comes next.',
      outcomes: [{
        title: 'Understand the situation',
        body: 'Give your question the context it needs.'
      }, {
        title: 'See your options',
        body: 'Explore the choices and what each involves.'
      }, {
        title: 'Find your next step',
        body: 'Focus on the decision that matters now.'
      }]
    },
    journey: {
      title: 'A little time.\nA useful starting point.',
      steps: [{
        title: 'Understand',
        body: 'Tell us where you are and what you want to work through.'
      }, {
        title: 'Prioritise',
        body: 'Explore the question that matters most to you right now.'
      }, {
        title: 'Next step',
        body: 'Discuss whether further support would be useful.'
      }]
    },
    divisions: {
      title: 'What would you like\nto move forward?',
      items: [{
        id: 'bim',
        group: 'engineering',
        title: 'Building information modelling',
        body: 'Explore how a coordinated digital model could support your design and project decisions.'
      }, {
        id: 'arch',
        group: 'engineering',
        title: 'Architecture',
        body: 'Work through your space, design direction, and the questions behind your brief.'
      }, {
        id: 'civil',
        group: 'engineering',
        title: 'Civil & structural engineering',
        body: 'Discuss your structure, site, or infrastructure needs and the support your project may require.'
      }, {
        id: 'elec',
        group: 'engineering',
        title: 'Electrical engineering',
        body: 'Talk through power, building systems, and electrical planning for your project.'
      }, {
        id: 'mgmt',
        group: 'strategy',
        title: 'Management',
        body: 'Look at how your organisation operates and where clearer processes could help.'
      }, {
        id: 'bd',
        group: 'strategy',
        title: 'Business development',
        body: 'Explore your growth direction, opportunities, and the decisions ahead.'
      }, {
        id: 'startup',
        group: 'strategy',
        title: 'Startup advice',
        body: 'Work through your idea, business model, or next stage with a fresh perspective.'
      }, {
        id: 'medical',
        group: 'specialist',
        title: 'Medical consulting',
        body: 'Discuss your healthcare-related project or service and the kind of specialist input it needs.'
      }, {
        id: 'law',
        group: 'specialist',
        title: 'Legal consulting',
        body: 'Describe the legal question or business matter you would like to explore.'
      }]
    },
    values: {
      title: 'How we approach\nyour question.',
      items: [{
        title: 'Clarity',
        body: 'Make the reasoning easy to follow.'
      }, {
        title: 'Care',
        body: 'Take time to understand your context.'
      }, {
        title: 'Practicality',
        body: 'Keep the conversation connected to your needs.'
      }, {
        title: 'Collaboration',
        body: 'Consider the next step together.'
      }]
    },
    final: {
      title: 'Start with\none conversation.',
      body: 'Bring your question. Let’s explore where to begin.'
    },
    contact: {
      title: 'Other ways to reach us.',
      body: 'Inquiries, appointments, and direct consulting correspondence. We respond within one business day.',
      directBody: 'Direct inquiries, appointment scheduling, and project correspondence.',
      action: 'Send an inquiry',
      href: '#/contact',
      offices: 'Consulting offices in Riyadh. Appointments agreed in advance.'
    }
  },
  ar: {
    hero: {
      title: 'رؤية أوضح.\nوخطوة مدروسة.',
      body: 'استشارات هندسية وإدارية وتخصصية. منظور جديد لخطوتك القادمة.',
      cta: 'اطلب مكالمتك المجانية',
      helper: '15 دقيقة. دون رسوم. نتفق معك على الموعد.'
    },
    about: {
      title: 'افهم السياق.\nوحدّد الخطوة التالية.',
      body: 'مشروع أو عمل أو سؤال تبحث له عن إجابة. ابدأ من حيث أنت. نساعدك على ربط التفاصيل ورؤية الخطوة التالية.',
      outcomes: [{
        title: 'فهم الوضع',
        body: 'ضع سؤالك في سياقه المناسب.'
      }, {
        title: 'رؤية الخيارات',
        body: 'استكشف الخيارات وما يتطلبه كل منها.'
      }, {
        title: 'تحديد الخطوة التالية',
        body: 'ركّز على القرار الذي يهمك الآن.'
      }]
    },
    journey: {
      title: 'وقت قليل.\nبداية مفيدة.',
      steps: [{
        title: 'نفهم',
        body: 'أخبرنا أين وصلت وما الذي تريد مناقشته.'
      }, {
        title: 'نرتّب الأولويات',
        body: 'نستكشف معك السؤال الأهم في هذه المرحلة.'
      }, {
        title: 'نناقش الخطوة التالية',
        body: 'نتحدث عن مدى حاجتك إلى دعم إضافي.'
      }]
    },
    divisions: {
      title: 'ما الذي ترغب\nفي تطويره؟',
      items: [{
        id: 'bim',
        group: 'engineering',
        title: 'نمذجة معلومات البناء',
        body: 'استكشف كيف يمكن للنموذج الرقمي المنسّق أن يدعم قرارات التصميم والمشروع.'
      }, {
        id: 'arch',
        group: 'engineering',
        title: 'العمارة',
        body: 'ناقش احتياجات المساحة وتوجّه التصميم والأسئلة التي يقوم عليها مشروعك.'
      }, {
        id: 'civil',
        group: 'engineering',
        title: 'الهندسة المدنية والإنشائية',
        body: 'تحدث عن المنشأة أو الموقع أو البنية التحتية والدعم الذي قد يحتاجه مشروعك.'
      }, {
        id: 'elec',
        group: 'engineering',
        title: 'الهندسة الكهربائية',
        body: 'ناقش الطاقة وأنظمة المباني والتخطيط الكهربائي لمشروعك.'
      }, {
        id: 'mgmt',
        group: 'strategy',
        title: 'الإدارة',
        body: 'انظر إلى طريقة عمل مؤسستك وكيف يمكن لتوضيح العمليات أن يساعدها.'
      }, {
        id: 'bd',
        group: 'strategy',
        title: 'تطوير الأعمال',
        body: 'استكشف توجّه النمو والفرص والقرارات التي تنتظرك.'
      }, {
        id: 'startup',
        group: 'strategy',
        title: 'استشارات الشركات الناشئة',
        body: 'ناقش فكرتك أو نموذج عملك أو مرحلتك التالية من منظور جديد.'
      }, {
        id: 'medical',
        group: 'specialist',
        title: 'الاستشارات الطبية',
        body: 'ناقش مشروعك أو خدمتك المرتبطة بالرعاية الصحية ونوع الدعم التخصصي الذي تحتاجه.'
      }, {
        id: 'law',
        group: 'specialist',
        title: 'الاستشارات القانونية',
        body: 'وضّح السؤال القانوني أو المسألة المتعلقة بعملك التي ترغب في استكشافها.'
      }]
    },
    values: {
      title: 'كيف نتعامل\nمع سؤالك.',
      items: [{
        title: 'الوضوح',
        body: 'نشرح لك أسباب الرأي بطريقة مفهومة.'
      }, {
        title: 'الاهتمام',
        body: 'نأخذ الوقت لفهم ظروفك.'
      }, {
        title: 'الواقعية',
        body: 'نبقي الحوار مرتبطاً باحتياجاتك.'
      }, {
        title: 'التعاون',
        body: 'نفكّر معك في الخطوة التالية.'
      }]
    },
    final: {
      title: 'ابدأ\nبمحادثة واحدة.',
      body: 'أخبرنا بسؤالك، ولنستكشف من أين نبدأ.'
    },
    contact: {
      title: 'طرق أخرى للتواصل.',
      body: 'للاستفسارات والمواعيد والمراسلات المهنية المباشرة. نجيب خلال يوم عمل واحد.',
      directBody: 'للاستفسارات المباشرة وتنسيق المواعيد ومراسلات المشاريع.',
      action: 'إرسال استفسار',
      href: '#/contact',
      offices: 'مكاتب الاستشارات في الرياض. المواعيد بالتنسيق المسبق.'
    }
  }
};

export const UI_LABELS = {
  en: {
    discovery: 'Explore our services',
    about: 'The bigger picture',
    journey: 'Your first conversation',
    journeyBody: 'An introduction to your needs and the support you’re looking for.',
    freeCall: 'Free introductory call',
    minutes: 'minutes',
    steps: 'Choose a conversation step',
    services: 'Find your starting point',
    select: 'Choose a service',
    detail: 'How we can help',
    values: 'Our approach',
    final: 'Your next step',
    call: 'Request your free call',
    helper: '15 minutes. No fee. We’ll agree a time with you.',
    quality: 'Good advice starts with context.',
    qualityBody: 'Your question, your priorities, and a clear conversation about what you need.',
    poster: 'Different perspectives. A clearer direction.',
    contact: 'Direct contact',
    contactDirect: 'Send an inquiry',
    contactDirectBody: 'Direct inquiries, appointment scheduling, and project correspondence.',
    contactOffices: 'Offices in Riyadh'
  },
  ar: {
    discovery: 'استكشف تخصصاتنا',
    about: 'الصورة الأوسع',
    journey: 'محادثتك الأولى',
    journeyBody: 'تعارف حول احتياجاتك والدعم الذي تبحث عنه.',
    freeCall: 'مكالمة تعارف مجانية',
    minutes: 'دقيقة',
    steps: 'اختر خطوة المحادثة',
    services: 'اختر نقطة البداية',
    select: 'اختر التخصص',
    detail: 'كيف يمكننا مساعدتك',
    values: 'نهجنا',
    final: 'خطوتك التالية',
    call: 'اطلب مكالمتك المجانية',
    helper: '15 دقيقة. دون رسوم. نتفق معك على الموعد.',
    quality: 'الاستشارة تبدأ بفهم السياق.',
    qualityBody: 'سؤالك وأولوياتك ومحادثة واضحة حول ما تحتاجه.',
    poster: 'وجهات نظر متعددة. اتجاه أوضح.',
    contact: 'تواصل مباشر',
    contactDirect: 'إرسال استفسار',
    contactDirectBody: 'للاستفسارات المباشرة وتنسيق المواعيد ومراسلات المشاريع.',
    contactOffices: 'المكاتب في الرياض'
  }
};
