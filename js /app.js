// =========================================================================
// BANCO DE DADOS DE USUÁRIOS E PROJETOS
// =========================================================================
const Storage = {
  // Retorna a lista de usuários registrados
  getUsers() {
    try {
      return JSON.parse(localStorage.getItem("studio_accounts_db") || "{}");
    } catch (e) {
      return {};
    }
  },
  saveUsers(users) {
    localStorage.setItem("studio_accounts_db", JSON.stringify(users));
  },

  // Sessão do usuário atual conectado
  getCurrentUser() {
    return localStorage.getItem("studio_logged_username") || null;
  },
  setCurrentUser(username) {
    localStorage.setItem("studio_logged_username", username);
  },
  clearCurrentUser() {
    localStorage.removeItem("studio_logged_username");
  },

  // Projetos salvos por usuário
  getProjects(username) {
    const key = `studio_data_${username.toLowerCase()}`;
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch (e) {
      return [];
    }
  },
  saveProjects(username, projects) {
    const key = `studio_data_${username.toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(projects));
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
const submitLoginBtn = document.getElementById("submitLoginBtn");

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

// Salvar chave Gemini
geminiKeyInput.value = localStorage.getItem("GEMINI_API_KEY") || "";
saveGeminiKeyBtn.addEventListener("click", () => {
  localStorage.setItem("GEMINI_API_KEY", geminiKeyInput.value.trim());
  alert("Chave Gemini salva com sucesso!");
});

// =========================================================================
// LÓGICA DE RECONHECIMENTO E CADASTRO AUTOMÁTICO
// =========================================================================
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = authUsername.value.trim();
  const pass = authPassword.value.trim();

  if (!name || !pass) {
    showMsg("Por favor, preencha o nome de usuário e a senha.", "error");
    return;
  }

  const users = Storage.getUsers();
  const userKey = name.toLowerCase();

  if (users[userKey]) {
    // USUÁRIO JÁ EXISTE -> VALIDAR SENHA
    if (users[userKey].password === pass) {
      showMsg(`Bem-vindo de volta, ${users[userKey].name}! Carregando seus projetos...`, "success");
      setTimeout(() => {
        Storage.setCurrentUser(users[userKey].name);
        openStudio(users[userKey].name);
      }, 500);
    } else {
      showMsg("⚠️ Senha incorreta para este usuário! Digite a senha cadastrada.", "error");
    }
  } else {
    // PRIMEIRO ACESSO -> REGISTRAR CADASTRO AUTOMATICAMENTE
    users[userKey] = {
      name: name,
      password: pass,
      created: new Date().toISOString()
    };
    Storage.saveUsers(users);
    Storage.setCurrentUser(name);

    showMsg(`✨ Cadastro realizado com sucesso! Bem-vindo, ${name}!`, "success");
    setTimeout(() => {
      openStudio(name);
    }, 500);
  }
});

function showMsg(text, type) {
  loginFeedback.textContent = text;
  loginFeedback.classList.remove("hidden");
  if (type === "success") {
    loginFeedback.className = "text-xs py-2.5 px-3 rounded-lg font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30";
  } else {
    loginFeedback.className = "text-xs py-2.5 px-3 rounded-lg font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30";
  }
}

// Botão Sair / Deslogar
logoutBtn.addEventListener("click", () => {
  Storage.clearCurrentUser();
  currentUsername = null;
  window.location.reload();
});

// Abertura do Studio
function openStudio(name) {
  currentUsername = name;
  authScreen.classList.add("hidden");
  appScreen.classList.remove("hidden");
  userName.textContent = name;

  refreshProjectList();

  const projects = Storage.getProjects(currentUsername);
  if (projects.length > 0) {
    selectProject(projects[0].id);
  } else {
    createNewProject();
  }
}

// =========================================================================
// HISTÓRICO DE PROJETOS E CONVERSAS DO USUÁRIO
// =========================================================================
function refreshProjectList() {
  if (!currentUsername) return;
  const projects = Storage.getProjects(currentUsername);
  conversationsList.innerHTML = "";

  projects.forEach(proj => {
    const btn = document.createElement("button");
    btn.className = `w-full text-left px-3 py-2 rounded-lg text-xs truncate transition flex items-center justify-between ${
      proj.id === currentConversationId
        ? "bg-slate-800 text-blue-400 font-semibold"
        : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
    }`;
    btn.innerHTML = `<span class="truncate">${proj.title || "Nova Produção"}</span>`;
    btn.addEventListener("click", () => selectProject(proj.id));
    conversationsList.appendChild(btn);
  });
}

function createNewProject() {
  if (!currentUsername) return;
  const projects = Storage.getProjects(currentUsername);
  const newProj = {
    id: "proj_" + Date.now(),
    title: "Nova Produção",
    messages: []
  };
  projects.unshift(newProj);
  Storage.saveProjects(currentUsername, projects);
  refreshProjectList();
  selectProject(newProj.id);
}

newChatBtn.addEventListener("click", createNewProject);

function selectProject(id) {
  if (!currentUsername) return;
  currentConversationId = id;
  const projects = Storage.getProjects(currentUsername);
  const proj = projects.find(p => p.id === id);
  if (!proj) return;

  currentChatTitle.textContent = proj.title;
  chatArea.innerHTML = "";
  conversationHistory = [];

  if (proj.messages.length === 0) {
    chatArea.appendChild(startScreen);
    startScreen.classList.remove("hidden");
  } else {
    startScreen.classList.add("hidden");
    proj.messages.forEach(msg => {
      conversationHistory.push({
        role: msg.role,
        parts: [{ text: msg.content }]
      });
      renderMessage(msg.content, msg.role === "user");
    });
  }
  refreshProjectList();
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
// ENVIO MONOTAREFA PARA A API DO GEMINI
// =========================================================================
async function handleSendMessage(text, isInitial = false) {
  const apiKey = geminiKeyInput.value.trim() || localStorage.getItem("GEMINI_API_KEY");
  if (!apiKey) {
    alert("Por favor, cole sua Gemini API Key no campo superior e clique em Salvar.");
    geminiKeyInput.focus();
    return;
  }

  startScreen.classList.add("hidden");

  const projects = Storage.getProjects(currentUsername);
  const currentProj = projects.find(p => p.id === currentConversationId);

  if (!isInitial) {
    renderMessage(text, true);
    conversationHistory.push({ role: "user", parts: [{ text }] });
    if (currentProj) {
      currentProj.messages.push({ role: "user", content: text });
      Storage.saveProjects(currentUsername, projects);
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
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Erro na geração da resposta.";

    conversationHistory.push({ role: "model", parts: [{ text: reply }] });
    renderMessage(reply, false);

    if (currentProj) {
      currentProj.messages.push({ role: "model", content: reply });
      // Se for a primeira resposta após a etapa 1, atualiza o título do projeto
      if (currentProj.messages.length <= 4 && !isInitial) {
        currentProj.title = text.length > 25 ? text.substring(0, 25) + "..." : text;
        currentChatTitle.textContent = currentProj.title;
      }
      Storage.saveProjects(currentUsername, projects);
      refreshProjectList();
    }
  } catch (err) {
    renderMessage(`❌ Erro de comunicação: ${err.message}`, false);
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

// Inicialização: Se já estiver conectado, abre direto
window.addEventListener("DOMContentLoaded", () => {
  if (currentUsername) {
    openStudio(currentUsername);
  }
});
