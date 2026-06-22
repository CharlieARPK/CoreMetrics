import { useState } from 'react';
import { useMetricsStore } from './store/useMetricsStore';
import MetricsChart from './components/MetricsChart';

function App() {
  const { entries, addEntry, updateEntry, deleteEntry } = useMetricsStore();
  const [editingId, setEditingId] = useState<string | null>(null);

  const getLocalNow = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const getLocalDateString = (timestamp: number) => {
    const now = new Date(timestamp);
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    date: getLocalNow(),
    weight: '',
    bodyFat: '',
    visceralFat: '',
    skeletalMuscle: '',
    bodyAge: '',
    restingMetabolism: '',
    bmi: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEntry = {
      timestamp: new Date(formData.date).getTime(),
      weight: Number(formData.weight) || 0,
      bodyFat: Number(formData.bodyFat) || 0,
      visceralFat: Number(formData.visceralFat) || 0,
      skeletalMuscle: Number(formData.skeletalMuscle) || 0,
      bodyAge: Number(formData.bodyAge) || 0,
      restingMetabolism: Number(formData.restingMetabolism) || 0,
      bmi: Number(formData.bmi) || 0,
    };

    if (editingId) {
      updateEntry(editingId, newEntry);
      setEditingId(null);
    } else {
      addEntry(newEntry);
    }
    
    setFormData({
      date: getLocalNow(),
      weight: '',
      bodyFat: '',
      visceralFat: '',
      skeletalMuscle: '',
      bodyAge: '',
      restingMetabolism: '',
      bmi: ''
    });
  };

  const handleEdit = (entry: any) => {
    setEditingId(entry.id);
    setFormData({
      date: getLocalDateString(entry.timestamp),
      weight: String(entry.weight),
      bodyFat: String(entry.bodyFat),
      visceralFat: String(entry.visceralFat),
      skeletalMuscle: String(entry.skeletalMuscle),
      bodyAge: String(entry.bodyAge),
      restingMetabolism: String(entry.restingMetabolism),
      bmi: String(entry.bmi)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      date: getLocalNow(),
      weight: '',
      bodyFat: '',
      visceralFat: '',
      skeletalMuscle: '',
      bodyAge: '',
      restingMetabolism: '',
      bmi: ''
    });
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="container animate-fade-in">
      <header className="app-header">
        <h1 className="app-title">CoreMetrics</h1>
        <p className="app-subtitle">Omron HBF-214-W Data Logger</p>
      </header>

      <main>
        <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--primary-dark)' }}>
            {editingId ? '記録の修正' : '新規記録'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="date">測定日時</label>
              <input type="datetime-local" id="date" name="date" className="form-input" value={formData.date} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="weight">体重 (kg)</label>
              <input type="number" step="0.1" id="weight" name="weight" className="form-input" value={formData.weight} onChange={handleChange} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="bodyFat">体脂肪率 (%)</label>
                <input type="number" step="0.1" id="bodyFat" name="bodyFat" className="form-input" value={formData.bodyFat} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="visceralFat">内臓脂肪レベル</label>
                <input type="number" id="visceralFat" name="visceralFat" className="form-input" value={formData.visceralFat} onChange={handleChange} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="skeletalMuscle">骨格筋率 (%)</label>
                <input type="number" step="0.1" id="skeletalMuscle" name="skeletalMuscle" className="form-input" value={formData.skeletalMuscle} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="bodyAge">体年齢 (才)</label>
                <input type="number" id="bodyAge" name="bodyAge" className="form-input" value={formData.bodyAge} onChange={handleChange} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="restingMetabolism">基礎代謝 (kcal)</label>
                <input type="number" id="restingMetabolism" name="restingMetabolism" className="form-input" value={formData.restingMetabolism} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="bmi">BMI</label>
                <input type="number" step="0.1" id="bmi" name="bmi" className="form-input" value={formData.bmi} onChange={handleChange} required />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                {editingId ? '更新する' : '保存する'}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="btn" style={{ background: 'rgba(255,255,255,0.7)', color: 'var(--text-main)', border: '1px solid var(--glass-border)' }}>
                  キャンセル
                </button>
              )}
            </div>
          </form>
        </section>

        <MetricsChart />

        {entries.length > 0 && (
          <section className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--primary-dark)' }}>最近の記録</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {entries.map(entry => (
                <div key={entry.id} style={{ 
                  background: 'rgba(255,255,255,0.4)', 
                  padding: '1rem', 
                  borderRadius: '12px',
                  position: 'relative'
                }}>
                  <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleEdit(entry)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '0.25rem', opacity: 0.7 }}
                      title="編集"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => deleteEntry(entry.id)}
                      style={{ background: 'none', border: 'none', color: '#ff5252', cursor: 'pointer', fontSize: '1.2rem', padding: '0.25rem', opacity: 0.8 }}
                      title="削除"
                    >
                      &times;
                    </button>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{formatDate(entry.timestamp)}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-dark)' }}>
                      {entry.weight} <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>kg</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', textAlign: 'right' }}>
                      体脂肪 {entry.bodyFat}% | 骨格筋 {entry.skeletalMuscle}%<br/>
                      内臓脂肪 {entry.visceralFat} | BMI {entry.bmi}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
