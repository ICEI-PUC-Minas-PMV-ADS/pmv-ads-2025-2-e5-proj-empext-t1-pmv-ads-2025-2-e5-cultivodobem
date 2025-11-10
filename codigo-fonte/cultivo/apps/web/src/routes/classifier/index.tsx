import { createFileRoute, useRouter } from "@tanstack/react-router";
import axios from "axios";
import { useAction, useMutation } from "convex/react";
import Dropzone from "dropzone";
import { Loader2, Upload } from "lucide-react";
import { type ChangeEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { ensureAuthenticated, getUserIdFromLocalStorage } from "@/lib/utils";
import { api } from "../../../../../packages/backend/convex/_generated/api";
import type { Id } from "../../../../../packages/backend/convex/_generated/dataModel";

export const Route = createFileRoute("/classifier/")({
	component: ClassifySample,
	beforeLoad: ensureAuthenticated,
});

function ClassifySample() {
	const generateUploadUrl = useMutation(api.upload.generateUploadUrl);
	const sendImage = useMutation(api.upload.sendImage);
	const classifySample = useAction(api.classifier.classifySample);
	const router = useRouter();

	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const [imageStorageId, setImageStorageId] = useState<Id<"_storage"> | null>(
		null,
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
			saveImageToStorage,
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

	const handleClassifySample = async () => {
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
			}
			if (error || !id) {
				throw new Error("Failed to classify sample");
			}

			router.navigate({ to: "/classifier/$id", params: { id } });
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
		<div className="screen flex flex-col items-center p-4">
			<h1 className="text-center font-bold text-2xl text-cultivo-primary">
				Classificar amostra
			</h1>
			<div
				className="mt-6 flex w-full flex-col gap-2 rounded-lg border border-cultivo-background-darker bg-white p-4 md:max-w-[540px]"
				style={{
					boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
				}}
			>
				<h2 className="font-bold text-cultivo-primary text-xl">Amostra</h2>

				<p className="flex-1 text-cultivo-primary">
					Selecione um arquivo ou arraste e solte uma imagem da amostra de
					feijão a ser classificada. O sistema aceita apenas arquivos JPEG, PNG
					e JPG.
				</p>

				{selectedImage && (
					<div className="flex flex-col items-center gap-2 rounded-lg bg-cultivo-background-darker p-4">
						<div className="relative w-full">
							<img
								src={URL.createObjectURL(selectedImage)}
								alt="Imagem selecionada"
								className="aspect-square w-full rounded-lg object-cover"
							/>
						</div>
						<span className="line-clamp-1 font-semibold text-cultivo-muted">
							Arquivo selecionado: {selectedImage.name}
						</span>
					</div>
				)}

				<form className="flex flex-col gap-4" id="dropzone" action="/target">
					{!uploading && (
						<label
							htmlFor="upload"
							className="flex cursor-pointer flex-row items-center gap-2 rounded-lg border-2 border-cultivo-primary border-dashed p-4 text-cultivo-primary"
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
								className="cursor-pointer rounded-lg bg-cultivo-green-dark px-4 py-2 text-white"
								onClick={handleClassifySample}
								disabled={processing}
							>
								Classificar
							</button>
						))}
				</form>
			</div>
		</div>
	);
}
