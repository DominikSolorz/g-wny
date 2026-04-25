const TOKEN_KEY = "nexus_informator_token";
const MOBILE_BREAKPOINT = 980;

const state = {
  token: localStorage.getItem(TOKEN_KEY) || "",
  user: null,
  contact: null,
  models: {
    chat: "gpt-5.2",
    image: "gpt-image-1.5",
    video: "sora-2",
    audio: "gpt-4o-transcribe"
  },
  chats: [],
  currentChat: null,
  currentChatId: "",
  currentScreen: "chat",
  lastAssistantMessage: "",
  loaderTimer: null,
  recognition: null,
  isListening: false,
  isBusy: false,
  isSpeaking: false,
  liveVoicePaused: false,
  liveVoiceRestartTimer: null,
  audioContext: null,
  videoJobs: [],
  integrations: [],
  liveNews: []
};

const marketingSite = document.getElementById("marketingSite");
const loaderScreen = document.getElementById("loaderScreen");
const chatApp = document.getElementById("chatApp");
const headerLaunchLink = document.getElementById("headerLaunchLink");
const homeBrandLinks = Array.from(document.querySelectorAll("[data-home-link]"));

const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const generateAccountBtn = document.getElementById("generateAccountBtn");
const toggleRegisterPasswordBtn = document.getElementById("toggleRegisterPasswordBtn");
const toggleLoginPasswordBtn = document.getElementById("toggleLoginPasswordBtn");

const registerFirstName = document.getElementById("registerFirstName");
const registerLastName = document.getElementById("registerLastName");
const registerDisplayName = document.getElementById("registerDisplayName");
const registerBirthDate = document.getElementById("registerBirthDate");
const registerAddress = document.getElementById("registerAddress");
const registerEmail = document.getElementById("registerEmail");
const registerUsername = document.getElementById("registerUsername");
const registerPassword = document.getElementById("registerPassword");
const loginIdentifier = document.getElementById("loginIdentifier");
const loginPassword = document.getElementById("loginPassword");

const termsConsent = document.getElementById("termsConsent");
const privacyConsent = document.getElementById("privacyConsent");
const rodoConsent = document.getElementById("rodoConsent");
const marketingConsent = document.getElementById("marketingConsent");
const audioConsent = document.getElementById("audioConsent");
const voiceCloneConsent = document.getElementById("voiceCloneConsent");

const loaderFill = document.getElementById("loaderFill");
const loaderPercent = document.getElementById("loaderPercent");
const loaderMessage = document.getElementById("loaderMessage");

const sidebarToggle = document.getElementById("sidebarToggle");
const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
const logoutBtn = document.getElementById("logoutBtn");
const newChatBtn = document.getElementById("newChatBtn");
const refreshChatsBtn = document.getElementById("refreshChatsBtn");
const chatHistoryList = document.getElementById("chatHistoryList");
const adminNavButton = document.getElementById("adminNavButton");
const sidebarScreenButtons = Array.from(
  document.querySelectorAll(".sidebar-link[data-screen]")
);

const currentUserName = document.getElementById("currentUserName");
const currentUserEmail = document.getElementById("currentUserEmail");
const modelsSummary = document.getElementById("modelsSummary");
const chatModelBadge = document.getElementById("chatModelBadge");
const imageModelBadge = document.getElementById("imageModelBadge");
const videoModelBadge = document.getElementById("videoModelBadge");
const currentModeBadge = document.getElementById("currentModeBadge");
const chatSourceBadge = document.getElementById("chatSourceBadge");

const chatModeSelect = document.getElementById("chatModeSelect");
const liveCategorySelect = document.getElementById("liveCategorySelect");
const form = document.getElementById("chatForm");
const input = document.getElementById("messageInput");
const messagesEl = document.getElementById("messages");
const statusEl = document.getElementById("status");
const clearBtn = document.getElementById("clearBtn");
const sendBtn = document.getElementById("sendBtn");
const speakLastBtn = document.getElementById("speakLastBtn");
const voiceInputBtn = document.getElementById("voiceInputBtn");
const liveVoiceToggleBtn = document.getElementById("liveVoiceToggleBtn");
const liveVoiceBanner = document.getElementById("liveVoiceBanner");
const liveVoiceState = document.getElementById("liveVoiceState");
const liveVoiceStateDot = document.getElementById("liveVoiceStateDot");
const liveVoiceStateLabel = document.getElementById("liveVoiceStateLabel");
const liveVoiceStateHint = document.getElementById("liveVoiceStateHint");

const liveNewsCategory = document.getElementById("liveNewsCategory");
const loadLiveNewsBtn = document.getElementById("loadLiveNewsBtn");
const liveNewsStatus = document.getElementById("liveNewsStatus");
const liveNewsList = document.getElementById("liveNewsList");

const imageForm = document.getElementById("imageForm");
const imagePrompt = document.getElementById("imagePrompt");
const imageSize = document.getElementById("imageSize");
const imageQuality = document.getElementById("imageQuality");
const imageResults = document.getElementById("imageResults");
const imageStatus = document.getElementById("imageStatus");

const workbenchForm = document.getElementById("workbenchForm");
const workbenchPrompt = document.getElementById("workbenchPrompt");
const workbenchTaskType = document.getElementById("workbenchTaskType");
const workbenchExpertMode = document.getElementById("workbenchExpertMode");
const workbenchLinks = document.getElementById("workbenchLinks");
const workbenchFiles = document.getElementById("workbenchFiles");
const workbenchFileList = document.getElementById("workbenchFileList");
const workbenchSaveToChat = document.getElementById("workbenchSaveToChat");
const workbenchStatus = document.getElementById("workbenchStatus");
const workbenchSources = document.getElementById("workbenchSources");
const workbenchResult = document.getElementById("workbenchResult");

const videoForm = document.getElementById("videoForm");
const videoPrompt = document.getElementById("videoPrompt");
const videoModel = document.getElementById("videoModel");
const videoSeconds = document.getElementById("videoSeconds");
const videoSize = document.getElementById("videoSize");
const videoJobs = document.getElementById("videoJobs");
const videoStatus = document.getElementById("videoStatus");
const refreshVideosBtn = document.getElementById("refreshVideosBtn");

const voiceConsentSetting = document.getElementById("voiceConsentSetting");
const saveVoiceConsentBtn = document.getElementById("saveVoiceConsentBtn");
const voiceStatus = document.getElementById("voiceStatus");

const settingsForm = document.getElementById("settingsForm");
const customPrompt = document.getElementById("customPrompt");
const preferredTone = document.getElementById("preferredTone");
const trustMode = document.getElementById("trustMode");
const expertMode = document.getElementById("expertMode");
const emotionalPresence = document.getElementById("emotionalPresence");
const boundaryStyle = document.getElementById("boundaryStyle");
const conciseMode = document.getElementById("conciseMode");
const askClarifyingQuestions = document.getElementById("askClarifyingQuestions");
const challengeWrongClaims = document.getElementById("challengeWrongClaims");
const autoFixMode = document.getElementById("autoFixMode");
const liveVoiceMode = document.getElementById("liveVoiceMode");
const autoSpeakResponses = document.getElementById("autoSpeakResponses");
const settingsVoiceConsentSetting = document.getElementById("settingsVoiceConsentSetting");
const settingsStatus = document.getElementById("settingsStatus");

const integrationForm = document.getElementById("integrationForm");
const integrationService = document.getElementById("integrationService");
const integrationAccountLabel = document.getElementById("integrationAccountLabel");
const integrationSecret = document.getElementById("integrationSecret");
const integrationNotes = document.getElementById("integrationNotes");
const integrationEnabled = document.getElementById("integrationEnabled");
const integrationPermissionRead = document.getElementById("integrationPermissionRead");
const integrationPermissionWrite = document.getElementById("integrationPermissionWrite");
const integrationPermissionDelete = document.getElementById("integrationPermissionDelete");
const clearIntegrationSecretBtn = document.getElementById("clearIntegrationSecretBtn");
const integrationList = document.getElementById("integrationList");
const integrationStatus = document.getElementById("integrationStatus");
const alibabaStatusRefreshBtn = document.getElementById("alibabaStatusRefreshBtn");
const alibabaStatus = document.getElementById("alibabaStatus");
const alibabaStatusMeta = document.getElementById("alibabaStatusMeta");
const gmailInboxRefreshBtn = document.getElementById("gmailInboxRefreshBtn");
const gmailStatus = document.getElementById("gmailStatus");
const gmailOauthStatus = document.getElementById("gmailOauthStatus");
const gmailOauthMeta = document.getElementById("gmailOauthMeta");
const gmailOauthConnectBtn = document.getElementById("gmailOauthConnectBtn");
const gmailOauthDisconnectBtn = document.getElementById("gmailOauthDisconnectBtn");
const gmailInboxList = document.getElementById("gmailInboxList");
const gmailSendForm = document.getElementById("gmailSendForm");
const gmailTo = document.getElementById("gmailTo");
const gmailSubject = document.getElementById("gmailSubject");
const gmailBody = document.getElementById("gmailBody");

const buildGoodList = document.getElementById("buildGoodList");
const buildFixList = document.getElementById("buildFixList");
const builderStatus = document.getElementById("builderStatus");

const refreshAdminBtn = document.getElementById("refreshAdminBtn");
const adminSummary = document.getElementById("adminSummary");
const adminUsersTableBody = document.querySelector("#adminUsersTable tbody");
const auditLogList = document.getElementById("auditLogList");
const incidentLogList = document.getElementById("incidentLogList");
const adminStatus = document.getElementById("adminStatus");
const settingsProfileName = document.getElementById("settingsProfileName");
const settingsProfileEmail = document.getElementById("settingsProfileEmail");
const workspaceEl = document.querySelector(".workspace");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const unifiedWorkspaceCollapsibleScreens = [
  "live",
  "code",
  "workbench",
  "image",
  "video",
  "voice",
  "integrations",
  "settings",
  "admin"
];

const allPanels = {
  chat: document.getElementById("chatScreen"),
  live: document.getElementById("liveScreen"),
  code: document.getElementById("codeScreen"),
  workbench: document.getElementById("workbenchScreen"),
  image: document.getElementById("imageScreen"),
  video: document.getElementById("videoScreen"),
  voice: document.getElementById("voiceScreen"),
  integrations: document.getElementById("integrationsScreen"),
  settings: document.getElementById("settingsScreen"),
  admin: document.getElementById("adminScreen")
};
const validScreens = new Set(Object.keys(allPanels));

function setFormMessage(element, message, type = "") {
  element.textContent = message || "";
  element.className = "form-message";
  if (type) {
    element.classList.add(type);
  }
}

function setStatus(element, message) {
  element.textContent = message || "";
}

