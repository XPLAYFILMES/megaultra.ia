// =========================================================================
// SISTEMA DE ARMAZENAMENTO SEGURO
// =========================================================================
let memoryDb = { users: {}, activeUser: null, projects: {} };

const Storage = {
  getUsers() {
    try {
      const data = localStorage.getItem("studio_users_v2");
      return data ? JSON.parse(data) : memoryDb.users;
    } catch (e) {
      return memoryDb.users;
    }
  },
  saveUsers(users) {
    try {
      localStorage.setItem("studio_users_v2", JSON.stringify(users));
    } catch (e) {
      memoryDb.users = users;
    }
  },
  getActiveUser() {
    try {
      return localStorage.getItem("studio_active_user_v2") || memoryDb.activeUser;
    } catch (e) {
      return memoryDb.activeUser;
    }
  },
  setActiveUser(username) {
    try {
      localStorage.setItem("studio_active_user_v2", username);
    } catch (e) {
      memoryDb.activeUser = username;
    }
  },
  clearActiveUser() {
    try {
      localStorage.removeItem("studio_active_user_v2");
    } catch (e) {
      memoryDb.activeUser = null;
    }
  },
  getProjects(username) {
    const key = `studio_projects_${username.toLowerCase()}`;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : (memoryDb.projects[username.toLowerCase()] || []);
    } catch (e) {
      return memoryDb.projects[username.toLowerCase()] || [];
    }
  },
  saveProjects(username, projects) {
    const key = `studio_projects_${username.toLowerCase()}`;
    try {
      localStorage.setItem(key, JSON.stringify(projects));
    } catch (e) {
      memoryDb.projects[username.toLowerCase()] = projects;
    }
  }
};

let currentUsername = Storage.getActiveUser();
let currentConversationId = null;
let conversationHistory = [];

// Elementos da Interface
const authScreen = document.getElementById("authScreen");
const appScreen = document.getElementById("appScreen");
const authUsername = document.getElementById("authUsername");
const authPassword = document.getElementById("authPassword");
const submitLoginBtn = document.getElementById("submitLoginBtn");
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

// Salvar API Key do Gemini
geminiKeyInput.value = localStorage.getItem("GEMINI_API_KEY") || "";
saveGeminiKeyBtn.addEventListener("click", () => {
  const key = geminiKeyInput.value.trim();
  if (key) {
    localStorage.setItem("GEMINI_API_KEY", key);
    alert("Chave Gemini salva!");
  }
});

// =========================================================================
// FUNÇÃO DE LOGIN / CADASTRO POR CLIQUE DIRETO (SEM SUBMIT DE FORM)
// =========================================================================
function handleAuthAction() {
  const username = (authUsername.value || "").trim();
  const password = (authPassword.value || "").trim();

  if (!username) {
    showFeedback("Digite um nome de usuário.", "error");
    authUsername.focus();
    return;
  }
  if (!password) {
    showFeedback("Digite uma senha.", "error");
    authPassword.focus();
    return;
  }

  const users = Storage.getUsers();
  const key = username.toLowerCase();

  if (users[key]) {
    // USUÁRIO JÁ EXISTE: CONFERIR SENHA
    if (users[key].password === password) {
      showFeedback(`Bem-vindo de volta, ${users[key].name}! Entrando...`, "success");
      Storage.setActiveUser(users[key].name);
      setTimeout(() => openStudio(users[key].name), 300);
    } else {
      showFeedback("⚠️ Senha incorreta! Digite a senha cadastrada para este usuário.", "error");
    }
  } else {
    // PRIMEIRO ACESSO: CRIA O CADASTRO E ENTRA
    users[key] = {
      name: username,
      password: password,
      created: new Date().toISOString()
    };
    Storage.saveUsers(users);
    Storage.setActiveUser(username);

    showFeedback(`✨ Usuário cadastrado com sucesso! Bem-vindo, ${username}!`, "success");
    setTimeout(() => openStudio(username), 300);
  }
}

submitLoginBtn.addEventListener("click", handleAuthAction);

// Permite apertar Enter no campo de senha
authPassword.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleAuthAction();
  }
});

function showFeedback(text, type) {
  loginFeedback.textContent = text;
  loginFeedback.classList.remove("hidden");
  if (type === "success") {
    loginFeedback.className = "text-xs py-2.5 px-3 rounded-lg font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
  } else {
    loginFeedback.className = "text-xs py-2.5 px-3 rounded-lg font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30";
  }
}

// Desconectar (Logout)
logoutBtn.addEventListener("click", () => {
  Storage.clearActiveUser();
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

// Inicialização imediata
window.addEventListener("DOMContentLoaded", () => {
  if (currentUsername) {
    openStudio(currentUsername);
  }
});
