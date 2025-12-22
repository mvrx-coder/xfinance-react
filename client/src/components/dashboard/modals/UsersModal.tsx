import { useState } from "react";
import { motion } from "framer-motion";
import { Modal } from "../Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Sparkles, 
  Eye,
  EyeOff,
  ClipboardList,
  X,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type Papel, PAPEIS, isPapelValido } from "@/types/usuario";
import { createUsuario } from "@/services/api/usuarios";

interface UsersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormState {
  email: string;
  senha: string;
  confirmarSenha: string;
  papel: Papel | "";
  ativo: boolean;
}

interface FormErrors {
  email?: string;
  senha?: string;
  confirmarSenha?: string;
  papel?: string;
}

const mockUsers = [
  { id: "1", email: "AAS@teste.com", papel: "analista" as Papel },
  { id: "2", email: "ACB@teste.com", papel: "analista" as Papel },
  { id: "3", email: "AGR@teste.com", papel: "admin" as Papel },
  { id: "4", email: "ALS@teste.com", papel: "auditor" as Papel },
  { id: "5", email: "CENTO@teste.com", papel: "financeiro" as Papel },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.03 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: { opacity: 1, y: 0 },
};

export function UsersModal({ isOpen, onClose }: UsersModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [form, setForm] = useState<FormState>({
    email: "",
    senha: "",
    confirmarSenha: "",
    papel: "",
    ativo: true,
  });
  
  const [errors, setErrors] = useState<FormErrors>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (senha: string): boolean => {
    if (senha.length < 8) return false;
    const hasLetter = /[a-zA-Z]/.test(senha);
    const hasNumber = /[0-9]/.test(senha);
    return hasLetter && hasNumber;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!form.email) {
      newErrors.email = "Email obrigatório";
    } else if (!validateEmail(form.email)) {
      newErrors.email = "Email inválido";
    }
    
    if (!form.senha) {
      newErrors.senha = "Senha obrigatória";
    } else if (!validatePassword(form.senha)) {
      newErrors.senha = "Min. 8 caracteres com letra e número";
    }
    
    if (!form.confirmarSenha) {
      newErrors.confirmarSenha = "Confirme a senha";
    } else if (form.senha !== form.confirmarSenha) {
      newErrors.confirmarSenha = "Senhas não coincidem";
    }
    
    if (!form.papel) {
      newErrors.papel = "Selecione um papel";
    } else if (!isPapelValido(form.papel)) {
      newErrors.papel = "Papel inválido";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormState, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!form.papel || !isPapelValido(form.papel)) return;
    
    setIsLoading(true);
    
    try {
      await createUsuario({
        email: form.email,
        senha: form.senha,
        papel: form.papel,
        ativo: form.ativo,
      });
      
      toast({
        title: "Usuário criado com sucesso",
        description: `O usuário foi cadastrado no sistema.`,
      });
      
      setForm({ email: "", senha: "", confirmarSenha: "", papel: "", ativo: true });
      setErrors({});
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao criar usuário",
        description: error instanceof Error ? error.message : "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = form.email && form.senha && form.confirmarSenha && form.papel && Object.keys(errors).length === 0;

  return (
    <Modal
      id="users-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Cadastro de Usuários"
      maxWidth="lg"
      footer={
        <Button variant="outline" onClick={onClose} data-testid="button-close-users">
          <X className="w-4 h-4 mr-2" />
          Fechar
        </Button>
      }
    >
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Novo Usuário</span>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-foreground flex items-center gap-1">
                Email <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="mvrxxx@gmail.com"
                  className={`h-11 bg-background/50 border-white/15 focus:border-primary/60 ${errors.email ? "border-destructive" : ""}`}
                  autoComplete="email"
                  data-testid="input-user-email"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senha" className="text-sm text-foreground flex items-center gap-1">
                  Senha (mínimo 8 caracteres) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="senha"
                    type={showPassword ? "text" : "password"}
                    value={form.senha}
                    onChange={(e) => handleInputChange("senha", e.target.value)}
                    placeholder="Digite a senha"
                    className={`h-11 bg-background/50 border-white/15 focus:border-primary/60 pr-10 ${errors.senha ? "border-destructive" : ""}`}
                    autoComplete="new-password"
                    data-testid="input-user-senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    data-testid="button-toggle-senha"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.senha && (
                  <p className="text-xs text-destructive">{errors.senha}</p>
                )}
                <p className="text-xs text-muted-foreground">Min. 8 caracteres com letra e número.</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmarSenha" className="text-sm text-foreground flex items-center gap-1">
                  Confirmar Senha <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmarSenha"
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmarSenha}
                    onChange={(e) => handleInputChange("confirmarSenha", e.target.value)}
                    placeholder="Repita a senha"
                    className={`h-11 bg-background/50 border-white/15 focus:border-primary/60 pr-10 ${errors.confirmarSenha ? "border-destructive" : ""}`}
                    autoComplete="new-password"
                    data-testid="input-user-confirmar-senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    data-testid="button-toggle-confirmar-senha"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmarSenha && (
                  <p className="text-xs text-destructive">{errors.confirmarSenha}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="papel" className="text-sm text-foreground flex items-center gap-1">
                Papel / Permissão <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.papel}
                onValueChange={(value) => handleInputChange("papel", value)}
              >
                <SelectTrigger 
                  className={`h-11 bg-background/50 border-white/15 focus:border-primary/60 ${errors.papel ? "border-destructive" : ""}`}
                  data-testid="select-user-papel"
                >
                  <SelectValue placeholder="Selecione o papel..." />
                </SelectTrigger>
                <SelectContent>
                  {PAPEIS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.papel && (
                <p className="text-xs text-destructive">{errors.papel}</p>
              )}
              <p className="text-xs text-muted-foreground">Define o nível de acesso no sistema</p>
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isLoading}
              className="w-full h-11 bg-gradient-to-r from-[#8C1888] to-[#6A0DAD] border-0 text-white font-semibold"
              data-testid="button-save-user"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </motion.div>
        
        <div className="border-t border-white/10 pt-6">
          <div className="flex items-center gap-2 text-primary mb-4">
            <ClipboardList className="w-4 h-4" />
            <span className="text-sm font-semibold">Usuários Cadastrados</span>
          </div>
          
          <div className="rounded-lg border border-white/10 overflow-hidden">
            <div className="grid grid-cols-2 gap-4 px-4 py-3 bg-white/5 border-b border-white/10">
              <span className="text-sm font-semibold text-foreground">E-mail</span>
              <span className="text-sm font-semibold text-foreground">Papel</span>
            </div>
            
            <ScrollArea className="max-h-[200px]">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {mockUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    variants={itemVariants}
                    className={`grid grid-cols-2 gap-4 px-4 py-3 ${index !== mockUsers.length - 1 ? "border-b border-white/5" : ""} hover:bg-white/5 transition-colors`}
                    data-testid={`user-row-${user.id}`}
                  >
                    <span className="text-sm text-foreground">{user.email}</span>
                    <span className="text-sm text-muted-foreground">{PAPEIS.find(p => p.value === user.papel)?.label || user.papel}</span>
                  </motion.div>
                ))}
              </motion.div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </Modal>
  );
}
