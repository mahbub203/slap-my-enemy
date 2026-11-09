import type { CharacterData, CharacterStyle } from '../types';

const API_BASE = '/api';

export interface BackendHealthResponse {
  status: string;
  service: string;
  ai_mode: string;
  version: string;
}

export interface GenerateBackendPayload {
  name: string;
  style: CharacterStyle;
  accent_color: string;
  session_id: string;
  consent_given: boolean;
  imageBlob?: Blob;
  rotation?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
}

export async function checkBackendHealth(): Promise<BackendHealthResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/health/`, { method: 'GET' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateCharacterViaBackend(
  payload: GenerateBackendPayload
): Promise<CharacterData | null> {
  try {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('style', payload.style);
    formData.append('accent_color', payload.accent_color);
    formData.append('session_id', payload.session_id);
    formData.append('consent_given', String(payload.consent_given));

    if (payload.rotation) formData.append('rotation', String(payload.rotation));
    if (payload.brightness) formData.append('brightness', String(payload.brightness));
    if (payload.contrast) formData.append('contrast', String(payload.contrast));
    if (payload.saturation) formData.append('saturation', String(payload.saturation));

    if (payload.imageBlob) {
      formData.append('image', payload.imageBlob, 'upload.png');
    }

    const res = await fetch(`${API_BASE}/characters/generate/`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to generate character on backend');
    }

    const data = await res.json();
    return {
      id: data.id,
      name: data.name,
      style: data.style,
      originalImage: data.original_image || '',
      faceTextureUrl: data.stylized_texture || '',
      accentColor: data.accent_color || '#ec4899',
      createdAt: data.created_at,
      expression: 'neutral'
    };
  } catch (e) {
    console.warn('Backend character generation fallback to client-side:', e);
    return null;
  }
}

export async function deleteCharacterViaBackend(charId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/characters/${charId}/`, {
      method: 'DELETE'
    });
    return res.status === 204;
  } catch {
    return false;
  }
}

export async function cleanupSessionViaBackend(sessionId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/characters/cleanup-session/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId })
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function updateSessionStatsViaBackend(payload: {
  session_id: string;
  total_score: number;
  max_combo: number;
  hits_added: number;
}): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/sessions/update-stats/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch {
    return false;
  }
}
