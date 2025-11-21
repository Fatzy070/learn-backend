import express from 'express'
import  { getVideoById , searchVideos , getPlaylistVideos  , enrollVideo , unenrollVideo , fetchEnrollVideos , completeLesson , progress} from '../controllers/courseController.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

router.get('/playlist/:playlistId' , getPlaylistVideos)
router.post('/enroll' , auth , enrollVideo )
router.delete('/unenroll/:videoId' , auth , unenrollVideo )
router.get('/userenroll' , auth , fetchEnrollVideos )
router.post('/courses/complete/:videoId', auth , completeLesson);
router.post('/progress/:videoId' , auth , progress )

router.get('/search' , auth , searchVideos)
router.get('/video/:videoId', auth, getVideoById);
export default router
