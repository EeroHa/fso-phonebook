const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const url = process.env.MONGODB_URI;

mongoose
  .connect(url)
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message);
  });

const validatePhoneNumber = (value) => {
  const phoneNumberRegex = /^(\d{2,3})-(\d+)$/;
  return phoneNumberRegex.test(value);
};

const personSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, minlength: 3 },
  number: {
    type: String,
    required: true,
    unique: false,
    minlength: 8,
    validate: {
      validator: validatePhoneNumber,
      message: 'Number must be a valid phone number ',
    },
  },
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Person', personSchema);
