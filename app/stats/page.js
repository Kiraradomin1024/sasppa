'use client';
import { useState, useEffect } from 'react';
import { allVehicles, getCategories, getCategoryIcon, getCategoryColor } from '@/data/vehicles';
import styles from './page.module.css';

export default function StatsPage() {
  const [progress, setProgress] = useState({});
  const [missed, setMissed] = useState({});
  const [quizHistory, setQuizHistory] = useState([]);
  const [syncCode, setSyncCode] = useState('');
  const [importCode, setImportCode] = useState('');
  const [syncMsg, setSyncMsg] = useState(null);

  useEffect(() => {
    try {
      setProgress(JSON.parse(localStorage.getItem('sasp-progress') || '{}'));
      setMissed(JSON.parse(localStorage.getItem('sasp-missed') || '{}'));
      setQuizHistory(JSON.parse(localStorage.getItem('sasp-quiz-history') || '[]'));
    } catch {}
  }, []);

  const knownIds = Object.entries(progress).filter(([,v]) => v === true).map(([k]) => k);
  const knownCount = knownIds.length;
  const totalCount = allVehicles.length;
  const pct = totalCount > 0 ? Math.round((knownCount / totalCount) * 100) : 0;

  const categories = getCategories();
  const catStats = categories.map(cat => {
    const total = allVehicles.filter(v => v.category === cat);
    const known = total.filter(v => progress[v.id] === true);
    return { cat, total: total.length, known: known.length, pct: total.length > 0 ? Math.round((known.length / total.length) * 100) : 0 };
  }).sort((a, b) => a.pct - b.pct);

  const mostMissed = Object.entries(missed)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([id, count]) => ({ vehicle: allVehicles.find(v => v.id === id), count }))
    .filter(m => m.vehicle);

  const resetProgress = () => {
    if (confirm('Réinitialiser toute la progression ?')) {
      localStorage.removeItem('sasp-progress');
      localStorage.removeItem('sasp-missed');
      localStorage.removeItem('sasp-quiz-history');
      setProgress({}); setMissed({}); setQuizHistory([]);
    }
  };

  const exportCode = () => {
    try {
      const data = {
        p: progress,
        m: missed,
        q: quizHistory,
      };
      const json = JSON.stringify(data);
      const code = btoa(unescape(encodeURIComponent(json)));
      setSyncCode(code);
      navigator.clipboard.writeText(code).then(() => {
        setSyncMsg({ type: 'success', text: 'Code copié dans le presse-papier !' });
      }).catch(() => {
        setSyncMsg({ type: 'success', text: 'Code généré ! Copie-le manuellement.' });
      });
      setTimeout(() => setSyncMsg(null), 3000);
    } catch {
      setSyncMsg({ type: 'error', text: 'Erreur lors de l\'export.' });
    }
  };

  const importFromCode = () => {
    try {
      if (!importCode.trim()) return;
      const json = decodeURIComponent(escape(atob(importCode.trim())));
      const data = JSON.parse(json);
      if (data.p) { localStorage.setItem('sasp-progress', JSON.stringify(data.p)); setProgress(data.p); }
      if (data.m) { localStorage.setItem('sasp-missed', JSON.stringify(data.m)); setMissed(data.m); }
      if (data.q) { localStorage.setItem('sasp-quiz-history', JSON.stringify(data.q)); setQuizHistory(data.q); }
      setImportCode('');
      setSyncMsg({ type: 'success', text: 'Progression importée avec succès !' });
      setTimeout(() => setSyncMsg(null), 3000);
    } catch {
      setSyncMsg({ type: 'error', text: 'Code invalide. Vérifie que tu as bien tout copié.' });
      setTimeout(() => setSyncMsg(null), 3000);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>📊 Statistiques</h1>

      {/* Global Stats */}
      <div className={styles.globalCard}>
        <div className={styles.bigPct}>
          <span className={styles.bigNum}>{pct}</span>
          <span className={styles.bigSign}>%</span>
        </div>
        <p className={styles.bigLabel}>Progression globale</p>
        <div className="progress-bar" style={{ maxWidth: '300px', margin: '12px auto 0' }}>
          <div className="progress-fill" style={{ width: `${pct}%` }}></div>
        </div>
        <p className={styles.bigDetail}>{knownCount} / {totalCount} véhicules maîtrisés</p>
        <div className={styles.statRow}>
          <div className={styles.statItem}>
            <span className={styles.statNum}>{quizHistory.length}</span>
            <span className={styles.statLabel}>Quiz passés</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNum}>{quizHistory.length > 0 ? Math.round(quizHistory.reduce((a, q) => a + (q.score / q.total) * 100, 0) / quizHistory.length) : 0}%</span>
            <span className={styles.statLabel}>Score moyen</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNum}>{Object.keys(missed).length}</span>
            <span className={styles.statLabel}>Véhicules ratés</span>
          </div>
        </div>
      </div>

      {/* Per Category */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Par catégorie</h2>
        <div className={styles.catList}>
          {catStats.map(s => (
            <div key={s.cat} className={styles.catRow}>
              <span className={styles.catIcon}>{getCategoryIcon(s.cat)}</span>
              <span className={styles.catName}>{s.cat}</span>
              <div className={styles.catBar}>
                <div className={styles.catFill} style={{ width: `${s.pct}%`, background: getCategoryColor(s.cat) }}></div>
              </div>
              <span className={styles.catPct} style={{ color: getCategoryColor(s.cat) }}>{s.pct}%</span>
              <span className={styles.catDetail}>{s.known}/{s.total}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Most Missed */}
      {mostMissed.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>🎯 Véhicules les plus ratés</h2>
          <div className={styles.missedList}>
            {mostMissed.map((m, i) => (
              <div key={m.vehicle.id} className={styles.missedRow}>
                <span className={styles.missedRank}>#{i + 1}</span>
                <span className={styles.missedIcon}>{getCategoryIcon(m.vehicle.category)}</span>
                <div className={styles.missedInfo}>
                  <span className={styles.missedName}>{m.vehicle.name}</span>
                  <span className={styles.missedMfr}>{m.vehicle.manufacturer} — {m.vehicle.category}</span>
                </div>
                <span className={styles.missedCount}>×{m.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quiz History */}
      {quizHistory.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>📝 Historique des quiz</h2>
          <div className={styles.historyList}>
            {[...quizHistory].reverse().slice(0, 10).map((q, i) => (
              <div key={i} className={styles.historyRow}>
                <span className={styles.historyDate}>{new Date(q.date).toLocaleDateString('fr-FR')}</span>
                <span className={styles.historyScore}>{q.score}/{q.total}</span>
                <span className={styles.historyPct} style={{ color: (q.score/q.total) >= 0.8 ? '#00FF88' : (q.score/q.total) >= 0.5 ? '#FFD600' : '#FF1744' }}>
                  {Math.round((q.score / q.total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sync Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>🔄 Synchronisation</h2>
        <p style={{ color: '#8a8a9a', fontSize: '0.85rem', marginBottom: '20px' }}>
          Transfère ta progression entre tes appareils avec un code.
        </p>
        
        <div className={styles.syncRow}>
          <button className="btn btn-primary" onClick={exportCode}>📤 Exporter mon code</button>
          {syncCode && (
            <div className={styles.codeBox}>
              <code className={styles.codeText}>{syncCode}</code>
              <button className={styles.copyBtn} onClick={() => { navigator.clipboard.writeText(syncCode); setSyncMsg({ type: 'success', text: 'Copié !' }); setTimeout(() => setSyncMsg(null), 2000); }}>📋</button>
            </div>
          )}
        </div>

        <div className={styles.syncRow} style={{ marginTop: '20px' }}>
          <div className={styles.importRow}>
            <input
              type="text"
              className="input"
              placeholder="Colle ton code ici..."
              value={importCode}
              onChange={e => setImportCode(e.target.value)}
            />
            <button className="btn btn-primary" onClick={importFromCode} disabled={!importCode.trim()}>📥 Importer</button>
          </div>
        </div>

        {syncMsg && (
          <p className={styles.syncMsg} style={{ color: syncMsg.type === 'success' ? '#00FF88' : '#FF1744' }}>
            {syncMsg.text}
          </p>
        )}
      </div>

      <div className={styles.resetSection}>
        <button className="btn btn-danger" onClick={resetProgress}>🗑️ Réinitialiser la progression</button>
      </div>
    </div>
  );
}
