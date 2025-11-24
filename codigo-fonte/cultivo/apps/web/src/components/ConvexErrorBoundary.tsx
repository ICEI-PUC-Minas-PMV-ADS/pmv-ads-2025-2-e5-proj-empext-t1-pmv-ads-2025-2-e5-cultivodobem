import React from "react";

type State = { error: Error | null };

// Catches errors thrown during rendering (including thrown by Convex queries)
// and shows a friendly message with actionable steps for deployments.
export default class ConvexErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: any) {
    // Log additional context to console for easier debugging in deployed logs
    // (keeps runtime behavior unchanged)
    console.error("ConvexErrorBoundary caught an error:", error, info);
  }

  render() {
    if (this.state.error) {
      const message = this.state.error?.message ?? String(this.state.error);
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8f3ed]">
          <div className="max-w-xl w-full bg-white shadow-lg rounded-lg p-6 text-center">
            <h1 className="text-2xl font-bold mb-2 text-[#7c6a5c]">Erro de Conexão</h1>
            <p className="text-[#7c6a5c] mb-4">
              Ocorreu um erro ao tentar acessar o backend. Isso costuma acontecer quando a
              variável de ambiente <code>VITE_CONVEX_URL</code> está ausente ou incorreta
              na sua implantação.
            </p>
            <p className="text-sm text-[#7c6a5c] mb-4 break-words">{message}</p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => window.location.reload()}
                className="inline-block px-4 py-2 bg-[#ffa726] text-white rounded font-semibold"
              >
                Recarregar
              </button>
              <a
                href="/"
                className="inline-block px-4 py-2 border rounded font-semibold"
              >
                Voltar
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}
