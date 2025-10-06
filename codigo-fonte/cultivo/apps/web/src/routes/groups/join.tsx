import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../../packages/backend/convex/_generated/api'
import { getUserIdFromLocalStorage } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/groups/join')({ component: RouteComponent })

function RouteComponent() {
  const groupId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('groupId') : null
  const userId = getUserIdFromLocalStorage()
  const [group, setGroup] = useState<any | null>(null)
  const addParticipant = useMutation(api.group.addParticipant)

  useEffect(() => {
    if (!groupId) return
    ;(async () => {
      try {
        const res = await fetch('/_/convex/express', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ function: 'group.getById', args: [{ id: groupId }] }),
        })
        const payload = await res.json()
        setGroup(payload?.result ?? null)
      } catch (e) {
        console.error(e)
      }
    })()
  }, [groupId])

  if (!groupId) return <div className="p-4">Link inválido.</div>

  useEffect(() => {
    if (!group || !userId) return
    const isOwner = String(userId) === String(group.createdBy) || String(userId) === String(group.userId)
    if (isOwner) {
      window.location.href = '/groups/owned'
    }
  }, [group, userId])

  async function onJoin() {
    if (!userId) {
      alert('Você precisa entrar para participar do grupo.');
      window.location.href = '/login'
      return
    }
  await addParticipant({ groupId: groupId as any, userId: userId as any })
    alert('Você entrou no grupo!')
    window.location.href = '/groups/participating'
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Entrar no Grupo</h1>
      {!group && <div>Carregando...</div>}
      {group && (
        <div className="rounded-lg border p-4">
          <div className="group-name text-lg font-semibold">{group.name}</div>
          <div className="group-desc">{group.description}</div>
          <div className="mt-3">
            <Button onClick={onJoin}>Entrar no grupo</Button>
            <Button variant="secondary" onClick={() => window.location.href = '/'}>Cancelar</Button>
          </div>
        </div>
      )}
    </div>
  )
}
