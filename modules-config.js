// modules-config.js - CineMorph AI - Controle com Modo Teste
const DEFAULT_MODULES = [
  { id: 'downloads', title: 'Downloads', file: 'downloads.html', category: 'Estratégias', status: 'active' },
  { id: 'menina-roca', title: 'Menina da Roça', file: 'menina-da-roca.html', category: 'Vídeos & Clonagem', status: 'test' },
  { id: 'clonagem', title: 'Clonagem de Vídeo', file: 'index.html', category: 'Vídeos & Clonagem', status: 'active' },
  { id: 'novelinhas-universal', title: 'Novelinhas Universal', file: 'novelinhas-universal.html', category: 'Vídeos & Clonagem', status: 'active' },
  { id: 'mestre-30s', title: 'Mestre 30s', file: 'mestre-30s.html', category: 'Vídeos & Clonagem', status: 'active' },
  { id: 'anti-pragas', title: 'Receitas Anti-Pragas', file: 'anti-pragas.html', category: 'Vídeos & Clonagem', status: 'active' },
  { id: 'pov-produto', title: 'POV Produto', file: 'pov-produto.html', category: 'Vídeos & Clonagem', status: 'active' },
  { id: 'tiktok-seedance', title: 'TikTok Shop Seedance', file: 'tiktok-seedance.html', category: 'Vídeos & Clonagem', status: 'active' },
  { id: 'gordo-magro', title: 'Gordo para Magro', file: 'gordo-magro.html', category: 'Agentes Especializados', status: 'active' },
  { id: 'velho-roca', title: 'Reflexão do Velho da Roça', file: 'velho-roca.html', category: 'Agentes Especializados', status: 'active' },
  { id: 'gerador-ganchos', title: 'Gerador de Ganchos', file: 'gerador-ganchos.html', category: 'Agentes Especializados', status: 'active' },
  { id: 'plantacoes', title: 'Vídeos de Plantações', file: 'plantacoes.html', category: 'Agentes Especializados', status: 'active' },
  { id: 'limpeza', title: 'Vídeos de Limpeza', file: 'limpeza.html', category: 'Agentes Especializados', status: 'active' },
  { id: 'novelinhas-gordos', title: 'Novelinhas Gordos', file: 'novelinhas-gordos.html', category: 'Agentes Especializados', status: 'active' },
  { id: 'upscale', title: 'Upscale de Imagem', file: 'upscale.html', category: 'Agentes Especializados', status: 'active' },
  { id: 'tiktok-shopee', title: 'TikTok Shop & Shopee', file: 'tiktok-shopee.html', category: 'Agentes Especializados', status: 'active' },
  { id: 'receitas-ebook', title: 'Receitas p/ Ebook', file: 'receitas-ebook.html', category: 'Agentes Especializados', status: 'active' },
  { id: 'encapsulados', title: 'Vender Encapsulados', file: 'encapsulados.html', category: 'Agentes Especializados', status: 'active' },
  { id: 'radar-tiktok', title: 'Radar TikTok Shop', file: 'radar-tiktok.html', category: 'Agentes Especializados', status: 'active' },
  { id: 'prompts-virais', title: 'Prompts Virais', file: 'prompts-virais.html', category: 'Redes Sociais', status: 'active' },
  { id: 'tiktok-shop', title: 'TikTok Shop', file: 'tiktok-shop.html', category: 'Redes Sociais', status: 'active' },
  { id: 'facebook', title: 'Facebook', file: 'facebook.html', category: 'Redes Sociais', status: 'active' },
  { id: 'youtube-shorts', title: 'YouTube e Shorts', file: 'youtube-shorts.html', category: 'Redes Sociais', status: 'active' },
  { id: 'ferramentas-ia', title: 'Ferramentas IA', file: 'ferramentas-ia.html', category: 'Ferramentas & Sistema', status: 'active' },
  { id: 'tutoriais', title: 'Tutoriais', file: 'tutoriais.html', category: 'Ferramentas & Sistema', status: 'active' },
  { id: 'config', title: 'Configurações', file: 'config.html', category: 'Ferramentas & Sistema', status: 'active' },
];

const STORAGE_KEY = 'cm_modules_state';

function getModulesState() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  if (!saved) return DEFAULT_MODULES;
  // merge para não perder novos arquivos adicionados depois
  return DEFAULT_MODULES.map(def => {
    const found = saved.find(s => s.id === def.id);
    return found ? { ...def, status: found.status } : def;
  });
}

function setModuleStatus(id, status) {
  const state = getModulesState();
  const item = state.find(m => m.id === id);
  if (item) {
    item.status = status;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

// Compatibilidade com código antigo que usava setModuleState(id, boolean)
function setModuleState(id, active) {
  setModuleStatus(id, active ? 'active' : 'maintenance');
}

function isAdmin() {
  const params = new URLSearchParams(window.location.search);
  return localStorage.getItem('cm_is_admin') === 'true' || params.has('admin_preview');
}

function isModuleVisibleForUser(mod) {
  if (mod.status === 'active') return true;
  if (mod.status === 'test' && isAdmin()) return true;
  return false;
}

function getVisibleModulesForMenu() {
  return getModulesState().filter(isModuleVisibleForUser);
}
