// modules-config.js - NOVO com Modo Teste
const DEFAULT_MODULES = [
  { id: 'menina-roca', title: 'Menina da Roça', file: 'menina-da-roca.html', category: 'Vídeos & Clonagem', status: 'test' }, // <- já em teste
  { id: 'clonagem', title: 'Clonagem de Vídeo', file: 'index.html', category: 'Vídeos & Clonagem', status: 'active' },
  // ... outros 24 módulos
];

function getModulesState() {
  return JSON.parse(localStorage.getItem('cm_modules_state') || 'null') || DEFAULT_MODULES;
}
function setModuleStatus(id, status) {
  const state = getModulesState();
  state.find(m => m.id === id).status = status;
  localStorage.setItem('cm_modules_state', JSON.stringify(state));
}
function isAdmin() {
  return localStorage.getItem('cm_is_admin') === 'true' || new URLSearchParams(location.search).has('admin_preview');
}
function isModuleVisibleForUser(mod) {
  if (mod.status === 'active') return true;
  if (mod.status === 'test' && isAdmin()) return true; // só admin vê
  return false; // manutenção esconde de todos
}

// No admin.html ao abrir:
localStorage.setItem('cm_is_admin', 'true');
