import { v4 as uuidv4 } from 'uuid';
import WebARService from '../services/webar.service.js';

const webarService = new WebARService();

/**
 * Initialize WebAR session
 */
export async function initializeSession(req, res) {
  try {
    const { mode, features } = req.body;
    const sessionId = uuidv4();
    
    const session = await webarService.initializeSession(sessionId, { mode, features });
    
    res.status(201).json(session);
  } catch (error) {
    console.error('WebAR initialization error:', error);
    res.status(500).json({ error: 'Failed to initialize WebAR session' });
  }
}

/**
 * Request camera access
 */
export async function requestCameraAccess(req, res) {
  try {
    const { sessionId } = req.body;
    
    const permission = await webarService.requestCameraAccess(sessionId);
    
    res.json({ permission });
  } catch (error) {
    console.error('Camera access error:', error);
    res.status(500).json({ error: 'Failed to request camera access' });
  }
}

/**
 * Detect surface for AR placement
 */
export async function detectSurface(req, res) {
  try {
    const { sessionId, surfaceType } = req.body;
    
    const surface = await webarService.detectSurface(sessionId, { surfaceType });
    
    res.json(surface);
  } catch (error) {
    console.error('Surface detection error:', error);
    res.status(500).json({ error: 'Failed to detect surface' });
  }
}

/**
 * Place avatar in AR scene
 */
export async function placeAvatar(req, res) {
  try {
    const { sessionId, avatarCode, position, rotation } = req.body;
    
    const placement = await webarService.placeAvatar(sessionId, avatarCode, position, rotation);
    
    res.status(201).json(placement);
  } catch (error) {
    console.error('Avatar placement error:', error);
    res.status(500).json({ error: 'Failed to place avatar' });
  }
}

/**
 * Overlay product on avatar
 */
export async function overlayProduct(req, res) {
  try {
    const { sessionId, avatarCode, productId, productUrl } = req.body;
    
    const overlay = await webarService.overlayProduct(sessionId, avatarCode, productId, productUrl);
    
    res.status(201).json(overlay);
  } catch (error) {
    console.error('Product overlay error:', error);
    res.status(500).json({ error: 'Failed to overlay product' });
  }
}

/**
 * Get session status
 */
export async function getSessionStatus(req, res) {
  try {
    const { sessionId } = req.params;
    
    const session = webarService.getSessionStatus(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Get session status error:', error);
    res.status(500).json({ error: 'Failed to get session status' });
  }
}

/**
 * Close WebAR session
 */
export async function closeSession(req, res) {
  try {
    const { sessionId } = req.params;
    
    const result = await webarService.closeSession(sessionId);
    
    res.status(204).send();
  } catch (error) {
    console.error('Close session error:', error);
    res.status(500).json({ error: 'Failed to close session' });
  }
}
