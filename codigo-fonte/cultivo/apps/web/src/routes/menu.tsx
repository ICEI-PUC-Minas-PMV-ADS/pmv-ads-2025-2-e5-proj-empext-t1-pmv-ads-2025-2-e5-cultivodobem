import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { UserCog, Bot, ChevronLeft } from "lucide-react";

export const Route = createFileRoute('/menu')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate();
  
  return (
    <div className="screen flex flex-col min-h-screen bg-white">
      {/* Content */}
      <div className="flex-1">
        <div className="max-w-2xl mx-auto px-4">
          {/* Links */}
          <div className="space-y-4">
            <Link
              to="/editusers"
              className="flex items-center gap-4 p-4 no-underline text-[#62331B] bg-[#E8F5E9] rounded-lg hover:bg-[#C8E6C9] transition-colors"
            >
              <div className="bg-white p-2 rounded-lg">
                <UserCog className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <span className="text-lg font-medium">Editar Perfil</span>
                <p className="text-sm text-gray-600 mt-0.5">Gerencie suas informações de perfil</p>
              </div>
              <ChevronLeft className="w-5 h-5 transform rotate-180" />
            </Link>

            <Link
              to="/assistant"
              className="flex items-center gap-4 p-4 no-underline text-[#62331B] bg-[#E8F5E9] rounded-lg hover:bg-[#C8E6C9] transition-colors"
            >
              <div className="bg-white p-2 rounded-lg">
                <Bot className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <span className="text-lg font-medium">Assistente Virtual</span>
                <p className="text-sm text-gray-600 mt-0.5">Obtenha ajuda do seu assistente virtual</p>
              </div>
              <ChevronLeft className="w-5 h-5 transform rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
