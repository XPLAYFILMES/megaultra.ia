let currentUser = null;
let currentConversationId = null;
let conversationHistory = [];

// Elementos da Interface
const authScreen = document.getElementById("authScreen");
const appScreen = document.getElementById("appScreen");
const googleLoginBtn = document.getElementById("googleLoginBtn");
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

// Autenticação
googleLoginBtn.addEventListener("click", () => auth.loginWithGoogle());
logoutBtn.addEventListener("click", () => auth.logout());

auth.onStateChange(async (user) => {
  currentUser = user;
  if (user) {
    authScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");
    userName.textContent = user.user_metadata?.full_name || user.email;
    userAvatar.src = user.user_metadata?.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=user";
    await refreshConversations();
  } else {
    authScreen.classList.remove("hidden");
    appScreen.classList.add("hidden");
  }
});

async function refreshConversations() {
  const chats = await db.getConversations();
  conversationsList.innerHTML = "";
  chats.forEach(chat => {
    const btn = document.createElement("button");
    btn.className = `w-full text-left px-3 py-2 rounded-lg text-xs truncate transition ${
      chat.id === currentConversationId ? "bg-slate-800 text-blue-400 font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
    }`;
    btn.textContent = chat.title || "Produção sem título";
    btn.addEventListener("click", () => selectConversation(chat.id, chat.title));
    conversationsList.appendChild(btn);
  });
}

newChatBtn.addEventListener("click", async () => {
  const newChat = await db.createConversation(currentUser.id);
  await refreshConversations();
  selectConversation(newChat.id, newChat.title);
});

async function selectConversation(id, title) {
  currentConversationId = id;
  currentChatTitle.textContent = title;
  chatArea.innerHTML = "";
  conversationHistory = [];

  const messages = await db.getMessages(id);
  if (messages.length === 0) {
    chatArea.appendChild(startScreen);
    startScreen.classList.remove("hidden");
  } else {
    startScreen.classList.add("hidden");
    messages.forEach(msg => {
      conversationHistory.push({
        role: msg.role,
        parts: [{ text: msg.content }]
      });
      renderMessage(msg.content, msg.role === 'user');
    });
  }
  await refreshConversations();
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

async function handleSendMessage(text, isInitial = false) {
  const apiKey = geminiKeyInput.value.trim() || localStorage.getItem("GEMINI_API_KEY");
  if (!apiKey) {
    alert("Informe sua Gemini API Key no campo superior.");
    return;
  }

  if (!currentConversationId) {
    const newChat = await db.createConversation(currentUser.id);
    currentConversationId = newChat.id;
  }

  startScreen.classList.add("hidden");

  if (!isInitial) {
    renderMessage(text, true);
    conversationHistory.push({ role: "user", parts: [{ text }] });
    await db.saveMessage(currentConversationId, 'user', text);
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
    await db.saveMessage(currentConversationId, 'model', reply);

    if (conversationHistory.length <= 4) {
      const summaryTitle = text.length > 25 ? text.substring(0, 25) + "..." : text;
      await db.updateConversationTitle(currentConversationId, summaryTitle);
      currentChatTitle.textContent = summaryTitle;
      await refreshConversations();
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
