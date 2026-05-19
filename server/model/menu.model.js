const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema(
    {
        name:        { type: String, required: true },
        description: { type: String, required: true },
        price:       { type: Number, required: true },
        photo:       { type: String, default: null },
        category: {
            type: String,
            enum: ['Rice Bowls', 'Ramen & Noodles', 'Taiyaki', 'Combo Meals', 'Burgers', 'Cold Noodles', 'Dango', 'Milk Tea', 'Drinks'],
            default: 'Rice Bowls'
        },
        available: { type: Boolean, default: true },
    },
    { collection: 'menu-data', timestamps: true }
);

module.exports = mongoose.model('MenuItem', menuSchema);
