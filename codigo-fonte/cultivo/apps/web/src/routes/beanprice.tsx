import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExternalLink, TrendingUp, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/beanprice")({
  component: RouteComponent,
});

type BeanPrice = {
  data: string;
  produto: string;
  unidade: string;
  valor: string;
};

function RouteComponent() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [prices, setPrices] = useState<BeanPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const loadingRef = useRef(true);

  const fetchPrices = () => {
    setLoading(true);
    loadingRef.current = true;
    setError(null);

    const iframe = iframeRef.current;
    if (!iframe) return;

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    iframeDoc.open();
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
</html>`);
    iframeDoc.close();

    let attempts = 0;
    const maxAttempts = 20; // 10 segundos (20 * 500ms)

    // Aguardar o widget carregar e extrair os dados
    const checkForData = () => {
      attempts++;
      const table = iframeDoc.querySelector(".imagenet-widget-tabela");
      
      if (table) {
        const rows = table.querySelectorAll("tbody tr");
        const extractedPrices: BeanPrice[] = [];

        rows.forEach((row) => {
          const cells = row.querySelectorAll("td");
          if (cells.length >= 3) {
            const dataCell = cells[0]?.textContent?.trim() || "";
            const produtoCell = cells[1];
            const valorCell = cells[2]?.textContent?.trim() || "";

            // Extrair nome do produto e unidade
            const produtoSpan = produtoCell?.querySelector(".maior");
            const unidadeSpan = produtoCell?.querySelector(".unidade");

            const produto = produtoSpan?.textContent?.trim() || produtoCell?.textContent?.trim() || "";
            const unidade = unidadeSpan?.textContent?.trim() || "";

            if (dataCell && produto && valorCell) {
              extractedPrices.push({
                data: dataCell,
                produto: produto.replace(/\s+/g, " "),
                unidade,
                valor: valorCell,
              });
            }
          }
        });

        if (extractedPrices.length > 0) {
          setPrices(extractedPrices);
          setLastUpdate(new Date());
          setLoading(false);
          loadingRef.current = false;
          return;
        }
      }

      // Se ainda não encontrou dados e não atingiu o limite
      if (attempts < maxAttempts) {
        setTimeout(checkForData, 500);
      } else {
        setError("Não foi possível carregar os dados. Tente novamente.");
        setLoading(false);
        loadingRef.current = false;
      }
    };

    setTimeout(checkForData, 1000);
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const formatDate = (dateStr: string) => {
    // Converter de DD/MM/YYYY para formato legível
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      return `${parts[0]}/${parts[1]}/${parts[2]}`;
    }
    return dateStr;
  };

  return (
    <div className="screen">
      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        <Card
          className="rounded-3xl border-0 shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
          style={{ background: "#f6efe4" }}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ background: "#e9f5eb" }}
                >
                  <TrendingUp size={24} style={{ color: "#2d7a31" }} />
                </div>
                <div>
                  <CardTitle
                    className="text-xl font-extrabold"
                    style={{ color: "#6b3f33" }}
                  >
                    Cotação do Feijão
                  </CardTitle>
                  <CardDescription style={{ color: "#9a7b6a" }}>
                    Preços atualizados do mercado
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchPrices}
                disabled={loading}
                className="rounded-xl"
                style={{
                  background: "#f9f2e8",
                  borderColor: "#eadfce",
                  color: "#6b3f33",
                }}
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
                <span className="ml-2 hidden sm:inline">Atualizar</span>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="px-4 sm:px-6 pb-6">
            {/* Iframe oculto para carregar o widget */}
            <iframe
              ref={iframeRef}
              title="Cotação Cepea"
              style={{ display: "none" }}
            />

            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2
                  size={40}
                  className="animate-spin mb-4"
                  style={{ color: "#f39a18" }}
                />
                <p className="text-sm" style={{ color: "#9a7b6a" }}>
                  Carregando cotações...
                </p>
              </div>
            )}

            {error && (
              <div
                className="rounded-xl border px-4 py-3 text-center"
                style={{
                  background: "#fef2f2",
                  borderColor: "#fecaca",
                  color: "#dc2626",
                }}
              >
                {error}
              </div>
            )}

            {!loading && !error && prices.length > 0 && (
              <>
                {/* Tabela para desktop */}
                <div className="hidden md:block overflow-hidden rounded-2xl border" style={{ borderColor: "#eadfce" }}>
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: "#eadfce" }}>
                        <th
                          className="px-4 py-3 text-left text-sm font-bold"
                          style={{ color: "#6b3f33" }}
                        >
                          Data
                        </th>
                        <th
                          className="px-4 py-3 text-left text-sm font-bold"
                          style={{ color: "#6b3f33" }}
                        >
                          Produto / Região
                        </th>
                        <th
                          className="px-4 py-3 text-left text-sm font-bold"
                          style={{ color: "#6b3f33" }}
                        >
                          Unidade
                        </th>
                        <th
                          className="px-4 py-3 text-right text-sm font-bold"
                          style={{ color: "#6b3f33" }}
                        >
                          Valor
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {prices.map((price, index) => (
                        <tr
                          key={index}
                          className="border-t transition-colors hover:bg-[#f9f2e8]"
                          style={{
                            borderColor: "#eadfce",
                            background: index % 2 === 0 ? "#f6efe4" : "#f9f2e8",
                          }}
                        >
                          <td
                            className="px-4 py-3 text-sm"
                            style={{ color: "#9a7b6a" }}
                          >
                            {formatDate(price.data)}
                          </td>
                          <td
                            className="px-4 py-3 text-sm font-medium"
                            style={{ color: "#6b3f33" }}
                          >
                            {price.produto}
                          </td>
                          <td
                            className="px-4 py-3 text-sm"
                            style={{ color: "#9a7b6a" }}
                          >
                            {price.unidade || "–"}
                          </td>
                          <td
                            className="px-4 py-3 text-right text-sm font-bold"
                            style={{ color: "#2d7a31" }}
                          >
                            {price.valor}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Cards para mobile */}
                <div className="md:hidden space-y-3">
                  {prices.map((price, index) => (
                    <div
                      key={index}
                      className="rounded-xl border p-4"
                      style={{
                        background: "#f9f2e8",
                        borderColor: "#eadfce",
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span
                          className="text-xs font-medium px-2 py-1 rounded-lg"
                          style={{ background: "#eadfce", color: "#9a7b6a" }}
                        >
                          {formatDate(price.data)}
                        </span>
                        <span
                          className="text-lg font-bold"
                          style={{ color: "#2d7a31" }}
                        >
                          {price.valor}
                        </span>
                      </div>
                      <p
                        className="text-sm font-medium mb-1"
                        style={{ color: "#6b3f33" }}
                      >
                        {price.produto}
                      </p>
                      {price.unidade && (
                        <p className="text-xs" style={{ color: "#9a7b6a" }}>
                          Unidade: {price.unidade}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Rodapé com fonte */}
                <div
                  className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border p-4"
                  style={{ background: "#f9f2e8", borderColor: "#eadfce" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: "#9a7b6a" }}>
                      Fonte:
                    </span>
                    <a
                      href="https://www.cepea.esalq.usp.br/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-semibold transition-colors hover:underline"
                      style={{ color: "#6b3f33" }}
                    >
                      CEPEA/ESALQ/USP
                      <ExternalLink size={12} />
                    </a>
                  </div>
                  {lastUpdate && (
                    <span className="text-xs" style={{ color: "#9a7b6a" }}>
                      Última atualização:{" "}
                      {lastUpdate.toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>

                {/* Aviso sobre os dados */}
                <p
                  className="mt-4 text-center text-xs"
                  style={{ color: "#9a7b6a" }}
                >
                  Os preços apresentados são indicadores de mercado fornecidos pelo
                  Centro de Estudos Avançados em Economia Aplicada (CEPEA).
                </p>
              </>
            )}

            {!loading && !error && prices.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm" style={{ color: "#9a7b6a" }}>
                  Nenhuma cotação disponível no momento.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
