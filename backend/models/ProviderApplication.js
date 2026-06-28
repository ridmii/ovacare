const mongoose = require('mongoose');

const providerApplicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    specialty: { type: String, required: true },
    description: { type: String, required: true },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    status: { type: String, default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProviderApplication', providerApplicationSchema);
