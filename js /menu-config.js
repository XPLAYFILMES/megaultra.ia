// modules-config.js - Gerenciador Central de Status dos Módulos

const DEFAULT_MODULES = [
  // ESTRATÉGIAS
  { id: "downloads", title: "Downloads", file: "downloads.html", category: "Estratégias", active: true },

  // VÍDEOS & CLONAGEM
  { id: "menina-da-roca", title: "Menina da Roça", file: "menina-da-roca.html", category: "Vídeos", active: true },
  { id: "clonador", title: "Clonagem de Vídeo", file: "index.html", category: "Vídeos", active: true },
  { id: "novelinhas-universal", title: "Novelinhas Universal", file: "novelinhas-universal.html", category: "Vídeos", active: true },
  { id: "mestre-30s", title: "Mestre 30s", file: "mestre-30s.html", category: "Vídeos", active: true },
  { id: "anti-pragas", title: "Receitas Anti-Pragas", file: "anti-pragas.html", category: "Vídeos", active: true },
  { id: "pov-produto", title: "POV Produto", file: "pov-produto.html", category: "Vídeos", active: true },
  { id: "tiktok-seedance", title: "TikTok Shop Seedance", file: "tiktok-seedance.html", category: "Vídeos", active: true },

  // AGENTES ESPECIALIZADOS
  { id: "gordo-magro", title: "Gordo para Magro", file: "gordo-magro.html", category: "Novos Agentes", active: true },
  { id: "velho-roca", title: "Reflexão do Velho da Roça", file: "velho-roca.html", category: "Novos Agentes", active: true },
  { id: "gerador-ganchos", title: "Gerador de Ganchos", file: "gerador-ganchos.html", category: "Novos Agentes", active: true },
  { id: "plantacoes", title: "Vídeos de Plantações", file: "plantacoes.html", category: "Novos Agentes", active: true },
  { id: "limpeza", title: "Vídeos de Limpeza", file: "limpeza.html", category: "Novos Agentes", active: true },
  { id: "novelinhas-gordos", title: "Novelinhas Gordos", file: "novelinhas-gordos.html", category: "Novos Agentes", active: true },
  { id: "upscale", title: "Upscale de Imagem", file: "upscale.html", category: "Novos Agentes", active: true },
  { id: "tiktok-shopee", title: "TikTok Shop & Shopee", file: "tiktok-shopee.html", category: "Novos Agentes", active: true },
  { id: "receitas-ebook", title: "Receitas p/ Ebook", file: "receitas-ebook.html", category: "Novos Agentes", active: true },
  { id: "encapsulados", title: "Vender Encapsulados", file: "encapsulados.html", category: "Novos Agentes", active: true },
  { id: "radar-tiktok", title: "Radar TikTok Shop", file: "radar-tiktok.html", category: "Novos Agentes", active: true },

  // REDES SOCIAIS
  { id: "prompts-virais", title: "Prompts Virais", file: "prompts-virais.html", category: "Redes Sociais", active: true },
  { id: "tiktok-shop", title: "TikTok Shop", file: "tiktok-shop.html", category: "Redes Sociais", active: true },
  { id: "facebook", title: "Facebook", file: "facebook.html", category: "Redes Sociais", active: true },
  { id: "youtube-shorts", title: "YouTube e Shorts", file: "youtube-shorts.html", category: "Redes Sociais", active: true },

  // FERRAMENTAS
  { id: "ferramentas-ia", title: "Ferramentas IA", file: "ferramentas-ia.html", category: "Ferramentas", active: true },
  { id: "tutoriais", title: "Tutoriais", file: "tutoriais.html", category: "Ferramentas", active: true }
];

function getModulesState() {
  const saved = localStorage.getItem('cm_modules_state');
  if (!saved) return DEFAULT_MODULES;
  try {
    const parsed = JSON.parse(saved);
    return DEFAULT_MODULES.map(m => {
      const match = parsed.find(p => p.id === m.id);
      return match ? { ...m, active: match.active } : m;
    });
  } catch (e) {
    return DEFAULT_MODULES;
  }
}

function setModuleState(id, isActive) {
  const current = getModulesState();
  const updated = current.map(m => m.id === id ? { ...m, active: isActive } : m);
  localStorage.setItem('cm_modules_state', JSON.stringify(updated));
  return updated;
}
