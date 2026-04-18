import express from 'express';
import * as avatarController from '../controllers/avatar.controller.js';
import * as sceneController from '../controllers/scene.controller.js';
import * as webarController from '../controllers/webar.controller.js';

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

// WebAR Routes
router.post('/webar/initialize', webarController.initializeSession);
router.post('/webar/camera/request', webarController.requestCameraAccess);
router.post('/webar/surface/detect', webarController.detectSurface);
router.post('/webar/avatar/place', webarController.placeAvatar);
router.post('/webar/product/overlay', webarController.overlayProduct);
router.get('/webar/sessions/:sessionId', webarController.getSessionStatus);
router.delete('/webar/sessions/:sessionId', webarController.closeSession);

export default router;
