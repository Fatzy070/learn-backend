import express from 'express'
import { editProfile ,  SignUp , Login , forgotPassword , resetPassword , googleLogin , getSingleUser , getAllUser   } from '../controllers/UserController.js'
import { auth } from '../middleware/auth.js'
const router = express.Router()

router.post('/google-login' , googleLogin)

router.post('/signup' , SignUp)
router.post('/login' , Login)

router.post('/forgot-password', forgotPassword)
router.post('/reset-password' , resetPassword)

router.post('/edit-profile' , auth , editProfile)

router.get('/me' , auth , getSingleUser )

export default router