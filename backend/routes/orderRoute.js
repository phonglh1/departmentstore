const express = require('express');
const router = express.Router();

const { newOrder, getOrderById, myOrders, adminGetAllOrders, adminUpdateOrder, adminDeleteOrder } = require('../controllers/orderController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.route('/order/new').post(isAuthenticatedUser, newOrder);
router.route('/order/:id').get(isAuthenticatedUser, getOrderById);
router.route('/orders/me').get(isAuthenticatedUser, myOrders);

router.route('/admin/orders').get(isAuthenticatedUser, authorizeRoles('admin'), adminGetAllOrders);
router.route('/admin/order/:id').put(isAuthenticatedUser, authorizeRoles('admin'), adminUpdateOrder);
router.route('/admin/order/:id').delete(isAuthenticatedUser, authorizeRoles('admin'), adminDeleteOrder);

module.exports = router;



