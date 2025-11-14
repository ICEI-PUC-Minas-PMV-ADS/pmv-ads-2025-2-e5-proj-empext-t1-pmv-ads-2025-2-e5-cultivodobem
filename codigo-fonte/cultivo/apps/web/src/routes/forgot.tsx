import { useState } from "react";
import "@/styles/forgot.css";
import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/forgot")({
	component: RecuperarSenha,
});

function RecuperarSenha() {
	const [email, setEmail] = useState("");
	const [mensagem, setMensagem] = useState("");

	const handleSubmit = (e: any) => {
		e.preventDefault();
		setMensagem(
			"Se o email estiver cadastrado, você receberá um link para redefinir a senha.",
		);
	};

	return (
		<div className="body container">
			<div className="card">
				<h1>Recuperar Senha</h1>

				<form onSubmit={handleSubmit}>
					<input
						className="input"
						type="email"
						placeholder="Digite seu email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
					<button className="w-full rounded-md bg-[#558f45] py-2 text-white">
						Enviar link de recuperação
					</button>
				</form>

				{mensagem && <p className="mensagem">{mensagem}</p>}
			</div>
		</div>
	);
}
