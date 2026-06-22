import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';
import { useMetricsStore } from '../store/useMetricsStore';

const metricsOptions = [
  { key: 'weight', label: '体重 (kg)' },
  { key: 'bodyFat', label: '体脂肪率 (%)' },
  { key: 'visceralFat', label: '内臓脂肪レベル' },
  { key: 'skeletalMuscle', label: '骨格筋率 (%)' },
  { key: 'bodyAge', label: '体年齢 (才)' },
  { key: 'restingMetabolism', label: '基礎代謝 (kcal)' },
  { key: 'bmi', label: 'BMI' }
] as const;

type MetricKey = typeof metricsOptions[number]['key'];

// 33歳男性向け基準値 (オムロン等一般的な指標に基づく)
const metricZones: Record<MetricKey, {y1?: number, y2?: number, color: string}[]> = {
  weight: [],
  bodyFat: [
    { y2: 10, color: 'rgba(255, 235, 59, 0.2)' }, // 低い
    { y1: 10, y2: 20, color: 'rgba(76, 175, 80, 0.2)' }, // 標準
    { y1: 20, y2: 25, color: 'rgba(255, 152, 0, 0.2)' }, // やや高い
    { y1: 25, color: 'rgba(244, 67, 54, 0.2)' } // 高い
  ],
  visceralFat: [
    { y2: 10, color: 'rgba(76, 175, 80, 0.2)' }, // 標準
    { y1: 10, y2: 15, color: 'rgba(255, 152, 0, 0.2)' }, // やや高い
    { y1: 15, color: 'rgba(244, 67, 54, 0.2)' } // 高い
  ],
  skeletalMuscle: [
    { y2: 32.9, color: 'rgba(255, 235, 59, 0.2)' }, // 低い
    { y1: 32.9, color: 'rgba(76, 175, 80, 0.2)' } // 標準・高い（良い）
  ],
  bodyAge: [
    { y2: 34, color: 'rgba(76, 175, 80, 0.2)' }, // 実年齢以下（良い）
    { y1: 34, color: 'rgba(255, 152, 0, 0.2)' } // 実年齢より上
  ],
  restingMetabolism: [],
  bmi: [
    { y2: 18.5, color: 'rgba(255, 235, 59, 0.2)' }, // 低体重
    { y1: 18.5, y2: 25, color: 'rgba(76, 175, 80, 0.2)' }, // 普通体重
    { y1: 25, y2: 30, color: 'rgba(255, 152, 0, 0.2)' }, // 肥満(1度)
    { y1: 30, color: 'rgba(244, 67, 54, 0.2)' } // 肥満(2度以上)
  ]
};

export default function MetricsChart() {
  const entries = useMetricsStore((state) => state.entries);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('weight');

  const chartData = useMemo(() => {
    return [...entries].reverse().map(entry => {
      const d = new Date(entry.timestamp);
      return {
        ...entry,
        displayDate: `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      };
    });
  }, [entries]);

  if (entries.length === 0) return null;

  const currentZones = metricZones[selectedMetric] || [];

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
            {currentZones.map((zone, idx) => (
              <ReferenceArea 
                key={idx} 
                y1={zone.y1} 
                y2={zone.y2} 
                fill={zone.color} 
                strokeOpacity={0} 
              />
            ))}
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
