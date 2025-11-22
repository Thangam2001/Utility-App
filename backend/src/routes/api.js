import { Router } from 'express'
import { upload } from '../middleware/upload.js'
import { handleOcr } from '../controllers/ocrController.js'
import { handleResize } from '../controllers/resizeController.js'
import { handleConvert } from '../controllers/convertController.js'
import { handleHistory } from '../controllers/historyController.js'
import { handleCrop } from '../controllers/cropController.js'
import { handleCompress } from '../controllers/compressController.js'

const router = Router()

router.post('/ocr', upload.single('file'), handleOcr)
router.post('/resize', upload.single('file'), handleResize)
router.post('/convert', upload.single('file'), handleConvert)
router.post('/crop', upload.single('file'), handleCrop)
router.post('/compress', upload.single('file'), handleCompress)
router.get('/history', handleHistory)

export default router


