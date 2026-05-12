import { useContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, ShieldAlert, Settings } from 'lucide-react';
import { Menu, Avatar, UnstyledButton, Group, Text } from '@mantine/core';

export const MainLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Verificamos si el usuario tiene el rol de administrador
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  return (
    <div className="min-h-screen flex flex-col font-sans bg-simdBg">
      
      {/* Header Minimalista tipo SaaS */}
      <header className="h-[64px] bg-white border-b border-gray-200 flex items-center justify-between px-6 sm:px-8 sticky top-0 z-50 transition-all">
        
        {/* Marca / Logo */}
        <div 
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => navigate('/home')}
        >
          <img 
            src="/img/logo-defensoria.png" 
            alt="Logo Defensoría" 
            className="h-8 w-auto transition-transform duration-300 group-hover:scale-105" 
          />
          <div className="hidden sm:block">
            <Text size="sm" fw={800} c="dark.8" className="leading-none tracking-tight">
              Defensoría de la Niñez
            </Text>
            <Text size="xs" c="dimmed" className="tracking-widest uppercase font-bold mt-0.5 text-[10px]">
              Portal Interno
            </Text>
          </div>
        </div>

        {/* Acciones y Perfil */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          
          {/* Botón Panel TI - Visible SOLO para administradores */}
          {isAdmin && (
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="hidden md:flex items-center space-x-2 px-3 py-2 rounded-md text-gray-500 hover:text-simdPrimary hover:bg-simdPrimary/5 transition-colors font-medium text-sm"
            >
              <ShieldAlert size={18} strokeWidth={2.5} />
              <span>Panel TI</span>
            </button>
          )}

          {/* Separador Visual */}
          <div className="hidden md:block h-6 w-px bg-gray-200 mx-2"></div>

          {/* Menú de Usuario con Mantine */}
          <Menu shadow="md" width={200} position="bottom-end" radius="md" withArrow>
            <Menu.Target>
              <UnstyledButton className="hover:bg-gray-50 p-1.5 rounded-xl transition-colors">
                <Group gap="sm">
                  {/* Mantine Avatar genera automáticamente las iniciales si no hay imagen */}
                  <Avatar color="simdPrimary" radius="xl" size="sm">
                    {user?.fullName?.charAt(0) || 'U'}
                  </Avatar>
                  
                  <div className="hidden md:block text-left">
                    <Text size="sm" fw={600} className="leading-none text-gray-800">
                      {user?.fullName || 'Usuario'}
                    </Text>
                    <Text size="xs" c="dimmed" className="uppercase tracking-wider mt-1 font-semibold text-[9px]">
                      {user?.roles?.[0]?.replace('ROLE_', '') || 'Funcionario'}
                    </Text>
                  </div>
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Opciones de cuenta</Menu.Label>
              <Menu.Item leftSection={<Settings size={14} className="text-gray-500" />}>
                Configuración
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item 
                color="red" 
                leftSection={<LogOut size={14} />} 
                onClick={handleLogout}
                className="font-medium"
              >
                Cerrar Sesión
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

        </div>
      </header>

      {/* Área de Contenido Principal donde se inyectan los módulos */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Footer Minimalista (Ahora con fondo transparente para no cortar la pantalla) */}
      <footer className="py-6 bg-transparent text-center mt-auto">
        <p className="text-xs text-gray-400 font-medium">
          Área de Estudios y Estadísticas &copy; 2026 | Defensoría de la Niñez
        </p>
      </footer>
    </div>
  );
};