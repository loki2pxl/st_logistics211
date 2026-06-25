// src/components/auth/LoginPage.styles.js
// ============================================================================
// LOGIN PAGE STYLES - Corporate Minimal Blue Theme
// ============================================================================

export const loginStyles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
    padding: '2rem',
    fontFamily: 'Arial, sans-serif'
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '2.5rem 3rem',
    maxWidth: '450px',
    width: '100%',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  logo: {
    textAlign: 'center',
    marginBottom: '1.75rem',
  },
  title: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: '2.2rem',
    fontWeight: 'bold',
    marginTop: '0.75rem',
    marginBottom: '0.25rem',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '1px'
  },
  subtitle: {
    color: '#64748b',
    fontSize: '0.9rem',
    fontWeight: 'normal'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontWeight: 'bold',
    fontSize: '0.85rem',
    color: '#334155',
  },
  input: {
    padding: '0.75rem 1rem',
    border: '1.5px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontFamily: 'Arial, sans-serif',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  button: {
    padding: '0.85rem',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: 'Arial, sans-serif',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
  },
  error: {
    padding: '0.75rem 1rem',
    background: 'rgba(239, 68, 68, 0.08)',
    color: '#dc2626',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    border: '1px solid rgba(239, 68, 68, 0.15)'
  },
  hint: {
    padding: '0.75rem 1rem',
    background: '#f8fafc',
    borderRadius: '8px',
    fontSize: '0.8rem',
    color: '#64748b',
    lineHeight: 1.5,
  },
};