function setToken(token) {
  state.token = token || "";
  if (state.token) {
    localStorage.setItem(TOKEN_KEY, state.token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

function getRequestedScreenFromHash() {
  const hash = String(window.location.hash || "").replace(/^#/, "").trim().toLowerCase();
  return validScreens.has(hash) ? hash : "";
}

function updateScreenHash(screen) {
  if (!validScreens.has(screen)) {
    return;
  }

  const nextHash = `#${screen}`;
  if (window.location.hash !== nextHash) {
    window.history.replaceState({}, "", nextHash);
  }
}

function syncSidebarUi() {
  const isSidebarOpen = document.body.classList.contains("sidebar-open");
  if (sidebarToggle) {
    sidebarToggle.setAttribute("aria-expanded", isSidebarOpen ? "true" : "false");
    sidebarToggle.classList.toggle("active", isSidebarOpen);
  }
}

function closeSidebar() {
  document.body.classList.remove("sidebar-open");
  syncSidebarUi();
}

function toggleSidebar() {
  if (window.innerWidth <= MOBILE_BREAKPOINT) {
    document.body.classList.toggle("sidebar-open");
    syncSidebarUi();
    return;
  }

  document.body.classList.toggle("sidebar-collapsed");
  syncSidebarUi();
}

function setPanelCollapsed(screen, collapsed) {
  const panel = allPanels[screen];
  if (!panel || !workspaceEl?.classList.contains("unified-workspace")) {
    return;
  }

  panel.classList.toggle("collapsed", Boolean(collapsed));
  const toggle = panel.querySelector(".panel-collapse-toggle");
  if (toggle) {
    toggle.textContent = collapsed ? "Rozwin" : "Zwin";
    toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
  }
}

function initUnifiedWorkspacePanels() {
  if (!workspaceEl?.classList.contains("unified-workspace")) {
    return;
  }

  unifiedWorkspaceCollapsibleScreens.forEach((screen) => {
    const panel = allPanels[screen];
    const header = panel?.querySelector(".panel-header");
    if (!panel || !header || header.querySelector(".panel-collapse-toggle")) {
      return;
    }

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "ghost-button panel-collapse-toggle";
    toggle.textContent = "Rozwin";
    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", () => {
      setPanelCollapsed(screen, !panel.classList.contains("collapsed"));
    });

    header.appendChild(toggle);
    setPanelCollapsed(screen, true);
  });
}

function applyChatShortcut(shortcut) {
  const templates = {
    image: "/image ",
    video: "/video ",
    audio: "/audio ",
    workbench: "/workbench ",
    live: "/live "
  };

  const template = templates[shortcut];
  if (!template) {
    return;
  }

  fillChatWithPrompt(template, shortcut === "live" ? "live" : "general");
}

function parseSlashCommand(text) {
  const normalized = String(text || "").trim();
  if (!normalized.startsWith("/")) {
    return null;
  }

  const [rawCommand, ...rest] = normalized.split(/\s+/);
  const raw = rawCommand.slice(1).toLowerCase();
  const command = ({ img: "image", obraz: "image", picture: "image" }[raw] || raw);
  const payload = rest.join(" ").trim();

  if (!["image", "video", "audio", "voice", "workbench", "live"].includes(command)) {
    return null;
  }

  return { command, payload };
}

function detectImageIntent(text) {
  const normalized = String(text || "").trim();
  if (!normalized) {
    return "";
  }

  const lower = normalized.toLowerCase();
  if (lower.startsWith("/image")) {
    return normalized.replace(/^\/image\s*/i, "").trim();
  }

  const imageKeywords = /(obraz|obrazu|grafik|zdjec|zdjęc|zdiec|zdieci|zdieć|foto|photo|picture|image|ilustracj|logo|plakat|tapet|miniatur|portret)/i;
  const actionKeywords = /(wygeneruj|stworz|stwórz|zrob|zrób|narysuj|utworz|utwórz|zaprojektuj|wykonaj|namaluj|przygotuj)/i;
  const drawingOnlyIntent = /(narysuj|namaluj|naszkicuj)/i;

  if ((imageKeywords.test(normalized) && actionKeywords.test(normalized)) || drawingOnlyIntent.test(normalized)) {
    return normalized;
  }

  return "";
}

async function handleSlashCommand(command) {
  if (!command) {
    return false;
  }

  if (command.command === "image") {
    setPanelCollapsed("image", false);
    switchScreen("image");
    if (command.payload) {
      imagePrompt.value = command.payload;
      autoResize(imagePrompt);
      imageForm.requestSubmit();
    } else {
      imagePrompt.focus();
      setStatus(statusEl, "Tryb /image gotowy. Opisz scene i uruchom generowanie.");
    }
    return true;
  }

  if (command.command === "live") {
    chatModeSelect.value = "live";
    setModeBadge();
    setPanelCollapsed("live", false);
    switchScreen("live");
    if (command.payload) {
      await sendMessage({ textOverride: command.payload, modeOverride: "live" });
    } else {
      setStatus(statusEl, "Tryb /live aktywny. Wpisz temat albo kategorie aktualnosci.");
    }
    return true;
  }

  if (command.command === "workbench") {
    setPanelCollapsed("workbench", false);
    switchScreen("workbench");
    if (command.payload) {
      workbenchPrompt.value = command.payload;
      autoResize(workbenchPrompt);
      workbenchForm.requestSubmit();
    } else {
      workbenchPrompt.focus();
      setStatus(statusEl, "Tryb /workbench gotowy. Wpisz zadanie albo dodaj linki i pliki.");
    }
    return true;
  }

  if (command.command === "video") {
    setPanelCollapsed("video", false);
    switchScreen("video");
    if (command.payload) {
      videoPrompt.value = command.payload;
      autoResize(videoPrompt);
      videoForm.requestSubmit();
    } else {
      videoPrompt.focus();
      setStatus(statusEl, "Tryb /video gotowy. Dopisz opis sceny i uruchom job.");
    }
    return true;
  }

  if (["audio", "voice"].includes(command.command)) {
    setPanelCollapsed("voice", false);
    switchScreen("voice");
    if (command.payload) {
      speakText(command.payload, statusEl, {
        resumeLiveListening: isLiveVoiceEnabled()
      });
    } else {
      toggleDictation();
    }
    return true;
  }

  return false;
}

async function apiFetch(url, options = {}) {
  const headers = {
    ...(options.headers || {})
  };

  if (!headers["Content-Type"] && options.body) {
    headers["Content-Type"] = "application/json";
  }

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Wystapil blad.");
  }

  return data;
}

function syncHeaderLaunch() {
  if (state.user) {
    headerLaunchLink.textContent = "Wroc do panelu";
    headerLaunchLink.setAttribute("href", "#panel");
  } else {
    headerLaunchLink.textContent = "Wejdz do panelu";
    headerLaunchLink.setAttribute("href", "#dostep");
  }
}

function updateModelsUi() {
  modelsSummary.textContent = [
    state.models.chat,
    state.models.image,
    state.models.video,
    state.models.audio
  ]
    .filter(Boolean)
    .join(" / ");
  chatModelBadge.textContent = `Model: ${state.models.chat}`;
  imageModelBadge.textContent = `Model: ${state.models.image}`;
  videoModelBadge.textContent = `Model: ${state.models.video}`;
}

function playSystemTone(type) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return;
  }

  if (!state.audioContext) {
    state.audioContext = new AudioContextClass();
  }

  const context = state.audioContext;
  if (context.state === "suspended") {
    void context.resume().catch(() => {});
  }

  const tones = {
    listening: { frequency: 720, duration: 0.08, gain: 0.03 },
    replyEnd: { frequency: 580, duration: 0.1, gain: 0.025 },
    pause: { frequency: 280, duration: 0.12, gain: 0.03 }
  };
  const tone = tones[type];
  if (!tone) {
    return;
  }

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  const now = context.currentTime;

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(tone.frequency, now);
  gainNode.gain.setValueAtTime(0.0001, now);
  gainNode.gain.exponentialRampToValueAtTime(tone.gain, now + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + tone.duration);
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + tone.duration + 0.02);
}

function populateSettingsForm() {
  const settings = state.user?.aiSettings || {};
  customPrompt.value = settings.customPrompt || "";
  preferredTone.value = settings.preferredTone || "advanced";
  trustMode.value = settings.trustMode || "skeptical";
  expertMode.value = settings.expertMode || "general";
  emotionalPresence.value = settings.emotionalPresence || "warm";
  boundaryStyle.value = settings.boundaryStyle || "firm";
  conciseMode.checked = settings.conciseMode !== false;
  askClarifyingQuestions.checked = settings.askClarifyingQuestions !== false;
  challengeWrongClaims.checked = settings.challengeWrongClaims !== false;
  autoFixMode.checked = settings.autoFixMode !== false;
  liveVoiceMode.checked = Boolean(settings.liveVoiceMode);
  autoSpeakResponses.checked = Boolean(settings.autoSpeakResponses);
  voiceConsentSetting.checked = Boolean(state.user?.consents?.voiceCloneConsent);
  if (settingsVoiceConsentSetting) {
    settingsVoiceConsentSetting.checked = Boolean(state.user?.consents?.voiceCloneConsent);
  }
  workbenchExpertMode.value = settings.expertMode || "general";
}

function isLiveVoiceEnabled() {
  return Boolean(state.user?.aiSettings?.liveVoiceMode);
}

function isAutoSpeakEnabled() {
  return Boolean(state.user?.aiSettings?.autoSpeakResponses);
}

function clearLiveVoiceRestartTimer() {
  if (state.liveVoiceRestartTimer) {
    clearTimeout(state.liveVoiceRestartTimer);
    state.liveVoiceRestartTimer = null;
  }
}

function updateLiveVoiceState(status, hint = "") {
  if (!liveVoiceStateDot || !liveVoiceStateLabel || !liveVoiceStateHint) {
    return;
  }

  liveVoiceStateDot.classList.remove("idle", "listening", "speaking", "paused");
  liveVoiceStateDot.classList.add(status);

  const labels = {
    idle: "Voice status: gotowy",
    listening: "Voice status: slucham",
    speaking: "Voice status: mowie",
    paused: "Voice status: pauza"
  };

  liveVoiceStateLabel.textContent = labels[status] || labels.idle;
  liveVoiceStateHint.textContent = hint || "Komendy: stop, start, nowy watek, czytaj jeszcze raz, przelacz na live, przestan czytac.";
}

function detectLocalVoiceCommand(text) {
  const normalized = String(text || "")
    .trim()
    .toLowerCase()
    .replace(/[!.?]+$/g, "");

  if (["stop", "pauza", "zatrzymaj", "stop voice", "stop live voice"].includes(normalized)) {
    return "pause-live-voice";
  }

  if (["wznow", "wznow", "start", "sluchaj", "słuchaj"].includes(normalized)) {
    return "resume-live-voice";
  }

  if (["nowy watek", "nowy czat", "nowa rozmowa"].includes(normalized)) {
    return "new-chat";
  }

  if (["czytaj jeszcze raz", "powtorz glosowo", "powtórz głosowo", "przeczytaj jeszcze raz"].includes(normalized)) {
    return "read-last-reply";
  }

  if (["przelacz na live", "przełącz na live", "tryb live", "wlacz live", "włącz live"].includes(normalized)) {
    return "switch-live-mode";
  }

  if (["otworz ustawienia", "otwórz ustawienia", "pokaz ustawienia", "pokaż ustawienia"].includes(normalized)) {
    return "open-settings";
  }

  if (["otworz obrazy", "otwórz obrazy", "pokaz obrazy", "pokaż obrazy"].includes(normalized)) {
    return "open-images";
  }

  if (["otworz integracje", "otwórz integracje", "pokaz integracje", "pokaż integracje"].includes(normalized)) {
    return "open-integrations";
  }

  if (["otworz live", "otwórz live", "pokaz live", "pokaż live", "otworz tryb live", "otwórz tryb live"].includes(normalized)) {
    return "open-live";
  }

  if (["otworz workbench", "otwórz workbench", "pokaz workbench", "pokaż workbench", "otworz warsztat", "otwórz warsztat"].includes(normalized)) {
    return "open-workbench";
  }

  if (["wyloguj", "wyloguj mnie", "zakoncz sesje", "zakończ sesję"].includes(normalized)) {
    return "logout";
  }

  if (["przestan czytac", "przestań czytać", "cisza", "nie czytaj"].includes(normalized)) {
    return "stop-reading";
  }

  return "";
}

