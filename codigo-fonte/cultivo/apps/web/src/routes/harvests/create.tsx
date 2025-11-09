import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../../../packages/backend/convex/_generated/api";
import { useEffect, useState, type ChangeEvent } from "react";
import type { Id } from "../../../../../packages/backend/convex/_generated/dataModel";
import Dropzone from "dropzone";
import { ensureAuthenticated, getUserIdFromLocalStorage } from "@/lib/utils";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

export const Route = createFileRoute("/harvests/create")({
  component: RouteComponent,
  beforeLoad: ensureAuthenticated,
});

function RouteComponent() {
  const generateUploadUrl = useMutation(api.upload.generateUploadUrl);
  const sendImage = useMutation(api.upload.sendImage);
  const classifySample = useAction(api.classifier.classifySample);
  const createHarvest = useMutation(api.harvests.createHarvest);
  const router = useRouter();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageStorageId, setImageStorageId] = useState<Id<"_storage"> | null>(
    null
  );
  const [processing, setProcessing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

    if (!file) return;

    saveImageToStorage(file);
  };

  useEffect(() => {
    Dropzone.autoDiscover = false;
    const myDropzone = new Dropzone("#dropzone", {
      createImageThumbnails: false,
      acceptedFiles: "image/jpeg, image/png, image/jpg",
      previewTemplate: `<div style="display: none;"></div>`,
    });

    const addedFileSubscription = myDropzone.on(
      "addedfile",
      saveImageToStorage
    );

    return () => {
      myDropzone.destroy();
      addedFileSubscription.destroy();
    };
  }, []);

  const saveImageToStorage = async (image: File) => {
    try {
      setUploading(true);

      const userId = getUserIdFromLocalStorage();

      const url = await generateUploadUrl();

      const response = await axios.post(url, image, {
        headers: {
          "Content-Type": image.type,
        },
      });

      const storageId = response.data.storageId;
      await sendImage({ storageId, userId });

      setImageStorageId(storageId);
      setSelectedImage(image);
    } catch (error: any) {
      console.log(error.message);

      if (error === "The image is not a bean sample") {
        toast.error("A imagem selecionada não é uma amostra de feijão", {
          position: "top-right",
          duration: 3000,
        });
      } else {
        toast.error("Erro ao salvar imagem", {
          position: "top-right",
          duration: 3000,
        });
      }
    } finally {
      setUploading(false);
    }
  };

  const schema = z.object({
    date: z.string(),
    quantity: z
      .number({ message: "Informe a quantidade" })
      .min(1, "A quantidade deve ser maior que zero"),
    observations: z.string().optional(),
  });

  type FormData = z.infer<typeof schema>;

  const defaultValues = {
    date: new Date().toISOString(),
    quantity: 1,
    observations: "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: defaultValues,
  });

  const onSubmit = async (data: FormData) => {
    if (!selectedImage || !imageStorageId) return;

    try {
      setProcessing(true);

      const userId = getUserIdFromLocalStorage();

      const { id, error } = await classifySample({
        storageId: imageStorageId,
        fileType: selectedImage.type,
        userId,
      });

      if (error === "The image is not a bean sample") {
        toast.error("A imagem selecionada não é uma amostra de feijão", {
          position: "top-right",
          duration: 3000,
        });
        return;
      } else if (error || !id) {
        throw new Error("Failed to classify sample");
      }

      const harvestId = await createHarvest({
        date: new Date(data.date).getTime(),
        quantity: data.quantity,
        observations: data.observations,
        analysisId: id,
        userId,
      });

      if (!harvestId) {
        throw new Error("Failed to create harvest");
      }

      router.navigate({ to: "/harvests" });
    } catch (error) {
      console.error(error);

      toast.error("Erro ao classificar amostra", {
        position: "top-right",
        duration: 3000,
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <section className="screen flex flex-col items-center p-4">
      <h1 className="font-bold text-2xl text-cultivo-primary text-center">
        Registrar Nova Colheita
      </h1>
      <div
        className="flex flex-col gap-2 p-4 rounded-lg bg-white border border-cultivo-background-darker mt-6 w-full md:max-w-[540px]"
        style={{
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2 className="font-bold text-xl text-cultivo-primary">Amostra</h2>

        <p className="text-cultivo-primary flex-1">
          Selecione um arquivo ou arraste e solte uma imagem da amostra de
          feijão a ser classificada. O sistema aceita apenas arquivos JPEG, PNG
          e JPG.
        </p>

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

        <form className="flex flex-col gap-4" id="dropzone" action="/target">
          {!uploading && (
            <label
              htmlFor="upload"
              className="flex flex-row items-center gap-2 cursor-pointer p-4 rounded-lg border-2 border-dashed border-cultivo-primary text-cultivo-primary"
            >
              <Upload />
              <input
                type="file"
                id="upload"
                className="hidden"
                accept="image/jpeg, image/png, image/jpg"
                onChange={handleFileChange}
              />
              <span className="font-semibold">
                Faça upload ou arraste uma imagem (jpeg, png, jpg)
              </span>
            </label>
          )}
          {uploading && (
            <div className="flex flex-row items-center gap-2">
              <Loader2 className="animate-spin text-cultivo-green-dark" />
              <span className="font-semibold text-cultivo-green-dark">
                Enviando imagem. Por favor, aguarde...
              </span>
            </div>
          )}
        </form>
      </div>

      <form
        className="space-y-4 w-full md:max-w-[540px] mt-4"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div>
          <label
            className="block font-semibold mb-1 text-cultivo-primary"
            htmlFor="date"
          >
            Data da Colheita
          </label>
          <Input
            id="date"
            type="date"
            {...register("date")}
            required
            className="bg-white"
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
          )}
        </div>

        <div>
          <label
            className="block font-semibold mb-1 text-cultivo-primary"
            htmlFor="quantity"
          >
            Quantidade (sacas de 60kg)
          </label>
          <Input
            id="quantity"
            type="number"
            min={1}
            {...register("quantity", { valueAsNumber: true })}
            required
            className="bg-white"
          />
          {errors.quantity && (
            <p className="text-red-500 text-sm mt-1">
              {errors.quantity.message}
            </p>
          )}
        </div>

        <div>
          <label
            className="block font-semibold mb-1 text-cultivo-primary"
            htmlFor="observations"
          >
            Observações
          </label>
          <textarea
            id="observations"
            {...register("observations")}
            className="border rounded w-full px-3 py-2 bg-white"
            rows={3}
            placeholder="Observações sobre a colheita (opcional)"
          />
          {errors.observations && (
            <p className="text-red-500 text-sm mt-1">
              {errors.observations.message}
            </p>
          )}
        </div>
        {selectedImage &&
          (processing ? (
            <div className="flex flex-row items-center gap-2">
              <Loader2 className="animate-spin text-cultivo-green-dark" />
              <span className="font-semibold text-cultivo-green-dark">
                Análise em andamento. Por favor, aguarde...
              </span>
            </div>
          ) : (
            <button
              className="bg-cultivo-green-dark text-white rounded-lg py-2 px-4 cursor-pointer w-full"
              type="submit"
              disabled={processing}
            >
              Registrar Colheita
            </button>
          ))}
      </form>
    </section>
  );
}
