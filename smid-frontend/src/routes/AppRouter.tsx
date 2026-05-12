import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MainLayout } from '../layouts/MainLayout';
import { Login } from '../pages/Login';
import { Home } from '../pages/Home';
// 1. Importas tu nuevo componente SGS
import { SgsDashboard } from '../pages/sgs/SgsDashboard'; 

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { token } = useContext(AuthContext);
  return !token ? children : <Navigate to="/home" replace />;
};

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

      {/* Todo lo que esté aquí adentro hereda el Header y está protegido */}
      <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home" element={<Home />} />
        
        {/* 2. Agregas la ruta de SGS aquí. 
            Nota que es solo "sgs" porque hereda el "/" del padre */}
        <Route path="sgs" element={<SgsDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};