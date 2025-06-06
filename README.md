# BE-challengeFinal-akademi-valentinaGadagnotto

# Plataforma de Cursos Online - Backend

Este repositorio contiene el backend de la Plataforma de Cursos Online desarrollada como parte del Challenge Final de Akademi.

## 🚀 Tecnologías Utilizadas

- Node.js
- Express.js
- MongoDB con Mongoose
- JWT para autenticación
- Nodemailer (para recuperación de contraseña)
- Dotenv
- Express Validator



## 📁 Estructura del Proyecto
BE-challengeFinal-akademi-valentinaGadagnotto
└── app.js
└── .env
└── 📁Postman
    └── Akademi.postman_collection.json
└── 📁src
    └── 📁controllers
        └── auth-controllers.js
        └── courses-controllers.js
        └── enrollments-controllers.js
        └── grades-controllers.js
        └── users-controllers.js
    └── 📁db
        └── mongoose.js
    └── 📁emails
        └── sendRecoveryEmail.js
    └── 📁middlewares
        └── check.js
    └── 📁models
        └── course.js
        └── enrollment.js
        └── grade.js
        └── user.js
    └── 📁routes
        └── auth-routes.js
        └── courses-routes.js
        └── enrollments-routes.js
        └── grades-routes.js
        └── users-routes.js
    └── 📁util
        └── 📁errors
            └── http-error.js
        └── generateToken.js
        └── 📁validators
            └── auth-validators.js
            └── course-validators.js
            └── grade-validators.js
            └── user-validators.js

## ⚙️ Instalación

1. Clonar el repositorio:
    git clone https://github.com/tuUsuarioGithub/challengeFinal-akademi-nombreApellido-backend.git

2. Instalar las dependencias:
    npm install

3. Crear un archivo .env en la raíz del proyecto con el siguiente contenido:
    PORT=5000
    MONGODB_URL=mongodb+srv://valegadagnotto:RpsR0WF3YENgUUM5@cluster0.mjjj7kf.mongodb.net/akademi?retryWrites=true&w=majority&appName=Cluster0
    GMAIL_USER=valegadagnotto@gmail.com
    GMAIL_PASS=gyrwlnwdosbphwgf
    JWT_SIGN=auth_token_signature

4. Iniciar el servidor:
    npm run

## 🔐 Autenticación

Autenticación basada en JWT. Incluye middleware para protección de rutas según rol de usuario: superadmin, profesor o alumno. Un usuario con rol de superadmin puede acceder a todos los endpoints.

## 📚 Endpoints Principales
# Auth
POST /auth/register – Registro de alumno

POST /auth/login – Login

POST /auth/forgot-password – Solicitar recuperación de contraseña

POST /auth/reset-password – Cambiar contraseña con token

# Users
GET /users – Listar todos los usuarios (solo superadmin)

POST /users – Crear usuario (con rol profesor o superadmin)

PUT /users/:id – Editar usuario

DELETE /users/:id – Eliminar usuario

# Courses
GET /courses – Listar cursos (alumnos)

POST /courses – Crear curso (profesor)

PUT /courses/:id – Editar curso (profesor)

DELETE /courses/:id – Eliminar curso (profesor)

GET /courses/:id – Ver detalle del curso

GET /courses/:professorId – Cursos creados por un profesor

# Enrollments
GET /enrollments/:studentId – Ver mis inscripciones (alumno)

POST /enrollments – Inscribirse a un curso

DELETE /enrollments/:id – Cancelar inscripción

GET /enrollments/course/:id – Ver alumnos de un curso (profesor)

# Grades
POST /grades – Cargar calificación (profesor)

PUT /grades/:id – Editar calificación (profesor)

GET /grades/student/:id – Ver calificaciones de un alumno (profesor)

## 📦 Colección de Postman
Se incluye la colección de Postman en la raíz del proyecto para testear todos los endpoints.

## 🛠️ Validaciones de Negocio
No permiten inscripciones duplicadas.

Se respeta el cupo máximo de cada curso.

No se puede eliminar un profesor con cursos asignados.

## 📝 Autor
Challenge Final - Akademi
Desarrollado por: Valentina Gadagñotto