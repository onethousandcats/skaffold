import './App.css';
import Login from '../components/Login';

const API = 'http://localhost:4000';

function App() {
  const { token, setToken } = useToken();
  if (!token) return <Login onLoggedIn={setToken} />;
  return <Posts token={token} onLogout={() => setToken('')} />;
}

export default App;
