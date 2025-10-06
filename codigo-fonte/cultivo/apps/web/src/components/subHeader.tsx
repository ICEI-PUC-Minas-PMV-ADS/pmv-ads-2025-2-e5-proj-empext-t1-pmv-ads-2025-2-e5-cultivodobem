import { Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ModeToggle } from "./mode-toggle";
import { MoveLeft } from "lucide-react";

export default function SubHeader() {

    const router = useRouter();

    return (
        <div className="pr-10 pl-10 pt-2">
           <button className="flex items-center gap-1 px-2 py-1" onClick={() => router.navigate({ to: '/' })}>
                <MoveLeft />
                Voltar
           </button>
        </div>
    );
}
