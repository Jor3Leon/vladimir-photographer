const mongoose = require('mongoose');

// Contact form messages shown in the admin mailbox.
const MessageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    isSeen: { type: Boolean, default: false },
    status: { type: String, enum: ['contacted', 'not_contacted'], default: 'not_contacted' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
