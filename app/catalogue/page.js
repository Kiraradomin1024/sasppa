'use client';
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { allVehicles, TIERS, getVehiclesByTier, getCategories, getManufacturers, getCategoryIcon, getCategoryColor, getVehicleImageUrl } from '@/data/vehicles';
import ImageModal from '@/components/ImageModal';
import styles from './page.module.css';

export default function CataloguePage() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedTier, setSelectedTier] = useState(4);
  const [selectedMfr, setSelectedMfr] = useState('all');
  const [zoomedImage, setZoomedImage] = useState(null);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCat(cat);
  }, [searchParams]);

  const categories = getCategories();
  const manufacturers = getManufacturers();

  const filtered = useMemo(() => {
    let pool = getVehiclesByTier(selectedTier);
    return pool.filter(v => {
      if (selectedCat !== 'all' && v.category !== selectedCat) return false;
      if (selectedMfr !== 'all' && v.manufacturer !== selectedMfr) return false;
      if (search && !v.name.toLowerCase().includes(search.toLowerCase()) &&
          !v.manufacturer.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, selectedCat, selectedTier, selectedMfr]);

  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach(v => {
      if (!g[v.category]) g[v.category] = [];
      g[v.category].push(v);
    });
    return g;
  }, [filtered]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Catalogue</h1>
        <p className={styles.subtitle}>{filtered.length} véhicules affichés</p>
      </div>

      <div className={styles.filters}>
        <input className={`input ${styles.search}`} placeholder="Rechercher un véhicule ou fabricant..." value={search} onChange={e => setSearch(e.target.value)} id="search-input" />
        
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Niveau</label>
            <div className={styles.tierBtns}>
              {TIERS.map(t => (
                <button key={t.id} className={`${styles.tierBtn} ${selectedTier === t.id ? styles.tierActive : ''}`}
                  onClick={() => setSelectedTier(t.id)}>{t.icon} {t.label}</button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Catégorie</label>
            <select className={`input ${styles.select}`} value={selectedCat} onChange={e => setSelectedCat(e.target.value)}>
              <option value="all">Toutes les catégories</option>
              {categories.map(c => <option key={c} value={c}>{getCategoryIcon(c)} {c}</option>)}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Fabricant</label>
            <select className={`input ${styles.select}`} value={selectedMfr} onChange={e => setSelectedMfr(e.target.value)}>
              <option value="all">Tous les fabricants</option>
              {manufacturers.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.results}>
        {Object.keys(grouped).sort().map(cat => (
          <div key={cat} className={styles.catSection}>
            <div className={styles.catHeader}>
              <span className={styles.catIcon}>{getCategoryIcon(cat)}</span>
              <h2 className={styles.catTitle}>{cat}</h2>
              <span className={styles.catCount}>{grouped[cat].length}</span>
            </div>
            <div className={styles.grid}>
              {grouped[cat].map((v, i) => (
                <div key={v.id} className={styles.card} style={{ '--cat-color': getCategoryColor(v.category), animationDelay: `${i * 0.03}s` }}>
                  <div className={styles.cardImg} onClick={() => setZoomedImage(getVehicleImageUrl(v))} style={{ cursor: 'zoom-in' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getVehicleImageUrl(v)} alt={v.name} className={styles.cardImage} loading="lazy" />
                  </div>
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardName}>{v.name}</h3>
                    <span className={styles.cardMfr}>{v.manufacturer}</span>
                    <span className={styles.cardCat} style={{ color: getCategoryColor(v.category), borderColor: getCategoryColor(v.category) + '40' }}>{v.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className={styles.empty}>
            <p>Aucun véhicule trouvé</p>
          </div>
        )}
      </div>

      <ImageModal src={zoomedImage} onClose={() => setZoomedImage(null)} />
    </div>
  );
}
