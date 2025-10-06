import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../../../../packages/backend/convex/_generated/api'
import { getUserIdFromLocalStorage } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/groups/owned')({ component: RouteComponent })

function RouteComponent() {
  const userId = getUserIdFromLocalStorage()
  const groups = useQuery(api.group.listByUser, userId ? { userId } : 'skip')

  if (!userId) return <div className="p-4">Usuário não autenticado.</div>

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Meus Grupos</h1>
      {!groups && <div>Carregando...</div>}
      {groups && groups.length === 0 && <div>Nenhum grupo criado por você.</div>}
      <ul className="groups-list">
        {groups?.map((g: any) => (
          <li key={g._id} className="group-item">
            <div>
              <div className="group-name">{g.name}</div>
              <div className="group-desc">{g.description}</div>
              <div className="group-stock">Estoque: {g.stock}</div>
            </div>
            <div className="group-actions">
              <Button onClick={() => (window.location.href = '/groups/')}>Ver todos</Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
