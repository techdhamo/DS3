const express = require('express');
const cors = require('cors');
const vrRoutes = require('./routes/vr.routes');

const app = express();
const PORT = process.env.PORT || 8088;

app.use(cors());
app.use(express.json());

app.use('/v1/vr', vrRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'vr-boutique' });
});

app.listen(PORT, () => {
  console.log(`VR Boutique Service running on port ${PORT}`);
});

module.exports = app;
