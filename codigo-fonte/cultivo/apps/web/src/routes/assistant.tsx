import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../packages/backend/convex/_generated/api";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const Route = createFileRoute("/assistant")({
  component: RouteComponent,
});

/**
 * Componente principal da interface de chat do Assistente Virtual.
 * Transforma a tela em uma interface de chat responsiva.
 */
function RouteComponent() {
  // O estado 'chatHistory' armazena todas as mensagens (usuário e assistente)
  const [chatHistory, setChatHistory] = useState<
    {
      id: number;
      role: string;
      content: string;
    }[]
  >([]);
  const [currentInput, setCurrentInput] = useState("");
  const [carregando, setCarregando] = useState(false); // O hook useAction está mockado acima, mas mantém a sintaxe original

  const promptAssistant = useAction(api.chat.promptAssistant);

  const enviarPergunta = async () => {
    const pergunta = currentInput.trim();
    if (!pergunta) return;

    // 1. Limpa o input e adiciona a mensagem do usuário ao histórico
    setCurrentInput("");
    const userMessage = { id: Date.now(), role: "user", content: pergunta };
    setChatHistory((prev) => [...prev, userMessage]);

    setCarregando(true);

    // Adiciona um placeholder para a resposta do assistente (para mostrar o estado 'Pensando...')
    const assistantPlaceholderId = Date.now() + 1;
    const assistantPlaceholder = {
      id: assistantPlaceholderId,
      role: "assistant",
      content: "Pensando...",
    };
    setChatHistory((prev) => [...prev, assistantPlaceholder]);

    try {
      const respostaGemini = await promptAssistant({ prompt: pergunta });

      // 2. Atualiza o placeholder com a resposta real
      setChatHistory((prev) =>
        prev.map((msg) =>
          msg.id === assistantPlaceholderId
            ? { ...msg, content: respostaGemini, role: "assistant" }
            : msg
        )
      );
    } catch (err) {
      console.error(err);
      // 3. Atualiza o placeholder em caso de erro
      setChatHistory((prev) =>
        prev.map((msg) =>
          msg.id === assistantPlaceholderId
            ? {
                ...msg,
                content: "⚠️ Ocorreu um erro ao se comunicar com o assistente.",
                role: "assistant",
              }
            : msg
        )
      );
    } finally {
      setCarregando(false);
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.key === "Enter" && !carregando && !e.shiftKey) {
      e.preventDefault();
      enviarPergunta();
    }
  };

  return (
    <section className="screen flex flex-col h-screen bg-gray-50 p-4 font-inter antialiased">
      <div className="max-w-3xl w-full mx-auto flex flex-col flex-grow bg-white rounded-xl shadow-2xl overflow-hidden">
        <header className="bg-indigo-500 text-white p-4 flex items-center shadow-md">
          <span className="text-2xl mr-3">🤖</span>
          <h2 className="text-xl font-semibold">
            Pergunte ao Assistente Virtual
          </h2>
        </header>
        <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {chatHistory.length === 0 ? (
            <div className="text-center text-gray-500 mt-12">
              <p className="text-lg">Pronto para começar?</p>
              <p className="text-sm">
                Pergunte sobre preços, safras, ou dados de mercado do feijão.
              </p>
            </div>
          ) : (
            chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-4/5 p-3 rounded-xl shadow-md transition-all duration-300
                            ${
                              msg.role === "user"
                                ? "bg-indigo-500 text-white rounded-br-none"
                                : "bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200"
                            }`}
                >
                  {msg.role === "assistant" && msg.content === "Pensando..." ? (
                    <div className="flex items-center space-x-2 text-sm text-gray-500 italic">
                      <svg
                        className="animate-spin h-5 w-5 text-indigo-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>{msg.content}</span>
                    </div>
                  ) : (
                    <div className="markdown-body">
                      <Markdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </Markdown>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div id="bottom-anchor" />
        </div>
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex space-x-3">
            <textarea
              placeholder="Digite sua pergunta..."
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={2}
              className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition duration-150"
              disabled={carregando}
            />
            <button
              onClick={enviarPergunta}
              disabled={carregando || !currentInput.trim()}
              className={`
                        px-6 py-2 rounded-lg text-white font-semibold shadow-md transition duration-300
                        ${
                          carregando || !currentInput.trim()
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800"
                        }
                    `}
            >
              {carregando ? "..." : "Enviar"}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        /* Custom scrollbar for chat history */
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1; /* slate-300 */
            border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8; /* slate-400 */
        }
        
        /* Basic Markdown styling for text output */
        .markdown-body p {
            margin-bottom: 0.5rem;
        }
        .markdown-body strong {
            font-weight: 600;
        }
        .markdown-body ul, .markdown-body ol {
            margin-left: 1.5rem;
            margin-bottom: 0.5rem;
        }
        .markdown-body li {
            margin-bottom: 0.25rem;
        }
        .markdown-body code {
            background-color: #e0e7ff; /* indigo-100 */
            padding: 2px 4px;
            border-radius: 4px;
            font-family: monospace;
        }
      `}</style>
    </section>
  );
}
