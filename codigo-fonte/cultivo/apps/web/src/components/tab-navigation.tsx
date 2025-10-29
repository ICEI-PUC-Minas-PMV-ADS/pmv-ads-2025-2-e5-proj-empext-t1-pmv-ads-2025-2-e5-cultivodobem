import { Link, useLocation } from "@tanstack/react-router";
import { Archive, House, Menu, Users, Newspaper } from "lucide-react";

export default function TabNavigation() {
  const location = useLocation();
  const items = [
    { name: "Painel", icon: House, href: "/" },
    { name: "Grupo", icon: Users, href: "/groups" },
    { name: "Feed", icon: Newspaper, href: "/feed" },
    { name: "Colheitas", icon: Archive, href: "/harvests" },
    { name: "Menu", icon: Menu, href: "/menu" },
  ];

  return (
    <nav className="flex flex-row justify-between items-center fixed bottom-0 left-0 right-0 bg-white py-4 px-6 md:hidden z-50">
      {items.map((item) => {
        const selected = item.href === location.pathname;

        return (
          <Link
            key={item.name}
            to={item.href}
            className={`flex flex-col items-center ${selected ? "text-cultivo-green-dark" : "text-cultivo-primary"}`}
          >
            {<item.icon className="mb-1" />}
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
