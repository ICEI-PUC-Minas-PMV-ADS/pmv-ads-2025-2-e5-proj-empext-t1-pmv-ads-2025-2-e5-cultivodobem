import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

export const Route = createFileRoute('/beanprice')({
  component: RouteComponent,
})

function RouteComponent() {
  const widgetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = widgetRef.current
    if (!container) return

    // Render the external widget inside an iframe so document.write does not break the app.
    const iframe = document.createElement('iframe')
    iframe.title = 'Cotação Cepea'
    iframe.width = '100%'
    iframe.height = '320'
    iframe.style.border = '0'
    iframe.setAttribute('scrolling', 'no')

    container.innerHTML = ''
    container.appendChild(iframe)

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDoc) return

    iframeDoc.open()
    iframeDoc.write(`<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <base target="_parent" />
    <style>
      body { margin: 0; background: transparent; }
    </style>
  </head>
  <body>
    <script type="text/javascript" src="https://www.cepea.org.br/br/widgetproduto.js.php?fonte=arial&tamanho=10&largura=900px&corfundo=dbd6b2&cortexto=333333&corlinha=ede7bf&id_indicador%5B%5D=380-1&id_indicador%5B%5D=380-380&id_indicador%5B%5D=381-56&id_indicador%5B%5D=381-124&id_indicador%5B%5D=381-405&id_indicador%5B%5D=381-61&id_indicador%5B%5D=381-428&id_indicador%5B%5D=381-413&id_indicador%5B%5D=381-1&id_indicador%5B%5D=381-380&id_indicador%5B%5D=380-56&id_indicador%5B%5D=380-417&id_indicador%5B%5D=380-138&id_indicador%5B%5D=380-405&id_indicador%5B%5D=380-61&id_indicador%5B%5D=380-428&id_indicador%5B%5D=380-413"></script>
  </body>
</html>`)
    iframeDoc.close()

    const resize = () => {
      const body = iframeDoc.body
      if (body) {
        iframe.height = `${body.scrollHeight}px`
      }
    }

    const observer = new MutationObserver(resize)
    const body = iframeDoc.body
    if (body) {
      observer.observe(body, { childList: true, subtree: true })
    }
    resize()

    return () => {
      observer.disconnect()
      container.innerHTML = ''
    }
  }, [])

  return (
    <div>
      <h1>Preço do Feijão</h1>
      <div ref={widgetRef} />
    </div>
  )
}
