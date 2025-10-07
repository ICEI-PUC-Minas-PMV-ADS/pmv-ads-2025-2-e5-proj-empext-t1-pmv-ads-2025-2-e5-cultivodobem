import { Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ModeToggle } from "./mode-toggle";
import logo from "@/assets/logo-mini.png";
import { LogIn, LogOut } from "lucide-react";

export default function HeaderNavigation() {
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<any>(null);
  useEffect(() => {
    const load = () => {
      try {
        setSessionUser(JSON.parse(localStorage.getItem("user") || "null"));
      } catch {
        setSessionUser(null);
      }
    };
    load();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "user") load();
    };
    window.addEventListener("storage", onStorage);

    const onAuthChanged = () => load();
    window.addEventListener("auth-changed", onAuthChanged as any);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("auth-changed", onAuthChanged as any);
    };
  }, []);

  function logout() {
    localStorage.removeItem("user");
    setSessionUser(null);
    window.dispatchEvent(new Event("auth-changed"));
    router.navigate({ to: "/login" });
  }

  const links = sessionUser
    ? sessionUser.tipo_usuario === "Produtor Rural"
      ? [{ to: "/menu", label: "Menu" }]
      : [
          { to: "/groups", label: "Meu Grupo" },
          { to: "/harvest", label: "Colheitas" },
          { to: "/menu", label: "Menu" },
        ]
    : [
        { to: "/about", label: "Quem somos" },
        { to: "/contact", label: "Fale conosco" },
      ];

  return (
    <div className="fixed top-0 left-0 right-0 bg-white">
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 items-center">
          <Link to="/">
            <img src={logo} alt="Cultivo do Bem" width={48} height={48} />
          </Link>
          {links.map(({ to, label }) => {
            return (
              <Link
                key={to}
                to={to}
                className="text-cultivo-primary hover:text-cultivo-secondary font-medium text-md underline"
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          {sessionUser ? (
            <>
              <span className="text-sm">
                Olá, <strong>{sessionUser.name ?? sessionUser.email}</strong>
              </span>
              <button className="flex flex-row justify-center items-center gap-2 bg-cultivo-secondary text-white rounded-lg p-2 cursor-pointer">
                Sair
                <LogOut width={14} height={14} />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex flex-row justify-center items-center gap-2 bg-cultivo-green-dark text-white text-sm rounded-lg p-2"
            >
              Entrar
              <LogIn width={14} height={14} />
            </Link>
          )}
          <ModeToggle />
        </div>
      </div>
      <hr />
    </div>
  );
}
