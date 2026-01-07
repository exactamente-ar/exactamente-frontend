# Exactamente

Este proyecto es una plataforma para la gestion de recursos academicos.

## Requisitos Previos

Antes de comenzar, asegurate de tener instalado lo siguiente:

- **Node.js**: Se recomienda la versión LTS más reciente.
- **pnpm**: El gestor de paquetes que utilizamos. Si no lo tenés instalado, podés hacerlo con:
  ```bash
  npm install -g pnpm
  ```

## Instalación

1. Cloná el repositorio:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd exactamente
   ```

2. Instalá las dependencias:
   ```bash
   pnpm install
   ```

## Desarrollo

Para correr el proyecto en modo de desarrollo local:

```bash
pnpm dev
```

Esto va a iniciar el servidor en `http://localhost:4321` (por defecto).

## Build

Para generar la versión de producción:

```bash
pnpm build
```
Los archivos generados van a estar en la carpeta `dist/`.

## Preview

Para probar la versión de producción localmente:

```bash
pnpm preview
```

## Colaboración

¡Las colaboraciones son bienvenidas! Si querés aportar al proyecto:

1. **Forkea** el repositorio.
2. Creá una **rama** para tu feature o fix (`git checkout -b feature/nueva-feature`).
3. Hacé tus cambios y commitealos (`git commit -m 'Agrega nueva feature'`).
4. Pusheá a la rama (`git push origin feature/nueva-feature`).
5. Abrí un **Pull Request**.

### Guía de Calidad
- Intentá mantener el código limpio y ordenado.
- Si agregás una funcionalidad grande, por favor actualizá la documentación si es necesario.
- Revisá que no haya errores de lint o build antes de pushear.
