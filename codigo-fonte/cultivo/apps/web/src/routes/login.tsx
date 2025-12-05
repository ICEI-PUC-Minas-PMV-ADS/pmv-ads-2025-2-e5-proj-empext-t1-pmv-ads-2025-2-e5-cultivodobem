import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { Label } from "@/components/ui/label";
import "@/styles/login.css";
import { useMutation } from "convex/react";
import { api } from "../../../../packages/backend/convex/_generated/api.js";

export const Route = createFileRoute("/login")({
  component: LoginComponent,
});

function LoginComponent() {
  const login = useMutation(api.auth.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await login({
        email: email.trim().toLowerCase(),
        password,
      });
      localStorage.setItem("user", JSON.stringify(user));
      window.dispatchEvent(new Event("auth-changed"));
      toast.success("Login realizado com sucesso!");
      router.navigate({ to: "/" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Tratar mensagens de erro específicas do Convex
      if (errorMessage.toLowerCase().includes("credenciais inválidas") || 
          errorMessage.toLowerCase().includes("invalid credentials")) {
        toast.error("E-mail ou senha incorretos. Verifique suas credenciais.");
      } else if (errorMessage.toLowerCase().includes("network") || 
                 errorMessage.toLowerCase().includes("fetch")) {
        toast.error("Erro de conexão. Verifique sua internet e tente novamente.");
      } else if (errorMessage.includes("[CONVEX")) {
        // Erro genérico do Convex - mostrar mensagem amigável
        toast.error("Não foi possível realizar o login. Tente novamente.");
      } else {
        toast.error("Erro ao fazer login. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  //       // Salvar dados do usuário no localStorage
  //       localStorage.setItem("user", JSON.stringify(user));

  //       toast.success("Login realizado com sucesso!");

  //       // Redirecionar para a página de todos
  //       router.navigate({ to: "/todos" });
  //     } else {
  //       throw new Error("Credenciais inválidas");
  //     }
  //   } catch (error) {
  //     toast.error(
  //       error instanceof Error ? error.message : "Erro ao fazer login"
  //     );
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <div className="login-container">
      {/* Container principal responsivo */}
      <div className="login-form-wrapper">
        {/* Header com logo e título */}
        <div className="login-header">
          {/* Logo Cultivo do Bem */}
          <div className="login-logo-container">
            <img src={logo} alt="Cultivo do Bem" className="login-logo" />
          </div>

          <h1 className="login-title">Acessar Conta</h1>
        </div>

        {/* Formulário */}
        <div>
          <form onSubmit={handleSubmit} className="login-form">
            {/* Campo Email */}
            <div className="login-field">
              <Label htmlFor="email" className="login-label">
                Email
              </Label>
              <input
                id="email"
                type="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="login-input"
              />
            </div>

            {/* Campo Senha */}
            <div className="login-field">
              <Label htmlFor="password" className="login-label">
                Senha
              </Label>
              <input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="login-input"
              />
            </div>

            {/* Link Esqueceu a senha */}
            <div className="login-forgot-password">
              <button
                type="button"
                className="login-forgot-link"
                onClick={() => router.navigate({ to: "/forgot" })}
              >
                Esqueceu sua senha?
              </button>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              className="login-submit-button"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>

            {/* Link para cadastro */}
            <div className="login-register-section">
              <span className="login-register-text">Não tem uma conta? </span>
              <button
                type="button"
                className="login-register-link"
                onClick={() => router.navigate({ to: "/signup" })}
              >
                Cadastre-se
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
