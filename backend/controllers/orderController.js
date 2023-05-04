const Order = require('../models/orderModel');
const Product = require('../models/productModel');

const Errorhandler = require("../utils/errorHandler");
const catchAsyncErrors =require('../middlewares/catchAsyncErrors');

//Create a new Order http://localhost:4000/api/v1/order/new
const newOrder = catchAsyncErrors( async(req, res, next) =>{
    const { 
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
    } = req.body;

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        user: req.user._id
    })

    res.status(200).json({
        success: true,
        order
    })
})

//Get single order http://localhost:4000/api/v1/order/:id
const getOrderById = catchAsyncErrors( async(req, res, next) =>{
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if(!order) {
        return next(new Errorhandler('No order found with this Id', 404))
    }

    res.status(200).json({
        success: true,
        order
    })
})

// Get logged in user orders http://localhost:4000/api/v1/orders/me
const myOrders = catchAsyncErrors( async(req, res, next) =>{
    const orders = await Order.find({ user: req.user.id})


    res.status(200).json({
        success: true,
        orders
    })
})

// Admin get all orders http://localhost:4000/api/v1/admin/orders
const adminGetAllOrders = catchAsyncErrors( async(req, res, next) =>{
    const orders = await Order.find();

    let totalAmount = 0;


    orders.forEach(order => {
        totalAmount += order.totalPrice
    })


    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
})

//Admin update(process) order http://localhost:4000/api/v1/admin/order/:id
const adminUpdateOrder = catchAsyncErrors( async(req, res, next) =>{
    const order = await Order.findById(req.params.id);

    if(order.orderStatus === 'Delivered') {
        return next(new Errorhandler('You have already delivered this order'), 400)
    }

    order.orderItems.forEach(async item =>{
        await updateStock(item.product, item.quantity)
    })

    order.orderStatus = req.body.status,
    order.deliveredAt = Date.now();

    await order.save()


    res.status(200).json({
        success: true,
        message: "Admin update is success!"
    })
})

//Admin delete order http://localhost:4000/api/v1/admin/order/:id
const adminDeleteOrder = catchAsyncErrors( async(req, res, next) =>{
    const order = await Order.findById(req.params.id)

    if(!order) {
        return next(new Errorhandler('No order found with this Id', 404))
    }

    await order.remove()

    res.status(200).json({
        success: true,
        message: "Admin delete order is success!"
    })
})

async function updateStock(id, quantity) {
    const product = await Product.findById(id);

    product.stock = product.stock - quantity;
    await product.save({ validateBeforeSave: false})
}

module.exports = {
    newOrder,
    getOrderById,
    myOrders,
    adminGetAllOrders,
    adminUpdateOrder,
    adminDeleteOrder
}