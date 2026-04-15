const mongoose = require('mongoose');

// Content schema for landing/admin data.
const ContentSchema = new mongoose.Schema({
    // Hero section
    hero: {
        name: String,
        title: String,
        description: String,
        image: String,
        cta: String
    },
    // About section
    about: {
        title: String,
        content: String,
        image: String
    },
    // Skills section
    skills: [{
        name: String,
        level: Number
    }],
    // Highlighted gallery (landing)
    gallery: [{
        id: Number,
        url: String,
        category: String,
        title: String
    }],
    // Full gallery grouped by category
    categorized_gallery: [{
        category: String,
        photos: [{
            id: Number,
            url: String,
            title: String
        }]
    }],
    // Video section shown between gallery and experience
    videos: [{
        id: Number,
        title: String,
        url: String
    }],
    // Timeline / experience section
    experiences: [{
        year: String,
        title: String,
        place: String
    }],
    // Pricing plans
    plans: [{
        id: Number,
        name: String,
        price: String,
        badge: String,
        image: String,
        features: [String]
    }],
    // Contact section
    contact: {
        email: String,
        phone: String,
        address: String,
        social: {
            facebook: String,
            instagram: String,
            tiktok: String,
            whatsapp: String
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('Content', ContentSchema);
