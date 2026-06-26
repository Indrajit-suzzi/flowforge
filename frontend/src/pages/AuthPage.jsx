import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, CheckCircle, ChevronDown, Code, MessageCircle, Smartphone, X } from 'lucide-react';
import { useLocalAuth } from '../contexts/useLocalAuth';
import api from '../utils/api';
import './AuthPage.css';

export default function AuthPage() {
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, googleLogin, completeOAuth } = useLocalAuth();
  const [error, setError] = useState(searchParams.get('error') || '');
  const [githubLoading, setGithubLoading] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const displayedError = error || (!googleClientId ? 'Google auth is not configured.' : '');
  const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const scriptAdded = useRef(false);

  const countries = [
    { code: '91', flag: '🇮🇳', name: 'India', pattern: 'XXXXX XXXXX' },
    { code: '1', flag: '🇺🇸', name: 'United States', pattern: '(XXX) XXX-XXXX' },
    { code: '44', flag: '🇬🇧', name: 'United Kingdom', pattern: 'XXXXX XXXXXX' },
    { code: '61', flag: '🇦🇺', name: 'Australia', pattern: 'XXX XXX XXX' },
    { code: '81', flag: '🇯🇵', name: 'Japan', pattern: 'XXX-XXXX-XXXX' },
    { code: '86', flag: '🇨🇳', name: 'China', pattern: 'XXX XXXX XXXX' },
    { code: '49', flag: '🇩🇪', name: 'Germany', pattern: 'XXXX XXXXXXX' },
    { code: '33', flag: '🇫🇷', name: 'France', pattern: 'X XX XX XX XX' },
    { code: '55', flag: '🇧🇷', name: 'Brazil', pattern: '(XX) XXXXX-XXXX' },
    { code: '7', flag: '🇷🇺', name: 'Russia', pattern: 'XXX XXX-XX-XX' },
    { code: '82', flag: '🇰🇷', name: 'South Korea', pattern: 'XXX-XXXX-XXXX' },
    { code: '39', flag: '🇮🇹', name: 'Italy', pattern: 'XXX XXX XXXX' },
    { code: '34', flag: '🇪🇸', name: 'Spain', pattern: 'XXX XX XX XX' },
    { code: '31', flag: '🇳🇱', name: 'Netherlands', pattern: 'XX XXXXXXX' },
    { code: '46', flag: '🇸🇪', name: 'Sweden', pattern: 'XX-XXX XX XX' },
    { code: '41', flag: '🇨🇭', name: 'Switzerland', pattern: 'XX XXX XX XX' },
    { code: '971', flag: '🇦🇪', name: 'UAE', pattern: 'XXX XXX XXXX' },
    { code: '966', flag: '🇸🇦', name: 'Saudi Arabia', pattern: 'XXX XXX XXXX' },
    { code: '65', flag: '🇸🇬', name: 'Singapore', pattern: 'XXXX XXXX' },
    { code: '60', flag: '🇲🇾', name: 'Malaysia', pattern: 'XX-XXXX XXXX' },
    { code: '63', flag: '🇵🇭', name: 'Philippines', pattern: 'XXX XXX XXXX' },
    { code: '62', flag: '🇮🇩', name: 'Indonesia', pattern: 'XXX-XXX-XXXX' },
    { code: '64', flag: '🇳🇿', name: 'New Zealand', pattern: 'XX XXX XXXX' },
    { code: '27', flag: '🇿🇦', name: 'South Africa', pattern: 'XX XXX XXXX' },
    { code: '52', flag: '🇲🇽', name: 'Mexico', pattern: 'XX XXXX XXXX' },
    { code: '90', flag: '🇹🇷', name: 'Turkey', pattern: 'XXX XXX XX XX' },
    { code: '351', flag: '🇵🇹', name: 'Portugal', pattern: 'XXX XXX XXX' },
    { code: '353', flag: '🇮🇪', name: 'Ireland', pattern: 'XX XXXXXXX' },
    { code: '45', flag: '🇩🇰', name: 'Denmark', pattern: 'XX XX XX XX' },
    { code: '47', flag: '🇳🇴', name: 'Norway', pattern: 'XXX XX XXX' },
    { code: '358', flag: '🇫🇮', name: 'Finland', pattern: 'XX XXX XXXX' },
    { code: '48', flag: '🇵🇱', name: 'Poland', pattern: 'XXX XXX XXX' },
    { code: '36', flag: '🇭🇺', name: 'Hungary', pattern: 'XX XXX XXXX' },
    { code: '420', flag: '🇨🇿', name: 'Czech Republic', pattern: 'XXX XXX XXX' },
    { code: '30', flag: '🇬🇷', name: 'Greece', pattern: 'XXX XXX XXXX' },
    { code: '972', flag: '🇮🇱', name: 'Israel', pattern: 'XX-XXX-XXXX' },
    { code: '66', flag: '🇹🇭', name: 'Thailand', pattern: 'XX-XXX-XXXX' },
    { code: '84', flag: '🇻🇳', name: 'Vietnam', pattern: 'XX XXX XX XX' },
    { code: '92', flag: '🇵🇰', name: 'Pakistan', pattern: 'XXX-XXXXXXX' },
    { code: '880', flag: '🇧🇩', name: 'Bangladesh', pattern: 'XXXX-XXXXXX' },
    { code: '94', flag: '🇱🇰', name: 'Sri Lanka', pattern: 'XX XXX XXXX' },
    { code: '977', flag: '🇳🇵', name: 'Nepal', pattern: 'XXX-XXXXXXX' },
  ];

  const [showPhone, setShowPhone] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [phoneSigningIn, setPhoneSigningIn] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const otpInputRef = useRef(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
      return;
    }
    if (!googleClientId) return;

    const initialized = buttonRef.current?.dataset?.gisInitialized;
    if (initialized) return;

    const renderButton = () => {
      if (!window.google || !buttonRef.current) return;
      if (buttonRef.current.dataset.gisInitialized) return;
      buttonRef.current.dataset.gisInitialized = 'true';
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async ({ credential }) => {
          try {
            await googleLogin(credential);
            navigate('/dashboard', { replace: true });
          } catch (err) {
            setError(err.response?.data?.message || 'Google sign-in failed');
          }
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'filled_black',
        size: 'large',
        type: 'standard',
        shape: 'rectangular',
        width: 320,
      });
    };

    if (window.google) {
      renderButton();
    } else if (!scriptAdded.current) {
      scriptAdded.current = true;
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = renderButton;
      script.onerror = () => setError('Could not load Google sign-in.');
      document.head.appendChild(script);
    }
  }, [googleClientId, googleLogin, navigate, user]);

  const startGithubLogin = () => {
    setGithubLoading(true);
    setTimeout(() => { window.location.href = `${apiBaseUrl}/api/v1/auth/github`; }, 150);
  };

  const isPhoneValid = phoneNumber.replace(/\s/g, '').length >= 7;

  const formatPhone = (digits) => {
    const d = digits.replace(/\s/g, '');
    const parts = [];
    for (let i = 0; i < d.length; i += 5) {
      parts.push(d.slice(i, i + 5));
    }
    return parts.join(' ');
  };

  const handlePhoneChange = (raw) => {
    const digits = raw.replace(/[^0-9]/g, '');
    if (digits.length > 15) return;
    setPhoneNumber(formatPhone(digits));
  };

  const handleRequestOTP = async () => {
    setSendingOtp(true);
    setOtpError('');
    try {
      const fullPhone = '+' + selectedCountry.code + phoneNumber.replace(/\s/g, '');
      await api.post('/api/v1/auth/otp/request', { phoneNumber: fullPhone });
      setOtpSent(true);
      setCooldown(60);
      setTimeout(() => otpInputRef.current?.focus(), 100);
    } catch (err) {
      setOtpError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    setVerifyingOtp(true);
    setOtpError('');
    try {
      const fullPhone = '+' + selectedCountry.code + phoneNumber.replace(/\s/g, '');
      const verifyRes = await api.post('/api/v1/auth/otp/verify', { phoneNumber: fullPhone, otp });

      setPhoneSigningIn(true);
      const loginRes = await api.post('/api/v1/auth/phone/login', { authkey: verifyRes.data.authkey });

      completeOAuth(loginRes.data.token);

      if (!loginRes.data.user?.profileComplete) {
        navigate('/complete-profile', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setOtpError(err.response?.data?.error || 'Verification failed');
    } finally {
      setVerifyingOtp(false);
      setPhoneSigningIn(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-grid-bg" />
      <div className="auth-blob auth-blob-peach" />
      <div className="auth-blob auth-blob-purple" />

      <div className="auth-card">
        {!phoneSigningIn ? (
          <>
            <h1>Sign in to FlowForge</h1>
            <p className="auth-subtitle">
              Use your Google, GitHub, or phone to get started. New accounts are created automatically.
            </p>

            {displayedError && <div className="auth-error">{displayedError}</div>}

            <div ref={buttonRef} className="google-btn-wrapper" />

            <div className="auth-divider">
              <span>or</span>
            </div>

            <button type="button" onClick={startGithubLogin} className="github-btn" disabled={githubLoading}>
              {githubLoading ? <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> : <Code size={18} />}
              Continue with GitHub
            </button>

            <div className="auth-divider">
              <span>or</span>
            </div>

            {!showPhone ? (
              <button type="button" onClick={() => setShowPhone(true)} className="github-btn">
                <Smartphone size={18} />
                Continue with WhatsApp
              </button>
            ) : !otpSent ? (
              <div className="wa-section">
                <p className="wa-label">Enter your phone number</p>
                <div className="wa-phone-input-wrapper">
                  <button
                    type="button"
                    className="wa-country-btn"
                    onClick={() => setShowCountryPicker(!showCountryPicker)}
                  >
                    <span className="wa-country-flag">{selectedCountry.flag}</span>
                    <span className="wa-country-code">+{selectedCountry.code}</span>
                    <ChevronDown size={14} className={`wa-chevron ${showCountryPicker ? 'open' : ''}`} />
                  </button>
                  <div className="wa-phone-divider" />
                  <input
                    type="tel"
                    className="wa-input"
                    placeholder={selectedCountry.pattern}
                    value={phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && isPhoneValid && handleRequestOTP()}
                  />
                  {phoneNumber && (
                    <button className="wa-clear-btn" onClick={() => setPhoneNumber('')} type="button">
                      <X size={16} />
                    </button>
                  )}
                </div>
                {showCountryPicker && (
                  <div className="wa-country-dropdown">
                    <div className="wa-country-list">
                      {countries.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          className={`wa-country-option ${c.code === selectedCountry.code ? 'active' : ''}`}
                          onClick={() => { setSelectedCountry(c); setShowCountryPicker(false); }}
                        >
                          <span className="wa-country-flag">{c.flag}</span>
                          <span className="wa-country-name">{c.name}</span>
                          <span className="wa-country-code-label">+{c.code}</span>
                          {c.code === selectedCountry.code && <Check size={14} className="wa-country-check" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <p className="wa-country-hint">
                  {selectedCountry.flag} {selectedCountry.name}
                  {isPhoneValid && <span className="wa-valid-badge"><Check size={12} /> Valid</span>}
                </p>
                {otpError && <div className="auth-error wa-error">{otpError}</div>}
                <button
                  type="button"
                  onClick={handleRequestOTP}
                  className="wa-send-btn"
                  disabled={sendingOtp || !isPhoneValid}
                >
                  {sendingOtp ? <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> : <MessageCircle size={18} />}
                  Send OTP via WhatsApp
                </button>
                <button type="button" onClick={() => setShowPhone(false)} className="wa-back-btn">
                  Back
                </button>
              </div>
            ) : (
              <div className="wa-section">
                <p className="wa-label">Enter the 6-digit code sent to {selectedCountry.flag} +{selectedCountry.code} {phoneNumber}</p>
                <input
                  ref={otpInputRef}
                  type="text"
                  className="wa-input wa-otp-input"
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && otp.length === 6 && handleVerifyOTP()}
                />
                {otpError && <div className="auth-error wa-error">{otpError}</div>}
                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  className="wa-send-btn"
                  disabled={verifyingOtp || otp.length !== 6}
                >
                  {verifyingOtp ? <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> : <CheckCircle size={18} />}
                  Verify Code
                </button>
                <div className="wa-resend-row">
                  {cooldown > 0 ? (
                    <span className="wa-cooldown">Resend in {cooldown}s</span>
                  ) : (
                    <button type="button" onClick={handleRequestOTP} className="wa-back-btn" disabled={sendingOtp}>
                      Resend OTP
                    </button>
                  )}
                  <button type="button" onClick={() => { setOtpSent(false); setOtp(''); setOtpError(''); }} className="wa-back-btn">
                    Change number
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="wa-success">
            <div className="wa-success-icon">
              <span className="spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }} />
            </div>
            <h2>Signing you in</h2>
            <p className="wa-success-text">
              Phone verified for {selectedCountry.flag} +{selectedCountry.code} {phoneNumber}. Creating your account...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
