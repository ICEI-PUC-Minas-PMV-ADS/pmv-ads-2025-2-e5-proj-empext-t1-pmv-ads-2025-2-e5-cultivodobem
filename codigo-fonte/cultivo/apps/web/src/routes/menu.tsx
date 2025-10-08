import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/menu')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/menu"!</div>
}
