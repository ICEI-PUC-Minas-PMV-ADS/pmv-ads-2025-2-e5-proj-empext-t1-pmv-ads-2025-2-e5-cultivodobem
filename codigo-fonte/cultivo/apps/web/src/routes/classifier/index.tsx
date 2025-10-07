import { createFileRoute } from "@tanstack/react-router";
import { Upload } from "lucide-react";
import { useState, type FormEvent, type ChangeEvent } from "react";
import { ensureAuthenticated, getUserIdFromLocalStorage } from "@/lib/utils";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../../../packages/backend/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";

export const Route = createFileRoute("/classifier/")({
  component: ClassifySample,
  beforeLoad: ensureAuthenticated,
});

function ClassifySample() {
  const generateUploadUrl = useMutation(api.upload.generateUploadUrl);
  const sendImage = useMutation(api.upload.sendImage);
  const classifySample = useAction(api.classifier.classifySample);

  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedImage(file);
  };

  const handleSendImage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedImage) return;

    setLoading(true);
    try {
      const userId = getUserIdFromLocalStorage();
      setLoading(true);

      const { url } = await generateUploadUrl();

      const response = await axios.post(url, selectedImage, {
        headers: {
          "Content-Type": selectedImage.type,
        },
      });

      const storageId = response.data.storageId;
      await sendImage({ storageId, userId });
      const analysis = await classifySample({
        storageId,
        fileType: selectedImage.type,
        userId,
      });
      setAnalysis(analysis);

      setSelectedImage(null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center p-6 pt-18 bg-cultivo-background">
      <h1 className="font-bold text-xl text-cultivo-primary text-center">
        Classificar amostra
      </h1>
      <div
        className="flex flex-col gap-2 p-4 rounded-lg bg-white border border-cultivo-background-darker mt-6 w-full md:max-w-[540px]"
        style={{
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2 className="font-bold text-xl text-cultivo-primary">Amostra</h2>

        {selectedImage && (
          <div className="flex flex-col gap-2 p-4 bg-cultivo-background-darker rounded-lg items-center">
            <div className="relative w-full">
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Imagem selecionada"
                className="w-full aspect-square object-cover rounded-lg"
              />
            </div>
            <span className="text-cultivo-muted font-semibold line-clamp-1">
              Arquivo selecionado: {selectedImage.name}
            </span>
          </div>
        )}

        <form onSubmit={handleSendImage} className="flex flex-col gap-4">
          <label
            htmlFor="upload"
            className="flex flex-row items-center gap-2 cursor-pointer p-4 border border-cultivo-primary rounded-lg hover:text-cultivo-muted transition-all"
          >
            <Upload />
            <input
              type="file"
              id="upload"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <span className="font-semibold">
              Selecionar arquivo (jpeg, png, jpg)
            </span>
          </label>
          {selectedImage &&
            (loading ? (
              <Skeleton className="w-full h-10 rounded-lg" />
            ) : (
              <input
                type="submit"
                value="Classificar"
                className="bg-cultivo-green-dark text-white rounded-lg py-2 px-4 cursor-pointer"
                disabled={loading}
              />
            ))}
        </form>
        {analysis && (
          <div className="flex flex-col gap-2 p-4 rounded-lg bg-white border border-cultivo-background-darker mt-6 w-full md:max-w-[540px]">
            <h2 className="font-bold text-xl text-cultivo-primary">Análise</h2>
            <pre className="flex-1 overflow-y-auto">
              {JSON.stringify(analysis, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
