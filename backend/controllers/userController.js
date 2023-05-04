const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler")
const catchAsyncError = require("../middlewares/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require('crypto');
const cloudinary = require('cloudinary');

//Register a user  http://localhost:4000/api/v1/register
const regiesterUser = catchAsyncError(async(req, res, next) =>{

    const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: 'avatars',
        width: 150,
        crop: "scale"
        
    })

    const { name, password, email} = req.body;
    const user = await User.create({
        name,
        password,
        email,
        avatar:{
            public_id: result.public_id,
            url: result.secure_url
        }
    })
    sendToken(user, 200, res);

})

//login user http://localhost:4000/api/v1/login
const loginUser = catchAsyncError( async(req, res, next) =>{
    const {email, password} = req.body;

    //Check if email and password is enterid by user
    if(!email || !password){
        return next(new ErrorHandler('Please enter email & passwword', 400));
    }


    //Finding user in database
    const user = await User.findOne({email}).select('+password');

    if(!user) {
        return next(new ErrorHandler('Invalid Email or Password', 401))
    }

    //Check if password correct or not 
    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched) {
        return next(new ErrorHandler('Invalid Email or Password', 401))
    }
    sendToken(user, 200, res)

    // const token = user.getJwtToken();
    // res.status(200).json({
    //     success: true,
    //     token
    // })
})

//Forgot password http://localhost:4000/api/v1/password/forgot
const forgotPassword = catchAsyncError(async(req, res, next) =>{
    const user = await User.findOne({email: req.body.email});
    if(!user){
        return next(new ErrorHandler('User not found with this email', 404))
    }

    //get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({validateBeforeSave: false});

    //Create reset password url

    //const reseturl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
    const reseturl = `${req.protocol}://${req.get('host')}/password/reset/${resetToken}`;

    const message = `Your password reset token is as follow:\n\n${reseturl}\n\nIf you have not requested this email, then ignore it.`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'ShopIT Password Recovery',
            message
        })
        res.status(200).json({
            succsess: true,
            message: `Email send to: ${user.email}`
        })

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave: false});

        return next(new ErrorHandler(error.message, 500))
    }
})

//Reset password http://localhost:4000/api/v1/password/reset/:token
const resetPassword = catchAsyncError(async(req, res, next) =>{
     // Hash URL token
     const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

     const user = await User.findOne({
         resetPasswordToken,
         resetPasswordExpire: { $gt: Date.now() }
     })
 
     if (!user) {
         return next(new ErrorHandler('Password reset token is invalid or has been expired', 400))
     }
 
     if (req.body.password !== req.body.confirmPassword) {
         return next(new ErrorHandler('Password does not match', 400))
     }
 
     // Setup new password
     user.password = req.body.password;
     user.resetPasswordToken = undefined;
     user.resetPasswordExpire = undefined;
 
     await user.save();
 
     sendToken(user, 200, res)
})

//Get current logged in user detail  http://localhost:4000/api/v1/me
const getUserProfile = catchAsyncError( async(req, res, next) =>{
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    })
})

//Update User Profile http://localhost:4000/api/v1/me/update
const updateUserProfile = catchAsyncError( async(req, res, next) =>{
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    //Update Acatar: TODO
    if(req.body.avatar !== '') {
        const user = await User.findById(req.user.id);

        const image_id = user.avatar.public_id;

        const res = await cloudinary.v2.uploader.destroy(image_id);

        const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: 'avatars',
            width: 150,
            crop: "scale"
            
        })

        newUserData.avatar = {
            public_id: result.public_id,
            url: result.secure_url
        }
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        message: 'Update is success!'

    })

})

//Update password http://localhost:4000/api/v1/password/update
const updatePassword = catchAsyncError( async(req, res, next) =>{
    const user = await User.findById(req.user.id).select('+password');

    //Check preview user password 
    const isMatched = await user.comparePassword(req.body.oldPassword);
    if(!isMatched){
        return next(new ErrorHandler('Old password is incorrect', 400));
    }

    user.password = req.body.password;
    await user.save();

    sendToken(user, 200, res);
})

// Logout user http://localhost:4000/api/v1/logout
const logoutUser = catchAsyncError(async(req, res, next) =>{
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        succsess: true,
        message: "Log out success"
    })
})

//Admin get all user http://localhost:4000/api/v1/admin/users
const adminGetAllUser = catchAsyncError( async(req, res, next) =>{
    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    })
})

//Admin get user detail http://localhost:4000/api/v1/admin/users/:id
const adminGetUserDetail = catchAsyncError( async(req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user) {
        return next(new ErrorHandler(`User does not found with id: ${req.params.id}`))
    }

    res.status(200).json({
        success: true,
        user
    })
})

// Admin update user detail http://localhost:4000/api/v1/admin/users/:id
const adminUpdateUser = catchAsyncError( async(req, res, next) =>{
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    //Update Acatar: TODO
    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        message: 'Admin Update is success!'

    })

})

//Admin delete user detail  http://localhost:4000/api/v1/admin/users/:id
const adminDeleteUser = catchAsyncError( async(req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user) {
        return next(new ErrorHandler(`User does not found with id: ${req.params.id}`))
    }

    //Remove avatar form cloudinary - TODO
    const image_id = user.avatar.public_id;

    await cloudinary.v2.uploader.destroy(image_id);

    await user.remove()

    res.status(200).json({
        success: true,
        message: "Delete user success!"
    })
})



module.exports = {
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
    adminDeleteUser
}
