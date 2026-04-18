import express from 'express';
import * as avatarController from '../controllers/avatar.controller.js';
import * as sceneController from '../controllers/scene.controller.js';

const router = express.Router();

// Avatar Management Routes
router.post('/avatars/generate', avatarController.generateAvatar);
router.get('/avatars/:avatarCode', avatarController.getAvatar);
router.get('/avatars/:avatarCode/preview', avatarController.getAvatarPreview);
router.post('/avatars/:avatarCode/customize', avatarController.customizeAvatar);

// Scene Composition Routes
router.post('/scenes/compose', sceneController.composeScene);
router.get('/scenes/:sceneId', sceneController.getScene);
router.post('/scenes/:sceneId/render', sceneController.renderScene);

// WebXR Session Routes
router.post('/sessions', sceneController.createSession);
router.delete('/sessions/:sessionId', sceneController.deleteSession);

export default router;
