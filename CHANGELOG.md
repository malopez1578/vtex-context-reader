# Change Log

## [1.0.0] - 2025-07-02

### Added
- 🎯 **Detección automática de proyectos VTEX**: Identifica proyectos VTEX IO automáticamente
- 📊 **Análisis completo de contexto**: Parsea manifest.json, service.json, schemas y estructura del proyecto
- 🧩 **Integración con GitHub Copilot**: Proporciona contexto específico de VTEX para mejorar sugerencias
- 🌳 **Vista de explorador VTEX**: Panel dedicado mostrando información del proyecto VTEX
- 🔄 **Actualización automática**: Monitorea cambios en archivos de configuración VTEX
- 📁 **Soporte multi-builder**: Compatible con React, Node.js, GraphQL, Store Theme y Pixel apps

### Features
- Context provider inteligente basado en tipo de archivo
- Tree view con información organizada del proyecto
- Comandos para mostrar y refrescar contexto
- File watchers para actualización en tiempo real
- Logging y debugging integrado
- Soporte para múltiples tipos de archivos VTEX

### Supported VTEX Files
- `manifest.json` - Configuración de aplicación
- `service.json` - Configuración de servicios Node.js  
- `schema.json` - Schemas de configuración
- Componentes React en `/react/`
- Servicios Node.js en `/node/`
- Schemas GraphQL en `/graphql/`
- Metadatos en `/public/metadata/`