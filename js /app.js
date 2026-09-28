// =========================================================================
// BANCO LOCAL DE CONTAS E PROJETOS (LOCALSTORAGE)
// =========================================================================
const Storage = {
  // Lista de usuários registrados
  getUsersDatabase() {
    return JSON.parse(localStorage.getItem("studio_registered_users") || "{}");
  },
  saveUsersDatabase(db) {
    localStorage.setItem("studio_registered_users", JSON.stringify(db));
  },

  // Sessão atual ativa
  getCurrentUser() {
    return localStorage.getItem("studio_active_user") || null;
  },
  setCurrentUser(username) {
    localStorage.setItem("studio_active_user", username);
  },
  clearCurrentUser() {
    localStorage.removeItem("studio_active_user");
  },

  // Conversas isoladas por usuário
  getConversations(username) {
    const key = `studio_projects_${username.toLowerCase()}`;
    return JSON.parse(localStorage.getItem(key) || "[]");
  },
  saveConversations(username, chats) {
    const key = `studio_projects_${username.toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(chats));
  }
};

let currentUsername = Storage.getCurrentUser();
let currentConversationId = null;
let conversationHistory = [];

// Elementos da Interface
const authScreen = document.getElementById("authScreen");
const appScreen = document.getElementById("appScreen");
const loginForm = document.getElementById("loginForm");
const authUsername = document.getElementById("authUsername");
const authPassword = document.getElementById("authPassword");
const loginFeedback = document.getElementById("loginFeedback");
const logoutBtn = document.getElementById("logoutBtn");
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
// SISTEMA DE LOGIN / CADASTRO AUTOMÁTICO POR NOME E SENHA
// =========================================================================
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = authUsername.value.trim();
  const password = authPassword.value.trim();

  if (!username || !password) return;

  const usersDb = Storage.getUsersDatabase();
  const userKey = username.toLowerCase();

  if (usersDb[userKey]) {
    // Usuário já existe -> conferir senha
    if (usersDb[userKey].password === password) {
      showFeedback("Login realizado com sucesso! Carregando seus projetos...", "success");
      setTimeout(() => {
        Storage.setCurrentUser(usersDb[userKey].originalName);
        activateApp(usersDb[userKey].originalName);
      }, 400);
    } else {
      showFeedback("⚠️ Senha incorreta para este usuário. Digite a senha cadastrada.", "error");
    }
  } else {
    // Primeiro acesso -> cria a conta automaticamente
    usersDb[userKey] = {
      originalName: username,
      password: password,
      createdAt: new Date().toISOString()
    };
    Storage.saveUsersDatabase(usersDb);
    Storage.setCurrentUser(username);

    showFeedback("✨ Conta criada com sucesso! Acessando sua área...", "success");
    setTimeout(() => {
      activateApp(username);
    }, 400);
  }
});

function showFeedback(message, type) {
  loginFeedback.textContent = message;
  loginFeedback.classList.remove("hidden");
  if (type === "success") {
    loginFeedback.className = "text-xs py-2 px-3 rounded-lg font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20";
  } else {
    loginFeedback.className = "text-xs py-2 px-3 rounded-lg font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20";
  }
}

// Desconectar (Logout)
logoutBtn.addEventListener("click", () => {
  Storage.clearCurrentUser();
  currentUsername = null;
  window.location.reload();
});

// Ativar a área de trabalho após autenticação
function activateApp(username) {
  currentUsername = username;
  authScreen.classList.add("hidden");
  appScreen.classList.remove("hidden");
  userName.textContent = username;

  refreshConversations();

  const chats = Storage.getConversations(currentUsername);
  if (chats.length > 0) {
    selectConversation(chats[0].id);
  } else {
    createNewConversation();
  }
}

// =========================================================================
// GESTÃO DE CONVERSAS E HISTÓRICO
// =========================================================================
function refreshConversations() {
  if (!currentUsername) return;
  const chats = Storage.getConversations(currentUsername);
  conversationsList.innerHTML = "";

  chats.forEach(chat => {
    const btn = document.createElement("button");
    btn.className = `w-full text-left px-3 py-2 rounded-lg text-xs truncate transition flex justify-between items-center ${
      chat.id === currentConversationId
        ? "bg-slate-800 text-blue-400 font-semibold"
        : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
    }`;
    btn.innerHTML = `<span class="truncate">${chat.title || "Nova Produção"}</span>`;
    btn.addEventListener("click", () => selectConversation(chat.id));
    conversationsList.appendChild(btn);
  });
}

function createNewConversation() {
  if (!currentUsername) return;
  const chats = Storage.getConversations(currentUsername);
  const newChat = {
    id: "prod_" + Date.now(),
    title: "Nova Produção",
    messages: []
  };
  chats.unshift(newChat);
  Storage.saveConversations(currentUsername, chats);
  refreshConversations();
  selectConversation(newChat.id);
}

newChatBtn.addEventListener("click", createNewConversation);

function selectConversation(id) {
  if (!currentUsername) return;
  currentConversationId = id;
  const chats = Storage.getConversations(currentUsername);
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
    isUser
      ? "bg-blue-600 text-white font-medium"
      : "bg-slate-800 border border-slate-700 text-slate-100 prose prose-invert"
  }`;
  bubble.innerHTML = isUser ? text : marked.parse(text);
  div.appendChild(bubble);
  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

// =========================================================================
// COMUNICAÇÃO COM O GEMINI
// =========================================================================
async function handleSendMessage(text, isInitial = false) {
  const apiKey = geminiKeyInput.value.trim() || localStorage.getItem("GEMINI_API_KEY");
  if (!apiKey) {
    alert("Informe sua Gemini API Key no campo superior.");
    return;
  }

  startScreen.classList.add("hidden");

  const chats = Storage.getConversations(currentUsername);
  const currentChat = chats.find(c => c.id === currentConversationId);

  if (!isInitial) {
    renderMessage(text, true);
    conversationHistory.push({ role: "user", parts: [{ text }] });
    if (currentChat) {
      currentChat.messages.push({ role: "user", content: text });
      Storage.saveConversations(currentUsername, chats);
    }
  } else {
    conversationHistory.push({
      role: "user",
      parts: [{ text: "Iniciar motor de produção. Apresente a ETAPA 1 do menu principal." }]
    });
  }

  sendBtn.disabled = true;
  userInput.disabled = true;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: CONFIG.SYSTEM_PROMPT }] },
          contents: conversationHistory,
          generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
        })
      }
    );

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
      Storage.saveConversations(currentUsername, chats);
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

// Inicialização: Se já estiver logado, entra direto; se não, mostra o formulário
window.addEventListener("DOMContentLoaded", () => {
  if (currentUsername) {
    activateApp(currentUsername);
  }
});
