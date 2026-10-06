// auth-guard.js - Validação de licença 30 dias + liberação admin preview
(function() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  
  // Se tem admin_preview, marca como admin e libera
  if (params.has('admin_preview')) {
    localStorage.setItem('cm_is_admin', 'true');
    return;
  }

  // Se não tem token, é acesso seu direto (admin)
  if (!token) return;

  try {
    if (!token.startsWith('cm_')) throw new Error('Token inválido');
    const payload = JSON.parse(atob(token.replace('cm_', '')));
    if (!payload.exp) throw new Error('Token sem expiração');
    if (Date.now() > payload.exp) {
      window.location.href = 'bloqueado.html';
    }
  } catch (e) {
    console.warn('Token inválido ou expirado:', e);
    // Não bloqueia, deixa passar mas loga
  }
})();
