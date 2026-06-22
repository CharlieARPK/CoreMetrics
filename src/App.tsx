import { useState } from 'react';
import { useMetricsStore } from './store/useMetricsStore';
import MetricsChart from './components/MetricsChart';

function App() {
  const { entries, addEntry, deleteEntry } = useMetricsStore();
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 16),
    weight: '',
    bodyFat: '',
    skeletalMuscle: '',
    bmi: '',
    restingMetabolism: '',
    bodyAge: '',
    visceralFat: ''
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
      skeletalMuscle: Number(formData.skeletalMuscle) || 0,
      bmi: Number(formData.bmi) || 0,
      restingMetabolism: Number(formData.restingMetabolism) || 0,
      bodyAge: Number(formData.bodyAge) || 0,
      visceralFat: Number(formData.visceralFat) || 0,
    };

    addEntry(newEntry);
    
    setFormData({
      date: new Date().toISOString().slice(0, 16),
      weight: '',
      bodyFat: '',
      skeletalMuscle: '',
      bmi: '',
      restingMetabolism: '',
      bodyAge: '',
      visceralFat: ''
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
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--primary-dark)' }}>新規記録</h2>
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
                <label className="form-label" htmlFor="skeletalMuscle">骨格筋率 (%)</label>
                <input type="number" step="0.1" id="skeletalMuscle" name="skeletalMuscle" className="form-input" value={formData.skeletalMuscle} onChange={handleChange} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="bmi">BMI</label>
                <input type="number" step="0.1" id="bmi" name="bmi" className="form-input" value={formData.bmi} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="restingMetabolism">基礎代謝 (kcal)</label>
                <input type="number" id="restingMetabolism" name="restingMetabolism" className="form-input" value={formData.restingMetabolism} onChange={handleChange} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="bodyAge">体年齢 (才)</label>
                <input type="number" id="bodyAge" name="bodyAge" className="form-input" value={formData.bodyAge} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="visceralFat">内臓脂肪レベル</label>
                <input type="number" id="visceralFat" name="visceralFat" className="form-input" value={formData.visceralFat} onChange={handleChange} required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              保存する
            </button>
          </form>
        </section>

        <MetricsChart />

        {entries.length > 0 && (
          <section className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--primary-dark)' }}>最近の記録</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {entries.slice(0, 5).map(entry => (
                <div key={entry.id} style={{ 
                  background: 'rgba(255,255,255,0.4)', 
                  padding: '1rem', 
                  borderRadius: '12px',
                  position: 'relative'
                }}>
                  <button 
                    onClick={() => deleteEntry(entry.id)}
                    style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', color: '#ff5252', cursor: 'pointer', fontSize: '1.2rem' }}
                    title="削除"
                  >
                    &times;
                  </button>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{formatDate(entry.timestamp)}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-dark)' }}>
                      {entry.weight} <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>kg</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', textAlign: 'right' }}>
                      体脂肪 {entry.bodyFat}% | 骨格筋 {entry.skeletalMuscle}%<br/>
                      BMI {entry.bmi}
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
