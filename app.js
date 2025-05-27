require('dotenv').config();
const express = require('express');
const connectDB = require('./src/db/mongoose');
const cors = require('cors');

const authRoutes = require('./src/routes/auth-routes');
const usersRoutes = require('./src/routes/users-routes');
const coursesRoutes = require('./src/routes/courses-routes');
const enrollmentsRoutes = require('./src/routes/enrollments-routes');
const gradesRoutes = require('./src/routes/grades-routes');
const HttpError = require('./src/util/errors/http-error');

const app = express();

// CORS config
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// CORS fix
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    next();
})

// json parsing
app.use(express.json());

// routes
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/courses', coursesRoutes);
app.use('/enrollments', enrollmentsRoutes);
// app.use('/grades', gradesRoutes);

// unsupported routes error
app.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', 404);
    throw error;
});

// error handler
app.use((error, req, res, next) => {
    // if (res.headerSent) { // si manejo bien los return, next y envíos de respuestas no debería tener ese problema
    //     return next(error);
    // }
    res.status(error.code || 500);
    res.json({ message: error.message || 'An unknown error occurred.'})
});

// mongo connection
connectDB();

// server listen
app.listen(process.env.PORT);
