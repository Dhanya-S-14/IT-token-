const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  assetId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Asset name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['laptop', 'desktop', 'monitor', 'printer', 'router', 'firewall', 'server', 'switch', 'software_license', 'other'],
    required: [true, 'Asset type is required']
  },
  serialNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  model: String,
  vendor: {
    type: String,
    required: [true, 'Vendor is required']
  },
  purchaseDate: Date,
  warrantyExpiry: Date,
  price: Number,
  status: {
    type: String,
    enum: ['available', 'assigned', 'maintenance', 'retired'],
    default: 'available'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  location: String,
  description: String,
  specifications: mongoose.Schema.Types.Mixed,
  images: [{
    url: String,
    publicId: String
  }],
  qrCode: String,
  maintenanceHistory: [{
    date: Date,
    description: String,
    cost: Number,
    performedBy: String,
    nextScheduled: Date
  }],
  notes: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

assetSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Asset').countDocuments();
    this.assetId = `AST-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

assetSchema.index({ assetId: 1 });
assetSchema.index({ type: 1, status: 1 });
assetSchema.index({ assignedTo: 1 });
assetSchema.index({ department: 1 });

module.exports = mongoose.model('Asset', assetSchema);
