// models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userName: String,
    userPhone: String,
    orderDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'shipped', 'completed'], default: 'pending' },
    cartItems: [
        {
            name: String,
            price: Number,
            quantity: Number
        }
    ],
    paymentScreenshot: String
});

module.exports = mongoose.model('Order', OrderSchema);
