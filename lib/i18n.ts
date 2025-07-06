export type Language = 'en' | 'nl';

export interface Translations {
  // Navigation
  nav: {
    dashboard: string;
    findMatch: string;
    conversations: string;
    voiceSetup: string;
    profile: string;
    settings: string;
    logout: string;
    login: string;
    signUp: string;
  };
  
  // Landing Page
  landing: {
    title: string;
    subtitle: string;
    description: string;
    startJourney: string;
    watchDemo: string;
    whyRealTalk: string;
    whyDescription: string;
    howItWorks: string;
    howDescription: string;
    readyForConnections: string;
    readyDescription: string;
    startFree: string;
    noCreditCard: string;
    step1Title: string;
    step1Description: string;
    step2Title: string;
    step2Description: string;
    step3Title: string;
    step3Description: string;
  };

  // Features
  features: {
    authenticConnections: string;
    authenticDescription: string;
    safeConversations: string;
    safeDescription: string;
    realityDrift: string;
    realityDriftDescription: string;
  };

  // Personalities
  personalities: {
    roots: string;
    rootsDescription: string;
    mask: string;
    maskDescription: string;
    spark: string;
    sparkDescription: string;
  };

  // Onboarding
  onboarding: {
    choosePersona: string;
    chooseDescription: 'Selecteer hoe je jezelf wilt presenteren: Roots, Mask, of Spark.',
    rootsTitle: string;
    rootsDesc: string;
    maskTitle: string;
    maskDesc: string;
    sparkTitle: string;
    sparkDesc: string;
    clickToSelect: string;
    stepOf: string;
    greatChoice: string;
    settingUp: string;
  };

  // Authentication
  auth: {
    welcomeBack: string;
    loginToContinue: string;
    email: string;
    password: string;
    forgotPassword: string;
    login: string;
    noAccount: string;
    registerHere: string;
    createAccount: string;
    startJourney: string;
    fullName: string;
    confirmPassword: string;
    alreadyAccount: string;
    loginHere: string;
    termsText: string;
    terms: string;
    privacy: string;
    backToHome: string;
    demoAccount: string;
    passwordsNoMatch: string;
    passwordTooShort: string;
  };

  // Dashboard
  dashboard: {
    welcome: string;
    authenticSpace: string;
    presentBest: string;
    unleashWild: string;
    personalityChoice: string;
    selectedPersona: string;
    customizeExperience: string;
    nextSteps: string;
    completeProfile: string;
    connectOthers: string;
    startSharing: string;
  };

  // Matching
  matching: {
    searchingFor: string;
    connecting: string;
    findingPartner: string;
    matchingPersonality: string;
    searchTime: string;
    status: string;
    connected: string;
    connecting2: string;
    demoMode: string;
    matchFound: string;
    talkingWith: string;
    perfectMatch: string;
    connectingToConversation: string;
    preparingConversation: string;
    noMatchFound: string;
    tryAgain: string;
    searchedFor: string;
    retryButton: string;
    orTry: string;
    changePersonality: string;
    tryLater: string;
  };

  // Conversation
  conversation: {
    connecting: string;
    connected: string;
    connectionLost: string;
    connectionError: string;
    you: string;
    partner: string;
    conversationTime: string;
    microphoneOff: string;
    audioActive: string;
    waitingConnection: string;
    connectionProblem: string;
    cannotConnect: string;
    conversationEnded: string;
    redirecting: string;
    simulateFeedback: string;
  };

  // Reality Drift Meter
  realityDrift: {
    title: string;
    authenticityLevel: string;
    rising: string;
    falling: string;
    authentic: string;
    lightFiltered: string;
    masked: string;
    strongFiltered: string;
    fullyArtificial: string;
    naturalConversation: string;
    smallAdjustments: string;
    clearPersona: string;
    significantDeviation: string;
    extremePersona: string;
    simulateChange: string;
    reset: string;
    light: string;
    strong: string;
    artificial: string;
  };

  // Voice Capture
  voiceCapture: {
    title: string;
    description: string;
    microphoneRequired: string;
    microphoneDescription: string;
    tryAgain: string;
    checkingAccess: string;
    voiceRecording: string;
    holdAndSpeak: string;
    recordingInProgress: string;
    recordingComplete: string;
    clickToStart: string;
    maxDuration: string;
    duration: string;
    size: string;
    download: string;
    recordAgain: string;
    nextStep: string;
    analysisNote: string;
    tipsTitle: string;
    tip1: string;
    tip2: string;
    tip3: string;
    tip4: string;
  };

