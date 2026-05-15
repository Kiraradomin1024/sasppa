'use client';
import { useState, useMemo, useCallback } from 'react';
import { allVehicles, TIERS, getVehiclesByTier, getTierCount, getCategories, getCategoryIcon, getCategoryColor, getVehicleImageUrl } from '@/data/vehicles';
import styles from './page.module.css';

export default function FlashcardsPage() {
  const [selectedTier, setSelectedTier] = useState(1);
  const [selectedCat, setSelectedCat] = useState('all');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [progress, setProgress] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sasp-progress') || '{}'); } catch { return {}; }
  });
  const [started, setStarted] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);

  const pool = useMemo(() => {
    let v = getVehiclesByTier(selectedTier);
    if (selectedCat !== 'all') v = v.filter(x => x.category === selectedCat);
    return [...v].sort(() => Math.random() - 0.5);
  }, [selectedTier, selectedCat, shuffleKey]);

  const current = pool[currentIdx];
  const categories = getCategories();

  const saveProgress = useCallback((id, known) => {
    const next = { ...progress, [id]: known };
    setProgress(next);
    try { localStorage.setItem('sasp-progress', JSON.stringify(next)); } catch {}
  }, [progress]);

  const handleAnswer = (known) => {
    if (current) saveProgress(current.id, known);
    setFlipped(false);
    setTimeout(() => {
      if (currentIdx < pool.length - 1) setCurrentIdx(currentIdx + 1);
      else { setStarted(false); setCurrentIdx(0); }
    }, 200);
  };

  const knownCount = pool.filter(v => progress[v.id] === true).length;

  if (!started) {
    return (
      <div className={styles.page}>
        <div className={styles.setup}>
          <h1 className={styles.title}>Flashcards</h1>
          <p className={styles.subtitle}>Sélectionne ton niveau et ta catégorie</p>

          <div className={styles.optionGroup}>
            <label className={styles.label}>Niveau</label>
            <div className={styles.tierBtns}>
              {TIERS.map(t => (
                <button key={t.id} className={`${styles.tierBtn} ${selectedTier === t.id ? styles.active : ''}`}
                  onClick={() => setSelectedTier(t.id)}>{t.icon} {t.label} ({t.count})</button>
              ))}
            </div>
          </div>

          <div className={styles.optionGroup}>
            <label className={styles.label}>Catégorie</label>
            <select className="input" value={selectedCat} onChange={e => setSelectedCat(e.target.value)}>
              <option value="all">Toutes</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <button className={`btn btn-primary btn-lg ${styles.startBtn}`}
            onClick={() => { setStarted(true); setCurrentIdx(0); setFlipped(false); setShuffleKey(k => k + 1); }}>
            Commencer ({pool.length} véhicules)
          </button>
        </div>
      </div>
    );
  }

  if (!current) return <div className={styles.page}><p>Aucun véhicule disponible</p></div>;

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className="btn btn-sm" onClick={() => { setStarted(false); setCurrentIdx(0); }}>Retour</button>
        <span className={styles.counter}>{currentIdx + 1} / {pool.length}</span>
        <span className={styles.score}>{knownCount} maîtrisé{knownCount > 1 ? 's' : ''}</span>
      </div>

      <div className="progress-bar" style={{ marginBottom: '32px' }}>
        <div className="progress-fill" style={{ width: `${((currentIdx + 1) / pool.length) * 100}%` }}></div>
      </div>

      <div className={styles.flashcardWrap} onClick={() => setFlipped(!flipped)}>
        <div className={`${styles.flashcard} ${flipped ? styles.flipped : ''}`}>
          <div className={styles.front}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getVehicleImageUrl(current)} alt="?" className={styles.flashImg} />
            <p className={styles.hint}>Quel est ce véhicule ?</p>
            <span className={styles.catBadge} style={{ color: getCategoryColor(current.category) }}>{current.category}</span>
            <p className={styles.tapHint}>Cliquer pour révéler</p>
          </div>
          <div className={styles.back}>
            <h2 className={styles.vehicleName}>{current.name}</h2>
            <p className={styles.vehicleMfr}>{current.manufacturer}</p>
            <span className={styles.catBadge} style={{ color: getCategoryColor(current.category) }}>{current.category}</span>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={`${styles.actionBtn} ${styles.actionFail}`} onClick={() => handleAnswer(false)}>
          Je ne sais pas
        </button>
        <button className={`${styles.actionBtn} ${styles.actionSuccess}`} onClick={() => handleAnswer(true)}>
          Je sais
        </button>
      </div>
    </div>
  );
}
