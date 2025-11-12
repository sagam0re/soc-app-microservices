const mongoose = require('mongoose');
const argon2 = require('argon2');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        try {
            this.password = await argon2.hash(this.password);
        } catch (e) {
            return next(e);
        }
    }
    next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await argon2.verify(this.password, candidatePassword);
}

userSchema.index({ username: 'text' });

const User = mongoose.model('User', userSchema);

module.exports = User;