  // Conversations Page
  conversations: {
    title: string;
    description: string;
    totalConversations: string;
    totalTime: string;
    avgDriftLevel: string;
    avgQuality: string;
    recentConversations: string;
    noConversations: string;
    noConversationsDesc: string;
    findMatch: string;
    viewDetails: string;
    startNewConversation: string;
    drift: string;
    loading: string;
  };

  // Feedback
  feedback: {
    stayedReal: string;
    soAuthentic: string;
    pureYourself: string;
    showingMask: string;
    perfectPresentation: string;
    stylishlyMasked: string;
    showingCrazy: string;
    completelyUnleashed: string;
    wildAndFree: string;
    greatConnection: string;
    conversationMaster: string;
    perfectlyBalanced: string;
    conversationStarted: string;
    backToYourself: string;
  };

  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    continue: string;
    finish: string;
    yes: string;
    no: string;
  };

  // Posts & Feed
  posts: {
    createPost: string;
    recordVoice: string;
    shareThought: string;
    authenticMoment: string;
    resonance: string;
    comments: string;
    voiceReply: string;
    authenticityScore: string;
    feedTitle: string;
    allPersonas: string;
    rootsFeed: string;
    maskFeed: string;
    sparkFeed: string;
    noPostsYet: string;
    createFirstPost: string;
    recordingTip: string;
    maxDuration: string;
    postSuccess: string;
    postFailed: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      dashboard: 'Dashboard',
      findMatch: 'Find Match',
      conversations: 'Conversations',
      voiceSetup: 'Voice Setup',
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Logout',
      login: 'Login',
      signUp: 'Sign Up'
    },
    landing: {
      title: 'Real Conversations,\nReal Connections',
      subtitle: 'Discover a new way to connect. Choose your personality, find your match, and have authentic conversations with our unique Reality Drift technology.',
      description: 'Discover a new way to connect. Choose your personality, find your match, and have authentic conversations with our unique Reality Drift technology.',
      startJourney: 'Start Your Journey',
      watchDemo: 'Watch Demo',
      whyRealTalk: 'Why RealTalk?',
      whyDescription: 'We combine advanced technology with human authenticity to enable meaningful connections.',
      howItWorks: 'How It Works',
      howDescription: 'Three simple steps to authentic conversations',
      readyForConnections: 'Ready For Real Connections?',
      readyDescription: 'Join thousands of users already having authentic conversations. Start your personal journey to real connections today.',
      startFree: 'Start Free Now',
      noCreditCard: 'No credit card required',
      step1Title: 'Choose Your Personality',
      step1Description: 'Select how you want to present yourself: Roots, Mask, or Spark.',
      step2Title: 'Find Your Match',
      step2Description: 'Our algorithm connects you with someone who matches your chosen personality.',
      step3Title: 'Start The Conversation',
      step3Description: 'Begin an authentic audio conversation with real-time feedback on your authenticity.'
    },
    features: {
      authenticConnections: 'Authentic Connections',
      authenticDescription: 'Meet people who truly match you, based on your real personality.',
      safeConversations: 'Safe Conversations',
      safeDescription: 'End-to-end encrypted audio conversations with advanced privacy protection.',
      realityDrift: 'Reality Drift Meter',
      realityDriftDescription: 'Unique technology that measures your authenticity in real-time during conversations.'
    },
    personalities: {
      roots: 'Roots 🌱',
      rootsDescription: 'Your authentic, grounded self',
      mask: 'Mask 🎭',
      maskDescription: 'Your curated, social self',
      spark: 'Spark 🔥',
      sparkDescription: 'Your wild, unfiltered energy'
    },
    onboarding: {
      choosePersona: 'Choose Your Persona',
      chooseDescription: 'Select how you want to present yourself: Roots, Mask, or Spark.',
      rootsTitle: 'Roots 🌱',
      rootsDesc: 'Authentic, genuine, and grounded. Share your real thoughts and experiences from the heart.',
      maskTitle: 'Mask 🎭',
      maskDesc: 'A curated version of yourself. Present your best face to the world with intention.',
      sparkTitle: 'Spark 🔥',
      sparkDesc: 'Unleash your wild energy. Be bold, spontaneous, and completely uninhibited.',
      clickToSelect: 'Click to select',
      stepOf: 'Step 1 of 3',
      greatChoice: 'Great Choice!',
      settingUp: 'Setting up your personalized experience...'
    },
    auth: {
      welcomeBack: 'Welcome Back',
      loginToContinue: 'Log in to continue to your dashboard',
      email: 'Email address',
      password: 'Password',
      forgotPassword: 'Forgot password?',
      login: 'Login',
      noAccount: 'Don\'t have an account?',
      registerHere: 'Register here',
      createAccount: 'Create Account',
      startJourney: 'Start your journey to authentic connections',
      fullName: 'Full name',
      confirmPassword: 'Confirm password',
      alreadyAccount: 'Already have an account?',
      loginHere: 'Login here',
      termsText: 'By creating an account you agree to our',
      terms: 'Terms of Service',
      privacy: 'Privacy Policy',
      backToHome: 'Back to home',
      demoAccount: 'Demo Account:',
      passwordsNoMatch: 'Passwords do not match',
      passwordTooShort: 'Password must be at least 6 characters long'
    },
    dashboard: {
      welcome: 'Welcome',
      authenticSpace: 'Welcome to your authentic space!',
      presentBest: 'Ready to present your best self!',
      unleashWild: 'Time to unleash your wild side!',
      personalityChoice: 'Your Personality Choice',
      selectedPersona: 'You selected',
      customizeExperience: 'as your persona. This will customize your experience throughout the platform.',
      nextSteps: 'Next Steps',
      completeProfile: 'Complete your profile setup',
      connectOthers: 'Connect with others who share your vibe',
      startSharing: 'Start sharing content in your chosen style'
    },
    matching: {
      searchingFor: 'Searching for someone to talk to',
      connecting: 'Connecting with like-minded souls',
      findingPartner: 'Finding your perfect conversation partner',
      matchingPersonality: 'Matching based on your personality',
      searchTime: 'Search time',
      status: 'Status',
      connected: 'Connected',
      connecting2: 'Connecting...',
      demoMode: 'Demo mode',
      matchFound: 'Match found! 🎉',
      talkingWith: 'You\'re going to talk with',
      perfectMatch: 'Perfect match',
      connectingToConversation: 'You\'re being connected to the conversation...',
      preparingConversation: 'Your conversation is being prepared',
      noMatchFound: 'No match found yet',
      tryAgain: 'Try again, there are always new people online!',
      searchedFor: 'Searched for',
      retryButton: 'Try Again',
      orTry: 'Or try:',
      changePersonality: 'Change your personality setting',
      tryLater: 'Try again later'
    },
    conversation: {
      connecting: 'Connecting...',
      connected: 'Connected',
      connectionLost: 'Connection lost',
      connectionError: 'Connection error',
      you: 'You',
      partner: 'Partner',
      conversationTime: 'Conversation time',
      microphoneOff: 'Microphone off',
      audioActive: 'Audio active',
      waitingConnection: 'Waiting for connection...',
      connectionProblem: 'Connection Problem',
      cannotConnect: 'Cannot connect with',
      conversationEnded: 'Conversation Ended',
      redirecting: 'You\'re being redirected to the dashboard...',
      simulateFeedback: 'Simulate Feedback'
    },
    realityDrift: {
      title: 'Reality Drift Meter',
      authenticityLevel: 'Authenticity level',
      rising: 'Rising',
      falling: 'Falling',
      authentic: 'Authentic',
      lightFiltered: 'Lightly Filtered',
      masked: 'Masked',
      strongFiltered: 'Strongly Filtered',
      fullyArtificial: 'Fully Artificial',
      naturalConversation: 'Conversation flows naturally and honestly',
      smallAdjustments: 'Small adjustments in presentation',
      clearPersona: 'Clear persona is being used',
      significantDeviation: 'Significant deviation from real self',
      extremePersona: 'Extreme persona or artificial presentation',
      simulateChange: 'Simulate Change',
      reset: 'Reset',
      light: 'Light',
      strong: 'Strong',
      artificial: 'Artificial'
    },
    voiceCapture: {
      title: 'Voice Verification',
      description: 'Record your voice for authentication',
      microphoneRequired: 'Microphone access required',
      microphoneDescription: 'We need access to your microphone to record your voice. Click "Allow" in your browser.',
      tryAgain: 'Try again',
      checkingAccess: 'Checking microphone access...',
      voiceRecording: 'Voice Recording',
      holdAndSpeak: 'Hold the button and speak – we\'ll record your voice',
      recordingInProgress: 'Recording in progress...',
      recordingComplete: 'Recording complete!',
      clickToStart: 'Click the microphone to start',
      maxDuration: 'Maximum duration:',
      duration: 'Duration:',
      size: 'Size:',
      download: 'Download',
      recordAgain: 'Record again',
      nextStep: 'Next step:',
      analysisNote: 'Your voice will be analyzed for authentication. This process may take a few seconds.',
      tipsTitle: 'Tips for a good recording',
      tip1: 'Ensure a quiet environment without background noise',
      tip2: 'Speak clearly and at a normal pace',
      tip3: 'Keep your device about 15-20 cm away',
      tip4: 'The recording lasts a maximum of 30 seconds'
    },
    conversations: {
      title: 'Your Conversations',
      description: 'View your conversation history and statistics',
      totalConversations: 'Total Conversations',
      totalTime: 'Total Time',
      avgDriftLevel: 'Avg. Drift Level',
      avgQuality: 'Avg. Quality',
      recentConversations: 'Recent Conversations',
      noConversations: 'No conversations yet',
      noConversationsDesc: 'Start your first conversation by finding a match!',
      findMatch: 'Find a Match',
      viewDetails: 'View details',
      startNewConversation: 'Start New Conversation',
      drift: 'drift',
      loading: 'Loading conversations...'
    },
    feedback: {
      stayedReal: '👍 Stayed real!',
      soAuthentic: '💯 So authentic!',
      pureYourself: '✨ Pure yourself!',
      showingMask: '🎭 Showing your Mask!',
      perfectPresentation: '👑 Perfect presentation!',
      stylishlyMasked: '✨ Stylishly masked!',
      showingCrazy: '⚡ Showing your Crazy Self!',
      completelyUnleashed: '🔥 Completely unleashed!',
      wildAndFree: '🎉 Wild and free!',
      greatConnection: '🏆 Great connection!',
      conversationMaster: '⭐ Conversation master!',
      perfectlyBalanced: '🎯 Perfectly balanced!',
      conversationStarted: '🎉 Conversation started!',
      backToYourself: '✨ Back to yourself!'
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      continue: 'Continue',
      finish: 'Finish',
      yes: 'Yes',
      no: 'No'
    },
    posts: {
      createPost: 'Create Post',
      recordVoice: 'Record Voice',
      shareThought: 'Share Your Thoughts',
      authenticMoment: 'Authentic Moment',
      resonance: 'Resonance',
      comments: 'Comments',
      voiceReply: 'Voice Reply',
      authenticityScore: 'Authenticity Score',
      feedTitle: 'Community Feed',
      allPersonas: 'All Personas',
      rootsFeed: 'Roots Feed',
      maskFeed: 'Mask Feed',
      sparkFeed: 'Spark Feed',
      noPostsYet: 'No posts yet',
      createFirstPost: 'Create your first authentic moment',
      recordingTip: 'Speak from the heart - authenticity is valued here',
      maxDuration: 'Maximum 60 seconds',
      postSuccess: 'Your authentic moment has been shared!',
      postFailed: 'Failed to share post. Please try again.'
    }
  },
  nl: {
    nav: {
      dashboard: 'Dashboard',
      findMatch: 'Vind Match',
      conversations: 'Gesprekken',
      voiceSetup: 'Stem Setup',
      profile: 'Profiel',
      settings: 'Instellingen',
      logout: 'Uitloggen',
      login: 'Inloggen',
      signUp: 'Registreren'
    },
    landing: {
      title: 'Echte Gesprekken,\nEchte Verbindingen',
      subtitle: 'Ontdek een nieuwe manier van verbinden. Kies je persoonlijkheid, vind je match, en heb authentieke gesprekken met onze unieke Reality Drift technologie.',
      description: 'Ontdek een nieuwe manier van verbinden. Kies je persoonlijkheid, vind je match, en heb authentieke gesprekken met onze unieke Reality Drift technologie.',
      startJourney: 'Start Je Reis',
      watchDemo: 'Bekijk Demo',
      whyRealTalk: 'Waarom RealTalk?',
      whyDescription: 'We combineren geavanceerde technologie met menselijke authenticiteit om betekenisvolle verbindingen mogelijk te maken.',
      howItWorks: 'Hoe Het Werkt',
      howDescription: 'In drie eenvoudige stappen naar authentieke gesprekken',
      readyForConnections: 'Klaar Voor Echte Verbindingen?',
      readyDescription: 'Join duizenden gebruikers die al authentieke gesprekken voeren. Begin vandaag nog met je persoonlijke reis naar echte verbindingen.',
      startFree: 'Begin Nu Gratis',
      noCreditCard: 'Geen creditcard vereist',
      step1Title: 'Kies Je Persoonlijkheid',
      step1Description: 'Selecteer hoe je jezelf wilt presenteren: Roots, Mask, of Spark.',
      step2Title: 'Vind Je Match',
      step2Description: 'Ons algoritme verbindt je met iemand die past bij je gekozen persoonlijkheid.',
      step3Title: 'Start Het Gesprek',
      step3Description: 'Begin een authentiek audio gesprek met real-time feedback over je authenticiteit.'
    },
    features: {
      authenticConnections: 'Authentieke Verbindingen',
      authenticDescription: 'Ontmoet mensen die echt bij je passen, gebaseerd op je echte persoonlijkheid.',
      safeConversations: 'Veilige Gesprekken',
      safeDescription: 'End-to-end versleutelde audio gesprekken met geavanceerde privacy bescherming.',
      realityDrift: 'Reality Drift Meter',
      realityDriftDescription: 'Unieke technologie die je authenticiteit in real-time meet tijdens gesprekken.'
    },
    personalities: {
      roots: 'Roots 🌱',
      rootsDescription: 'Je authentieke, geaarde zelf',
      mask: 'Mask 🎭',
      maskDescription: 'Je gecureerde, sociale zelf',
      spark: 'Spark 🔥',
      sparkDescription: 'Je wilde, ongefilterde energie'
    },
    onboarding: {
      choosePersona: 'Kies Je Persona',
      chooseDescription: 'Selecteer hoe je jezelf wilt presenteren: Roots, Mask, of Spark.',
      rootsTitle: 'Roots 🌱',
      rootsDesc: 'Authentiek, oprecht en geaard. Deel je echte gedachten en ervaringen vanuit het hart.',
      maskTitle: 'Mask 🎭',
      maskDesc: 'Een gecureerde versie van jezelf. Presenteer je beste gezicht naar de wereld met intentie.',
      sparkTitle: 'Spark 🔥',
      sparkDesc: 'Laat je wilde energie los. Wees gedurfd, spontaan en volledig ongeïnhibeerd.',
      clickToSelect: 'Klik om te selecteren',
      stepOf: 'Stap 1 van 3',
      greatChoice: 'Geweldige Keuze!',
      settingUp: 'Je gepersonaliseerde ervaring wordt ingesteld...'
    },
    auth: {
      welcomeBack: 'Welkom Terug',
      loginToContinue: 'Log in om door te gaan naar je dashboard',
      email: 'E-mailadres',
      password: 'Wachtwoord',
      forgotPassword: 'Wachtwoord vergeten?',
      login: 'Inloggen',
      noAccount: 'Nog geen account?',
      registerHere: 'Registreer hier',
      createAccount: 'Account Aanmaken',
      startJourney: 'Begin je reis naar authentieke verbindingen',
      fullName: 'Volledige naam',
      confirmPassword: 'Bevestig wachtwoord',
      alreadyAccount: 'Al een account?',
      loginHere: 'Log hier in',
      termsText: 'Door een account aan te maken ga je akkoord met onze',
      terms: 'Algemene Voorwaarden',
      privacy: 'Privacybeleid',
      backToHome: 'Terug naar home',
      demoAccount: 'Demo Account:',
      passwordsNoMatch: 'Wachtwoorden komen niet overeen',
      passwordTooShort: 'Wachtwoord moet minimaal 6 karakters lang zijn'
    },
    dashboard: {
      welcome: 'Welkom',
      authenticSpace: 'Welkom in je authentieke ruimte!',
      presentBest: 'Klaar om je beste zelf te presenteren!',
      unleashWild: 'Tijd om je wilde kant los te laten!',
      personalityChoice: 'Je Persoonlijkheidskeuze',
      selectedPersona: 'Je hebt',
      customizeExperience: 'geselecteerd als je persona. Dit zal je ervaring op het platform aanpassen.',
      nextSteps: 'Volgende Stappen',
      completeProfile: 'Voltooi je profiel setup',
      connectOthers: 'Verbind met anderen die je vibe delen',
      startSharing: 'Begin met het delen van content in je gekozen stijl'
    },
    matching: {
      searchingFor: 'Zoeken naar iemand om mee te praten',
      connecting: 'Verbinden met gelijkgestemde zielen',
      findingPartner: 'Vinden van je perfecte gesprekspartner',
      matchingPersonality: 'Matchen op basis van je persoonlijkheid',
      searchTime: 'Zoektijd',
      status: 'Status',
      connected: 'Verbonden',
      connecting2: 'Verbinden...',
      demoMode: 'Demo modus',
      matchFound: 'Match gevonden! 🎉',
      talkingWith: 'Je gaat praten met',
      perfectMatch: 'Perfecte match',
      connectingToConversation: 'Je wordt doorverbonden naar het gesprek...',
      preparingConversation: 'Je gesprek wordt voorbereid',
      noMatchFound: 'Nog geen match gevonden',
      tryAgain: 'Probeer het opnieuw, er zijn altijd nieuwe mensen online!',
      searchedFor: 'Gezocht voor',
      retryButton: 'Opnieuw proberen',
      orTry: 'Of probeer:',
      changePersonality: 'Verander je persoonlijkheid instelling',
      tryLater: 'Probeer het later opnieuw'
    },
    conversation: {
      connecting: 'Verbinden...',
      connected: 'Verbonden',
      connectionLost: 'Verbinding verbroken',
      connectionError: 'Verbindingsfout',
      you: 'Jij',
      partner: 'Partner',
      conversationTime: 'Gesprekstijd',
      microphoneOff: 'Microfoon uitgeschakeld',
      audioActive: 'Audio actief',
      waitingConnection: 'Wachten op verbinding...',
      connectionProblem: 'Verbindingsprobleem',
      cannotConnect: 'Kan geen verbinding maken met',
      conversationEnded: 'Gesprek Beëindigd',
      redirecting: 'Je wordt doorgestuurd naar het dashboard...',
      simulateFeedback: 'Simuleer Feedback'
    },
    realityDrift: {
      title: 'Reality Drift Meter',
      authenticityLevel: 'Authenticiteit niveau',
      rising: 'Stijgend',
      falling: 'Dalend',
      authentic: 'Authentiek',
      lightFiltered: 'Licht Gefilterd',
      masked: 'Gemaskerd',
      strongFiltered: 'Sterk Gefilterd',
      fullyArtificial: 'Volledig Kunstmatig',
      naturalConversation: 'Gesprek verloopt natuurlijk en eerlijk',
      smallAdjustments: 'Kleine aanpassingen in presentatie',
      clearPersona: 'Duidelijke persona wordt gebruikt',
      significantDeviation: 'Aanzienlijke afwijking van echte zelf',
      extremePersona: 'Extreme persona of kunstmatige presentatie',
      simulateChange: 'Simuleer Verandering',
      reset: 'Reset',
      light: 'Licht',
      strong: 'Sterk',
      artificial: 'Kunstmatig'
    },
    voiceCapture: {
      title: 'Stem Verificatie',
      description: 'Neem je stem op voor authenticatie',
      microphoneRequired: 'Microfoon toegang vereist',
      microphoneDescription: 'We hebben toegang tot je microfoon nodig om je stem op te nemen. Klik op "Toestaan" in je browser.',
      tryAgain: 'Probeer opnieuw',
      checkingAccess: 'Microfoon toegang controleren...',
      voiceRecording: 'Stem Opname',
      holdAndSpeak: 'Houd de knop ingedrukt en praat – we nemen je stem op',
      recordingInProgress: 'Opname bezig...',
      recordingComplete: 'Opname voltooid!',
      clickToStart: 'Klik op de microfoon om te beginnen',
      maxDuration: 'Maximale duur:',
      duration: 'Duur:',
      size: 'Grootte:',
      download: 'Download',
      recordAgain: 'Opnieuw opnemen',
      nextStep: 'Volgende stap:',
      analysisNote: 'Je stem wordt geanalyseerd voor authenticatie. Dit proces kan enkele seconden duren.',
      tipsTitle: 'Tips voor een goede opname',
      tip1: 'Zorg voor een rustige omgeving zonder achtergrondgeluid',
      tip2: 'Spreek duidelijk en in een normaal tempo',
      tip3: 'Houd je apparaat op ongeveer 15-20 cm afstand',
      tip4: 'De opname duurt maximaal 30 seconden'
    },
    conversations: {
      title: 'Jouw Gesprekken',
      description: 'Bekijk je gesprekgeschiedenis en statistieken',
      totalConversations: 'Totaal Gesprekken',
      totalTime: 'Totale Tijd',
      avgDriftLevel: 'Gem. Drift Level',
      avgQuality: 'Gem. Kwaliteit',
      recentConversations: 'Recente Gesprekken',
      noConversations: 'Nog geen gesprekken',
      noConversationsDesc: 'Start je eerste gesprek door een match te zoeken!',
      findMatch: 'Vind een Match',
      viewDetails: 'Bekijk details',
      startNewConversation: 'Start Nieuw Gesprek',
      drift: 'drift',
      loading: 'Gesprekken laden...'
    },
    feedback: {
      stayedReal: '👍 Echt gebleven!',
      soAuthentic: '💯 Zo authentiek!',
      pureYourself: '✨ Puur jezelf!',
      showingMask: '🎭 Je laat je Mask zien!',
      perfectPresentation: '👑 Perfecte presentatie!',
      stylishlyMasked: '✨ Stijlvol gemaskeerd!',
      showingCrazy: '⚡ Je laat je Crazy Self zien!',
      completelyUnleashed: '🔥 Volledig losgelaten!',
      wildAndFree: '🎉 Wild en vrij!',
      greatConnection: '🏆 Geweldige connectie!',
      conversationMaster: '⭐ Gesprek meester!',
      perfectlyBalanced: '🎯 Perfect gebalanceerd!',
      conversationStarted: '🎉 Gesprek gestart!',
      backToYourself: '✨ Terug naar jezelf!'
    },
    common: {
      loading: 'Laden...',
      error: 'Fout',
      success: 'Succes',
      cancel: 'Annuleren',
      save: 'Opslaan',
      delete: 'Verwijderen',
      edit: 'Bewerken',
      close: 'Sluiten',
      back: 'Terug',
      next: 'Volgende',
      previous: 'Vorige',
      continue: 'Doorgaan',
      finish: 'Voltooien',
      yes: 'Ja',
      no: 'Nee'
    },
    posts: {
      createPost: 'Post Maken',
      recordVoice: 'Stem Opnemen',
      shareThought: 'Deel Je Gedachten',
      authenticMoment: 'Authentiek Moment',
      resonance: 'Resonantie',
      comments: 'Reacties',
      voiceReply: 'Stem Reactie',
      authenticityScore: 'Authenticiteit Score',
      feedTitle: 'Community Feed',
      allPersonas: 'Alle Personas',
      rootsFeed: 'Roots Feed',
      maskFeed: 'Mask Feed',
      sparkFeed: 'Spark Feed',
      noPostsYet: 'Nog geen posts',
      createFirstPost: 'Maak je eerste authentieke moment',
      recordingTip: 'Spreek vanuit het hart - authenticiteit wordt hier gewaardeerd',
      maxDuration: 'Maximaal 60 seconden',
      postSuccess: 'Je authentieke moment is gedeeld!',
      postFailed: 'Kon post niet delen. Probeer opnieuw.'
    }
  }
};

export const useTranslation = (language: Language = 'en') => {
  return translations[language];
};

export const getStoredLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('language') as Language;
    if (stored && ['en', 'nl'].includes(stored)) {
      return stored;
    }
    // Detect browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('nl')) {
      return 'nl';
    }
  }
  return 'en';
};

export const setStoredLanguage = (language: Language) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', language);
  }
};