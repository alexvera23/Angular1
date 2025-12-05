Sistema de Gestion Academica (SGA) - Frontend

Este repositorio contiene el codigo fuente del Frontend para el Sistema de Gestion Academica. Es una aplicacion de pagina unica (SPA) desarrollada con Angular y TypeScript, diseñada para interactuar con la API REST del backend. La interfaz de usuario utiliza Angular Material y Bootstrap para garantizar un diseño responsivo y funcional.

Tecnologias Utilizadas

Framework: Angular (Version mas reciente segun package.json)

Lenguaje: TypeScript

Estilos: SCSS (Sass), Bootstrap

Componentes UI: Angular Material

Visualizacion de Datos: Ngx-Charts / Chart.js

Gestion de Paquetes: NPM

Arquitectura del Proyecto

El codigo fuente se encuentra bajo el directorio src/app y esta organizado por funcionalidad:

screens/: Contiene los componentes que representan paginas completas.

login-screen: Pantalla de inicio de sesion.

home: Pantalla principal o dashboard.

admin, alumno, profesores: Pantallas especificas para la gestion de cada rol.

eventos-academicos-screens: Listado y visualizacion de eventos.

graficas-screen: Visualizacion de metricas y estadisticas del sistema.

partials/: Componentes reutilizables en toda la aplicacion.

registro-*: Formularios modulares para registrar alumnos, administradores, profesores y eventos.

navar-user, sidebar-user: Elementos de navegacion.

confirm-dialog: Modales para confirmacion de acciones.

services/: Capa de comunicacion con el Backend.

auth.service: Manejo de inicio de sesion y almacenamiento de tokens.

facade.service: Patron Facade para simplificar las llamadas a multiples servicios.

*users*.service: Servicios especificos para cada entidad (alumnos, profesores, etc.).

tools/: Servicios de utilidad como validadores personalizados y manejo de errores.

guards/: Proteccion de rutas (AuthGuard) para asegurar que solo usuarios autenticados accedan a secciones privadas.

interceptors/: Interceptor HTTP para adjuntar tokens de autenticacion a las peticiones salientes.

Funcionalidades Principales

1. Autenticacion

Formulario de login seguro.

Persistencia de sesion mediante almacenamiento local (Local Storage).

Redireccion automatica basada en el rol del usuario.

2. Gestion de Usuarios (CRUD)

Interfaces dedicadas para listar, registrar, editar y eliminar Administradores, Profesores y Alumnos.

Formularios reactivos con validaciones en tiempo real (campos requeridos, formatos de correo, matriculas, etc.).

3. Gestion de Eventos

Calendario o lista de eventos academicos.

Formulario para dar de alta nuevos eventos o modificar los existentes.

4. Dashboard y Graficas

Visualizacion grafica de la distribucion de usuarios y datos del sistema.

Integracion con librerias de graficos para mostrar informacion estadistica.

Guia de Instalacion y Ejecucion

Sigue estos pasos para desplegar la aplicacion frontend en tu entorno local.

Prerrequisitos

Node.js (Version LTS recomendada).

Angular CLI instalado globalmente.

Pasos

Navegar a la carpeta del frontend

Instalar dependencias
Ejecuta el siguiente comando para descargar todas las librerias necesarias listadas en package.json.

npm install


Ejecutar el servidor de desarrollo

ng serve


O alternativamente:

npm start


Acceder a la aplicacion
Abre tu navegador web y ve a la direccion http://localhost:4200/. La aplicacion se recargara automaticamente si realizas cambios en el codigo fuente.

Configuracion de Entorno

Los archivos de configuracion de entorno se encuentran en src/environments/. Asegurate de que la variable apiUrl o similar apunte a la direccion correcta donde se esta ejecutando tu Backend de Django (por defecto http://127.0.0.1:8000/).