async function handleLocalVoiceCommand(command) {
  if (command === "pause-live-voice") {
    state.liveVoicePaused = true;
    clearLiveVoiceRestartTimer();
    stopAudio();
    playSystemTone("pause");
    if (state.recognition && state.isListening) {
      state.recognition.stop();
    }
    updateLiveVoiceState("paused", "Live voice zatrzymany lokalnie. Uzyj przycisku albo komendy start, aby wznowic.");
    setStatus(statusEl, "Live voice zatrzymany lokalnie. Uzyj przycisku albo komendy 'start', aby wznowic.");
    return true;
  }

  if (command === "resume-live-voice") {
    state.liveVoicePaused = false;
    updateLiveVoiceState("listening", "Live voice wznowiony. Slucham.");
    scheduleLiveListening("Live voice wznowiony. Slucham.");
    return true;
  }

  if (command === "new-chat") {
    await createNewChat();
    updateLiveVoiceState("idle", "Utworzono nowy watek. Mozesz mowic dalej.");
    return true;
  }

  if (command === "read-last-reply") {
    if (state.lastAssistantMessage) {
      speakText(state.lastAssistantMessage, statusEl, {
        resumeLiveListening: isLiveVoiceEnabled()
      });
      return true;
    }

    updateLiveVoiceState("idle", "Brak ostatniej odpowiedzi do odczytania.");
    setStatus(statusEl, "Brak ostatniej odpowiedzi do odczytania.");
    return true;
  }

  if (command === "switch-live-mode") {
    chatModeSelect.value = "live";
    setModeBadge();
    updateLiveVoiceState("idle", "Tryb czatu przelaczony na live.");
    setStatus(statusEl, "Tryb czatu przelaczony na live.");
    return true;
  }

  if (command === "open-settings") {
    switchScreen("settings");
    updateLiveVoiceState("idle", "Otworzylem ustawienia.");
    setStatus(statusEl, "Otworzylem ustawienia.");
    return true;
  }

  if (command === "open-images") {
    switchScreen("image");
    updateLiveVoiceState("idle", "Otworzylem obrazy.");
    setStatus(statusEl, "Otworzylem ekran obrazow.");
    return true;
  }

  if (command === "open-integrations") {
    switchScreen("integrations");
    updateLiveVoiceState("idle", "Otworzylem integracje.");
    setStatus(statusEl, "Otworzylem integracje.");
    return true;
  }

  if (command === "open-live") {
    switchScreen("voice");
    updateLiveVoiceState("idle", "Otworzylem tryb live.");
    setStatus(statusEl, "Otworzylem tryb live.");
    return true;
  }

  if (command === "open-workbench") {
    switchScreen("workbench");
    updateLiveVoiceState("idle", "Otworzylem workbench.");
    setStatus(statusEl, "Otworzylem workbench.");
    return true;
  }

  if (command === "logout") {
    updateLiveVoiceState("idle", "Wylogowuje.");
    setStatus(statusEl, "Wylogowuje.");
    await handleLogout();
    return true;
  }

  if (command === "stop-reading") {
    stopAudio();
    playSystemTone("pause");
    updateLiveVoiceState(state.liveVoicePaused ? "paused" : "idle", "Lektor zatrzymany. Mozesz wznowic glos komenda czytaj jeszcze raz.");
    setStatus(statusEl, "Lektor zatrzymany lokalnie.");
    if (isLiveVoiceEnabled() && !state.liveVoicePaused) {
      scheduleLiveListening("Live voice: lektor zatrzymany, slucham dalej.");
    }
    return true;
  }

  return false;
}

function syncLiveVoiceUi() {
  const enabled = isLiveVoiceEnabled();
  if (liveVoiceToggleBtn) {
    liveVoiceToggleBtn.textContent = enabled
      ? (state.liveVoicePaused ? "Live voice: pauza" : "Live voice: wlaczone")
      : "Live voice: wylaczone";
    liveVoiceToggleBtn.classList.toggle("active", enabled && !state.liveVoicePaused);
  }

  if (liveVoiceBanner) {
    liveVoiceBanner.classList.toggle("hidden", !enabled);
  }

  if (!enabled) {
    updateLiveVoiceState("idle", "Komendy: stop, start, nowy watek, czytaj jeszcze raz, przelacz na live, przestan czytac.");
    return;
  }

  if (state.liveVoicePaused) {
    updateLiveVoiceState("paused", "Live voice w pauzie. Uzyj start albo kliknij przycisk, aby wznowic.");
    return;
  }

  if (state.isSpeaking) {
    updateLiveVoiceState("speaking", "Asystent czyta odpowiedz na glos.");
    return;
  }

  if (state.isListening) {
    updateLiveVoiceState("listening", "Asystent nasluchuje mikrofonu.");
    return;
  }

  updateLiveVoiceState("idle", "Live voice aktywny i gotowy do rozmowy.");
}

function updateUserUi() {
  currentUserName.textContent =
    state.user?.displayName || state.user?.firstName || "Uzytkownik";
  currentUserEmail.textContent =
    state.user?.email || "konto aktywne";
  if (settingsProfileName) {
    settingsProfileName.textContent = state.user?.displayName || state.user?.firstName || "Uzytkownik";
  }
  if (settingsProfileEmail) {
    settingsProfileEmail.textContent = state.user?.email || "konto aktywne";
  }
  adminNavButton.classList.toggle("hidden", state.user?.role !== "admin");
  updateModelsUi();
  populateSettingsForm();
  syncLiveVoiceUi();
}

function showMarketing() {
  loaderScreen.classList.add("hidden");
  chatApp.classList.add("hidden");
  marketingSite.classList.remove("hidden");
  document.body.classList.remove("sidebar-open");
}

