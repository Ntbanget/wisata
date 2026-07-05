const fs = require('fs');
const multer = require('multer');
const path = require('path');

const backendRoot = path.resolve(__dirname, '../..');
const paymentUploadDir = path.join(backendRoot, 'uploads', 'payments');
const vehicleUploadDir = path.join(backendRoot, 'public', 'assets', 'vehicles');

const ensureDirectory = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

// Configure storage for payment proof uploads
const paymentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureDirectory(paymentUploadDir);
    cb(null, paymentUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'payment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure storage for vehicle image uploads
const vehicleStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureDirectory(vehicleUploadDir);
    cb(null, vehicleUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'vehicle-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only images (JPG, JPEG, PNG) for payment proofs
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, and PNG files are allowed for payment proofs.'));
  }
};

// File filter for vehicle images (images only)
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and GIF files are allowed.'));
  }
};

const uploadPayment = multer({
  storage: paymentStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

const uploadVehicle = multer({
  storage: vehicleStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: imageFilter
});

module.exports = { uploadPayment, uploadVehicle, ensureDirectory };