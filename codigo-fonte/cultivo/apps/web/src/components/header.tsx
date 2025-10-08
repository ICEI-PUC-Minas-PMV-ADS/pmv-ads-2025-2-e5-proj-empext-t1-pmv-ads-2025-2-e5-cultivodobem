import { Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ModeToggle } from "./mode-toggle";

export default function Header() {
  const links = [
    { to: "/", label: "Home" },
    { to: "/feed", label: "Feed" },
    { to: "/editusers", label: "Edit Users" },
  ] as const;

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
    // ouvir as mudanças na mesma aba para exibir o nome do usuário logado
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

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label }) => {
            return (
              <Link key={to} to={to}>
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
              <button
                onClick={logout}
                className="rounded-md px-3 py-1 text-sm"
                style={{
                  background: "var(--login-button-bg, #f99d1c)",
                  color: "#fff",
                }}
              >
                Sair
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-md px-3 py-1 text-sm"
              style={{
                background: "var(--login-button-bg, #f99d1c)",
                color: "#fff",
              }}
            >
              Entrar
            </Link>
          )}
          <ModeToggle />
        </div>
      </div>
      <hr />
    </div>
  );
}
