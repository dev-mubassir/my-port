import { initArt3D } from './art3d.js';
import { initAboutAnimations } from './about-anim.js';
import '../styles/art3d.css';
import '../styles/about-anim.css';

/**
 * About Section Module (001)
 * Coordinates the 3D neural map canvas art and the master typewriter/rule animation timeline.
 */
export function initAbout() {
  const section = document.getElementById('about');
  if (!section) return null;

  const artContainer = document.getElementById('about-art3d');
  let artInstance = null;

  if (artContainer) {
    artInstance = initArt3D(artContainer, {
      autoPlay: false
    });
  }

  const aboutAnim = initAboutAnimations(section, {
    onArtStart: () => {
      if (artInstance && typeof artInstance.play === 'function') {
        artInstance.play();
      }
    }
  });

  return { artInstance, aboutAnim };
}
