// modules-config.js - Gerenciador Central de Módulos e Menu Dinâmico
const DEFAULT_MODULES = [
  // ESTRATÉGIAS
  { id: 'downloads', name: 'Downloads', category: 'ESTRATÉGIAS', file: 'downloads.html', icon: 'fa-download', status: 'ativo' },
  
  // VÍDEOS & CLONAGEM
  { id: 'menina-da-roca', name: 'Menina da Roça', category: 'VÍDEOS', file: 'menina-da-roca.html', icon: 'fa-camera', status: 'ativo' },
  { id: 'clonagem-video', name: 'Clonagem de Vídeo', category: 'VÍDEOS', file: 'index.html', icon: 'fa-file-video', status: 'ativo' },
  { id: 'novelinhas-universal', name: 'Novelinhas Universal', category: 'VÍDEOS', file: 'novelinhas-universal.html', icon: 'fa-film', status: 'ativo' },
  { id: 'mestre-30s', name: 'Mestre 30s', category: 'VÍDEOS', file: 'mestre-30s.html', icon: 'fa-utensils', status: 'ativo' },
  { id: 'anti-pragas', name: 'Receitas Anti-Pragas', category: 'VÍDEOS', file: 'anti-pragas.html', icon: 'fa-bug', status: 'ativo' },
  { id: 'pov-produto', name: 'POV Produto', category: 'VÍDEOS', file: 'pov-produto.html', icon: 'fa-box-open', status: 'ativo' },
  { id: 'tiktok-seedance', name: 'TikTok Shop Seedance', category: 'VÍDEOS', file: 'tiktok-seedance.html', icon: 'fa-video', status: 'ativo' },

  // NOVOS AGENTES
  { id: 'gordo-magro', name: 'Gordo para Magro', category: 'AGENTES', file: 'gordo-magro.html', icon: 'fa-scale-balanced', status: 'ativo' },
  { id: 'velho-roca', name: 'Reflexão do Velho da Roça', category: 'AGENTES', file: 'velho-roca.html', icon: 'fa-heart', status: 'ativo' },
  { id: 'gerador-ganchos', name: 'Gerador de Ganchos', category: 'AGENTES', file: 'gerador-ganchos.html', icon: 'fa-fire', status: 'ativo' },
  { id: 'plantacoes', name: 'Vídeos de Plantações', category: 'AGENTES', file: 'plantacoes.html', icon: 'fa-seedling', status: 'ativo' },
  { id: 'limpeza', name: 'Vídeos de Limpeza', category: 'AGENTES', file: 'limpeza.html', icon: 'fa-wand-magic-sparkles', status: 'ativo' },
  { id: 'novelinhas-gordos', name: 'Novelinhas Gordos', category: 'AGENTES', file: 'novelinhas-gordos.html', icon: 'fa-hand-holding-heart', status: 'ativo' },
  { id: 'upscale', name: 'Upscale de Imagem', category: 'AGENTES', file: 'upscale.html', icon: 'fa-image', status: 'ativo' },
  { id: 'tiktok-shopee', name: 'TikTok Shop & Shopee', category: 'AGENTES', file: 'tiktok-shopee.html', icon: 'fa-bag-shopping', status: 'ativo' },
  { id: 'receitas-ebook', name: 'Receitas p/ Ebook', category: 'AGENTES', file: 'receitas-ebook.html', icon: 'fa-book-open', status: 'ativo' },
  { id: 'encapsulados', name: 'Vender Encapsulados', category: 'AGENTES', file: 'encapsulados.html', icon: 'fa-cubes-stacked', status: 'ativo' },
  { id: 'radar-tiktok', name: 'Radar TikTok Shop', category: 'AGENTES', file: 'radar-tiktok.html', icon: 'fa-chart-line', status: 'ativo' },

  // REDES SOCIAIS
  { id: 'prompts-virais', name: 'Prompts Virais', category: 'REDES', file: 'prompts-virais.html', icon: 'fa-bolt', status: 'ativo' },
  { id: 'tiktok-shop', name: 'TikTok Shop', category: 'REDES', file: 'tiktok-shop.html', icon: 'fa-tiktok', iconPrefix: 'fa-brands', status: 'ativo' },
  { id: 'facebook', name: 'Facebook', category: 'REDES', file: 'facebook.html', icon: 'fa-facebook', iconPrefix: 'fa-brands', status: 'ativo' },
  { id: 'youtube-shorts', name: 'YouTube e Shorts', category: 'REDES', file: 'youtube-shorts.html', icon: 'fa-youtube', iconPrefix: 'fa-brands', status: 'ativo' },

  // FERRAMENTAS
  { id: 'ferramentas-ia', name: 'Ferramentas IA', category: 'FERRAMENTAS', file: 'ferramentas-ia.html', icon: 'fa-screwdriver-wrench', status: 'ativo' },
  { id: 'tutoriais', name: 'Tutoriais', category: 'FERRAMENTAS', file: 'tutoriais.html', icon: 'fa-circle-play', status: 'ativo' }
];

