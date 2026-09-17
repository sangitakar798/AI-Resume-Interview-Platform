import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../features/auth/hooks/useAuth';
import './app-navigation.scss';

export default function AppNavigation() {
  const navigate = useNavigate();
  const { user, handleLogout } = useAuth();
  // const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await handleLogout();
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return <nav className="app-navigation" aria-label="Account navigation">
    <button type="button" onClick={() => navigate('/')}>Home</button>
    <button type="button" onClick={() => navigate('/applications')}>Applications</button>
    <span className="app-navigation__user">{user?.username || user?.email}</span>
    <button type="button" className="app-navigation__logout" onClick={logout} disabled={isLoggingOut}>
      {isLoggingOut ? 'Logging out...' : 'Log out'}
    </button>
  </nav>;
}

