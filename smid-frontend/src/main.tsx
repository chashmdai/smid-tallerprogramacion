import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// 1. Importaciones de Mantine
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

// 2. Fuentes y Estilos (Importa la fuente antes que el CSS de Mantine)
import '@fontsource/inter/index.css';
import '@fontsource/inter/700.css'; // Opcional: Carga el peso negrita si lo necesitas
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

// 3. Tus estilos globales / Tailwind
import './index.css';

import App from './App.tsx';

// Configura el theme para que use Inter como fuente principal
const theme = createTheme({
  fontFamily: 'Inter, sans-serif',
  /** Si quieres que los encabezados también usen Inter: **/
  headings: { fontFamily: 'Inter, sans-serif' },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <Notifications position="top-right" zIndex={1000} />
      <App />
    </MantineProvider>
  </StrictMode>,
);