import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine
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
const metricZones: Record<MetricKey, {y1: number, y2: number, color: string}[]> = {
  weight: [],
  bodyFat: [
    { y1: 0, y2: 10, color: 'rgba(255, 235, 59, 0.2)' }, // 低い
    { y1: 10, y2: 20, color: 'rgba(76, 175, 80, 0.2)' }, // 標準
    { y1: 20, y2: 25, color: 'rgba(255, 152, 0, 0.2)' }, // やや高い
    { y1: 25, y2: 100, color: 'rgba(244, 67, 54, 0.2)' } // 高い
  ],
  visceralFat: [
    { y1: 0, y2: 10, color: 'rgba(76, 175, 80, 0.2)' }, // 標準
    { y1: 10, y2: 15, color: 'rgba(255, 152, 0, 0.2)' }, // やや高い
    { y1: 15, y2: 100, color: 'rgba(244, 67, 54, 0.2)' } // 高い
  ],
  skeletalMuscle: [], // ユーザー要望により色は塗らない
  bodyAge: [
    { y1: 0, y2: 36, color: 'rgba(76, 175, 80, 0.2)' }, // 実年齢以下（良い）: 35歳以下
    { y1: 36, y2: 200, color: 'rgba(255, 152, 0, 0.2)' } // 実年齢より上: 36歳以上
  ],
  restingMetabolism: [],
  bmi: [
    { y1: 0, y2: 18.5, color: 'rgba(255, 235, 59, 0.2)' }, // 低体重
    { y1: 18.5, y2: 25, color: 'rgba(76, 175, 80, 0.2)' }, // 普通体重
    { y1: 25, y2: 30, color: 'rgba(255, 152, 0, 0.2)' }, // 肥満(1度)
    { y1: 30, y2: 100, color: 'rgba(244, 67, 54, 0.2)' } // 肥満(2度以上)
  ]
};

export default function MetricsChart() {
  const entries = useMetricsStore((state) => state.entries);
  const targetWeight = useMetricsStore((state) => state.targetWeight);
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

  const xDomain = useMemo(() => {
    if (chartData.length <= 1) {
      const time = chartData[0]?.timestamp || Date.now();
      return [time - 86400000, time + 86400000]; // 1データしかない場合は前後1日をドメインにする
    }
    return ['auto', 'auto'];
  }, [chartData]);

  if (entries.length === 0) return null;

  const renderChart = (metric: MetricKey, chartHeight: string, showTitle: boolean) => {
    const currentZones = metricZones[metric] || [];
    const metricInfo = metricsOptions.find(o => o.key === metric);

    return (
      <div style={{ marginBottom: showTitle ? '2rem' : '0' }}>
        {showTitle && (
          <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-dark)', marginBottom: '0.5rem', textAlign: 'center' }}>
            {metricInfo?.label}
          </h3>
        )}
        <div style={{ height: chartHeight, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              {currentZones.map((zone, idx) => (
                <ReferenceArea 
                  key={idx} 
                  y1={zone.y1} 
                  y2={zone.y2} 
                  fill={zone.color} 
                  strokeOpacity={0} 
                  ifOverflow="hidden"
                />
              ))}
              {metric === 'weight' && targetWeight !== null && (
                <ReferenceLine 
                  y={targetWeight} 
                  stroke="#ff5252" 
                  strokeDasharray="5 5" 
                  label={{ position: 'top', value: `目標: ${targetWeight}kg`, fill: '#ff5252', fontSize: 12, fontWeight: 'bold' }} 
                  ifOverflow="extendDomain"
                />
              )}
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.5)" vertical={false} />
              <XAxis 
                dataKey="timestamp" 
                type="number"
                domain={xDomain}
                tickFormatter={(unixTime) => {
                  const d = new Date(unixTime);
                  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
                }}
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
                labelFormatter={(label) => {
                  const d = new Date(label as number);
                  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                }}
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
                dataKey={metric} 
                name={metricInfo?.label}
                stroke="var(--primary-color)" 
                strokeWidth={3}
                dot={{ fill: 'var(--primary-color)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 選択式のメイングラフ */}
      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-dark)', margin: 0 }}>メイングラフ</h2>
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
        {renderChart(selectedMetric, '300px', false)}
      </section>

      {/* 常時表示の全項目グラフ */}
      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-dark)', marginBottom: '1.5rem' }}>すべての項目の推移</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {metricsOptions.map(opt => (
            <div key={opt.key} style={{ background: 'rgba(255,255,255,0.3)', padding: '1rem', borderRadius: '12px' }}>
              {renderChart(opt.key, '200px', true)}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
