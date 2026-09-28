// =========================================================================
// BANCO LOCAL (LOCALSTORAGE)
// =========================================================================
const Storage = {
  getConversations() {
    return JSON.parse(localStorage.getItem("studio_conversations") || "[]");
  },
  saveConversations(chats) {
    localStorage.setItem("studio_conversations", JSON.stringify(chats));
  },
  getUser() {
    return JSON.parse(localStorage.getItem("studio_user") || "null");
  },
  setUser(user) {
    localStorage.setItem("studio_user", JSON.stringify(user));
  },
  clearUser() {
    localStorage.removeItem("studio_user");
  }
};

let currentUser = Storage.getUser();
let currentConversationId = null;
let conversationHistory = [];

// Elementos da Interface
const authScreen = document.getElementById("authScreen");
const appScreen = document.getElementById("appScreen");
const guestLoginBtn = document.getElementById("guestLoginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userAvatar = document.getElementById("userAvatar");
const userName = document.getElementById("userName");
const conversationsList = document.getElementById("conversationsList");
const newChatBtn = document.getElementById("newChatBtn");
const currentChatTitle = document.getElementById("currentChatTitle");
const chatArea = document.getElementById("chatArea");
const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const geminiKeyInput = document.getElementById("geminiKeyInput");
const saveGeminiKeyBtn = document.getElementById("saveGeminiKeyBtn");

// Chave da API Gemini
geminiKeyInput.value = localStorage.getItem("GEMINI_API_KEY") || "";
saveGeminiKeyBtn.addEventListener("click", () => {
  localStorage.setItem("GEMINI_API_KEY", geminiKeyInput.value.trim());
  alert("Chave Gemini salva!");
});

// =========================================================================
// AUTENTICAÇÃO GOOGLE (NATIVA DO GOOGLE)
// =========================================================================
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// Callback chamado pelo botão oficial do Google
window.handleGoogleCredentialResponse = (response) => {
  const payload = parseJwt(response.credential);
  if (payload) {
    const user = {
      name: payload.name,
      email: payload.email,
      picture: payload.picture
    };
    Storage.setUser(user);
    initApp(user);
  }
};

// Login direto / sem autenticação externa
if (guestLoginBtn) {
  guestLoginBtn.addEventListener("click", () => {
    const user = {
      name: "Criador Studio",
      email: "criador@local",
      picture: "https://api.dicebear.com/7.x/bottts/svg?seed=studio"
    };
    Storage.setUser(user);
    initApp(user);
  });
}

logoutBtn.addEventListener("click", () => {
  Storage.clearUser();
  window.location.reload();
});

function initApp(user) {
  currentUser = user;
  authScreen.classList.add("hidden");
  appScreen.classList.remove("hidden");
  userName.textContent = user.name;
  userAvatar.src = user.picture;
  refreshConversations();

  const chats = Storage.getConversations();
  if (chats.length > 0) {
    selectConversation(chats[0].id);
  } else {
    createNewConversation();
  }
}

// =========================================================================
// GERENCIADOR DE CONVERSAS (LOCAL)
// =========================================================================
function refreshConversations() {
  const chats = Storage.getConversations();
  conversationsList.innerHTML = "";
  chats.forEach(chat => {
    const btn = document.createElement("button");
    btn.className = `w-full text-left px-3 py-2 rounded-lg text-xs truncate transition flex justify-between items-center ${
      chat.id === currentConversationId ? "bg-slate-800 text-blue-400 font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
    }`;
    btn.innerHTML = `<span class="truncate">${chat.title || "Nova Produção"}</span>`;
    btn.addEventListener("click", () => selectConversation(chat.id));
    conversationsList.appendChild(btn);
  });
}

function createNewConversation() {
  const chats = Storage.getConversations();
  const newChat = {
    id: "chat_" + Date.now(),
    title: "Nova Produção",
    messages: []
  };
  chats.unshift(newChat);
  Storage.saveConversations(chats);
  refreshConversations();
  selectConversation(newChat.id);
}

newChatBtn.addEventListener("click", createNewConversation);

function selectConversation(id) {
  currentConversationId = id;
  const chats = Storage.getConversations();
  const chat = chats.find(c => c.id === id);
  if (!chat) return;

  currentChatTitle.textContent = chat.title;
  chatArea.innerHTML = "";
  conversationHistory = [];

  if (chat.messages.length === 0) {
    chatArea.appendChild(startScreen);
    startScreen.classList.remove("hidden");
  } else {
    startScreen.classList.add("hidden");
    chat.messages.forEach(msg => {
      conversationHistory.push({
        role: msg.role,
        parts: [{ text: msg.content }]
      });
      renderMessage(msg.content, msg.role === 'user');
    });
  }
  refreshConversations();
}

function renderMessage(text, isUser) {
  const div = document.createElement("div");
  div.className = `flex ${isUser ? "justify-end" : "justify-start"} w-full`;
  const bubble = document.createElement("div");
  bubble.className = `max-w-[85%] rounded-2xl p-4 text-sm ${
    isUser ? "bg-blue-600 text-white" : "bg-slate-800 border border-slate-700 text-slate-100 prose prose-invert"
  }`;
  bubble.innerHTML = isUser ? text : marked.parse(text);
  div.appendChild(bubble);
  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

// =========================================================================
// ENVIO PARA O GEMINI
// =========================================================================
async function handleSendMessage(text, isInitial = false) {
  const apiKey = geminiKeyInput.value.trim() || localStorage.getItem("GEMINI_API_KEY");
  if (!apiKey) {
    alert("Informe sua Gemini API Key no campo superior.");
    return;
  }

  startScreen.classList.add("hidden");

  const chats = Storage.getConversations();
  const currentChat = chats.find(c => c.id === currentConversationId);

  if (!isInitial) {
    renderMessage(text, true);
    conversationHistory.push({ role: "user", parts: [{ text }] });
    if (currentChat) {
      currentChat.messages.push({ role: "user", content: text });
      Storage.saveConversations(chats);
    }
  } else {
    conversationHistory.push({ role: "user", parts: [{ text: "Iniciar motor de produção. Apresente a ETAPA 1 do menu principal." }] });
  }

  sendBtn.disabled = true;
  userInput.disabled = true;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: CONFIG.SYSTEM_PROMPT }] },
        contents: conversationHistory,
        generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
      })
    });

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Erro na geração.";

    conversationHistory.push({ role: "model", parts: [{ text: reply }] });
    renderMessage(reply, false);

    if (currentChat) {
      currentChat.messages.push({ role: "model", content: reply });
      if (currentChat.messages.length <= 4 && !isInitial) {
        currentChat.title = text.length > 25 ? text.substring(0, 25) + "..." : text;
        currentChatTitle.textContent = currentChat.title;
      }
      Storage.saveConversations(chats);
      refreshConversations();
    }
  } catch (err) {
    renderMessage(`❌ Erro: ${err.message}`, false);
  } finally {
    sendBtn.disabled = false;
    userInput.disabled = false;
    userInput.focus();
  }
}

startBtn.addEventListener("click", () => handleSendMessage("", true));

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const val = userInput.value.trim();
  if (!val) return;
  userInput.value = "";
  handleSendMessage(val, false);
});

// Inicialização automática se já logado
if (currentUser) {
  initApp(currentUser);
}


