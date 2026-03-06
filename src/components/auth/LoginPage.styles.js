// src/components/auth/LoginPage.styles.js
// ============================================================================
// LOGIN PAGE STYLES
// ============================================================================

export const loginStyles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%)',
    padding: '2rem',
  },
  card: {
    background: 'white',
    borderRadius: '2rem',
    padding: '3rem',
    maxWidth: '450px',
    width: '100%',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
  },
  logo: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontFamily: 'Bebas Neue, sans-serif',
    fontSize: '2.5rem',
    marginTop: '1rem',
    marginBottom: '0.5rem',
    background: 'linear-gradient(135deg, #1e3c72 0%, #7e22ce 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontWeight: 700,
    fontSize: '0.95rem',
    color: '#0f172a',
  },
  input: {
    padding: '1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    fontFamily: 'Outfit, sans-serif',
    transition: 'all 0.3s ease',
  },
  button: {
    padding: '1rem',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '0.75rem',
    fontSize: '1.1rem',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'Outfit, sans-serif',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
  },
  error: {
    padding: '1rem',
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    borderRadius: '0.75rem',
    fontSize: '0.95rem',
    fontWeight: 600,
  },
  hint: {
    padding: '1rem',
    background: '#f8fafc',
    borderRadius: '0.75rem',
    fontSize: '0.85rem',
    color: '#64748b',
    lineHeight: 1.6,
  },
};