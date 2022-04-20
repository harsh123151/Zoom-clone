const express = require('express')
const { v4: uuidv4 } = require('uuid')
const router = express.Router()
router.get('/', (req, res) => {
  res.render('index')
})
router.get('/link', (req, res) => {
  const link = uuidv4()
  res.redirect(`/join/${link}`)
})
router.get('/join/:roomid', (req, res) => {
  const { roomid } = req.params
  res.render('index1', { roomid })
})

module.exports = router
