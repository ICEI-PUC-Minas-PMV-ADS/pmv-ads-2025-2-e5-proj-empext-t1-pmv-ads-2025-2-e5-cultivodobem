import logo from "@/assets/logo.png";
import { Link, useRouter } from "@tanstack/react-router";
import { LogIn, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

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
          { to: "/groups", label: "Grupo" },
          { to: "/harvest", label: "Colheitas" },
          { to: "/feed", label: "Informações" },
          { to: "/assistant", label: "Assistente Virtual" },
          { to: "/menu", label: "Menu" },
        ]
    : [
        { to: "/about", label: "Quem somos" },
        { to: "/contact", label: "Fale conosco" },
      ];

  return (
    <div className="fixed top-0 left-0 right-0 bg-white h-16 z-50">
      <div className="flex flex-row items-center justify-between px-2 py-1 h-full">
        <nav className="flex gap-4 items-center">
          <Link to="/">
            <img src={logo} alt="Cultivo do Bem" width={48} height={48} />
          </Link>
          <div className="flex flex-row gap-4 md:hidden font-bold text-cultivo-primary text-xl">
            Cultivo do Bem
          </div>
          <div className="flex flex-row gap-4 max-md:hidden">
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
          </div>
        </nav>
        <div className="flex items-center gap-3">
          {sessionUser ? (
            <>
              <span className="max-md:hidden">
                Olá, <strong>{sessionUser.name ?? sessionUser.email}</strong>
              </span>
              <button className="flex flex-row justify-center items-center gap-2 bg-cultivo-secondary text-white font-medium rounded-lg py-1 px-2 cursor-pointer" onClick={logout}>
                Sair
                <LogOut width={14} height={14} />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex flex-row justify-center items-center gap-2 border border-cultivo-green-dark text-cultivo-green-dark text-sm font-medium rounded-lg py-1 px-2"
            >
              Entrar
              <LogIn width={14} height={14} />
            </Link>
          )}
          {/* <ModeToggle /> */}
        </div>
      </div>
      <hr />
    </div>
  );
}
