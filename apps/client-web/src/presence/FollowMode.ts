import { usePresenceStore } from './PresenceProvider';
import { useAppStore } from '../store/useAppStore';

/**
 * Follow mode: smoothly animate viewport to match the presenter's viewport.
 * Uses spring animation to avoid jitter.
 */
export function updateFollowMode(): void {
  const { followingClientId, followerViewport } = usePresenceStore.getState();
  if (!followingClientId || !followerViewport) return;

  const appStore = useAppStore.getState();
  const { panX, panY, zoom } = appStore;

  // Spring toward target viewport
  const springFactor = 0.1;
  const newPanX = panX + (followerViewport.x - panX) * springFactor;
  const newPanY = panY + (followerViewport.y - panY) * springFactor;
  const newZoom = zoom + (followerViewport.zoom - zoom) * springFactor;

  appStore.setPan(newPanX, newPanY);
  appStore.setZoom(newZoom);
}
