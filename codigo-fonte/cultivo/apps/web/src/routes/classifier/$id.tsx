import { ensureAuthenticated } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/classifier/$id")({
  component: ViewSampleClassification,
  beforeLoad: ensureAuthenticated,
});

function ViewSampleClassification() {
  return (
    <div className="w-full h-screen flex flex-col items-center p-6 pt-18 bg-cultivo-background">
      <h1 className="font-bold text-xl text-cultivo-primary text-center">
        Resultado da análise
      </h1>
      {/* <img
        src={imageUrl}
        alt="Imagem da amostra"
        className="w-full aspect-square object-cover rounded-lg"
      /> */}
      <div
        className="flex flex-col gap-2 p-4 rounded-lg bg-white border border-cultivo-background-darker mt-6 w-full md:max-w-[540px]"
        style={{
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2 className="font-bold text-xl text-cultivo-primary">Amostra</h2>
      </div>
    </div>
  );
}
