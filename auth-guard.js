<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Acesso Bloqueado | CineMorph AI</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-black text-slate-100 min-h-screen flex items-center justify-center p-4 font-sans">
  <div class="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full text-center space-y-5 shadow-2xl">
    <div class="w-16 h-16 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-full flex items-center justify-center mx-auto text-2xl">
      <i class="fa-solid fa-lock"></i>
    </div>
    
    <div class="space-y-2">
      <h1 class="text-lg font-bold text-white uppercase tracking-wide">CineMorph AI — Acesso Indisponível</h1>
      <p id="motivoMsg" class="text-xs text-slate-400 leading-relaxed">
        Seu período de assinatura de 30 dias expirou ou este link não possui uma licença ativa.
      </p>
    </div>

    <div class="pt-2">
      <a href="https://wa.me/" target="_blank" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer">
        <i class="fa-brands fa-whatsapp text-sm"></i>
        <span>Falar com Suporte para Renovar</span>
      </a>
    </div>
  </div>

  <script>
    const params = new URLSearchParams(window.location.search);
    const motivo = params.get('motivo');
    const nome = params.get('nome');
    const msg = document.getElementById('motivoMsg');

    if (motivo === 'expirado') {
      msg.innerHTML = `Olá <strong>${nome || 'Assinante'}</strong>, sua licença de 30 dias no CineMorph AI expirou. Fale com o suporte para renovar o acesso.`;
    } else {
      msg.innerText = "Este link é restrito para clientes autorizados da plataforma CineMorph AI. Utilize o link exclusivo enviado pelo administrador.";
    }
  </script>
</body>
</html>
