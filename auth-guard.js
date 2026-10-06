[]// auth-guard.js - Validador de Acesso por Token e Validade
(function () {
  // Ignora validação na própria tela de bloqueio ou no painel admin
  const currentPath = window.location.pathname;
  if (currentPath.endsWith('admin.html') || currentPath.endsWith('bloqueado.html')) {
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get('token');

  // Se veio token na URL, salva no dispositivo do usuário
  if (tokenFromUrl) {
    localStorage.setItem('cm_user_token', tokenFromUrl);
  }

  const activeToken = localStorage.getItem('cm_user_token');

  if (!activeToken) {
    window.location.href = 'bloqueado.html?motivo=sem_token';
    return;
  }

  // Busca lista de usuários cadastrados no storage central compartilhado
  const users = JSON.parse(localStorage.getItem('cm_client_database') || '[]');
  const client = users.find(u => u.token === activeToken);

  if (!client) {
    window.location.href = 'bloqueado.html?motivo=invalido';
    return;
  }

  const now = new Date().getTime();
  const expiresAt = new Date(client.expiresAt).getTime();

  if (now > expiresAt || client.status !== 'ativo') {
    window.location.href = `bloqueado.html?motivo=expirado&nome=${encodeURIComponent(client.name)}`;
    return;
  }

  // Acesso permitido: Propaga o token nos links internos do menu para navegação contínua
  window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a').forEach(anchor => {
      const href = anchor.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('#') && !href.includes('token=')) {
        const separator = href.includes('?') ? '&' : '?';
        anchor.setAttribute('href', `${href}${separator}token=${activeToken}`);
      }
    });
  });
})();
