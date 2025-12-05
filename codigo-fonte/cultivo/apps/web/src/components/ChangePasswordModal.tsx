import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../packages/backend/convex/_generated/api.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, Eye, EyeOff } from "lucide-react";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  passwordRe: RegExp;
}

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type PasswordErrors = Partial<Record<keyof PasswordForm, string>>;

export function ChangePasswordModal({
  open,
  onClose,
  userId,
  passwordRe,
}: ChangePasswordModalProps) {
  const changePassword = useMutation(api.user.changePassword);

  const [form, setForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [topError, setTopError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: PasswordErrors = {};

    if (!form.currentPassword) {
      nextErrors.currentPassword = "Informe sua senha atual.";
    }

    if (!form.newPassword) {
      nextErrors.newPassword = "Crie uma nova senha.";
    } else if (!passwordRe.test(form.newPassword)) {
      nextErrors.newPassword =
        "A senha deve ter no mínimo 8 caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais.";
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Repita a nova senha.";
    } else if (form.newPassword && form.confirmPassword !== form.newPassword) {
      nextErrors.confirmPassword = "As senhas não coincidem.";
    }

    if (
      form.currentPassword &&
      form.newPassword &&
      form.currentPassword === form.newPassword
    ) {
      nextErrors.newPassword = "A nova senha deve ser diferente da atual.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setTopError("Corrija os campos destacados antes de continuar.");
      return;
    }

    setTopError(null);

    setLoading(true);

    try {
      await changePassword({
        id: userId as any,
        currentPassword: btoa(form.currentPassword), // Criptografar para comparar
        newPassword: btoa(form.newPassword), // Criptografar para salvar
      });

      toast.success("Senha alterada com sucesso!");

      // Limpar formulário
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});

      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const msgLower = errorMessage.toLowerCase();
      
      let friendlyMessage = "Erro ao alterar senha. Tente novamente.";
      
      if (msgLower.includes("senha atual incorreta") || msgLower.includes("incorrect password")) {
        friendlyMessage = "Senha atual incorreta. Verifique e tente novamente.";
        setErrors((prev) => ({ ...prev, currentPassword: "Senha incorreta." }));
      } else if (msgLower.includes("usuário não encontrado")) {
        friendlyMessage = "Usuário não encontrado. Faça login novamente.";
      } else if (msgLower.includes("network") || msgLower.includes("fetch")) {
        friendlyMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
      } else if (msgLower.includes("[convex")) {
        friendlyMessage = "Não foi possível alterar a senha. Tente novamente.";
      }
      
      setTopError(friendlyMessage);
      toast.error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const togglePassword = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  if (!open) return null;

  const errClass = (k: keyof PasswordForm) =>
    `h-11 rounded-xl border pr-10 ${
      errors[k] ? "border-red-500 bg-red-50" : ""
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-[90%] max-w-md rounded-2xl border p-6 shadow-xl"
        style={{
          background: "var(--edit-bg)",
          borderColor: "#eadfce",
          color: "var(--edit-text)",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Alterar senha"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock size={20} className="text-amber-600" />
            <h3 className="text-lg font-semibold">Alterar Senha</h3>
          </div>
          <button
            className="edit-close text-xl"
            onClick={onClose}
            aria-label="Fechar"
            disabled={loading}
          >
            ×
          </button>
        </div>

        {topError && (
          <div className="mb-3 rounded-xl border border-red-400 bg-red-50 px-4 py-2 text-sm text-red-700">
            {topError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Senha atual */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha atual *</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                placeholder="Digite sua senha atual"
                value={form.currentPassword}
                onChange={(e) =>
                  setForm({ ...form, currentPassword: e.target.value })
                }
                className={errClass("currentPassword")}
                style={{ background: "#f9f2e8", borderColor: "#eadfce" }}
                aria-invalid={!!errors.currentPassword}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => togglePassword("current")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                {showPasswords.current ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-xs text-red-600">{errors.currentPassword}</p>
            )}
          </div>

          {/* Nova senha */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova senha *</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? "text" : "password"}
                placeholder="Crie uma senha forte"
                value={form.newPassword}
                onChange={(e) =>
                  setForm({ ...form, newPassword: e.target.value })
                }
                className={errClass("newPassword")}
                style={{ background: "#f9f2e8", borderColor: "#eadfce" }}
                aria-invalid={!!errors.newPassword}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => togglePassword("new")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-red-600">{errors.newPassword}</p>
            )}
          </div>

          {/* Confirmar nova senha */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                placeholder="Digite novamente a nova senha"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                className={errClass("confirmPassword")}
                style={{ background: "#f9f2e8", borderColor: "#eadfce" }}
                aria-invalid={!!errors.confirmPassword}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => togglePassword("confirm")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                {showPasswords.confirm ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Indicador de força da senha */}
          {form.newPassword && (
            <div className="space-y-1">
              <div className="text-xs text-gray-600">Força da senha:</div>
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((index) => {
                  const strength = getPasswordStrength(form.newPassword);
                  const getBarColor = (barIndex: number, strength: number) => {
                    if (barIndex >= strength) return "bg-gray-300";
                    if (strength === 1) return "bg-red-500";
                    if (strength === 2) return "bg-yellow-500";
                    if (strength === 3) return "bg-blue-500";
                    return "bg-green-500";
                  };

                  return (
                    <div
                      key={`strength-bar-${index}`}
                      className={`h-1 flex-1 rounded ${getBarColor(index, strength)}`}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 edit-button"
              disabled={loading}
            >
              {loading ? "Alterando..." : "Alterar Senha"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Função para calcular força da senha
function getPasswordStrength(password: string): number {
  let strength = 0;

  if (password.length >= 6) strength++;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
  if (/\d/.test(password) && /[!@#$%^&*]/.test(password)) strength++;

  return Math.min(strength, 4);
}
