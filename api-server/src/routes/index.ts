import express from 'express'
const router = express.Router()
import v1Route from './v1'

router.use('/api/v1', v1Route)

export default router
