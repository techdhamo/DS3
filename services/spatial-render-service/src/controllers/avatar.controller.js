import { v4 as uuidv4 } from 'uuid';
import * as avatarService from '../services/avatar.service.js';

/**
 * Generate 3D avatar from photo
 */
export async function generateAvatar(req, res) {
  try {
    const { profileId, photoId, gender, style } = req.body;
    
    const avatarCode = uuidv4();
    
    // In production, this would call the Perception Engine's avatar generator
    const result = await avatarService.generateAvatar({
      profileId,
      photoId,
      gender,
      style,
      avatarCode
    });
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Avatar generation error:', error);
    res.status(500).json({ error: 'Failed to generate avatar' });
  }
}

/**
 * Get avatar by code
 */
export async function getAvatar(req, res) {
  try {
    const { avatarCode } = req.params;
    const format = req.query.format || 'glb';
    
    const avatar = await avatarService.getAvatar(avatarCode, format);
    
    if (!avatar) {
      return res.status(404).json({ error: 'Avatar not found' });
    }
    
    res.json(avatar);
  } catch (error) {
    console.error('Get avatar error:', error);
    res.status(500).json({ error: 'Failed to get avatar' });
  }
}

/**
 * Get avatar preview image
 */
export async function getAvatarPreview(req, res) {
  try {
    const { avatarCode } = req.params;
    const format = req.query.format || 'png';
    
    const preview = await avatarService.getAvatarPreview(avatarCode, format);
    
    if (!preview) {
      return res.status(404).json({ error: 'Avatar preview not found' });
    }
    
    res.set('Content-Type', `image/${format}`);
    res.send(preview);
  } catch (error) {
    console.error('Get avatar preview error:', error);
    res.status(500).json({ error: 'Failed to get avatar preview' });
  }
}

/**
 * Customize avatar
 */
export async function customizeAvatar(req, res) {
  try {
    const { avatarCode } = req.params;
    const customizations = req.body;
    
    const result = await avatarService.customizeAvatar(avatarCode, customizations);
    
    res.json(result);
  } catch (error) {
    console.error('Avatar customization error:', error);
    res.status(500).json({ error: 'Failed to customize avatar' });
  }
}
