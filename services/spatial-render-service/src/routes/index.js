import express from 'express';
import router from './spatial.routes.js';

const app = express();

// Use the spatial routes
app.use('/', router);

export default app;
