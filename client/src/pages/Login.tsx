/**
 * Página de Login - xFinance
 * 
 * Usa o hook useAuth do contexto centralizado.
 * Redireciona para Dashboard se já autenticado.
 * Suporta fluxo de primeiro acesso (definição de senha).
 */

import { useState, useEffect } from "react";
import { useLocation, Redirect } from "wouter";
import { Zap, TrendingUp, Shield, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft, KeyRound } from "lucide-react";
import { useAuth, useLogoSet } from "@/hooks";

export default function Login() {
  const [, setLocation] = useLocation();
  const { 
    login, 
    checkEmail,
    setFirstPassword,
    cancelFirstAccess,
    isLoading: isAuthLoading, 
    isAuthenticated, 
    error: authError, 
    clearError,
    isFirstAccess,
    firstAccessEmail,
  } = useAuth();
  const { logos } = useLogoSet();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Estados para primeiro acesso
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Limpar erros ao digitar
  useEffect(() => {
    if (localError) setLocalError(null);
    if (successMessage) setSuccessMessage(null);
    if (authError) clearError();
  }, [email, password, newPassword, confirmPassword]);
  
  // Sincronizar email com primeiro acesso
  useEffect(() => {
    if (firstAccessEmail && !email) {
      setEmail(firstAccessEmail);
    }
  }, [firstAccessEmail]);

  // Redirecionar se já autenticado
  if (isAuthenticated && !isAuthLoading) {
    return <Redirect to="/" />;
  }

  // Erro a exibir (prioridade: local > contexto)
  const displayError = localError || authError;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!email.trim()) {
      setLocalError("Informe o email");
      return;
    }
    if (!password.trim()) {
      setLocalError("Informe a senha");
      return;
    }
    
    setIsSubmitting(true);
    setLocalError(null);
    
    try {
      const result = await login({ email, password });
      
      if (result === "first_access") {
        // Primeiro acesso detectado - o AuthContext já configurou o estado
        // O formulário de primeiro acesso será exibido automaticamente
        return;
      }
      
      if (result === true) {
        // Redirecionamento é feito automaticamente pelo Redirect acima
        // quando isAuthenticated muda para true
        setLocation("/");
      }
      // Se falhou, o erro já está no contexto (authError)
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckEmail = async () => {
    if (!email.trim()) {
      setLocalError("Informe o email");
      return;
    }
    
    setIsSubmitting(true);
    setLocalError(null);
    
    try {
      const result = await checkEmail(email);
      
      if (result === "first_access") {
        // Primeiro acesso - o estado já foi configurado
        setSuccessMessage("Primeiro acesso detectado. Defina sua senha.");
        return;
      }
      
      if (result !== "ok") {
        // Erro específico retornado
        setLocalError(result);
      }
      // Se "ok", o usuário pode continuar com o login normal
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Erro ao verificar email");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword.trim()) {
      setLocalError("Informe a nova senha");
      return;
    }
    
    if (newPassword.length < 6) {
      setLocalError("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setLocalError("As senhas não coincidem");
      return;
    }
    
    setIsSubmitting(true);
    setLocalError(null);
    
    try {
      const success = await setFirstPassword(newPassword, confirmPassword);
      
      if (success) {
        setSuccessMessage("Senha definida com sucesso!");
        // Redirecionamento será automático via isAuthenticated
        setLocation("/");
      }
      // Se falhou, o erro já está no contexto (authError)
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Erro ao definir senha");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelFirstAccess = () => {
    cancelFirstAccess();
    setNewPassword("");
    setConfirmPassword("");
    setPassword("");
    setLocalError(null);
    setSuccessMessage(null);
  };

  // Loading inicial do contexto de auth
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-depth-gradient">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-bg-gradient" />
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      
      <div className="login-content">
        <div className="login-hero">
          <div className="login-hero-card">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img 
                src={logos.login} 
                alt="xFinance Logo" 
                className="h-20 w-auto object-contain"
              />
            </div>
            
            <span className="login-eyebrow">
              PLANEJAMENTO &bull; PERFORMANCE &bull; PREVISIBILIDADE
            </span>
            
            <h1 className="login-title">xFinance</h1>
            
            <p className="login-description">
              Gerencie fluxo financeiro, repasses e inspeções em um{" "}
              <span className="text-[#00BCD4]">cockpit único</span>, com insights em tempo real e{" "}
              <span className="text-[#CE62D9]">storytelling visual</span>.
            </p>
            
            <ul className="login-benefits">
              <li>
                <span className="login-bullet" />
                Automação de cobranças e repasses
              </li>
              <li>
                <span className="login-bullet" />
                Workflows guiados para o time financeiro
              </li>
              <li>
                <span className="login-bullet" />
                Auditoria com histórico completo por registro
              </li>
            </ul>
            
            <div className="login-kpis">
              <div className="login-kpi">
                <div className="login-kpi-icon login-kpi-icon-yellow">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="login-kpi-value">12h</span>
                  <span className="login-kpi-label">Lead time médio</span>
                </div>
              </div>
              
              <div className="login-kpi">
                <div className="login-kpi-icon login-kpi-icon-cyan">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <span className="login-kpi-value">+4.8k</span>
                  <span className="login-kpi-label">Cases monitorados</span>
                </div>
              </div>
              
              <div className="login-kpi">
                <div className="login-kpi-icon login-kpi-icon-purple">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <span className="login-kpi-value">ISO-ready</span>
                  <span className="login-kpi-label">Conformidade</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="login-form-section">
          <div className="login-card">
            <div className="login-card-header">
              <h2 className="login-card-title">Acesse sua conta</h2>
              <p className="login-card-subtitle">
                Use seu e-mail corporativo para continuar
              </p>
            </div>
            
            {!isFirstAccess ? (
              <form onSubmit={handleLogin} className="login-form">
                {displayError && (
                  <div className="login-error">
                    <AlertCircle className="w-4 h-4" />
                    <span>{displayError}</span>
                  </div>
                )}
                {successMessage && (
                  <div className="login-success">
                    <KeyRound className="w-4 h-4" />
                    <span>{successMessage}</span>
                  </div>
                )}
                <div className="login-input-group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={handleCheckEmail}
                    placeholder="mvrxxx@gmail.com"
                    className="login-input"
                    required
                    disabled={isSubmitting}
                    data-testid="input-email"
                  />
                </div>
                
                <div className="login-input-group">
                  <div className="login-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite sua senha"
                      className="login-input login-input-password"
                      required
                      disabled={isSubmitting}
                      data-testid="input-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="login-password-toggle"
                      disabled={isSubmitting}
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="login-button"
                  data-testid="button-login"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Entrar"
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSetNewPassword} className="login-form">
                <div className="login-first-access-notice">
                  <KeyRound className="w-5 h-5" />
                  <div>
                    <p className="login-first-access-title">Primeiro Acesso</p>
                    <p className="login-first-access-email">{firstAccessEmail}</p>
                  </div>
                </div>
                
                {displayError && (
                  <div className="login-error">
                    <AlertCircle className="w-4 h-4" />
                    <span>{displayError}</span>
                  </div>
                )}
                
                {successMessage && (
                  <div className="login-success">
                    <KeyRound className="w-4 h-4" />
                    <span>{successMessage}</span>
                  </div>
                )}
                
                <div className="login-input-group">
                  <div className="login-input-wrapper">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nova senha (mínimo 6 caracteres)"
                      className="login-input login-input-password"
                      required
                      minLength={6}
                      disabled={isSubmitting}
                      autoFocus
                      data-testid="input-new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="login-password-toggle"
                      disabled={isSubmitting}
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="login-input-group">
                  <div className="login-input-wrapper">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmar nova senha"
                      className="login-input login-input-password"
                      required
                      minLength={6}
                      disabled={isSubmitting}
                      data-testid="input-confirm-password"
                    />
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="login-password-mismatch">As senhas não coincidem</p>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting || newPassword.length < 6 || newPassword !== confirmPassword}
                  className="login-button login-button-first-access"
                  data-testid="button-set-password"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      Definir Senha e Entrar
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleCancelFirstAccess}
                  disabled={isSubmitting}
                  className="login-button-secondary"
                  data-testid="button-cancel-first-access"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar ao login
                </button>
              </form>
            )}
            
            <div className="login-footer">
              <p className="login-mfa-notice">
                Acesso protegido com MFA opcional
              </p>
              <p className="login-status">
                Status do ambiente:{" "}
                <span className="login-status-online">Online</span>
              </p>
            </div>
            
            <div className="login-brand">
              <span className="login-brand-text">Integrado com</span>
              <div className="login-brand-logo">
                <span className="login-brand-mvrx">MVR</span>
                <span className="login-brand-x">X</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
