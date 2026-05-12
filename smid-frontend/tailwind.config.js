/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 🖋️ Configuración de Fuente
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      
      // 🎨 Paleta de colores institucional SMID
      colors: {
        // Colores Principales
        simdPrimary: '#9E1B54',       // Magenta institucional
        simdPrimaryHover: '#7A1440',  // Magenta oscuro para hover
        simdAccent: '#F99E39',        // Naranja del isotipo
        
        // Colores Funcionales
        simdSuccess: '#93C43A',       // Verde Claro
        simdWarning: '#F4DD26',       // Amarillo
        simdDanger: '#E55572',        // Rosa/Sandía
        simdInfo: '#5D6062',          // Gris institucional
        
        // Neutros y UI
        simdBg: '#F4F5F7',            // Fondo general
        simdSurface: '#FFFFFF',       // Fondo de tarjetas/paneles
        simdTextMain: '#4A4D4E',      // Texto principal
        simdTextMuted: '#828587',     // Texto secundario
        simdBorder: '#E5E7EB',        // Bordes de tablas/tarjetas
      }
    },
  },
  plugins: [],
}