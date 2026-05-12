// src/theme.ts
import { createTheme, type MantineColorsTuple } from '@mantine/core';

// Generamos una paleta basada en tu #9E1B54 para que Mantine tenga tonos claros para los hover
const simdPrimaryPalette: MantineColorsTuple = [
  '#fbeaf2',
  '#f1d4e3',
  '#e0a6c4',
  '#cf75a3',
  '#c14c86',
  '#b73273',
  '#b22368',
  '#9e1659',
  '#8d104f', // Este se aproxima a tu #9E1B54
  '#7c0843'  // Tu hover #7A1440
];

export const theme = createTheme({
  colors: {
    simdPrimary: simdPrimaryPalette,
  },
  primaryColor: 'simdPrimary',
  primaryShade: 8, // Le decimos que el color base es el índice 8
  fontFamily: 'Inter, system-ui, sans-serif', // Asegura una tipografía limpia
  defaultRadius: 'md', // Bordes redondeados modernos por defecto
});