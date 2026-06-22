import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useMetricsStore } from '../store/useMetricsStore';

const metricsOptions = [
  { key: 'weight', label: '体重 (kg)' },
  { key: 'bodyFat', label: '体脂肪率 (%)' },
  { key: 'skeletalMuscle', label: '骨格筋率 (%)' },
  { key: 'bmi', label: 'BMI' },
  { key: 'restingMetabolism', label: '基礎代謝 (kcal)' },
  { key: 'bodyAge', label: '体年齢 (才)' },
  { key: 'visceralFat', label: '内臓脂肪レベル' }
] as const;

type MetricKey = typeof metricsOptions[number]['key'];

export default function MetricsChart() {
  const entries = useMetricsStore((state) => state.entries);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('weight');

  // Sort entries from oldest to newest for the chart
  const chartData = useMemo(() => {
    return [...entries].reverse().map(entry => {
      const d = new Date(entry.timestamp);
      return {
        ...entry,
        displayDate: `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
      };
    });
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-dark)', margin: 0 }}>グラフ推移</h2>
        <select 
          className="form-input" 
          style={{ width: 'auto', padding: '0.5rem', fontSize: '0.9rem' }}
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value as MetricKey)}
        >
          {metricsOptions.map(opt => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div style={{ height: '300px', width: '100%', marginTop: '1rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.5)" vertical={false} />
            <XAxis 
              dataKey="displayDate" 
              tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
              axisLine={false} 
              tickLine={false} 
            />
            <YAxis 
              domain={['auto', 'auto']} 
              tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
              axisLine={false} 
              tickLine={false} 
            />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(255, 255, 255, 0.8)', 
                backdropFilter: 'blur(10px)', 
                border: '1px solid rgba(255, 255, 255, 0.6)', 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                color: 'var(--text-main)'
              }}
              itemStyle={{ color: 'var(--primary-dark)', fontWeight: 'bold' }}
            />
            <Line 
              type="monotone" 
              dataKey={selectedMetric} 
              name={metricsOptions.find(o => o.key === selectedMetric)?.label}
              stroke="var(--primary-color)" 
              strokeWidth={3}
              dot={{ fill: 'var(--primary-color)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
