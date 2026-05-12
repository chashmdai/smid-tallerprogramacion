# SMID - Sistema de Procesamiento y Gestión Documental

Este repositorio contiene el código fuente del monorepo para SMID y SGS, plataformas desarrolladas para la Defensoría de la Niñez. El sistema opera bajo una arquitectura de microservicios orientada al procesamiento de documentos legales y el control analítico de oficios.

## Arquitectura y Componentes

El proyecto se divide en dos áreas funcionales integradas:

*   SMID: Clúster de microservicios enfocado en el procesamiento y digitalización de documentos legales.
*   SGS (Sistema de Gestión de Solicitudes/Oficios): Plataforma analítica independiente diseñada para modernizar, automatizar y controlar el flujo de los oficios institucionales.

### Estructura del Monorepo

*   `/smid-frontend`: Interfaz de usuario centralizada.
*   `/smid-backend`: Backend basado en clúster de microservicios.
    *   `/api-gateway`: Puerta de enlace unificada y enrutamiento de peticiones.
    *   `/auth`: Microservicio de seguridad, autenticación y gestión de accesos.
    *   `/sgs`: Microservicio core para el control de oficios y plataforma analítica.

## Stack Tecnológico Core

Frontend:
*   React
*   Vite
*   Node.js
*   Tailwind CSS

Backend:
*   Java 21 (OpenJDK 21 LTS)
*   Spring Boot
*   Docker (Orquestación)
*   MySQL 8

## Despliegue Local

(Sección reservada para documentar la inicialización de contenedores y variables de entorno).