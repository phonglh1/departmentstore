const express = require("express");
const router = express.Router();

const {
    regiesterUser, 
    loginUser, 
    logoutUser, 
    forgotPassword, 
    resetPassword, 
    getUserProfile, 
    updatePassword, 
    updateUserProfile,
    adminGetAllUser, 
    adminGetUserDetail, 
    adminUpdateUser, 
    adminDeleteUser} = require("../controllers/userController");

const { isAuthenticatedUser, authorizeRoles} = require('../middlewares/auth');

router.route("/register").post(regiesterUser);

router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);

router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/password/update").put(isAuthenticatedUser, updatePassword);

router.route("/me").get(isAuthenticatedUser, getUserProfile);
router.route("/me/update").put(isAuthenticatedUser, updateUserProfile);

router.route("/admin/users").get(isAuthenticatedUser, authorizeRoles('admin'), adminGetAllUser);
router.route("/admin/user/:id").get(isAuthenticatedUser, authorizeRoles('admin'), adminGetUserDetail);
router.route("/admin/user/:id").put(isAuthenticatedUser, authorizeRoles('admin'), adminUpdateUser);
router.route("/admin/user/:id").delete(isAuthenticatedUser, authorizeRoles('admin'), adminDeleteUser);

module.exports = router