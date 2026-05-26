import { useState, useEffect } from 'react';
import api from '../utils/api';

const ALLOWED_FONTS = new Set(['Outfit', 'Inter', 'DM Sans', 'Plus Jakarta Sans']);
const HEX_COLOR = /^#[0-9a-fA-F]{3,8}$/;

const sanitizeTheme = (t) => ({
  primaryColor: HEX_COLOR.test(t.primaryColor) ? t.primaryColor : '#ff7e5f',
  accentColor: HEX_COLOR.test(t.accentColor) ? t.accentColor : '#8b5cf6',
  borderRadius: Math.min(50, Math.max(0, Number(t.borderRadius) || 12)),
  fontFamily: ALLOWED_FONTS.has(t.fontFamily) ? t.fontFamily : 'Outfit',
  logoUrl: typeof t.logoUrl === 'string' ? t.logoUrl.replace(/[^a-zA-Z0-9:/._\-~?#[\]@!$&'()*+,;=]/g, '') : '',
  customCss: '',
});

const defaultTheme = sanitizeTheme({});

export default function TenantThemeProvider({ children }) {
  const [theme, setTheme] = useState(defaultTheme);

  useEffect(() => {
    api.get('/api/v1/theme')
      .then(r => setTheme(sanitizeTheme(r.data || defaultTheme)))
      .catch(() => {});
  }, []);

  const safeFont = theme.fontFamily.replace(/[^a-zA-Z\s-]/g, '');

  return (
    <>
      <style>{`
        :root {
          --color-primary: ${theme.primaryColor};
          --color-accent: ${theme.accentColor};
          --border-radius: ${theme.borderRadius}px;
          --font-heading: '${safeFont}', sans-serif;
        }
      `}</style>
      {children}
    </>
  );
}
