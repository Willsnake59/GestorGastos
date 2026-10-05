import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  GraduationCap,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Globe,
  Building,
  ArrowRight,
  Wallet,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import { triggerHaptic } from '../utils/haptics'

export const LoginPage: React.FC = () => {
  const { login, register, loginAsDemo, isAuthenticated } = useAuth()
  const { t, language, setLanguage } = useLanguage()
  const { success, error } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Login form state
  const [loginEmail, setLoginEmail] = useState('evaluador@universidad.edu')
  const [loginPassword, setLoginPassword] = useState('demo123')

  // Register form state
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regUniversity, setRegUniversity] = useState('')

  // Determine redirection target
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  const handleTabChange = (tab: 'login' | 'register') => {
    triggerHaptic('light')
    setActiveTab(tab)
    setErrorMessage(null)
  }

  const handleToggleLanguage = () => {
    triggerHaptic('light')
    setLanguage(language === 'es' ? 'en' : 'es')
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMessage(t('auth.errorRequiredFields'))
      return
    }

    try {
      setIsLoading(true)
      triggerHaptic('medium')
      await login(loginEmail, loginPassword)
      success(t('auth.successLogin'))
      navigate(from, { replace: true })
    } catch (err: unknown) {
      triggerHaptic('heavy')
      const msg = err instanceof Error && err.message === 'AUTH_INVALID_CREDENTIALS'
        ? t('auth.errorInvalidCredentials')
        : t('common.errorDesc')
      setErrorMessage(msg)
      error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMessage(t('auth.errorRequiredFields'))
      return
    }

    if (regPassword.length < 4) {
      setErrorMessage(t('auth.errorPasswordShort'))
      return
    }

    try {
      setIsLoading(true)
      triggerHaptic('medium')
      await register(regName, regEmail, regPassword, regUniversity)
      success(t('auth.successRegister'))
      navigate(from, { replace: true })
    } catch (err: unknown) {
      triggerHaptic('heavy')
      const msg = err instanceof Error && err.message === 'AUTH_USER_EXISTS'
        ? t('auth.errorUserExists')
        : t('common.errorDesc')
      setErrorMessage(msg)
      error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickDemoAccess = async (role: 'evaluator' | 'student') => {
    try {
      setIsLoading(true)
      triggerHaptic('heavy')
      await loginAsDemo(role)
      success(t('auth.successLogin'))
      navigate(from, { replace: true })
    } catch (err: unknown) {
      console.error(err)
      error(t('common.errorDesc'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-obsidian)',
        backgroundImage: 'radial-gradient(ellipse at 50% 10%, rgba(174, 147, 87, 0.12) 0%, rgba(10, 11, 13, 0.95) 75%)',
        padding: 'var(--space-4)',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        {/* Barra superior con marca e idioma */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 var(--space-2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-carbon)',
                border: '1px solid var(--color-slate)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ae9357',
              }}
            >
              <Wallet size={20} />
            </div>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '1.25rem',
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-paper-white)',
                  letterSpacing: '0.01em',
                }}
              >
                {t('nav.brand')}
              </h1>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--color-fog)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {t('nav.tagline')}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleLanguage}
            aria-label={language === 'es' ? 'Cambiar a inglés' : 'Switch to Spanish'}
            title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-carbon)',
              border: '1px solid var(--color-slate)',
              color: 'var(--color-paper-white)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Globe size={15} color="#ae9357" />
            <span>{language.toUpperCase()}</span>
          </button>
        </div>

        {/* Tarjeta de Acceso Rápido para Evaluador Académico / Universidad */}
        <div
          style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, rgba(174, 147, 87, 0.15) 0%, rgba(26, 27, 30, 0.95) 100%)',
            border: '1px solid rgba(174, 147, 87, 0.4)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap size={20} color="#e5c875" />
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#e5c875',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {t('auth.academicBadge')}
            </span>
          </div>

          <p
            style={{
              margin: 0,
              fontSize: '0.825rem',
              color: 'var(--color-fog)',
              lineHeight: 1.4,
            }}
          >
            {t('auth.evaluatorCardDesc')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickDemoAccess('evaluator')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #ae9357 0%, #876f3b 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(174, 147, 87, 0.3)',
                transition: 'transform 0.15s ease, opacity 0.15s ease',
              }}
            >
              <Sparkles size={18} />
              <span>{t('auth.demoEvaluatorBtn')}</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickDemoAccess('student')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '0.55rem 0.8rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--color-paper-white)',
                border: '1px solid var(--color-slate)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <User size={15} color="var(--color-fog)" />
              <span>{t('auth.demoStudentBtn')}</span>
            </button>
          </div>
        </div>

        {/* Tarjeta Principal de Autenticación con Pestañas */}
        <div
          style={{
            backgroundColor: 'var(--color-carbon)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-slate)',
            padding: 'var(--space-5)',
            boxShadow: 'var(--shadow-xl)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}
        >
          {/* Selector de Pestañas (Login / Registro) */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--color-obsidian)',
              borderRadius: 'var(--radius-pill)',
              padding: '3px',
              border: '1px solid var(--color-graphite)',
            }}
          >
            <button
              type="button"
              onClick={() => handleTabChange('login')}
              style={{
                flex: 1,
                padding: '0.55rem 0.8rem',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                backgroundColor: activeTab === 'login' ? 'var(--color-slate)' : 'transparent',
                color: activeTab === 'login' ? 'var(--color-paper-white)' : 'var(--color-fog)',
                fontWeight: activeTab === 'login' ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {t('auth.tabLogin')}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('register')}
              style={{
                flex: 1,
                padding: '0.55rem 0.8rem',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                backgroundColor: activeTab === 'register' ? 'var(--color-slate)' : 'transparent',
                color: activeTab === 'register' ? 'var(--color-paper-white)' : 'var(--color-fog)',
                fontWeight: activeTab === 'register' ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {t('auth.tabRegister')}
            </button>
          </div>

          {/* Mensaje de error si ocurre */}
          {errorMessage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                fontSize: '0.825rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* FORMULARIO DE INICIO DE SESIÓN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div>
                <label
                  htmlFor="login-email"
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--color-fog)',
                    marginBottom: '4px',
                  }}
                >
                  {t('auth.emailLabel')}
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    color="var(--color-fog)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder={t('auth.emailPlaceholder')}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '0.65rem 0.85rem 0.65rem 36px',
                      backgroundColor: 'var(--color-obsidian)',
                      border: '1px solid var(--color-graphite)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-paper-white)',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--color-fog)',
                    marginBottom: '4px',
                  }}
                >
                  {t('auth.passwordLabel')}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    color="var(--color-fog)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder')}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '0.65rem 40px 0.65rem 36px',
                      backgroundColor: 'var(--color-obsidian)',
                      border: '1px solid var(--color-graphite)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-paper-white)',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-fog)',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  marginTop: 'var(--space-2)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-paper-white)',
                  color: 'var(--color-obsidian)',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <span>{isLoading ? '...' : t('auth.submitLogin')}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* FORMULARIO DE REGISTRO */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div>
                <label
                  htmlFor="reg-name"
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--color-fog)',
                    marginBottom: '4px',
                  }}
                >
                  {t('auth.nameLabel')} *
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={16}
                    color="var(--color-fog)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder={t('auth.namePlaceholder')}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '0.65rem 0.85rem 0.65rem 36px',
                      backgroundColor: 'var(--color-obsidian)',
                      border: '1px solid var(--color-graphite)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-paper-white)',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-email"
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--color-fog)',
                    marginBottom: '4px',
                  }}
                >
                  {t('auth.emailLabel')} *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    color="var(--color-fog)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder={t('auth.emailPlaceholder')}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '0.65rem 0.85rem 0.65rem 36px',
                      backgroundColor: 'var(--color-obsidian)',
                      border: '1px solid var(--color-graphite)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-paper-white)',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-password"
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--color-fog)',
                    marginBottom: '4px',
                  }}
                >
                  {t('auth.passwordLabel')} *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    color="var(--color-fog)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder')}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '0.65rem 40px 0.65rem 36px',
                      backgroundColor: 'var(--color-obsidian)',
                      border: '1px solid var(--color-graphite)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-paper-white)',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-fog)',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-university"
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--color-fog)',
                    marginBottom: '4px',
                  }}
                >
                  {t('auth.universityLabel')}
                </label>
                <div style={{ position: 'relative' }}>
                  <Building
                    size={16}
                    color="var(--color-fog)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    id="reg-university"
                    type="text"
                    value={regUniversity}
                    onChange={(e) => setRegUniversity(e.target.value)}
                    placeholder={t('auth.universityPlaceholder')}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '0.65rem 0.85rem 0.65rem 36px',
                      backgroundColor: 'var(--color-obsidian)',
                      border: '1px solid var(--color-graphite)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-paper-white)',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  marginTop: 'var(--space-2)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-paper-white)',
                  color: 'var(--color-obsidian)',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <span>{isLoading ? '...' : t('auth.submitRegister')}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* Pie de privacidad y seguridad local-first */}
          <div
            style={{
              paddingTop: 'var(--space-3)',
              borderTop: '1px solid var(--color-graphite)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.75rem',
              color: 'var(--color-fog)',
              lineHeight: 1.3,
            }}
          >
            <ShieldCheck size={16} color="#ae9357" style={{ flexShrink: 0 }} />
            <span>{t('auth.academicSubtitle')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
