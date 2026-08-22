const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;
const { connectToDatabase } = require('./db/connection');
const eventRoutes = require('./routes/eventRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const decisionRoutes = require('./routes/decisionRoutes');
const disruptionRoutes = require('./routes/disruptionRoutes');
const globalVendorRoutes = require('./routes/globalVendorRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'relay-api'
  });
});

app.use('/event/:eventId/vendor', vendorRoutes);
app.use('/event/:eventId/decisions', decisionRoutes);
app.use('/event/:eventId/disruptions', disruptionRoutes);
app.use('/event', eventRoutes);
app.use('/global-vendors', globalVendorRoutes);
app.use('/notifications', notificationRoutes);

async function startServer() {
  await connectToDatabase();
  app.listen(port, () => {
    console.log(`Relay Express API listening on port ${port}`);
  });
}

startServer().catch(console.error);
