const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const propertyRoutes = require('./routes/property.routes');
const matchRoutes = require('./routes/match.routes');

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/matches', matchRoutes);

module.exports = app;

