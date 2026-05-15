'use client';
import { useState, useEffect } from 'react';
import { allVehicles, TIERS, getCategories, getCategoryIcon } from '@/data/vehicles';
import styles from './page.module.css';

export default function Home() {
  const [stats, setStats] = useState({ known: 0, total: allVehicles.length });

  useEffect(() => {
    try {
      const progress = JSON.parse(localStorage.getItem('sasp-progress') || '{}');
      const known = Object.values(progress).filter(v => v === true).length;
      setStats({ known, total: allVehicles.length });
    } catch { setStats({ known: 0, total: allVehicles.length }); }
  }, []);

  const categories = getCategories();
  const pct = stats.total > 0 ? Math.round((stats.known / stats.total) * 100) : 0;

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBg}></div>
        <div className={styles.heroContent}>
          <div className={styles.badge}>🚔 Cameron Coleman</div>
          <h1 className={styles.title}>
            <span className={styles.titleAccent}>SASP</span> Academy
          </h1>
          <p className={styles.subtitle}>
            Maîtrise l'identification de <span className={styles.count}>{allVehicles.length}</span> véhicules GTA V
          </p>
          <div className={styles.progressWrap}>
            <div className={styles.progressInfo}>
              <span>Progression globale</span>
              <span className={styles.progressPct}>{pct}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${pct}%` }}></div>
            </div>
            <span className={styles.progressDetail}>{stats.known} / {stats.total} véhicules maîtrisés</span>
          </div>
        </div>
      </section>

      {/* Mode Cards */}
      <section className={styles.modes}>
        <h2 className={styles.sectionTitle}>Modes d'entraînement</h2>
        <div className={styles.modeGrid}>
          {[
            { href:'/catalogue', icon:'📋', title:'Catalogue', desc:'Parcourir tous les véhicules par catégorie et fabricant', color:'#00FF88' },
            { href:'/flashcards', icon:'🎴', title:'Flashcards', desc:'Apprends avec des cartes à retourner, suivi de progression', color:'#00D4FF' },
            { href:'/quiz', icon:'🧪', title:'Quiz', desc:'Teste tes connaissances avec des QCM chronométrés', color:'#B026FF' },
            { href:'/stats', icon:'📊', title:'Statistiques', desc:'Suis ta progression et identifie tes points faibles', color:'#FF4081' },
          ].map((mode, i) => (
            <a key={mode.href} href={mode.href} className={styles.modeCard} style={{ '--accent': mode.color, animationDelay: `${i * 0.1}s` }}>
              <div className={styles.modeIcon}>{mode.icon}</div>
              <h3 className={styles.modeTitle}>{mode.title}</h3>
              <p className={styles.modeDesc}>{mode.desc}</p>
              <div className={styles.modeArrow}>→</div>
            </a>
          ))}
        </div>
      </section>

      {/* Tier Selection */}
      <section className={styles.tiers}>
        <h2 className={styles.sectionTitle}>Niveaux de difficulté</h2>
        <div className={styles.tierGrid}>
          {TIERS.map((tier, i) => {
            return (
              <div key={tier.id} className={styles.tierCard} style={{ animationDelay: `${i * 0.1}s` }}>
                <span className={styles.tierIcon}>{tier.icon}</span>
                <h3 className={styles.tierLabel}>{tier.label}</h3>
                <span className={styles.tierCount}>{tier.count} véhicules</span>
                <p className={styles.tierDesc}>{tier.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Categories Preview */}
      <section className={styles.catSection}>
        <h2 className={styles.sectionTitle}>Catégories</h2>
        <div className={styles.catGrid}>
          {categories.map((cat, i) => {
            const count = allVehicles.filter(v => v.category === cat).length;
            return (
              <a key={cat} href={`/catalogue?category=${encodeURIComponent(cat)}`} className={styles.catCard} style={{ animationDelay: `${i * 0.05}s` }}>
                <span className={styles.catIcon}>{getCategoryIcon(cat)}</span>
                <span className={styles.catName}>{cat}</span>
                <span className={styles.catCount}>{count}</span>
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
}
