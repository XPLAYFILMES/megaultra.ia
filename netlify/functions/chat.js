export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response("Método não permitido", { status: 405 });
  }

  const { mensagem } = await req.json();

  if (!mensagem) {
    return new Response(JSON.stringify({ erro: "Mensagem vazia." }), { status: 400 });
  }

  // Token gratuito da Hugging Face (adicionado nas variáveis de ambiente do Netlify)
  const HF_TOKEN = process.env.HF_TOKEN;

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-72B-Instruct/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "Qwen/Qwen2.5-72B-Instruct",
          messages: [
            { role: "system", content: "Você é um assistente prestativo, inteligente e responde sempre em português de forma clara." },
            { role: "user", content: mensagem }
          ],
          max_tokens: 500
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ erro: data.error || "Erro na inferência da IA" }), {
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    const respostaTexto = data.choices?.[0]?.message?.content || "Sem resposta.";

    return new Response(JSON.stringify({ resposta: respostaTexto }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ erro: "Erro interno no servidor: " + err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