function showHomePage() {
  showMarketing();
  window.location.hash = "start";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showChatApp() {
  loaderScreen.classList.add("hidden");
  marketingSite.classList.add("hidden");
  chatApp.classList.remove("hidden");
}

function startLoaderThenOpen(user, models = state.models, contact = state.contact) {
  const steps = [
    "Uruchamiamy sesje i zabezpieczenia...",
    "Pobieramy ustawienia, modele i profil...",
    "Ladujemy ekran rozmowy i pamiec czatow...",
    "Przygotowujemy media oraz prompt builder...",
    "Finalizujemy uruchomienie panelu..."
  ];

  state.models = { ...state.models, ...models };
  state.contact = contact || state.contact;

  marketingSite.classList.add("hidden");
  chatApp.classList.add("hidden");
  loaderScreen.classList.remove("hidden");

  if (state.loaderTimer) {
    clearInterval(state.loaderTimer);
  }

  let tick = 0;
  loaderFill.style.width = "0%";
  loaderPercent.textContent = "0%";
  loaderMessage.textContent = steps[0];

  state.loaderTimer = setInterval(() => {
    tick += 1;
    const percent = Math.min(tick, 100);
    const index = Math.min(
      steps.length - 1,
      Math.floor((percent / 100) * steps.length)
    );

    loaderFill.style.width = `${percent}%`;
    loaderPercent.textContent = `${percent}%`;
    loaderMessage.textContent = steps[index];

    if (percent >= 100) {
      clearInterval(state.loaderTimer);
      state.loaderTimer = null;
      openApp(user, state.models, state.contact);
    }
  }, 100);
}

function stopAudio() {
  state.isSpeaking = false;
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function tryStartLiveListening(reason = "") {
  if (!isLiveVoiceEnabled() || state.liveVoicePaused || !state.recognition || state.isListening || state.isBusy || state.isSpeaking) {
    return;
  }

  clearLiveVoiceRestartTimer();

  try {
    state.recognition.start();
    playSystemTone("listening");
    updateLiveVoiceState("listening", reason || "Asystent nasluchuje mikrofonu.");
    if (reason) {
      setStatus(statusEl, reason);
    }
  } catch {
    if (reason) {
      setStatus(statusEl, `${reason} Jesli przegladarka zablokowala mikrofon, kliknij Start dyktafonu.`);
    }
  }
}

function scheduleLiveListening(reason = "") {
  if (!isLiveVoiceEnabled()) {
    return;
  }

  clearLiveVoiceRestartTimer();
  state.liveVoiceRestartTimer = setTimeout(() => {
    state.liveVoiceRestartTimer = null;
    tryStartLiveListening(reason);
  }, 220);
}

function speakText(text, statusTarget = statusEl, options = {}) {
  if (!text) {
    return;
  }

  if (!("speechSynthesis" in window)) {
    setStatus(statusTarget, "Ta przegladarka nie obsluguje czytania glosowego.");
    return;
  }

  stopAudio();
  clearLiveVoiceRestartTimer();
  if (state.recognition && state.isListening) {
    state.recognition.stop();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "pl-PL";
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.onstart = () => {
    state.isSpeaking = true;
    updateLiveVoiceState("speaking", "Asystent czyta odpowiedz na glos.");
  };
  utterance.onend = () => {
    state.isSpeaking = false;
    playSystemTone("replyEnd");
    syncLiveVoiceUi();
    if (typeof options.onEnd === "function") {
      options.onEnd();
    }
    if (options.resumeLiveListening) {
      scheduleLiveListening("Live voice: znowu slucham.");
    }
  };
  utterance.onerror = () => {
    state.isSpeaking = false;
    syncLiveVoiceUi();
    if (options.resumeLiveListening) {
      scheduleLiveListening("Live voice: lektor zatrzymany, wracam do sluchania.");
    }
  };
  window.speechSynthesis.speak(utterance);
}

function setModeBadge() {
  const labels = {
    general: "Tryb: chat",
    code: "Tryb: code",
    analysis: "Tryb: analysis",
    review: "Tryb: review",
    live: "Tryb: live"
  };
  currentModeBadge.textContent = labels[chatModeSelect.value] || labels.general;
}

function updateChatSourceBadge(sourceLabel = "brak") {
  chatSourceBadge.textContent = `Zrodlo: ${sourceLabel}`;
}

function autoResize(textarea) {
  if (!textarea) {
    return;
  }

  textarea.style.height = "auto";
  textarea.style.height = `${Math.min(textarea.scrollHeight, 220)}px`;
}

function setBusy(isBusy) {
  state.isBusy = isBusy;
  sendBtn.disabled = isBusy;
  input.disabled = isBusy;
  sendBtn.textContent = isBusy ? "Pisze..." : "Wyslij";
  if (!isBusy) {
    syncLiveVoiceUi();
  }
}

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function refreshChatVideoMessage(jobId) {
  const data = await apiFetch(`/api/media/video/${jobId}`);
  const nextMessages = (state.currentChat?.messages || []).map((message) =>
    message.videoJobId === jobId
      ? {
          ...message,
          videoStatus: data.job?.status || message.videoStatus,
          mediaModel: data.job?.model || message.mediaModel,
          mediaSize: data.job?.size || message.mediaSize,
          mediaSeconds: data.job?.seconds || message.mediaSeconds
        }
      : message
  );

  state.currentChat = {
    ...state.currentChat,
    messages: nextMessages
  };
  renderMessages();
  return data.job;
}

function appendChatMedia(message, bubbleWrap) {
  if (message.mediaType === "image" && message.imageDataUrl) {
    const card = document.createElement("article");
    card.className = "media-card chat-media-card";

    const image = document.createElement("img");
    image.src = message.imageDataUrl;
    image.alt = message.mediaPrompt || message.content || "Wygenerowany obraz";

    const description = document.createElement("p");
    description.textContent = [message.mediaModel, message.mediaSize, message.mediaQuality]
      .filter(Boolean)
      .join(" | ");
    const downloadLink = document.createElement("a");
    downloadLink.className = "audio-button";
    downloadLink.href = message.imageDataUrl;
    downloadLink.download = "nexus-chat-image.png";
    downloadLink.textContent = "Pobierz obraz";

    card.appendChild(image);
    if (description.textContent) {
      card.appendChild(description);
    }
    card.appendChild(downloadLink);
    bubbleWrap.appendChild(card);
  }

  if (message.mediaType === "video" && message.videoJobId) {
    const card = document.createElement("article");
    card.className = "video-job chat-media-card";

    const title = document.createElement("strong");
    title.textContent = message.mediaPrompt || "Generowanie wideo z czatu";

    const meta = document.createElement("div");
    meta.className = "video-meta";
    [
      message.mediaModel,
      message.mediaSeconds ? `${message.mediaSeconds} s` : "",
      message.mediaSize,
      message.videoStatus ? `Status: ${message.videoStatus}` : ""
    ]
      .filter(Boolean)
      .forEach((item) => {
        const span = document.createElement("span");
        span.textContent = item;
        meta.appendChild(span);
      });

    const actions = document.createElement("div");
    actions.className = "video-actions";

    const refreshButton = document.createElement("button");
    refreshButton.className = "ghost-button";
    refreshButton.type = "button";
    refreshButton.textContent = "Odswiez status";
    refreshButton.addEventListener("click", async () => {
      setStatus(statusEl, "Odswiezam status wideo z czatu...");
      const job = await refreshChatVideoMessage(message.videoJobId);
      setStatus(statusEl, `Status wideo: ${job?.status || "nieznany"}.`);
    });
    actions.appendChild(refreshButton);

    if (isVideoReady(message.videoStatus)) {
      const downloadLink = document.createElement("a");
      downloadLink.className = "primary-link";
      downloadLink.href = `/api/media/video/${message.videoJobId}/content`;
      downloadLink.textContent = "Pobierz MP4";
      actions.appendChild(downloadLink);
    }

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(actions);
    bubbleWrap.appendChild(card);
  }
}

function createMessageElement(message) {
  const article = document.createElement("article");
  article.className = `message ${message.role}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = message.role === "assistant" ? "AI" : "TY";

  const bubbleWrap = document.createElement("div");
  bubbleWrap.className = "bubble-wrap";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = message.content;
  bubbleWrap.appendChild(bubble);

  appendChatMedia(message, bubbleWrap);

  if (message.role === "assistant" && message.sourceLabel) {
    const meta = document.createElement("div");
    meta.className = "message-meta";
    meta.textContent = `Zrodlo odpowiedzi: ${message.sourceLabel}`;
    bubbleWrap.appendChild(meta);
  }

  if (message.role === "assistant") {
    const tools = document.createElement("div");
    tools.className = "message-tools";

    const speakButton = document.createElement("button");
    speakButton.type = "button";
    speakButton.textContent = "Czytaj";
    speakButton.addEventListener("click", () => speakText(message.content));
    tools.appendChild(speakButton);

    bubbleWrap.appendChild(tools);
    state.lastAssistantMessage = message.content;
  }

  article.appendChild(avatar);
  article.appendChild(bubbleWrap);
  return article;
}

function renderMessages() {
  messagesEl.innerHTML = "";

  if (!state.currentChat?.messages?.length) {
    messagesEl.innerHTML = '<article class="message assistant"><div class="avatar">AI</div><div class="bubble-wrap"><div class="bubble">Brak wiadomosci w tym watku.</div></div></article>';
    return;
  }

  state.currentChat.messages.forEach((message) => {
    messagesEl.appendChild(createMessageElement(message));
  });

  const lastAssistant = [...state.currentChat.messages]
    .reverse()
    .find((message) => message.role === "assistant");
  updateChatSourceBadge(lastAssistant?.sourceLabel || "brak");
  renderBuilderBoard();

  scrollToBottom();
}

function createBuilderItem(text, variant) {
  const article = document.createElement("article");
  article.className = `builder-item ${variant}`;
  article.textContent = text;
  return article;
}

function renderBuilderBoard() {
  if (!buildGoodList || !buildFixList || !builderStatus) {
    return;
  }

  buildGoodList.innerHTML = "";
  buildFixList.innerHTML = "";

  const assistantMessages = (state.currentChat?.messages || []).filter(
    (message) => message.role === "assistant"
  );

  const chunks = assistantMessages
    .flatMap((message) =>
      String(message.content || "")
        .split(/\n+/)
        .map((entry) => entry.replace(/^[-*\d.\s]+/, "").trim())
        .filter(Boolean)
    )
    .slice(-24);

  const fixPattern = /(blad|bledy|error|errors|bug|fix|napraw|problem|ryzyko|warning|ostrzez|missing|brakuje|nie dziala|fail)/i;
  const fixItems = chunks.filter((entry) => fixPattern.test(entry));
  const goodItems = chunks.filter((entry) => !fixPattern.test(entry));

  if (!chunks.length) {
    buildGoodList.appendChild(
      createBuilderItem("Brak jeszcze odpowiedzi technicznej do oceny.", "good")
    );
    buildFixList.appendChild(
      createBuilderItem("Po kolejnej odpowiedzi AI pojawia sie tu czerwone punkty do poprawy.", "fix")
    );
    builderStatus.textContent = "Brak analizy ostatniej odpowiedzi.";
    return;
  }

  (goodItems.length ? goodItems : ["Brak wyraznie oznaczonych gotowych elementow."]).forEach((entry) => {
    buildGoodList.appendChild(createBuilderItem(entry, "good"));
  });

  (fixItems.length ? fixItems : ["Brak wykrytych czerwonych flag w ostatnich odpowiedziach."]).forEach((entry) => {
    buildFixList.appendChild(createBuilderItem(entry, "fix"));
  });

  builderStatus.textContent = `Przeanalizowano ${chunks.length} fragmentow odpowiedzi AI.`;
}

function sortChats(chats) {
  return [...chats].sort(
    (left, right) => new Date(right.updatedAt) - new Date(left.updatedAt)
  );
}

function upsertChatSummary(summary) {
  state.chats = sortChats(
    state.chats.filter((chat) => chat.id !== summary.id).concat(summary)
  );
}

function renderChatHistory() {
  chatHistoryList.innerHTML = "";

  if (!state.chats.length) {
    chatHistoryList.innerHTML = '<div class="history-item">Brak zapisanych watkow.</div>';
    return;
  }

  state.chats.forEach((chat) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `history-item${chat.id === state.currentChatId ? " active" : ""}`;
    const title = document.createElement("strong");
    title.textContent = chat.title || "Nowa rozmowa";

    const time = document.createElement("small");
    time.textContent = new Date(chat.updatedAt).toLocaleString("pl-PL");

    button.appendChild(title);
    button.appendChild(time);
    button.addEventListener("click", () => {
      openChat(chat.id);
    });
    chatHistoryList.appendChild(button);
  });
}

function setCurrentChat(chat) {
  state.currentChat = chat;
  state.currentChatId = chat?.id || "";
  renderMessages();
  renderChatHistory();
}

async function createNewChat() {
  const data = await apiFetch("/api/chats", {
    method: "POST"
  });

  upsertChatSummary(data.summary);
  setCurrentChat(data.chat);
  switchScreen("chat");
  updateChatSourceBadge("brak");
  setStatus(statusEl, "Utworzono nowy watek.");
  input.focus();
}

async function loadChats() {
  const data = await apiFetch("/api/chats");
  state.chats = sortChats(data.chats || []);
  renderChatHistory();

  if (!state.chats.length) {
    await createNewChat();
    return;
  }

  const targetChatId = state.currentChatId || state.chats[0].id;
  await openChat(targetChatId);
}

async function openChat(chatId) {
  const data = await apiFetch(`/api/chats/${chatId}`);
  setCurrentChat(data.chat);
}

async function sendMessage(options = {}) {
  const text = String(options.textOverride ?? input.value).trim();
  if (!text) {
    return;
  }

  const localVoiceCommand = detectLocalVoiceCommand(text);
  if (isLiveVoiceEnabled() && await handleLocalVoiceCommand(localVoiceCommand)) {
    input.value = "";
    autoResize(input);
    syncLiveVoiceUi();
    return;
  }

  const slashCommand = parseSlashCommand(text);
  if (await handleSlashCommand(slashCommand)) {
    input.value = "";
    autoResize(input);
    input.focus();
    return;
  }

  const imageIntentPayload = detectImageIntent(text);
  if (imageIntentPayload) {
    setStatus(statusEl, "Wykryto prosbe o obraz. Uruchamiam generator obrazu...");
    await handleSlashCommand({
      command: "image",
      payload: imageIntentPayload
    });
    input.value = "";
    autoResize(input);
    input.focus();
    return;
  }

  if (!state.currentChatId) {
    await createNewChat();
  }

  setBusy(true);
  setStatus(statusEl, "AI przygotowuje odpowiedz...");

  try {
    const data = await apiFetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        chatId: state.currentChatId,
        message: text,
        mode: options.modeOverride || chatModeSelect.value,
        liveCategory: liveCategorySelect.value
      })
    });
    state.models.chat = data.model || state.models.chat;
    updateModelsUi();
    input.value = "";
    autoResize(input);
    setCurrentChat(data.chat);
    upsertChatSummary(data.summary);
    renderChatHistory();
    updateChatSourceBadge(data.sourceLabel || data.model || "brak");
    setStatus(statusEl, `Odpowiedz gotowa. Zrodlo: ${data.sourceLabel || data.model || "nieznane"}.`);

    if (isAutoSpeakEnabled()) {
      speakText(data.reply, statusEl, {
        resumeLiveListening: isLiveVoiceEnabled()
      });
    } else if (isLiveVoiceEnabled()) {
      scheduleLiveListening("Live voice: odpowiedz gotowa, znowu slucham.");
    }
  } catch (error) {
    setStatus(statusEl, error.message);
    if (error.message.toLowerCase().includes("zaloguj")) {
      await handleLogout();
    }
  } finally {
    setBusy(false);
    input.focus();
  }
}

function renderLiveNews(items = []) {
  liveNewsList.innerHTML = "";

  if (!items.length) {
    liveNewsList.innerHTML = '<article class="source-card">Brak aktualnych naglowkow dla tej kategorii.</article>';
    return;
  }

  items.forEach((item) => {
    const article = document.createElement("article");
    article.className = "source-card live-card";

    const title = document.createElement("strong");
    title.textContent = item.title || "Naglowek";

    const meta = document.createElement("span");
    meta.textContent = [item.source, item.pubDate].filter(Boolean).join(" | ");

    const description = document.createElement("p");
    description.textContent = item.description || "Brak opisu.";

    const actions = document.createElement("div");
    actions.className = "hub-actions";

    if (item.link) {
      const link = document.createElement("a");
      link.className = "audio-button ghost";
      link.href = item.link;
      link.target = "_blank";
      link.rel = "noreferrer noopener";
      link.textContent = "Otworz zrodlo";
      actions.appendChild(link);
    }

    const analyze = document.createElement("button");
    analyze.type = "button";
    analyze.className = "suggestion-chip";
    analyze.textContent = "Omow w chacie";
    analyze.addEventListener("click", () => {
      fillChatWithPrompt(
        `Przeanalizuj to aktualne wydarzenie i oddziel fakty od wnioskow: ${item.title}${item.description ? ` - ${item.description}` : ""}`,
        "live"
      );
      if (item.link) {
        window.open(item.link, "_blank", "noopener,noreferrer");
      }
    });
    actions.appendChild(analyze);

    article.appendChild(title);
    if (meta.textContent) {
      article.appendChild(meta);
    }
    article.appendChild(description);
    article.appendChild(actions);
    liveNewsList.appendChild(article);
  });
}

async function loadLiveNews(category = liveNewsCategory.value) {
  setStatus(liveNewsStatus, "Pobieram live news...");

  try {
    const data = await apiFetch(`/api/live/news?category=${encodeURIComponent(category)}`);
    state.liveNews = data.items || [];
    if (liveCategorySelect) {
      liveCategorySelect.value = data.category || category;
    }
    if (liveNewsCategory) {
      liveNewsCategory.value = data.category || category;
    }
    renderLiveNews(state.liveNews);
    setStatus(
      liveNewsStatus,
      `Pobrano ${state.liveNews.length} naglowkow. Kategoria: ${data.category || category}.`
    );
  } catch (error) {
    setStatus(liveNewsStatus, error.message);
    renderLiveNews([]);
  }
}

function buildSettingsPayload(overrides = {}) {
  const resolvedLiveVoiceMode = typeof overrides.liveVoiceMode === "boolean"
    ? overrides.liveVoiceMode
    : liveVoiceMode.checked;
  const resolvedVoiceCloneConsent = typeof overrides.voiceCloneConsent === "boolean"
    ? overrides.voiceCloneConsent
    : Boolean(settingsVoiceConsentSetting?.checked ?? voiceConsentSetting.checked);

  return {
    customPrompt: customPrompt.value.trim(),
    preferredTone: preferredTone.value,
    trustMode: trustMode.value,
    expertMode: expertMode.value,
    emotionalPresence: emotionalPresence.value,
    boundaryStyle: boundaryStyle.value,
    conciseMode: conciseMode.checked,
    askClarifyingQuestions: askClarifyingQuestions.checked,
    challengeWrongClaims: challengeWrongClaims.checked,
    autoFixMode: autoFixMode.checked,
    liveVoiceMode: resolvedLiveVoiceMode,
    autoSpeakResponses: resolvedLiveVoiceMode ? true : autoSpeakResponses.checked,
    voiceCloneConsent: resolvedVoiceCloneConsent,
    ...overrides
  };
}

async function saveSettings(payload, statusElement, successMessage) {
  const data = await apiFetch("/api/settings", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  state.user = data.user;
  updateUserUi();
  setStatus(statusElement, successMessage);
}

function renderImageResult(result, promptText) {
  const card = document.createElement("article");
  card.className = "media-card";

  const image = document.createElement("img");
  image.src = result.imageDataUrl;
  image.alt = promptText;

  const title = document.createElement("strong");
  title.textContent = "Nowy render";

  const description = document.createElement("p");
  description.textContent = `${result.model} | ${result.size} | ${result.quality}`;

  const interpretation = document.createElement("p");
  interpretation.textContent = `Jak Nexus to widzi: ${promptText}`;

  const downloadLink = document.createElement("a");
  downloadLink.className = "audio-button";
  downloadLink.href = result.imageDataUrl;
  downloadLink.download = "nexus-informator-image.png";
  downloadLink.textContent = "Pobierz PNG";

  card.appendChild(image);
  card.appendChild(title);
  card.appendChild(description);
  card.appendChild(interpretation);
  card.appendChild(downloadLink);

  imageResults.prepend(card);
}

function isVideoReady(status) {
  return ["completed", "succeeded", "ready", "done"].includes(
    String(status || "").toLowerCase()
  );
}

function renderVideoJobs() {
  videoJobs.innerHTML = "";

  if (!state.videoJobs.length) {
    videoJobs.innerHTML = '<article class="video-job">Brak jobow wideo.</article>';
    return;
  }

  state.videoJobs.forEach((job) => {
    const article = document.createElement("article");
    article.className = "video-job";

    const title = document.createElement("strong");
    title.textContent = job.prompt;

    const meta = document.createElement("div");
    meta.className = "video-meta";

    [
      job.model || state.models.video,
      `${job.seconds || "?"} s`,
      job.size || "?",
      `Status: ${job.status || "unknown"}`,
      typeof job.progress === "number" ? `Postep: ${job.progress}%` : ""
    ]
      .filter(Boolean)
      .forEach((item) => {
        const span = document.createElement("span");
        span.textContent = item;
        meta.appendChild(span);
      });

    const actions = document.createElement("div");
    actions.className = "video-actions";

    const refreshButton = document.createElement("button");
    refreshButton.className = "ghost-button";
    refreshButton.type = "button";
    refreshButton.textContent = "Odswiez";
    refreshButton.addEventListener("click", async () => {
      await fetchVideoStatus(job.id);
    });
    actions.appendChild(refreshButton);

    if (isVideoReady(job.status)) {
      const downloadLink = document.createElement("a");
      downloadLink.className = "primary-link";
      downloadLink.href = `/api/media/video/${job.id}/content`;
      downloadLink.textContent = "Pobierz MP4";
      actions.appendChild(downloadLink);
    }

    article.appendChild(title);
    article.appendChild(meta);
    article.appendChild(actions);
    videoJobs.appendChild(article);
  });
}

function renderWorkbenchFilePreview() {
  workbenchFileList.innerHTML = "";

  if (!workbenchFiles.files.length) {
    workbenchFileList.innerHTML = '<div class="history-item">Brak dodanych plikow.</div>';
    return;
  }

  Array.from(workbenchFiles.files).forEach((file) => {
    const pill = document.createElement("div");
    pill.className = "file-pill";
    pill.textContent = `${file.name} | ${(file.size / 1024 / 1024).toFixed(2)} MB`;
    workbenchFileList.appendChild(pill);
  });
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error(`Nie udalo sie odczytac pliku ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

async function serializeWorkbenchFiles() {
  const files = Array.from(workbenchFiles.files || []);
  return Promise.all(
    files.map(async (file) => ({
      name: file.name,
      type: file.type,
      size: file.size,
      data: await fileToDataUrl(file)
    }))
  );
}

function parseWorkbenchLinks() {
  return workbenchLinks.value
    .split(/\n+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function renderWorkbenchSources(sources = []) {
  workbenchSources.innerHTML = "";

  if (!sources.length) {
    return;
  }

  sources.forEach((source) => {
    const article = document.createElement("article");
    article.className = "source-card";

    const title = document.createElement("strong");
    title.textContent = source.title || source.url || source.kind || "Zrodlo";

    const meta = document.createElement("span");
    meta.textContent = [source.kind, source.url].filter(Boolean).join(" | ");

    const excerpt = document.createElement("p");
    excerpt.textContent = source.excerpt || "Brak podgladu tresci.";

    article.appendChild(title);
    if (meta.textContent) {
      article.appendChild(meta);
    }
    article.appendChild(excerpt);
    workbenchSources.appendChild(article);
  });
}

function renderBlockedFindings(findings = []) {
  findings.forEach((finding) => {
    const article = document.createElement("article");
    article.className = "source-card";

    const title = document.createElement("strong");
    title.textContent = `Zablokowany plik: ${finding.fileName}`;

    const meta = document.createElement("span");
    meta.textContent = `Status: ${finding.status} | Poziom: ${finding.severity}`;

    const excerpt = document.createElement("p");
    excerpt.textContent = `${finding.reason} Sygaly: ${(finding.signals || []).join(", ") || "brak"}`;

    article.appendChild(title);
    article.appendChild(meta);
    article.appendChild(excerpt);
    workbenchSources.appendChild(article);
  });
}

function renderWorkbenchResultCard(data) {
  workbenchResult.innerHTML = "";
  workbenchResult.classList.remove("hidden");

  const title = document.createElement("h3");
  title.textContent = "Wynik narzedzi";

  const meta = document.createElement("p");
  meta.className = "status";
  meta.textContent = `${data.taskType} | ${data.expertMode} | ${data.model}`;

  const content = document.createElement("div");
  content.className = "result-body";
  content.textContent = data.reply || "";

  workbenchResult.appendChild(title);
  workbenchResult.appendChild(meta);
  workbenchResult.appendChild(content);
}

async function handleWorkbenchSubmit(event) {
  event.preventDefault();
  setStatus(workbenchStatus, "Analizuje materialy i uruchamiam narzedzia...");
  workbenchResult.classList.add("hidden");

  try {
    const files = await serializeWorkbenchFiles();
    const data = await apiFetch("/api/workbench/run", {
      method: "POST",
      body: JSON.stringify({
        prompt: workbenchPrompt.value.trim(),
        taskType: workbenchTaskType.value,
        expertMode: workbenchExpertMode.value,
        links: parseWorkbenchLinks(),
        files,
        saveToChat: workbenchSaveToChat.checked,
        chatId: state.currentChatId || ""
      })
    });

    renderWorkbenchSources(data.sources || []);
    renderBlockedFindings(data.blockedFindings || []);
    renderWorkbenchResultCard(data);
    setStatus(
      workbenchStatus,
      data.blockedFindings?.length
        ? `Analiza gotowa. Zablokowano ${data.blockedFindings.length} podejrzanych plikow i zapisano incydent.`
        : "Analiza gotowa."
    );

    if (data.chat && data.summary) {
      upsertChatSummary(data.summary);
      setCurrentChat(data.chat);
      renderChatHistory();
    }
  } catch (error) {
    setStatus(workbenchStatus, error.message);
  }
}

function buildIntegrationPermissions() {
  return [
    integrationPermissionRead.checked ? "read" : "",
    integrationPermissionWrite.checked ? "write" : "",
    integrationPermissionDelete.checked ? "delete" : ""
  ].filter(Boolean);
}

function findIntegration(service) {
  return state.integrations.find((entry) => entry.service === service) || null;
}

function syncIntegrationForm() {
  const integration = findIntegration(integrationService.value);
  integrationAccountLabel.value = integration?.accountLabel || "";
  integrationNotes.value = integration?.notes || "";
  integrationEnabled.checked = integration ? integration.enabled !== false : true;
  integrationPermissionRead.checked = integration
    ? integration.permissions.includes("read")
    : true;
  integrationPermissionWrite.checked = integration
    ? integration.permissions.includes("write")
    : false;
  integrationPermissionDelete.checked = integration
    ? integration.permissions.includes("delete")
    : false;
  integrationSecret.value = "";
  setStatus(
    integrationStatus,
    integration?.hasSecret
      ? `Sekret dla ${integration.service} jest juz zapisany po stronie backendu.`
      : ""
  );
}

function renderIntegrations() {
  integrationList.innerHTML = "";

  if (!state.integrations.length) {
    integrationList.innerHTML = '<article class="source-card">Brak zapisanych integracji.</article>';
    return;
  }

  state.integrations.forEach((integration) => {
    const article = document.createElement("article");
    article.className = "source-card";

    const title = document.createElement("strong");
    title.textContent = integration.service;

    const meta = document.createElement("span");
    meta.textContent = [
      integration.enabled ? "aktywna" : "wylaczona",
      integration.accountLabel || "",
      integration.maskedSecret ? `sekret: ${integration.maskedSecret}` : "bez sekretu"
    ]
      .filter(Boolean)
      .join(" | ");

    const description = document.createElement("p");
    description.textContent = [
      integration.permissions?.length
        ? `Uprawnienia: ${integration.permissions.join(", ")}.`
        : "Brak uprawnien.",
      integration.notes || ""
    ]
      .filter(Boolean)
      .join(" ");

    article.appendChild(title);
    article.appendChild(meta);
    article.appendChild(description);
    integrationList.appendChild(article);
  });
}

function renderGmailInbox(messages = []) {
  gmailInboxList.innerHTML = "";

  if (!messages.length) {
    gmailInboxList.innerHTML = '<article class="source-card">Brak wiadomosci albo brak dostepu do inbox.</article>';
    return;
  }

  messages.forEach((message) => {
    const article = document.createElement("article");
    article.className = "source-card";

    const title = document.createElement("strong");
    title.textContent = message.subject || "Bez tematu";

    const meta = document.createElement("span");
    meta.textContent = [message.from, message.date].filter(Boolean).join(" | ");

    const snippet = document.createElement("p");
    snippet.textContent = message.snippet || "Brak podgladu.";

    article.appendChild(title);
    if (meta.textContent) {
      article.appendChild(meta);
    }
    article.appendChild(snippet);
    gmailInboxList.appendChild(article);
  });
}

function renderGmailOauthMeta(statusData) {
  if (!gmailOauthMeta) {
    return;
  }

  if (!statusData) {
    gmailOauthMeta.innerHTML = "Brak danych o Gmail OAuth.";
    return;
  }

  gmailOauthMeta.innerHTML = [
    `<strong>Status OAuth</strong>`,
    `<span>${statusData.connected ? "polaczony" : "niepolaczony"} | ${statusData.available ? "credentials OK" : "brak credentials"}</span>`,
    `<p>${statusData.connected
      ? `Konto Gmail: ${statusData.email || "podlaczone przez OAuth"}. Inbox i wysylka korzystaja z tokenow Google po stronie serwera.`
      : statusData.available
        ? "Mozesz uruchomic pelne laczenie Gmail przez Google OAuth bez recznego wklejania tokenu."
        : "Aby uruchomic Gmail OAuth, uzupelnij GOOGLE_CLIENT_ID i GOOGLE_CLIENT_SECRET w konfiguracji serwera."}</p>`
  ].join("");
}

function renderAlibabaStatus(statusData) {
  if (!alibabaStatusMeta) {
    return;
  }

  if (!statusData) {
    alibabaStatusMeta.innerHTML = "Brak danych o Alibaba Cloud.";
    return;
  }

  alibabaStatusMeta.innerHTML = [
    `<strong>Status Alibaba Cloud</strong>`,
    `<span>${statusData.configured ? "skonfigurowany" : "niekompletny"} | access key: ${statusData.accessKeyId || "brak"}</span>`,
    `<p>${statusData.summary}</p>`,
    `<p>Region: ${statusData.region || "brak"} | Bucket OSS: ${statusData.ossBucket || "brak"} | Endpoint: ${statusData.ossEndpoint || "brak"}</p>`
  ].join("");
}

async function loadAlibabaStatus() {
  if (!alibabaStatusMeta) {
    return null;
  }

  setStatus(alibabaStatus, "Sprawdzam konfiguracje Alibaba Cloud...");

  try {
    const data = await apiFetch("/api/integrations/alibaba/status");
    renderAlibabaStatus(data);
    setStatus(alibabaStatus, data.summary);
    return data;
  } catch (error) {
    renderAlibabaStatus(null);
    setStatus(alibabaStatus, error.message);
    return null;
  }
}

async function loadGmailOauthStatus() {
  try {
    const data = await apiFetch("/api/integrations/gmail/oauth/status");
    renderGmailOauthMeta(data);
    gmailOauthConnectBtn.disabled = !data.available;
    gmailOauthDisconnectBtn.disabled = !data.connected;
    return data;
  } catch (error) {
    renderGmailOauthMeta(null);
    gmailOauthConnectBtn.disabled = true;
    gmailOauthDisconnectBtn.disabled = true;
    setStatus(gmailOauthStatus, error.message);
    return null;
  }
}

async function loadIntegrations() {
  try {
    const data = await apiFetch("/api/integrations");
    state.integrations = data.integrations || [];
    renderIntegrations();
    renderGmailInbox([]);
    syncIntegrationForm();
    await loadAlibabaStatus();
    await loadGmailOauthStatus();
  } catch (error) {
    setStatus(integrationStatus, error.message);
  }
}

async function loadGmailInbox() {
  setStatus(gmailStatus, "Pobieram skrzynke Gmail...");

  try {
    const data = await apiFetch("/api/integrations/gmail/inbox");
    renderGmailInbox(data.messages || []);
    setStatus(gmailStatus, `Pobrano ${data.messages?.length || 0} wiadomosci Gmail.`);
  } catch (error) {
    renderGmailInbox([]);
    setStatus(gmailStatus, error.message);
  }
}

async function handleGmailSend(event) {
  event.preventDefault();
  setStatus(gmailStatus, "Wysylam wiadomosc przez Gmail...");

  try {
    await apiFetch("/api/integrations/gmail/send", {
      method: "POST",
      body: JSON.stringify({
        to: gmailTo.value.trim(),
        subject: gmailSubject.value.trim(),
        text: gmailBody.value.trim()
      })
    });

    gmailSendForm.reset();
    setStatus(gmailStatus, "Mail zostal wyslany przez Gmail.");
    await loadGmailInbox();
  } catch (error) {
    setStatus(gmailStatus, error.message);
  }
}

async function handleGmailOauthConnect() {
  setStatus(gmailOauthStatus, "Przygotowuje przekierowanie do Google OAuth...");

  try {
    const data = await apiFetch("/api/integrations/gmail/oauth/start");
    window.location.href = data.authorizationUrl;
  } catch (error) {
    setStatus(gmailOauthStatus, error.message);
  }
}

async function handleGmailOauthDisconnect() {
  setStatus(gmailOauthStatus, "Odlaczam Gmail OAuth...");

  try {
    const data = await apiFetch("/api/integrations/gmail/oauth/disconnect", {
      method: "POST"
    });
    state.integrations = data.integrations || state.integrations;
    renderIntegrations();
    renderGmailInbox([]);
    await loadGmailOauthStatus();
    setStatus(gmailOauthStatus, "Polaczenie Gmail OAuth zostalo odlaczone.");
  } catch (error) {
    setStatus(gmailOauthStatus, error.message);
  }
}

async function handleIntegrationSave(event) {
  event.preventDefault();
  setStatus(integrationStatus, "Zapisuje integracje i szyfruje sekret...");

  try {
    const data = await apiFetch("/api/integrations", {
      method: "POST",
      body: JSON.stringify({
        service: integrationService.value,
        accountLabel: integrationAccountLabel.value.trim(),
        notes: integrationNotes.value.trim(),
        secret: integrationSecret.value.trim(),
        enabled: integrationEnabled.checked,
        permissions: buildIntegrationPermissions()
      })
    });

    state.integrations = data.integrations || [];
    if (data.user) {
      state.user = data.user;
      updateUserUi();
    }
    integrationSecret.value = "";
    renderIntegrations();
    syncIntegrationForm();
    setStatus(integrationStatus, "Integracja zapisana.");
  } catch (error) {
    setStatus(integrationStatus, error.message);
  }
}

async function handleIntegrationSecretClear() {
  setStatus(integrationStatus, "Usuwam zapisany sekret...");

  try {
    const data = await apiFetch("/api/integrations", {
      method: "POST",
      body: JSON.stringify({
        service: integrationService.value,
        accountLabel: integrationAccountLabel.value.trim(),
        notes: integrationNotes.value.trim(),
        enabled: integrationEnabled.checked,
        permissions: buildIntegrationPermissions(),
        clearSecret: true
      })
    });

    state.integrations = data.integrations || [];
    integrationSecret.value = "";
    renderIntegrations();
    syncIntegrationForm();
    setStatus(integrationStatus, "Sekret usuniety.");
  } catch (error) {
    setStatus(integrationStatus, error.message);
  }
}

function renderAdminOverview(data) {
  adminSummary.innerHTML = "";
  [
    ["Uzytkownicy", data.summary.users],
    ["Administratorzy", data.summary.admins],
    ["Rozmowy", data.summary.chats],
    ["Wideo", data.summary.videoJobs],
    ["Incydenty", data.summary.incidents || 0],
    ["Storage", data.summary.storageDriver || "json"],
    ["Ostatni log", data.summary.lastAuditEvent || "brak"]
  ].forEach(([label, value]) => {
    const article = document.createElement("article");
    const strong = document.createElement("strong");
    strong.textContent = label;
    const span = document.createElement("span");
    span.textContent = String(value);
    article.appendChild(strong);
    article.appendChild(span);
    adminSummary.appendChild(article);
  });

  adminUsersTableBody.innerHTML = "";
  data.users.forEach((user) => {
    const row = document.createElement("tr");
    [
      user.role,
      user.username || "-",
      user.email,
      user.profile?.address || "-",
      user.profile?.birthDate || "-",
      user.integrationCount ?? 0,
      user.lastKnownIp || "-",
      user.lastChatAt || "-"
    ].forEach((value) => {
      const td = document.createElement("td");
      td.textContent = value;
      row.appendChild(td);
    });
    adminUsersTableBody.appendChild(row);
  });

  auditLogList.innerHTML = "";
  if (!(data.audit || []).length) {
    auditLogList.innerHTML = '<article class="audit-item">Brak logow audytowych.</article>';
  }
  (data.audit || []).forEach((entry) => {
    const article = document.createElement("article");
    article.className = "audit-item";

    const strong = document.createElement("strong");
    strong.textContent = `${entry.event} | ${entry.timestamp}`;

    const details = document.createElement("div");
    details.textContent = `${entry.ip} | ${JSON.stringify(entry.details || {})}`;

    article.appendChild(strong);
    article.appendChild(details);
    auditLogList.appendChild(article);
  });

  incidentLogList.innerHTML = "";
  if (!(data.incidents || []).length) {
    incidentLogList.innerHTML = '<article class="audit-item">Brak incydentow plikow.</article>';
  }
  (data.incidents || []).forEach((entry) => {
    const article = document.createElement("article");
    article.className = "audit-item";

    const strong = document.createElement("strong");
    strong.textContent = `${entry.type} | ${entry.timestamp}`;

    const details = document.createElement("div");
    details.textContent = `${entry.ip} | ${JSON.stringify(entry.details || {})}`;

    article.appendChild(strong);
    article.appendChild(details);
    incidentLogList.appendChild(article);
  });
}

async function loadAdminOverview() {
  if (state.user?.role !== "admin") {
    return;
  }

  setStatus(adminStatus, "Laduje panel administratora...");

  try {
    const data = await apiFetch("/api/admin/overview");
    renderAdminOverview(data);
    setStatus(adminStatus, "Panel administratora odswiezony.");
  } catch (error) {
    setStatus(adminStatus, error.message);
  }
}

function switchScreen(screen) {
  if (screen === "admin" && state.user?.role !== "admin") {
    return;
  }

  if (!validScreens.has(screen)) {
    screen = "chat";
  }

  state.currentScreen = screen;
  updateScreenHash(screen);

  sidebarScreenButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.screen === screen);
  });

  Object.entries(allPanels).forEach(([name, panel]) => {
    panel.classList.toggle("active", name === screen);
  });

  const activePanel = allPanels[screen];
  if (activePanel) {
    activePanel.classList.remove("screen-transition-enter");
    void activePanel.offsetWidth;
    activePanel.classList.add("screen-transition-enter");
  }

  if (screen === "admin") {
    loadAdminOverview();
  }

  if (screen === "integrations") {
    loadIntegrations();
  }

  if (screen === "live") {
    loadLiveNews();
  }

  if (screen === "code") {
    renderBuilderBoard();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });

  if (window.innerWidth <= MOBILE_BREAKPOINT) {
    closeSidebar();
  }
}

function initSpeechRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    voiceInputBtn.disabled = true;
    voiceInputBtn.textContent = "Brak dyktafonu";
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "pl-PL";
  recognition.interimResults = true;
  recognition.continuous = false;

  recognition.onstart = () => {
    state.isListening = true;
    voiceInputBtn.textContent = "Zatrzymaj dyktafon";
    updateLiveVoiceState("listening", isLiveVoiceEnabled() ? "Asystent nasluchuje mikrofonu." : "Dyktafon aktywny.");
    setStatus(statusEl, isLiveVoiceEnabled() ? "Live voice: slucham..." : "Slucham...");
  };

  recognition.onend = () => {
    state.isListening = false;
    voiceInputBtn.textContent = "Start dyktafonu";
    syncLiveVoiceUi();

    if (isLiveVoiceEnabled() && !state.liveVoicePaused && !state.isBusy && !state.isSpeaking) {
      scheduleLiveListening("Live voice: slucham dalej.");
    }
  };

  recognition.onresult = (event) => {
    let transcript = "";
    for (const result of event.results) {
      transcript += result[0].transcript;
    }
    input.value = transcript.trim();
    autoResize(input);

    const lastResult = event.results[event.results.length - 1];
    if (isLiveVoiceEnabled() && lastResult?.isFinal) {
      void (async () => {
        const command = detectLocalVoiceCommand(transcript.trim());
        if (await handleLocalVoiceCommand(command)) {
          syncLiveVoiceUi();
          input.value = "";
          autoResize(input);
          return;
        }

        state.liveVoicePaused = false;
        await sendMessage({ textOverride: transcript.trim() });
      })();
    }
  };

  recognition.onerror = () => {
    state.isListening = false;
    voiceInputBtn.textContent = "Start dyktafonu";
    updateLiveVoiceState("paused", "Mikrofon nie wystartowal. Mozesz kliknac Start dyktafonu lub sprawdzic uprawnienia.");
    setStatus(
      statusEl,
      isLiveVoiceEnabled()
        ? "Live voice nie mogl uruchomic mikrofonu. Kliknij Start dyktafonu albo sprawdz uprawnienia przegladarki."
        : "Nie udalo sie uruchomic dyktafonu."
    );
  };

  state.recognition = recognition;
}

function toggleDictation() {
  if (!state.recognition) {
    return;
  }

  if (state.isListening) {
    state.recognition.stop();
    return;
  }

  state.recognition.start();
}

async function toggleLiveVoiceMode(forceValue) {
  const nextValue = typeof forceValue === "boolean" ? forceValue : !isLiveVoiceEnabled();
  setStatus(statusEl, nextValue ? "Wlaczam tryb live voice..." : "Wylaczam tryb live voice...");

  try {
    await saveSettings(
      buildSettingsPayload({
        liveVoiceMode: nextValue,
        autoSpeakResponses: autoSpeakResponses.checked
      }),
      settingsStatus,
      nextValue ? "Tryb live voice zapisany i aktywny." : "Tryb live voice wylaczony."
    );

    if (nextValue) {
      state.liveVoicePaused = false;
      syncLiveVoiceUi();
      switchScreen("chat");
      const lastAssistant = [...(state.currentChat?.messages || [])]
        .reverse()
        .find((message) => message.role === "assistant" && String(message.content || "").trim());

      if (lastAssistant && isAutoSpeakEnabled()) {
        speakText(lastAssistant.content, statusEl, {
          resumeLiveListening: true
        });
      } else {
        scheduleLiveListening("Live voice: slucham od razu po wlaczeniu.");
      }
    } else {
      state.liveVoicePaused = false;
      clearLiveVoiceRestartTimer();
      stopAudio();
      if (state.recognition && state.isListening) {
        state.recognition.stop();
      }
      syncLiveVoiceUi();
      setStatus(statusEl, "Tryb live voice jest wylaczony.");
    }
  } catch (error) {
    setStatus(statusEl, error.message);
    syncLiveVoiceUi();
  }
}

function togglePasswordVisibility(inputElement, buttonElement) {
  const nextType = inputElement.type === "password" ? "text" : "password";
  inputElement.type = nextType;
  buttonElement.textContent = nextType === "password" ? "Pokaz" : "Ukryj";
}

async function suggestAccountData() {
  setFormMessage(registerMessage, "Losuje login i haslo...", "");

  try {
    const data = await apiFetch("/api/account/suggest", {
      method: "POST",
      body: JSON.stringify({
        firstName: registerFirstName.value.trim(),
        lastName: registerLastName.value.trim()
      })
    });

    registerUsername.value = data.username;
    registerPassword.value = data.password;
    setFormMessage(registerMessage, "Wygenerowano login i haslo.", "success");
  } catch (error) {
    setFormMessage(registerMessage, error.message, "error");
  }
}

async function handleRegister(event) {
  event.preventDefault();
  setFormMessage(registerMessage, "Tworzymy konto i kopie zapasowa...", "");

  const payload = {
    firstName: registerFirstName.value.trim(),
    lastName: registerLastName.value.trim(),
    displayName: registerDisplayName.value.trim(),
    birthDate: registerBirthDate.value,
    address: registerAddress.value.trim(),
    email: registerEmail.value.trim(),
    username: registerUsername.value.trim(),
    password: registerPassword.value,
    consents: {
      termsAccepted: termsConsent.checked,
      privacyAccepted: privacyConsent.checked,
      rodoAccepted: rodoConsent.checked,
      marketingAccepted: marketingConsent.checked,
      audioUsed: audioConsent.checked,
      voiceCloneConsent: voiceCloneConsent.checked
    }
  };

  try {
    const data = await apiFetch("/api/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    setToken(data.token);
    registerForm.reset();
    setFormMessage(registerMessage, "Konto utworzone. Laduje sie studio.", "success");
    startLoaderThenOpen(data.user, state.models, state.contact);
  } catch (error) {
    setFormMessage(registerMessage, error.message, "error");
  }
}

async function handleLogin(event) {
  event.preventDefault();
  setFormMessage(loginMessage, "Logujemy do panelu...", "");

  try {
    const data = await apiFetch("/api/login", {
      method: "POST",
      body: JSON.stringify({
        identifier: loginIdentifier.value.trim(),
        password: loginPassword.value
      })
    });

    setToken(data.token);
    loginForm.reset();
    setFormMessage(loginMessage, "Logowanie udane. Startujemy panel.", "success");
    startLoaderThenOpen(data.user, state.models, state.contact);
  } catch (error) {
    setFormMessage(loginMessage, error.message, "error");
  }
}

async function handleLogout() {
  try {
    if (state.token) {
      await apiFetch("/api/logout", {
        method: "POST"
      });
    }
  } catch {
    // local cleanup still matters
  } finally {
    clearLiveVoiceRestartTimer();
    stopAudio();
    if (state.recognition && state.isListening) {
      state.recognition.stop();
    }
    setToken("");
    state.user = null;
    state.contact = null;
    state.chats = [];
    state.currentChat = null;
    state.currentChatId = "";
    state.videoJobs = [];
    state.integrations = [];
    state.lastAssistantMessage = "";
    syncHeaderLaunch();
    showMarketing();
    renderChatHistory();
    setFormMessage(loginMessage, "Zostales wylogowany.", "success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

async function restoreSession() {
  if (!state.token) {
    syncHeaderLaunch();
    showMarketing();
    return;
  }

  try {
    const data = await apiFetch("/api/me");
    state.contact = data.contact;
    openApp(data.user, data.models, data.contact);
  } catch {
    setToken("");
    state.user = null;
    syncHeaderLaunch();
    showMarketing();
  }
}

async function openApp(user, models = state.models, contact = state.contact) {
  state.user = user;
  state.models = { ...state.models, ...models };
  state.contact = contact || state.contact;

  syncHeaderLaunch();
  updateUserUi();
  showChatApp();
  switchScreen(getRequestedScreenFromHash() || "chat");
  await loadChats();
  await loadIntegrations();
  await fetchVideoJobs();
  if (state.user?.role === "admin") {
    await loadAdminOverview();
  }

  const currentUrl = new URL(window.location.href);
  const gmailOauthResult = currentUrl.searchParams.get("gmail_oauth");
  if (gmailOauthResult) {
    switchScreen("integrations");
    if (gmailOauthResult === "success") {
      setStatus(gmailOauthStatus, "Gmail OAuth zostal polaczony. Mozesz pobrac inbox i wysylac wiadomosci.");
      await loadGmailOauthStatus();
      await loadGmailInbox();
    } else {
      setStatus(gmailOauthStatus, "Autoryzacja Gmail nie zostala zakonczona. Sprobuj ponownie.");
    }
    currentUrl.searchParams.delete("gmail_oauth");
    const nextUrl = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;
    window.history.replaceState({}, "", nextUrl);
  }

  syncLiveVoiceUi();

  if (isLiveVoiceEnabled()) {
    const welcomeMessage = [...(state.currentChat?.messages || [])]
      .reverse()
      .find((message) => message.role === "assistant" && String(message.content || "").trim());

    if (welcomeMessage && isAutoSpeakEnabled()) {
      speakText(welcomeMessage.content, statusEl, {
        resumeLiveListening: true
      });
    } else {
      scheduleLiveListening("Live voice aktywny po zalogowaniu. Slucham.");
    }
  }
}

async function handleImageGeneration(event) {
  event.preventDefault();
  setStatus(imageStatus, "Generowanie obrazu...");

  try {
    const data = await apiFetch("/api/media/image", {
      method: "POST",
      body: JSON.stringify({
        prompt: imagePrompt.value.trim(),
        size: imageSize.value,
        quality: imageQuality.value
      })
    });

    state.models.image = data.model || state.models.image;
    updateModelsUi();
    renderImageResult(data, imagePrompt.value.trim());
    setStatus(imageStatus, "Obraz gotowy.");
  } catch (error) {
    setStatus(imageStatus, error.message);
  }
}

async function handleVideoCreate(event) {
  event.preventDefault();
  setStatus(
    videoStatus,
    "Generowanie wideo jest chwilowo wylaczone. Do tej funkcji trzeba najpierw podpiac osobne API."
  );
}

async function fetchVideoJobs() {
  try {
    const data = await apiFetch("/api/media/videos");
    state.videoJobs = data.jobs || [];
    renderVideoJobs();
  } catch (error) {
    setStatus(videoStatus, error.message);
  }
}

async function fetchVideoStatus(id) {
  try {
    const data = await apiFetch(`/api/media/video/${id}`);
    state.videoJobs = state.videoJobs.map((job) =>
      job.id === id ? data.job : job
    );
    renderVideoJobs();
  } catch (error) {
    setStatus(videoStatus, error.message);
  }
}

async function handleSettingsSave(event) {
  event.preventDefault();
  setStatus(settingsStatus, "Zapisuje ustawienia AI...");

  try {
    await saveSettings(buildSettingsPayload(), settingsStatus, "Ustawienia AI zapisane.");
  } catch (error) {
    setStatus(settingsStatus, error.message);
  }
}

async function handleVoiceConsentSave() {
  setStatus(voiceStatus, "Zapisuje ustawienie glosu...");

  try {
    await saveSettings(
      buildSettingsPayload({ voiceCloneConsent: voiceConsentSetting.checked }),
      voiceStatus,
      "Zgoda glosowa zapisana."
    );
  } catch (error) {
    setStatus(voiceStatus, error.message);
  }
}

async function handleLiveVoiceToggle() {
  const nextValue = !isLiveVoiceEnabled() || state.liveVoicePaused;
  liveVoiceMode.checked = nextValue;
  if (nextValue) {
    autoSpeakResponses.checked = true;
  }
  await toggleLiveVoiceMode(nextValue);
}

function fillChatWithPrompt(text, mode = "general") {
  chatModeSelect.value = mode;
  setModeBadge();
  switchScreen("chat");
  input.value = text;
  autoResize(input);
  input.focus();
}

function animateCounters(element) {
  if (!element || !('IntersectionObserver' in window)) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add('in-view');
        const counters = entry.target.querySelectorAll('.counter');
        counters.forEach((counter, idx) => {
          counter.style.setProperty('--counter-delay', String(idx));
          const target = parseInt(counter.dataset.target, 10) || 0;
          let current = 0;
          const increment = Math.ceil(target / 12);
          const interval = setInterval(() => {
            current += increment;
            if (current >= target) {
              current = target;
              clearInterval(interval);
            }
            counter.textContent = String(current);
          }, 60);
        });
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
  );

  observer.observe(element);
}

function initUserRoleSelector() {
  const roles = document.querySelectorAll('input[name="userRole"]');
  const roleCopy = document.getElementById('onboarding-role-copy');
  
  if (!roles.length || !roleCopy) {
    return;
  }

  const roleCopyMap = {
    legal: 'Pełny profil dostosowany do obowiązków prawnych, zgody RODO i bezpieczeństwa danych w jednym, spokojnym przepływie.',
    tech: 'Szybka konfiguracja z fokusem na API, integracje, workbench i automatyzację - profil, zgody i dostęp bez zbędnych pól.',
    business: 'Onboarding skoncentrowany na monitorowaniu, raportach i łączeniu z narzędziami biznesowymi - dane operacyjne i przychody.'
  };

  const initRole = localStorage.getItem('selectedUserRole') || 'legal';
  const initRadio = document.querySelector(`input[name="userRole"][value="${initRole}"]`);
  if (initRadio) {
    initRadio.checked = true;
    roleCopy.textContent = roleCopyMap[initRole];
  }

  roles.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      const role = e.target.value;
      roleCopy.textContent = roleCopyMap[role] || roleCopyMap.legal;
      localStorage.setItem('selectedUserRole', role);
    });
  });
}

