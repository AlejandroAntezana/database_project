# Database Visualizer Educativo

## 🎯 Objetivo General

Esta plataforma es una aplicación web interactiva desarrollada para ayudar a estudiantes a aprender conceptos fundamentales de bases de datos relacionales. Su meta principal es proporcionar un entorno moderno e intuitivo donde los usuarios puedan modelar tablas, visualizar relaciones mediante un diagrama interactivo, e interactuar con los datos (inserción, consultas, y *joins*), todo gestionado localmente en el navegador sin necesidad de herramientas externas o configuración de servidores.

## ✨ Funcionalidades Principales

*   **Modelado Visual (Canvas):** Creación interactiva de bases de datos utilizando diagramas de nodos y vínculos, permitiendo estructurar esquemas de una manera altamente gráfica.
*   **Gestión Dinámica de Tablas:** Permite a los usuarios definir tablas, configurar atributos, tipos de datos y asignar claves primarias de manera sencilla.
*   **Gestión de Relaciones (Joins):** Funcionalidad extendida para enlazar relaciones entre tablas con vista previa (Live Join Preview) y traducción semántica de cardinalidades (1:1, 1:N, N:M).
*   **Panel de Datos Interactivos (DML):** Interfaz para insertar, filtrar y borrar registros dentro de las tablas definidas.
*   **Query Sandbox (Constructor SQL):** Una caja de arena para pruebas donde los usuarios pueden interactuar visualmente seleccionando columnas y estableciendo condicionales (cláusulas `WHERE`) para ver en tiempo real cómo impactan sus búsquedas SQL.

## 🛠️ Herramientas de Desarrollo y Tecnologías

Este proyecto está construido con un stack tecnológico moderno, enfocado principalmente en rendimiento y experiencia de desarrollo en el ecosistema Frontend:

*   **[React](https://react.dev/) (v19):** Biblioteca base del lado del cliente para construir interfaces de usuario reactivas y componibles.
*   **[TypeScript](https://www.typescriptlang.org/):** Superset de JavaScript que añade tipado estático, permitiendo crear código robusto y ayudando con la prevención de errores comunes.
*   **[Vite](https://vitejs.dev/) (v8):** Herramienta de compilación y servidor de desarrollo extremadamente ágil.
*   **[React Flow / @xyflow/react](https://reactflow.dev/):** Potente motor de renderizado de grafos para la interacción visual en el lienzo con los diagramas de Entidad-Relación y mapeo de nodos.
*   **[Tailwind CSS](https://tailwindcss.com/) (v3):** Framework CSS basado en clases utilitarias para crear un estilo rico, adaptable y de alto impacto visual sin depender de extensas hojas de estilo externas.
*   **[Zustand](https://zustand-demo.pmnd.rs/) (v5):** Librería minimalista para gestionar el estado de los componentes, perfecta para manejar los datos, nodos y conexiones generadas de manera global.
*   **[Lucide React](https://lucide.dev/):** Conjunto de iconos open-source que complementan la experiencia visual de manera limpia. 
*   **ESLint:** Herramienta para asegurar el estándar de buenas prácticas durante la integración y el trabajo de codificación.
