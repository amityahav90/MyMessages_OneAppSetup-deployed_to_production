const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  aboutMe: { type: String, required: true },
  userImage: { type: String, required: true },
  userCountry: { type: String, required: true },
  profession: { type: String, required: true },
  memberSince: { type: Date, required: false }
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
