import { useContext } from 'react';
import { ShieldHalf, Users, TableProperties, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Title, Text, Badge } from '@mantine/core';
import { AuthContext } from '../context/AuthContext';

export const Home = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Usamos "Hola" en lugar de "Bienvenido" para evitar fricción de género (ej: Bienvenido, María)
  const firstName = user?.fullName?.split(' ')[0] || 'Funcionario';

  const modules = [
    {
      id: 'smid',
      title: 'SMID',
      badge: 'Módulo Principal',
      description: 'Gestión de casos, observatorio legislativo e inteligencia de datos en tiempo real.',
      icon: <ShieldHalf size={26} strokeWidth={2.5} />,
      // La "sal": Borde superior grueso de color, ring sutil y sombra elegante
      cardStyle: 'border-t-4 border-t-simdPrimary ring-1 ring-gray-900/5 shadow-sm hover:shadow-md hover:ring-simdPrimary/30',
      iconBg: 'bg-[#FDF2F8] text-simdPrimary',
      badgeColor: 'simdPrimary',
      path: '/smid'
    },
    {
      id: 'proninez',
      title: 'PRONIÑEZ',
      badge: 'IA Copilot',
      description: 'Promoción y Protección Integral. Análisis documental con asistencia jurídica.',
      icon: <Users size={26} strokeWidth={2.5} />,
      cardStyle: 'border-t-4 border-t-[#3498DB] ring-1 ring-gray-900/5 shadow-sm hover:shadow-md hover:ring-[#3498DB]/30',
      iconBg: 'bg-[#E8F4FD] text-[#3498DB]',
      badgeColor: 'blue',
      path: '/proninez'
    },
    {
      id: 'sgs',
      title: 'SGS',
      badge: 'Extracción',
      description: 'Matriz de Seguimiento. Extracción y consolidación automática de oficios institucionales.',
      icon: <TableProperties size={26} strokeWidth={2.5} />,
      cardStyle: 'border-t-4 border-t-[#1ABC9C] ring-1 ring-gray-900/5 shadow-sm hover:shadow-md hover:ring-[#1ABC9C]/30',
      iconBg: 'bg-[#E8F8F5] text-[#1ABC9C]',
      badgeColor: 'teal',
      path: '/sgs'
    }
  ];

  return (
    <div className="py-10 px-6 sm:px-10 max-w-7xl mx-auto font-sans">
      
      {/* Cabecera del Dashboard - Más estructurada */}
      <div className="mb-10 pb-6 border-b border-gray-200/80 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Badge color="gray" variant="light" size="sm" radius="sm" className="mb-3 font-bold tracking-[0.15em] uppercase">
            Defensoría de la Niñez
          </Badge>
          <Title order={1} className="text-3xl text-gray-900 tracking-tight font-extrabold mb-1">
            Hola, {firstName}
          </Title>
          <Text size="md" c="dimmed" className="font-medium">
            Selecciona una aplicación para comenzar tu jornada.
          </Text>
        </div>
        
        {/* Indicador de Estado - Le da vida y contexto técnico al panel */}
        <div className="flex items-center space-x-3 bg-white ring-1 ring-gray-900/5 px-4 py-2 rounded-lg shadow-sm">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-simdSuccess opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-simdSuccess"></span>
          </div>
          <div className="flex flex-col">
            <Text size="xs" fw={700} c="dark.7" className="leading-none mb-0.5">Sistemas en línea</Text>
            <Text size="[10px]" c="dimmed" className="leading-none uppercase font-semibold tracking-wider text-[10px]">Todos los servicios operativos</Text>
          </div>
        </div>
      </div>

      {/* Grilla de Módulos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {modules.map((mod) => (
          <div 
            key={mod.id}
            onClick={() => navigate(mod.path)}
            className={`
              group bg-white rounded-xl cursor-pointer transition-all duration-300
              flex flex-col h-full relative overflow-hidden
              ${mod.cardStyle}
            `}
          >
            {/* Contenido principal de la tarjeta */}
            <div className="p-7 flex-1 flex flex-col">
              
              <div className="flex items-start justify-between mb-6">
                {/* Ícono con contenedor sólido */}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${mod.iconBg}`}>
                  {mod.icon}
                </div>
                <Badge 
                  variant="light" 
                  color={mod.badgeColor} 
                  radius="sm"
                  className="font-bold"
                >
                  {mod.badge}
                </Badge>
              </div>

              <Title order={3} className="text-xl font-extrabold text-gray-900 mb-2.5">
                {mod.title}
              </Title>
              
              <Text c="dimmed" size="sm" className="leading-relaxed font-medium">
                {mod.description}
              </Text>
            </div>

            {/* Pie de la tarjeta (Call to Action) */}
            <div className="px-7 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between group-hover:bg-gray-50 transition-colors">
              <Text size="sm" fw={700} className="text-gray-500 group-hover:text-gray-900 transition-colors">
                Ingresar a la plataforma
              </Text>
              {/* Usamos un ícono de flecha diagonal, muy propio del software moderno */}
              <div className="text-gray-400 group-hover:text-gray-900 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                <ArrowUpRight size={20} strokeWidth={2.5} />
              </div>
            </div>
            
          </div>
        ))}
      </div>

    </div>
  );
};