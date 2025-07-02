# 📦 Guía Completa para Publicar VTEX Context Reader

## Prerrequisitos Completados ✅
- [x] Extensión desarrollada y funcionando
- [x] Código compilado sin errores
- [x] Documentación completa (README.md, USAGE.md)
- [x] CHANGELOG.md actualizado
- [x] Licencia MIT agregada
- [x] package.json configurado para publicación

## Pasos Restantes para Publicación

### 1. 🎨 Crear Icon de la Extensión
**REQUERIDO ANTES DE CONTINUAR**
- Crear `icon.png` (128x128px) en la raíz del proyecto
- Ver detalles en `ICON_REQUIREMENTS.md`

### 2. 🔧 Configurar Publisher Account

#### Crear cuenta en Azure DevOps:
1. Ve a https://dev.azure.com
2. Crea una cuenta o inicia sesión
3. Crea una organización nueva

#### Crear Personal Access Token:
1. Ve a User Settings → Personal Access Tokens
2. Clic en "New Token"
3. Configuración:
   - **Name**: "VS Code Extension Publishing"
   - **Organization**: Tu organización
   - **Expiration**: 1 año
   - **Scopes**: Seleccionar "Marketplace" → "Manage"
4. Copia el token (¡guárdalo seguro!)

#### Crear Publisher:
```bash
# Crear publisher (reemplaza con tu información)
vsce create-publisher tu-nombre-publisher
```

### 3. 📝 Configurar package.json Final

Actualiza en `package.json`:
```json
{
  "publisher": "tu-nombre-publisher-real",
  "repository": {
    "type": "git",
    "url": "https://github.com/TU-USUARIO/vtex-context-reader.git"
  },
  "homepage": "https://github.com/TU-USUARIO/vtex-context-reader#readme",
  "bugs": {
    "url": "https://github.com/TU-USUARIO/vtex-context-reader/issues"
  }
}
```

### 4. 🔐 Login con vsce
```bash
vsce login tu-nombre-publisher
# Ingresa tu Personal Access Token cuando se solicite
```

### 5. 📦 Empaquetar la Extensión
```bash
# Crear archivo .vsix para testing
vsce package

# Esto creará: vtex-context-reader-1.0.0.vsix
```

### 6. 🧪 Probar el Package Localmente
```bash
# Instalar la extensión empaquetada localmente
code --install-extension vtex-context-reader-1.0.0.vsix

# O desde VS Code:
# Ctrl+Shift+P → "Extensions: Install from VSIX"
```

### 7. 🚀 Publicar en Marketplace
```bash
# Publicar la extensión
vsce publish

# O si ya tienes el .vsix:
vsce publish --packagePath vtex-context-reader-1.0.0.vsix
```

### 8. ✅ Verificar Publicación
1. Ve a https://marketplace.visualstudio.com
2. Busca "VTEX Context Reader"
3. Verifica que aparezca tu extensión
4. Prueba instalarla desde VS Code Marketplace

## 🔄 Para Futuras Actualizaciones

### Actualizar Versión:
```bash
# Incrementar versión patch (1.0.0 → 1.0.1)
vsce publish patch

# Incrementar versión minor (1.0.0 → 1.1.0)
vsce publish minor

# Incrementar versión major (1.0.0 → 2.0.0)
vsce publish major

# O especificar versión exacta
vsce publish 1.2.3
```

### Workflow Recomendado:
1. Hacer cambios en el código
2. Actualizar CHANGELOG.md
3. Hacer commit y push a Git
4. Ejecutar `vsce publish patch/minor/major`

## 📊 Después de Publicar

### Monitoreo:
- Ver estadísticas en https://marketplace.visualstudio.com/manage
- Revisar reviews y ratings
- Responder a preguntas de usuarios

### Marketing:
- Compartir en redes sociales
- Documentar en blog/LinkedIn
- Enviar a comunidades de VTEX
- Crear video demo en YouTube

## 🛠️ Comandos de Referencia Rápida

```bash
# Setup inicial
npm install -g @vscode/vsce
vsce create-publisher nombre-publisher
vsce login nombre-publisher

# Desarrollo
vsce package                    # Crear .vsix
code --install-extension *.vsix # Probar localmente

# Publicación
vsce publish                    # Publicar nueva versión
vsce publish patch             # Incrementar patch
vsce unpublish                 # Remover extensión (¡cuidado!)

# Información
vsce show nombre-publisher.extension-name
vsce ls nombre-publisher       # Listar extensiones del publisher
```

## ⚠️ Checklist Final Antes de Publicar

- [ ] Icon creado (icon.png 128x128)
- [ ] Publisher configurado en Azure DevOps
- [ ] Personal Access Token guardado
- [ ] package.json actualizado con publisher real
- [ ] Repository URL actualizada en package.json
- [ ] Extensión probada localmente con F5
- [ ] Código compilado sin errores (`npm run compile`)
- [ ] README.md actualizado
- [ ] CHANGELOG.md completado
- [ ] Tests funcionando (`npm test`)

¡Una vez completados estos pasos, tu extensión estará disponible globalmente en VS Code Marketplace! 🎉
