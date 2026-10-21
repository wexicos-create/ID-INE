# ID-INE / ValidaDepósito

**Plataforma empresarial de expedientes de identidad y conciliación de depósitos bancarios.**  
Repositorio: https://github.com/wexicos-create/ID-INE

## Qué contiene esta versión

- Dashboard adaptable para escritorio y móvil.
- Registro de expedientes de depósito con importe, banco, referencia, cliente y notas.
- Búsqueda, detalle y actualización manual de estados.
- Flujo de captura propuesto para INE (frente/reverso) y fotografía del rostro sosteniendo la identificación.
- Avisos explícitos para diferenciar una demostración de una verificación real.
- Persistencia temporal de expedientes en `localStorage` del navegador.

## Importante: estado actual

Esta rama es un **prototipo de interfaz**, no un sistema financiero de producción. No inicia sesión, no separa empresas en un backend, no consulta cuentas bancarias, no verifica CEP automáticamente, no valida la autenticidad de una INE y no realiza biometría/prueba de vida. El estado “Conciliado” solo representa una acción manual en la demo. Los datos se guardan localmente en el navegador y no deben introducirse datos personales, bancarios o documentos reales.

Se eliminó del flujo principal la antigua pantalla de validación que podía mostrar resultados de aprobación simulados. No presentar ningún puntaje de IA como prueba oficial de autenticidad o identidad.

## Ejecutar localmente

Requiere una versión de Node compatible con Vite 8.

```bash
npm install
npm run dev
```

Para comprobar el build de frontend:

```bash
npm run build
```

## Publicar en Vercel

1. Importa `wexicos-create/ID-INE` desde el panel de Vercel.
2. Selecciona la rama `feature/deposit-verification-platform` para previsualizar este prototipo.
3. Framework: Vite. Build command: `npm run build`. Output directory: `dist`.
4. No hacen falta variables de entorno para la demo de interfaz.

No conectes credenciales bancarias ni claves privadas al cliente. El archivo `server.ts` se utiliza para desarrollo local; Vercel sirve el frontend estático de Vite con esta configuración.

## Arquitectura de producción recomendada

### 1. Organizaciones y control de acceso
- Autenticación con MFA para administradores y revisores.
- Aislamiento multiempresa en base de datos: cada consulta y cada objeto debe incluir un tenant validado por el servidor.
- Roles separados: propietario de empresa, operador, revisor de identidad, auditor y solo lectura.
- Auditoría append-only de cambios de estado, usuario, fecha, motivo y origen de la acción.

### 2. Depósitos y conciliación
- Cada pago esperado recibe un identificador único, no reutilizable y no sensible.
- Capturar importe, moneda, cuenta receptora enmascarada, fecha esperada, referencia y cliente.
- Aceptar una referencia/CEP de Banxico y cotejar los campos disponibles: estado del CEP, monto, fecha, banco emisor/receptor, clave de rastreo y beneficiario cuando esté disponible.
- Si el CEP no está disponible o los datos no coinciden, marcar “Revisión manual”; nunca aprobar por ausencia de error.
- Para conciliación automática real, usar API bancaria/agregador autorizado o importación autenticada de movimientos. No pedir NIP, contraseña, CVV ni tokens de banca al cliente.
- Procesar webhooks de forma autenticada, idempotente, con firma, control de repetición y registro de eventos.

### 3. Identidad sin Didit
- La captura de INE y selfie solo es recolección de evidencia; no prueba autenticidad por sí misma.
- Para comprobar rostro visible y documento en mano se requieren controles de calidad de captura; para prueba de vida y comparación facial se necesita un método biométrico probado y validado, o revisión humana con limitaciones explícitas.
- Sin un proveedor biométrico, el producto puede ofrecer revisión manual de documentos, no una afirmación automática de identidad verificada.
- Mantener expedientes pendientes hasta que un revisor autorizado registre el resultado y el motivo.

### 4. Protección de datos
- Solicitar consentimiento informado y avisar finalidades, responsable, retención y derechos ARCO conforme a la legislación aplicable.
- Guardar archivos en almacenamiento privado, cifrados y con URLs temporales de corta duración.
- No registrar imágenes, INE, CURP, claves de elector, tokens ni payloads sensibles en logs.
- Aplicar minimización de datos, política de eliminación, control de accesos, límites de carga y análisis de malware.
- No almacenar biometría o documentos en `localStorage` ni en almacenamiento público.

## Próximos hitos antes de producción

- [ ] Conectar backend y base de datos con aislamiento multiempresa.
- [ ] Autenticación, MFA, roles y auditoría inmutable.
- [ ] Subida segura de documentos y política de borrado.
- [ ] Integración de CEP/conciliación con validación del lado servidor.
- [ ] Flujo de revisión manual, aclaraciones y apelaciones.
- [ ] Pruebas automatizadas, límites antiabuso, monitoreo y respuesta a incidentes.
- [ ] Revisión legal y de privacidad antes de procesar datos reales.

## Licencia

No se ha declarado una licencia de código abierto en este repositorio. Define una antes de autorizar reutilización comercial por terceros.
