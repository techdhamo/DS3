const express = require('express');
const VRController = require('../controllers/vr.controller');

const router = express.Router();
const vrController = new VRController();

router.post('/rooms', (req, res) => vrController.createRoom(req, res));
router.post('/rooms/join', (req, res) => vrController.joinRoom(req, res));
router.post('/rooms/leave', (req, res) => vrController.leaveRoom(req, res));
router.post('/rooms/position', (req, res) => vrController.updatePosition(req, res));
router.get('/rooms/:roomId/users', (req, res) => vrController.getRoomUsers(req, res));

module.exports = router;