function getModulesConfig() {
  const saved = localStorage.getItem('cm_modules_config');
  if (!saved) {
    localStorage.setItem('cm_modules_config', JSON.stringify(DEFAULT_MODULES));
    return DEFAULT_MODULES;
  }
  return JSON.parse(saved);
}

function saveModulesConfig(modules) {
  localStorage.setItem('cm_modules_config', JSON.stringify(modules));
}

// Bloqueia acesso caso a página atual esteja em manutenção
(function checkMaintenance() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  if (['admin.html', 'bloqueado.html', 'manutencao.html', 'config.html'].includes(currentPath)) return;

  const modules = getModulesConfig();
  const currentMod = modules.find(m => m.file === currentPath);
  if (currentMod && currentMod.status === 'manutencao') {
    window.location.href = `manutencao.html?modulo=${encodeURIComponent(currentMod.name)}`;
  }
})();

// Renderiza a navegação lateral com suporte aos estados Ativo / Manutenção
function renderDynamicSidebar(activeFile = 'index.html') {
  const navContainer = document.getElementById('dynamicSidebarNav');
  if (!navContainer) return;

  const modules = getModulesConfig();
  const categories = [
    { key: 'ESTRATÉGIAS', title: 'Estratégias' },
    { key: 'VÍDEOS', title: 'Vídeos & Clonagem' },
    { key: 'AGENTES', title: 'Agentes Especializados' },
    { key: 'REDES', title: 'Redes Sociais' },
    { key: 'FERRAMENTAS', title: 'Ferramentas & Sistema' }
  ];

  let html = `
    <div>
      <a href="index.html" class="flex items-center gap-3 px-3 py-2 rounded-lg ${activeFile === 'index.html' ? 'text-indigo-400 bg-indigo-950/30 border border-indigo-900/40' : 'text-slate-300 hover:bg-slate-900 hover:text-white'} transition">
        <i class="fa-solid fa-house"></i>
        <span>Início</span>
      </a>
    </div>
  `;

  categories.forEach(cat => {
    const catModules = modules.filter(m => m.category === cat.key && m.file !== 'index.html');
    if (catModules.length === 0) return;

    html += `
      <div class="space-y-1">
        <p class="px-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase">${cat.title}</p>
    `;

    catModules.forEach(mod => {
      const isCurrent = activeFile === mod.file;
      const isUnderMaintenance = mod.status === 'manutencao';
      const prefix = mod.iconPrefix || 'fa-solid';

      if (isUnderMaintenance) {
        html += `
          <a href="manutencao.html?modulo=${encodeURIComponent(mod.name)}" class="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-950/10 border border-amber-900/30 text-amber-400/80 hover:bg-amber-950/20 transition">
            <div class="flex items-center gap-3 truncate">
              <i class="${prefix} ${mod.icon} w-4 text-amber-500"></i>
              <span class="truncate">${mod.name}</span>
            </div>
            <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-800">Manutenção</span>
          </a>
        `;
      } else {
        html += `
          <a href="${mod.file}" class="flex items-center gap-3 px-3 py-2 rounded-lg ${isCurrent ? 'text-indigo-400 bg-indigo-950/30 border border-indigo-900/40 font-bold' : 'text-slate-400 hover:bg-slate-900 hover:text-white'} transition">
            <i class="${prefix} ${mod.icon} w-4"></i>
            <span class="truncate">${mod.name}</span>
          </a>
        `;
      }
    });

    html += `</div>`;
  });

  // Link de Configurações no rodapé do menu
  html += `
    <div class="space-y-1 pt-2 border-t border-slate-900">
      <a href="config.html" class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-300 hover:text-white transition">
        <div class="flex items-center gap-3">
          <i class="fa-solid fa-gear text-indigo-400 w-4"></i>
          <span>Configurações</span>
        </div>
        <span id="keyStatusBadge" class="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">...</span>
      </a>
    </div>
  `;

  navContainer.innerHTML = html;
}

window.addEventListener('DOMContentLoaded', () => {
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  renderDynamicSidebar(currentFile);
});
