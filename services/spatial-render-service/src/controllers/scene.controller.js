import { v4 as uuidv4 } from 'uuid';
import * as sceneService from '../services/scene.service.js';

/**
 * Compose a multi-avatar scene
 */
export async function composeScene(req, res) {
  try {
    const { profileIds, avatarCodes, sceneType, background } = req.body;
    
    const sceneId = uuidv4();
    
    const scene = await sceneService.composeScene({
      sceneId,
      profileIds,
      avatarCodes,
      sceneType: sceneType || 'group',
      background: background || 'studio'
    });
    
    res.status(201).json(scene);
  } catch (error) {
    console.error('Scene composition error:', error);
    res.status(500).json({ error: 'Failed to compose scene' });
  }
}

/**
 * Get scene by ID
 */
export async function getScene(req, res) {
  try {
    const { sceneId } = req.params;
    
    const scene = await sceneService.getScene(sceneId);
    
    if (!scene) {
      return res.status(404).json({ error: 'Scene not found' });
    }
    
    res.json(scene);
  } catch (error) {
    console.error('Get scene error:', error);
    res.status(500).json({ error: 'Failed to get scene' });
  }
}

/**
 * Render scene (return render URL)
 */
export async function renderScene(req, res) {
  try {
    const { sceneId } = req.params;
    const { format, quality } = req.body;
    
    const renderUrl = await sceneService.renderScene(sceneId, {
      format: format || 'glb',
      quality: quality || 'high'
    });
    
    res.json({ renderUrl });
  } catch (error) {
    console.error('Scene render error:', error);
    res.status(500).json({ error: 'Failed to render scene' });
  }
}

/**
 * Create WebXR session
 */
export async function createSession(req, res) {
  try {
    const { sceneId, mode } = req.body;
    
    const sessionId = uuidv4();
    
    const session = await sceneService.createSession({
      sessionId,
      sceneId,
      mode: mode || 'ar'
    });
    
    res.status(201).json(session);
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
}

/**
 * Delete WebXR session
 */
export async function deleteSession(req, res) {
  try {
    const { sessionId } = req.params;
    
    await sceneService.deleteSession(sessionId);
    
    res.status(204).send();
  } catch (error) {
    console.error('Session deletion error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
}
