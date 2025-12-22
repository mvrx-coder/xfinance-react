import { useState } from "react";
import { useLocation } from "wouter";
import { Zap, TrendingUp, Shield, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { login } from "@/services/api/auth";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFirstAccess, setIsFirstAccess] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await login({ email, password });
      
      if (response.success) {
        // Salvar dados do usuário no localStorage para acesso rápido
        if (response.user) {
          localStorage.setItem("xfinance_user", JSON.stringify(response.user));
        }
        setLocation("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsFirstAccess(false);
  };

  return (
    <div className="login-container">
      <div className="login-bg-gradient" />
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      
      <div className="login-content">
        <div className="login-hero">
          <div className="login-hero-card">
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
                {error && (
                  <div className="login-error">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}
                <div className="login-input-group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mvrxxx@gmail.com"
                    className="login-input"
                    required
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
                      data-testid="input-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="login-password-toggle"
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
                  disabled={isLoading}
                  className="login-button"
                  data-testid="button-login"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Entrar"
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSetNewPassword} className="login-form">
                <div className="login-first-access-notice">
                  <p>Primeiro acesso detectado. Defina sua nova senha.</p>
                </div>
                
                <div className="login-input-group">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nova senha"
                    className="login-input"
                    required
                    minLength={8}
                    data-testid="input-new-password"
                  />
                </div>
                
                <div className="login-input-group">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmar senha"
                    className="login-input"
                    required
                    minLength={8}
                    data-testid="input-confirm-password"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading || newPassword !== confirmPassword}
                  className="login-button"
                  data-testid="button-set-password"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Definir nova senha"
                  )}
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
