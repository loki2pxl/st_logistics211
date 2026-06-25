// src/components/auth/LoginPage.styles.js
// ============================================================================
// LOGIN PAGE STYLES - Fintask-inspired Glassmorphism & Soft Gradients
// ============================================================================

export const loginStyles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle at 15% 15%, rgba(253, 186, 116, 0.18) 0%, transparent 40%), radial-gradient(circle at 85% 85%, rgba(196, 181, 253, 0.22) 0%, transparent 45%), linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
    padding: '2rem',
    fontFamily: "'Outfit', sans-serif"
  },
  card: {
    background: 'rgba(255, 255, 255, 0.82)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderRadius: '24px',
    padding: '2.5rem 3rem',
    maxWidth: '550px',
    width: '100%',
    boxShadow: '0 25px 50px -12px rgba(124, 58, 237, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.6) inset',
    border: '1px solid rgba(255, 255, 255, 0.5)'
  },
  logo: {
    textAlign: 'center',
    marginBottom: '1.75rem',
  },
  title: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '2.2rem',
    fontWeight: 'bold',
    marginTop: '0.75rem',
    marginBottom: '0.25rem',
    background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '1px'
  },
  subtitle: {
    color: '#64748b',
    fontSize: '0.95rem',
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
    fontWeight: '600',
    fontSize: '0.85rem',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  input: {
    padding: '0.85rem 1.1rem',
    border: '1.5px solid #e2e8f0',
    borderRadius: '14px',
    fontSize: '0.95rem',
    fontFamily: "'Outfit', sans-serif",
    background: '#f8fafc',
    outline: 'none',
    transition: 'all 0.25s ease',
  },
  button: {
    padding: '0.95rem',
    background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif",
    transition: 'all 0.25s ease',
    boxShadow: '0 8px 20px rgba(124, 58, 237, 0.2)',
  },
  error: {
    padding: '0.75rem 1rem',
    background: 'rgba(239, 68, 68, 0.08)',
    color: '#dc2626',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    border: '1px solid rgba(239, 68, 68, 0.15)'
  },
  hint: {
    padding: '0.75rem 1rem',
    background: '#f8fafc',
    borderRadius: '12px',
    fontSize: '0.8rem',
    color: '#64748b',
    lineHeight: 1.5,
  },
};