function initMarketingReveal() {
  if (!marketingSite) {
    return;
  }

  const targets = [
    ...marketingSite.querySelectorAll("main > section"),
    ...marketingSite.querySelectorAll("main > section .glass-card"),
    ...document.querySelectorAll(".site-footer, .site-footer .footer-brand, .site-footer .footer-links")
  ];

  const uniqueTargets = Array.from(new Set(targets.filter(Boolean)));
  if (!uniqueTargets.length) {
    return;
  }

  uniqueTargets.forEach((element, index) => {
    element.classList.add("reveal-target");
    element.style.setProperty("--reveal-index", String(index % 6));
  });

  marketingSite.classList.add("reveal-ready");

  if (!("IntersectionObserver" in window)) {
    uniqueTargets.forEach((element) => {
      element.classList.add("is-visible");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  uniqueTargets.forEach((element) => {
    observer.observe(element);
  });

  const metricsSection = marketingSite.querySelector('.metrics-animate');
  if (metricsSection) {
    animateCounters(metricsSection);
  }
}

registerForm.addEventListener("submit", handleRegister);
loginForm.addEventListener("submit", handleLogin);
generateAccountBtn.addEventListener("click", suggestAccountData);
toggleRegisterPasswordBtn.addEventListener("click", () => {
  togglePasswordVisibility(registerPassword, toggleRegisterPasswordBtn);
});
toggleLoginPasswordBtn.addEventListener("click", () => {
  togglePasswordVisibility(loginPassword, toggleLoginPasswordBtn);
});

logoutBtn.addEventListener("click", handleLogout);
newChatBtn.addEventListener("click", createNewChat);
clearBtn.addEventListener("click", createNewChat);
refreshChatsBtn.addEventListener("click", loadChats);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  await sendMessage();
});

input.addEventListener("input", () => autoResize(input));
workbenchPrompt.addEventListener("input", () => autoResize(workbenchPrompt));
workbenchLinks.addEventListener("input", () => autoResize(workbenchLinks));
imagePrompt.addEventListener("input", () => autoResize(imagePrompt));
videoPrompt.addEventListener("input", () => autoResize(videoPrompt));
customPrompt.addEventListener("input", () => autoResize(customPrompt));
integrationSecret.addEventListener("input", () => autoResize(integrationSecret));
integrationNotes.addEventListener("input", () => autoResize(integrationNotes));
gmailBody.addEventListener("input", () => autoResize(gmailBody));

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

chatModeSelect.addEventListener("change", setModeBadge);
liveCategorySelect.addEventListener("change", () => {
  liveNewsCategory.value = liveCategorySelect.value;
});
speakLastBtn.addEventListener("click", () => speakText(state.lastAssistantMessage));
voiceInputBtn.addEventListener("click", toggleDictation);
liveVoiceToggleBtn.addEventListener("click", handleLiveVoiceToggle);

imageForm.addEventListener("submit", handleImageGeneration);
workbenchForm.addEventListener("submit", handleWorkbenchSubmit);
workbenchFiles.addEventListener("change", renderWorkbenchFilePreview);
videoForm.addEventListener("submit", handleVideoCreate);
refreshVideosBtn.addEventListener("click", fetchVideoJobs);

settingsForm.addEventListener("submit", handleSettingsSave);
integrationForm.addEventListener("submit", handleIntegrationSave);
integrationService.addEventListener("change", syncIntegrationForm);
clearIntegrationSecretBtn.addEventListener("click", handleIntegrationSecretClear);
if (alibabaStatusRefreshBtn) {
  alibabaStatusRefreshBtn.addEventListener("click", loadAlibabaStatus);
}
gmailInboxRefreshBtn.addEventListener("click", loadGmailInbox);
gmailOauthConnectBtn.addEventListener("click", handleGmailOauthConnect);
gmailOauthDisconnectBtn.addEventListener("click", handleGmailOauthDisconnect);
gmailSendForm.addEventListener("submit", handleGmailSend);
loadLiveNewsBtn.addEventListener("click", () => {
  if (liveCategorySelect) {
    liveCategorySelect.value = liveNewsCategory.value;
  }
  loadLiveNews(liveNewsCategory.value);
});
saveVoiceConsentBtn.addEventListener("click", handleVoiceConsentSave);
refreshAdminBtn.addEventListener("click", loadAdminOverview);

document.querySelectorAll("[data-chat-shortcut]").forEach((button) => {
  button.addEventListener("click", () => {
    applyChatShortcut(button.dataset.chatShortcut);
  });
});

sidebarToggle.addEventListener("click", () => {
  toggleSidebar();
});

sidebarCloseBtn.addEventListener("click", () => {
  closeSidebar();
});

if (sidebarOverlay) {
  sidebarOverlay.addEventListener("click", () => {
    closeSidebar();
  });
}

sidebarScreenButtons.forEach((button) => {
  button.addEventListener("click", () => {
    switchScreen(button.dataset.screen);
    if (window.innerWidth > MOBILE_BREAKPOINT) {
      document.body.classList.add("sidebar-collapsed");
    } else {
      closeSidebar();
    }
  });
});

document.querySelectorAll("[data-fill-chat]").forEach((button) => {
  button.addEventListener("click", () => {
    fillChatWithPrompt(
      button.dataset.fillChat || "",
      button.dataset.fillMode || "general"
    );
  });
});

document.querySelectorAll("[data-open-screen]").forEach((button) => {
  button.addEventListener("click", () => {
    switchScreen(button.dataset.openScreen);
    closeSidebar();
  });
});

initUnifiedWorkspacePanels();

window.addEventListener("hashchange", () => {
  const requestedScreen = getRequestedScreenFromHash();
  if (state.user && requestedScreen && requestedScreen !== state.currentScreen) {
    switchScreen(requestedScreen);
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSidebar();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > MOBILE_BREAKPOINT) {
    closeSidebar();
  } else {
    syncSidebarUi();
  }
});

syncSidebarUi();

document.querySelectorAll("[data-voice-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.voiceTarget);
    if (!target) {
      return;
    }
    speakText(target.textContent.trim(), registerMessage);
  });
});

