import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../packages/backend/convex/_generated/api";

export const Route = createFileRoute("/assistant")({
  component: RouteComponent,
});

function RouteComponent() {
  const [pergunta, setPergunta] = useState("");
  const [resposta, setResposta] = useState("");
  const [carregando, setCarregando] = useState(false);

  const promptAssistant = useAction(api.chat.promptAssistant);

  const enviarPergunta = async () => {
    if (!pergunta.trim()) return;
    setCarregando(true);
    try {
      const respostaGemini = await promptAssistant({ prompt: pergunta });
      setResposta(respostaGemini ?? "");
    } catch (err) {
      console.error(err);
      setResposta("⚠️ Ocorreu um erro ao se comunicar com o assistente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <section className="screen justify-center items-center">
      <div
        style={{
          maxWidth: "600px",
          margin: "40px auto",
          padding: "20px",
          border: "2px solid #ccc",
          borderRadius: "12px",
          backgroundColor: "#f9f9f9",
          fontFamily: "sans-serif",
        }}
      >
        <h2>🤖 Assistente Virtual - Cultura do Feijão</h2>

        <textarea
          placeholder="Digite sua pergunta..."
          value={pergunta}
          onChange={(e) => setPergunta(e.target.value)}
          rows={4}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #999",
            marginBottom: "10px",
          }}
        />

        <button
          onClick={enviarPergunta}
          disabled={carregando}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "2px solid #4f46e5",
            background: carregando ? "#ccc" : "transparent",
            color: carregando ? "#555" : "#4f46e5",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {carregando ? "Pensando..." : "Enviar"}
        </button>

        {resposta && (
          <div
            style={{
              marginTop: "20px",
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "15px",
              whiteSpace: "pre-wrap",
            }}
          >
            <strong>Resposta:</strong>
            <br />
            {resposta}
          </div>
        )}
      </div>
    </section>
  );
}
