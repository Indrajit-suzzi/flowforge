import { useState, useEffect } from 'react';
import api from '../utils/api';

const defaultTheme = {
  primaryColor: '#ff7e5f',
  accentColor: '#8b5cf6',
  borderRadius: 12,
  fontFamily: 'Outfit',
  logoUrl: '',
  customCss: '',
};

export default function TenantThemeProvider({ children }) {
  const [theme, setTheme] = useState(defaultTheme);

  useEffect(() => {
    api.get('/api/v1/theme')
      .then(r => setTheme(r.data || defaultTheme))
      .catch(() => {});
  }, []);

  return (
    <>
      <style>{`
        :root {
          --color-primary: ${theme.primaryColor};
          --color-accent: ${theme.accentColor};
          --border-radius: ${theme.borderRadius}px;
          --font-heading: '${theme.fontFamily}', sans-serif;
          ${theme.customCss}
        }
      `}</style>
      {children}
    </>
  );
}