document.getElementById("stopAudioBtn").addEventListener("click", stopAudio);

headerLaunchLink.addEventListener("click", async (event) => {
  event.preventDefault();

  if (state.user) {
    await openApp(state.user, state.models, state.contact);
    return;
  }

  try {
    const data = await apiFetch("/api/guest", { method: "POST" });
    setToken(data.token);
    startLoaderThenOpen(data.user, state.models, state.contact);
  } catch {
    window.location.hash = "dostep";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

homeBrandLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    if (!state.user) {
      return;
    }

    event.preventDefault();
    showHomePage();
  });
});

window.addEventListener("resize", () => {
  if (window.innerWidth > MOBILE_BREAKPOINT) {
    document.body.classList.remove("sidebar-open");
  }
});

autoResize(input);
autoResize(workbenchPrompt);
autoResize(workbenchLinks);
autoResize(imagePrompt);
autoResize(videoPrompt);
autoResize(customPrompt);
autoResize(integrationSecret);
autoResize(integrationNotes);
autoResize(gmailBody);
setModeBadge();
syncHeaderLaunch();
initSpeechRecognition();
renderChatHistory();
renderWorkbenchFilePreview();
renderBuilderBoard();
input.placeholder = "Napisz zadanie albo steruj czatem, np. /image nowoczesne logo kancelarii";
initMarketingReveal();
initUserRoleSelector();
restoreSession();
