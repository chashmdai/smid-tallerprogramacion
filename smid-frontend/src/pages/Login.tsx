import { useState, useContext, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { api } from '../api/axiosConfig';
import { User, Lock } from 'lucide-react';
import { TextInput, PasswordInput, Button, Title, Text, Box } from '@mantine/core';
import { notifications } from '@mantine/notifications';

// Utilidad para formatear el RUT chileno visualmente
const formatRut = (value: string) => {
  const clean = value.replace(/[^0-9kK]/g, '').toUpperCase();
  if (!clean) return '';

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);

  if (clean.length === 1) return clean;

  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formattedBody}-${dv}`;
};

export const Login = () => {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 1. Limpieza preventiva: Si había basura de un error anterior, la matamos antes de intentar loguear
    logout(); 
    localStorage.removeItem('smid_token');
    
    try {
      const rutForApi = rut.replace(/\./g, '');

      const response = await api.post('/auth/login', { rut: rutForApi, password });
      
      // 2. Extracción segura
      const { token, rut: userRut, fullName, roles } = response.data;
      
      // 3. Validación estricta: Evitamos la trampa del undefined en localStorage
      if (!token || token === 'undefined') {
        throw new Error("El servidor no proporcionó un token de seguridad válido.");
      }
      
      // 4. Inyección de contexto
      login(token, { rut: userRut, fullName, roles });
      
      notifications.show({
        title: 'Acceso autorizado',
        message: `Bienvenido al sistema, ${fullName}`,
        color: 'teal',
        autoClose: 3000,
      });

      navigate('/sgs/dashboard'); // Asegúrate de que apunte a tu ruta real
      
    } catch (err: unknown) {
      let errorMessage = 'Error de conexión con el servidor. Intente más tarde.';
      
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      notifications.show({
        title: 'Error de Autenticación',
        message: errorMessage,
        color: 'red',
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-simdBg flex flex-col items-center justify-center p-4 sm:p-8 font-sans">
      
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden flex flex-col lg:flex-row min-h-[560px]">
        
        {/* Lado izquierdo - Logo */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-12 bg-white relative">
          <img 
            src="/img/defensoria-vertical.png" 
            alt="Defensoría de la Niñez" 
            className="w-[65%] max-w-[280px] object-contain drop-shadow-sm transition-transform duration-500 hover:scale-[1.02]"
          />
          <div className="absolute bottom-8 text-center w-full">
            <p className="text-[11px] font-bold text-simdTextMuted uppercase tracking-[0.2em]">
              Panel Regional O'Higgins y Maule
            </p>
          </div>
        </div>

        <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-gray-100 to-transparent my-12"></div>

        {/* Lado derecho - Formulario */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 bg-white">
          <Box className="w-full max-w-[340px] mx-auto">
            
            <Box mb="xl">
              <Title order={2} className="text-gray-900 font-extrabold tracking-tight mb-1 text-3xl">
                Iniciar Sesión
              </Title>
              <Text c="dimmed" size="sm" className="font-medium">
                Ingrese sus credenciales para continuar
              </Text>
            </Box>

            <form onSubmit={handleSubmit} className="space-y-5">
              <TextInput
                label="Usuario (RUT)"
                placeholder="12.345.678-9"
                required
                size="md"
                maxLength={12}
                variant="filled"
                leftSection={<User size={18} className="text-gray-500" />}
                value={rut}
                onChange={(e) => setRut(formatRut(e.currentTarget.value))}
                styles={{ 
                  input: { fontSize: '14px', backgroundColor: '#F4F5F7' }, 
                  label: { fontSize: '13px', marginBottom: '6px', fontWeight: 600, color: '#4A4D4E' } 
                }}
              />

              <PasswordInput
                label="Contraseña"
                placeholder="••••••••"
                required
                size="md"
                variant="filled"
                leftSection={<Lock size={18} className="text-gray-500" />}
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                styles={{ 
                  input: { fontSize: '14px', backgroundColor: '#F4F5F7' }, 
                  label: { fontSize: '13px', marginBottom: '6px', fontWeight: 600, color: '#4A4D4E' } 
                }}
              />

              <Button 
                type="submit" 
                fullWidth 
                size="md" 
                mt="xl" 
                loading={isLoading}
                className="transition-all active:scale-[0.98] shadow-sm hover:shadow-md font-bold tracking-wide"
                radius="md"
              >
                Ingresar al Sistema
              </Button>
            </form>
            
          </Box>
        </div>

      </div>

      <div className="mt-8 text-center text-simdTextMuted">
        <p className="text-xs font-medium">
          Sistema Integral de Monitoreo de Derechos &copy; 2026
        </p>
      </div>
 
    </div>
  );
};