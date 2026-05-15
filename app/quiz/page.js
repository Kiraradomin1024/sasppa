'use client';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { allVehicles, TIERS, getVehiclesByTier, getCategories, getRandomChoices, getCategoryIcon, getCategoryColor, getVehicleImageUrl } from '@/data/vehicles';
import styles from './page.module.css';

export default function QuizPage() {
  const [selectedTier, setSelectedTier] = useState(1);
  const [selectedCat, setSelectedCat] = useState('all');
  const [questionCount, setQuestionCount] = useState(20);
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timer, setTimer] = useState(0);
  const [mistakes, setMistakes] = useState([]);
  const [finished, setFinished] = useState(false);

  const categories = getCategories();
  const pool = useMemo(() => {
    let v = getVehiclesByTier(selectedTier);
    if (selectedCat !== 'all') v = v.filter(x => x.category === selectedCat);
    return v;
  }, [selectedTier, selectedCat]);

  const startQuiz = () => {
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, questionCount);
    const qs = shuffled.map(v => ({
      vehicle: v,
      choices: getRandomChoices(v, 4, pool.length >= 4 ? pool : allVehicles),
    }));
    setQuestions(qs);
    setCurrentQ(0); setScore(0); setSelected(null);
    setShowResult(false); setMistakes([]); setFinished(false);
    setTimer(0); setStarted(true);
  };

  useEffect(() => {
    if (!started || finished) return;
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [started, finished]);

  const handleChoice = (choice) => {
    if (showResult) return;
    setSelected(choice.id);
    setShowResult(true);
    const correct = choice.id === questions[currentQ].vehicle.id;
    if (correct) setScore(s => s + 1);
    else setMistakes(m => [...m, { vehicle: questions[currentQ].vehicle, chosen: choice }]);
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(q => q + 1);
      setSelected(null); setShowResult(false);
    } else {
      setFinished(true);
      // Save progress
      try {
        const progress = JSON.parse(localStorage.getItem('sasp-progress') || '{}');
        const quizHistory = JSON.parse(localStorage.getItem('sasp-quiz-history') || '[]');
        questions.forEach((q, i) => {
          const wasCorrect = !mistakes.find(m => m.vehicle.id === q.vehicle.id);
          if (wasCorrect) progress[q.vehicle.id] = true;
          const missed = JSON.parse(localStorage.getItem('sasp-missed') || '{}');
          if (!wasCorrect) { missed[q.vehicle.id] = (missed[q.vehicle.id] || 0) + 1; localStorage.setItem('sasp-missed', JSON.stringify(missed)); }
        });
        quizHistory.push({ date: new Date().toISOString(), score, total: questions.length, time: timer });
        localStorage.setItem('sasp-progress', JSON.stringify(progress));
        localStorage.setItem('sasp-quiz-history', JSON.stringify(quizHistory));
      } catch {}
    }
  };

  const formatTime = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  if (!started) {
    return (
      <div className={styles.page}>
        <div className={styles.setup}>
          <h1 className={styles.title}>Quiz</h1>
          <p className={styles.subtitle}>Teste tes connaissances en identification</p>
          <div className={styles.optionGroup}>
            <label className={styles.label}>Niveau</label>
            <div className={styles.tierBtns}>
              {TIERS.map(t => (
                <button key={t.id} className={`${styles.tierBtn} ${selectedTier===t.id?styles.active:''}`}
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
          <div className={styles.optionGroup}>
            <label className={styles.label}>Nombre de questions</label>
            <div className={styles.tierBtns}>
              {[10,20,30,50].map(n => (
                <button key={n} className={`${styles.tierBtn} ${questionCount===n?styles.active:''}`}
                  onClick={() => setQuestionCount(n)}>{n}</button>
              ))}
            </div>
          </div>
          <button className="btn btn-primary btn-lg" style={{width:'100%',justifyContent:'center',marginTop:'20px'}}
            onClick={startQuiz} disabled={pool.length < 4}>
            {pool.length < 4 ? 'Pas assez de véhicules (min 4)' : `Démarrer (${Math.min(questionCount, pool.length)} questions)`}
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className={styles.page}>
        <div className={styles.results}>
          <div className={styles.resultIcon}>{pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '😤'}</div>
          <h1 className={styles.resultTitle}>
            {pct >= 80 ? 'Excellent !' : pct >= 50 ? 'Pas mal !' : 'Continue de réviser !'}
          </h1>
          <div className={styles.resultScore}>
            <span className={styles.scoreNum}>{score}</span>
            <span className={styles.scoreSlash}>/</span>
            <span className={styles.scoreTotal}>{questions.length}</span>
          </div>
          <p className={styles.resultPct}>{pct}% de bonnes réponses</p>
          <p className={styles.resultTime}>⏱️ Temps : {formatTime(timer)}</p>
          {mistakes.length > 0 && (
            <div className={styles.mistakeSection}>
              <h3 className={styles.mistakeTitle}>❌ Erreurs à retravailler</h3>
              {mistakes.map((m, i) => (
                <div key={i} className={styles.mistakeRow}>
                  <span>{getCategoryIcon(m.vehicle.category)}</span>
                  <span className={styles.mistakeCorrect}>{m.vehicle.name}</span>
                  <span className={styles.mistakeMfr}>({m.vehicle.manufacturer})</span>
                  <span className={styles.mistakeChosen}>Tu as dit : {m.chosen.name}</span>
                </div>
              ))}
            </div>
          )}
          <div className={styles.resultActions}>
            <button className="btn btn-primary" onClick={startQuiz}>🔄 Recommencer</button>
            <button className="btn" onClick={() => { setStarted(false); setFinished(false); }}>← Menu</button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];
  return (
    <div className={styles.page}>
      <div className={styles.quizTop}>
        <button className="btn btn-sm" onClick={() => { setStarted(false); setFinished(false); }}>✕</button>
        <span className={styles.counter}>Q{currentQ+1}/{questions.length}</span>
        <span className={styles.timerDisplay}>⏱️ {formatTime(timer)}</span>
        <span className={styles.liveScore}>✅ {score}</span>
      </div>
      <div className="progress-bar" style={{marginBottom:'24px'}}>
        <div className="progress-fill" style={{width:`${((currentQ+1)/questions.length)*100}%`}}></div>
      </div>
      <div className={styles.questionCard}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={getVehicleImageUrl(q.vehicle)} alt="?" className={styles.qImg} />
        <span className={styles.qCat} style={{color:getCategoryColor(q.vehicle.category)}}>{q.vehicle.category}</span>
        <p className={styles.qText}>Quel est le nom de ce véhicule ?</p>
      </div>
      <div className={styles.choicesGrid}>
        {q.choices.map(c => {
          let cls = styles.choice;
          if (showResult && c.id === q.vehicle.id) cls += ' ' + styles.correct;
          else if (showResult && c.id === selected && c.id !== q.vehicle.id) cls += ' ' + styles.wrong;
          return (
            <button key={c.id} className={cls} onClick={() => handleChoice(c)} disabled={showResult}>
              {c.name}
            </button>
          );
        })}
      </div>
      {showResult && (
        <button className="btn btn-primary btn-lg" style={{width:'100%',justifyContent:'center',marginTop:'20px'}} onClick={nextQuestion}>
          {currentQ < questions.length - 1 ? 'Question suivante →' : 'Voir les résultats 🏁'}
        </button>
      )}
    </div>
  );
}
