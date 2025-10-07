import { createFileRoute } from "@tanstack/react-router";
import { Upload } from "lucide-react";
import { useState, type FormEvent, type ChangeEvent } from "react";
import { getUserIdFromLocalStorage } from "@/lib/utils";
import { useMutation } from "convex/react";
import { api } from "../../../../../packages/backend/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/classifier/")({
  component: RouteComponent,
});

function RouteComponent() {
  const generateUploadUrl = useMutation(api.upload.generateUploadUrl);
  const sendImage = useMutation(api.upload.sendImage);

  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedImage(file);
  };

  const handleSendImage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const userId = getUserIdFromLocalStorage();
    setLoading(true);
    const postUrl = await generateUploadUrl();

    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": selectedImage!.type },
      body: selectedImage,
    });

    const { storageId } = await result.json();
    await sendImage({ storageId, userId: userId });

    setSelectedImage(null);
    setLoading(false);
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
          {selectedImage && loading ? (
            <Skeleton className="w-full h-10 rounded-lg" />
          ) : (
            <input
              type="submit"
              value="Classificar"
              className="bg-cultivo-green-dark text-white rounded-lg py-2 px-4 cursor-pointer"
              disabled={loading}
            />
          )}
        </form>
      </div>
    </div>
  );
}
