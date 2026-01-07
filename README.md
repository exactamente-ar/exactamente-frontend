# Exactamente

**Exactamente** es un proyecto que gestiona recursos académicos (parciales, resúmenes, finales) para estudiantes universitarios. La aplicación permite consultar y organizar materiales de estudio por materia, carrera y universidad, integrándose con Google Sheets como fuente de datos.


## 📁 Estructura del Proyecto

```
exactamente/
├── domain/                    # 🟢 Capa de Dominio (Núcleo)
│   ├── resource/
│   │   ├── resource.entity.ts       # Entidad Resource con lógica de negocio
│   │   ├── resource.repository.ts   # Interface del repositorio
│   │   └── resource.types.ts        # Tipos y enums (ResourceType, ResourceFormat)
│   └── subject/
│       ├── subject.entity.ts        # Entidad Subject
│       ├── subject.repository.ts    # Interface del repositorio
│       └── subject.types.ts         # Tipos de Subject
│
├── aplication/                # 🔵 Capa de Aplicación
│   └── resource/
│       ├── list-resources.use-case.ts  # Caso de uso: listar recursos
│       └── resource.dto.ts             # DTO y función toDTO()
│
├── infraestructure/           # 🟠 Capa de Infraestructura
│   └── sheets/
│       ├── sheet-client.ts                    # Cliente HTTP para Google Sheets
│       ├── resource.repository.sheets.ts      # Implementación del repositorio
│       └── mappers/
│           └── resource.sheets.mapper.ts      # Mapper: API → Domain
│
└── ui/                        # 🟣 Capa de Presentación
    └── src/                   # Componentes Astro/React
```

## 🎯 Responsabilidades por Capa

### 🟢 Domain Layer (Dominio)

**Responsabilidad**: Contiene la lógica de negocio pura, independiente de frameworks y tecnologías externas.

- **Entities**: Objetos con identidad y comportamiento (`Resource`, `Subject`)
- **Repository Interfaces**: Contratos que definen cómo acceder a los datos
- **Types**: Enums y tipos que representan conceptos del dominio

**Reglas**:
- ❌ NO puede depender de otras capas
- ❌ NO puede importar librerías externas (excepto tipos nativos)
- ✅ Define las reglas de negocio
- ✅ Es la capa más estable

### 🔵 Application Layer (Aplicación)

**Responsabilidad**: Orquesta el flujo de datos entre capas y ejecuta casos de uso.

- **Use Cases**: Implementan las funcionalidades de la aplicación
- **DTOs**: Objetos de transferencia de datos para comunicación entre capas

**Reglas**:
- ✅ Puede depender de la capa de Dominio
- ❌ NO puede depender de Infrastructure o UI
- ✅ Coordina entidades y repositorios
- ✅ No contiene lógica de negocio (eso va en Domain)

---

### 🟠 Infrastructure Layer (Infraestructura)

**Responsabilidad**: Implementa los detalles técnicos (APIs, bases de datos, servicios externos).

- **Repository Implementations**: Implementaciones concretas de las interfaces del dominio
- **Mappers**: Transforman datos externos al formato del dominio
- **Clients**: Comunicación con APIs externas

**Reglas**:
- ✅ Puede depender de Domain y Application
- ✅ Implementa las interfaces definidas en Domain
- ✅ Maneja detalles técnicos (HTTP, persistencia, etc.)
- ❌ NO expone detalles de implementación al dominio



---

### 🟣 UI Layer (Presentación)

**Responsabilidad**: Interfaz de usuario y presentación de datos.

- **Components**: Componentes Astro/React
- **Pages**: Rutas de la aplicación

**Reglas**:
- ✅ Puede depender de Application (Use Cases)
- ✅ Consume DTOs, no entidades directamente
- ❌ NO contiene lógica de negocio
- ❌ NO accede directamente a Infrastructure

---

## 🚀 Desarrollo

### Requisitos
- Node.js 18+
- npm o yarn

### Estructura de Comandos
```bash
# Desarrollo (UI)
cd ui
npm install
npm run dev

# Build
npm run build
```

**Última actualización**: Enero 2026
