import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AuthPage from './pages/AuthPage'
import ProfilePage from './pages/ProfilePage';
import { AuthProvider } from './components/AuthProvider';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="*" element={<AuthPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App