import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { ExternalLink, Plus, Search } from "lucide-react";
import { api } from "../../../../../packages/backend/convex/_generated/api";
import { ensureUserRole } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export const Route = createFileRoute("/search-harvests/")({
  component: SearchHarvestsScreen,
  beforeLoad: () => ensureUserRole("Representante"),
});

function SearchHarvestsScreen() {
  const stocks = useQuery(api.beanstock.getBeanStocks);
  const [stocksWithLocation, setStocksWithLocation] = useState<any[]>([]);

  useEffect(() => {
    Promise.allSettled(
      (stocks || []).map((stock) =>
        axios.get(`https://viacep.com.br/ws/${stock.location}/json/`)
      )
    ).then((responses) =>
      setStocksWithLocation(
        responses.map((item: any, index) => ({
          ...(stocks?.[index] || {}),
          location: `${item.value.data.localidade} / ${item.value.data.estado}`,
        }))
      )
    );
  }, [stocks]);

  const [search, setSearch] = useState("");

  const filteredStocks = useMemo(() => {
    return stocksWithLocation.filter(
      (stock) =>
        stock.name.toLowerCase().includes(search.toLowerCase()) ||
        stock.location.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, stocksWithLocation]);

  return (
    <div className="screen flex flex-col items-center p-4">
      <div className="flex flex-row p-1 items-center border border-cultivo-muted rounded-lg md:max-w-md w-full">
        <Search className="text-cultivo-muted" />
        <input
          type="text"
          className="w-full ring-0 outline-0 ml-4"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Busque por nome, cidade ou estado"
        />
      </div>
      {filteredStocks &&
        filteredStocks.length > 0 &&
        filteredStocks.map((stock, index) => (
          <div
            key={index}
            className="flex flex-col p-4 md:max-w-md rounded-lg bg-white border border-cultivo-background-darker mt-6 w-full"
            style={{
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="flex flex-row justify-between items-center">
              <h3 className="text-xl text-cultivo-primary font-bold">
                {stock.name}
              </h3>
              <Link
                 to="/proposals/create"
                search={{ harvestId: stock._id }}
                className="flex flex-row items-center gap-2 text-cultivo-green-dark"
              >
                Enviar proposta <ExternalLink />
              </Link>
            </div>
            <div className="flex flex-row justify-between mt-4">
              <div>
                <p className="text-cultivo-primary text-base">
                  <strong className="font-bold">Quantidade:</strong>{" "}
                  {stock.quantity} sacas
                </p>
                <p className="text-cultivo-muted text-base mt-2 truncate">
                  Nota: {stock.lowestScore} - {stock.highestScore}
                </p>
                <p className="text-cultivo-muted text-base mt-2 truncate">
                  Localização: {stock.location}
                </p>
                <Carousel className="py-4">
                  <CarouselContent>
                    {stock.images.map((image: string) => (
                      <CarouselItem>
                        <img
                          src={image}
                          className="aspect-square object-cover select-none"
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {stock.images.length > 1 && (
                    <>
                      <CarouselPrevious />
                      <CarouselNext />
                    </>
                  )}
                </Carousel>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
