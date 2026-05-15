'use client';
import { useEffect } from 'react';
import styles from './ImageModal.module.css';

export default function ImageModal({ src, alt, onClose }) {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (src) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [src]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!src) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <button className={styles.closeBtn} onClick={onClose} aria-label="Fermer">×</button>
      <div className={styles.content} onClick={e => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt || 'Aperçu'} className={styles.image} />
      </div>
    </div>
  );
}
