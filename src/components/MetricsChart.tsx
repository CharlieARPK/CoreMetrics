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
  ReferenceLine,
  Legend
} from 'recharts';
import { useMetricsStore } from '../store/useMetricsStore';

const metricsOptions = [
  { key: 'weight', label: '体重 (kg)' },
  { key: 'bodyFat', label: '体脂肪率 (%)' },
  { key: 'visceralFat', label: '内臓脂肪レベル' },
  { key: 'skeletalMuscle', label: '骨格筋率 (%)' },
  { key: 'bodyAge', label: '体年齢 (才)' },
  { key: 'restingMetabolism', label: '基礎代謝 (kcal)' },
  { key: 'bmi', label: 'BMI' },
  { key: 'waist', label: '腹囲 (cm)' }
] as const;

type MetricKey = typeof metricsOptions[number]['key'];
const MALE_WAIST_THRESHOLD_CM = 85;
const MALE_WAIST_HIGH_RISK_CM = 90;

export default function MetricsChart() {
  const entries = useMetricsStore((state) => state.entries);
  const targetWeight = useMetricsStore((state) => state.targetWeight);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('weight');

  // ユーザーの身長(m^2)を体重とBMIから計算し、各項目の基準帯を動的に生成
  const allMetricZones = useMemo(() => {
    let heightSq = 3.0625; // デフォルト1.75m (1.75^2 = 3.0625)
    const validEntry = entries.find(e => e.weight > 0 && e.bmi > 0);
    if (validEntry) {
      heightSq = validEntry.weight / validEntry.bmi;
    }

    return {
      weight: [
        { y1: 0, y2: Number((18.5 * heightSq).toFixed(1)), color: 'rgba(255, 235, 59, 0.2)' }, // 低体重
        { y1: Number((18.5 * heightSq).toFixed(1)), y2: Number((25 * heightSq).toFixed(1)), color: 'rgba(76, 175, 80, 0.2)' }, // 普通体重
        { y1: Number((25 * heightSq).toFixed(1)), y2: Number((30 * heightSq).toFixed(1)), color: 'rgba(255, 152, 0, 0.2)' }, // 肥満(1度)
        { y1: Number((30 * heightSq).toFixed(1)), y2: 300, color: 'rgba(244, 67, 54, 0.2)' } // 肥満(2度以上)
      ],
      waist: [
        { y1: 0, y2: MALE_WAIST_THRESHOLD_CM, color: 'rgba(76, 175, 80, 0.2)' },
        { y1: MALE_WAIST_THRESHOLD_CM, y2: MALE_WAIST_HIGH_RISK_CM, color: 'rgba(255, 235, 59, 0.25)' },
        { y1: MALE_WAIST_HIGH_RISK_CM, y2: 200, color: 'rgba(244, 67, 54, 0.2)' }
      ],
      bodyFat: [
        { y1: 0, y2: 10, color: 'rgba(255, 235, 59, 0.2)' },
        { y1: 10, y2: 20, color: 'rgba(76, 175, 80, 0.2)' },
        { y1: 20, y2: 25, color: 'rgba(255, 152, 0, 0.2)' },
        { y1: 25, y2: 100, color: 'rgba(244, 67, 54, 0.2)' }
      ],
      visceralFat: [
        { y1: 0, y2: 10, color: 'rgba(76, 175, 80, 0.2)' },
        { y1: 10, y2: 15, color: 'rgba(255, 152, 0, 0.2)' },
        { y1: 15, y2: 100, color: 'rgba(244, 67, 54, 0.2)' }
      ],
      skeletalMuscle: [
        { y1: 0, y2: 30.0, color: 'rgba(244, 67, 54, 0.2)' }, // 低い(要注意)
        { y1: 30.0, y2: 32.8, color: 'rgba(255, 235, 59, 0.2)' }, // やや低い
        { y1: 32.8, y2: 100, color: 'rgba(76, 175, 80, 0.2)' } // 標準〜高い(健康)
      ],
      bodyAge: [
        { y1: 0, y2: 36, color: 'rgba(76, 175, 80, 0.2)' },
        { y1: 36, y2: 200, color: 'rgba(255, 152, 0, 0.2)' }
      ],
      restingMetabolism: [
        { y1: 0, y2: 1400, color: 'rgba(244, 67, 54, 0.2)' }, // 低い
        { y1: 1400, y2: 1530, color: 'rgba(255, 235, 59, 0.2)' }, // 平均よりやや下
        { y1: 1530, y2: 5000, color: 'rgba(76, 175, 80, 0.2)' } // 35歳男性平均(1530kcal)以上
      ],
      bmi: [
        { y1: 0, y2: 18.5, color: 'rgba(255, 235, 59, 0.2)' },
        { y1: 18.5, y2: 25, color: 'rgba(76, 175, 80, 0.2)' },
        { y1: 25, y2: 30, color: 'rgba(255, 152, 0, 0.2)' },
        { y1: 30, y2: 100, color: 'rgba(244, 67, 54, 0.2)' }
      ]
    };
  }, [entries]);

  const chartData = useMemo(() => {
    const reversed = [...entries].reverse();
    return reversed.map((entry, idx) => {
      const d = new Date(entry.timestamp);
      
      const calcMA = (key: keyof typeof entry) => {
        const start = Math.max(0, idx - 6);
        const windowSlice = reversed.slice(start, idx + 1);
        const sum = windowSlice.reduce((acc, curr) => acc + (Number(curr[key]) || 0), 0);
        return Number((sum / windowSlice.length).toFixed(1));
      };

      const calcWaistMA = () => {
        if (entry.waist === undefined) return null;

        const measuredValues = reversed
          .slice(0, idx + 1)
          .map(item => item.waist)
          .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
          .slice(-7);

        const sum = measuredValues.reduce((acc, value) => acc + value, 0);
        return Number((sum / measuredValues.length).toFixed(1));
      };

      return {
        ...entry,
        waist: entry.waist ?? null,
        displayDate: `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
        weight_ma: calcMA('weight'),
        waist_ma: calcWaistMA(),
        bodyFat_ma: calcMA('bodyFat'),
        visceralFat_ma: calcMA('visceralFat'),
        skeletalMuscle_ma: calcMA('skeletalMuscle'),
        bodyAge_ma: calcMA('bodyAge'),
        restingMetabolism_ma: calcMA('restingMetabolism'),
        bmi_ma: calcMA('bmi'),
      };
    });
  }, [entries]);

  const xDomain = useMemo(() => {
    if (chartData.length <= 1) {
      const time = chartData[0]?.timestamp || 0;
      return [time - 86400000, time + 86400000]; // 1データしかない場合は前後1日をドメインにする
    }
    return ['auto', 'auto'];
  }, [chartData]);

  if (entries.length === 0) return null;

  const renderChart = (metric: MetricKey, chartHeight: string, showTitle: boolean) => {
    const currentZones = allMetricZones[metric] || [];
    const metricInfo = metricsOptions.find(o => o.key === metric);

    const minX = chartData.length <= 1 ? (chartData[0]?.timestamp || 0) - 86400000 : chartData[0]?.timestamp;
    const maxX = chartData.length <= 1 ? (chartData[0]?.timestamp || 0) + 86400000 : chartData[chartData.length - 1]?.timestamp;

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
                  x1={minX}
                  x2={maxX}
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
              {metric === 'waist' && (
                <ReferenceLine
                  y={MALE_WAIST_THRESHOLD_CM}
                  stroke="#e53935"
                  strokeDasharray="5 5"
                  label={{ position: 'top', value: `男性基準: ${MALE_WAIST_THRESHOLD_CM}cm`, fill: '#e53935', fontSize: 12, fontWeight: 'bold' }}
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
                itemSorter={(item) => (String(item.dataKey).endsWith('_ma') ? 1 : -1)}
                labelFormatter={(label) => {
                  const d = new Date(label as number);
                  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                }}
                contentStyle={{ 
                  background: 'rgba(255, 255, 255, 0.85)', 
                  backdropFilter: 'blur(10px)', 
                  border: '1px solid rgba(255, 255, 255, 0.6)', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  color: 'var(--text-main)'
                }}
                itemStyle={{ color: 'var(--primary-dark)', fontWeight: 'bold' }}
              />
              <Legend 
                verticalAlign="top" 
                height={28} 
                content={(props) => {
                  const payload = props.payload as Array<{
                    value?: string;
                    id?: string;
                    dataKey?: string;
                    color?: string;
                  }> | undefined;
                  if (!payload) return null;

                  const sortedPayload = [...payload].sort((a, b) => {
                    const aIsMa = String(a.dataKey || a.id || a.value).endsWith('_ma') || a.value === '移動平均';
                    const bIsMa = String(b.dataKey || b.id || b.value).endsWith('_ma') || b.value === '移動平均';
                    if (aIsMa && !bIsMa) return 1;
                    if (!aIsMa && bIsMa) return -1;
                    return 0;
                  });

                  return (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.8rem', paddingBottom: '4px' }}>
                      {sortedPayload.map((entry, index) => (
                        <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            display: 'inline-block',
                            width: '14px',
                            height: entry.value === '移動平均' ? '4px' : '3px',
                            backgroundColor: entry.color || 'var(--primary-color)',
                            borderRadius: '2px'
                          }} />
                          <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                            {entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              <Line 
                type="monotone" 
                dataKey={metric} 
                name={metricInfo?.label}
                connectNulls={metric === 'waist'}
                stroke="var(--primary-color)" 
                strokeWidth={1.5}
                dot={{ fill: 'var(--primary-color)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey={`${metric}_ma`} 
                name="移動平均"
                connectNulls={metric === 'waist'}
                stroke="#1e88e5" 
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, stroke: '#fff', strokeWidth: 2 }}
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
