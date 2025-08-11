import { useState } from 'react';

export default function useToken() {
  const [token, setToken] = useState(() => localStorage.getItem('cms_token') || '');
  useEffect(() => {
    if (token) localStorage.setItem('cms_token', token);
    else localStorage.removeItem('cms_token');
  }, [token]);
  return { token, setToken };
}
