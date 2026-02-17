import { useEffect, useState } from "react";
import { getCsvAnalysis } from "../services/aiApi";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

function AiForecast({ businessId, theme }) {
    const [csvStats, setCsvStats] = useState(null);
    const [csvGranularity, setCsvGranularity] = useState('weekly');
    const [isLoadingCsv, setIsLoadingCsv] = useState(false);

    const isDark = theme === 'dark';
    const textColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, font: { size: 10 }, color: textColor } }
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: textColor } },
            y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } }
        }
    };

    useEffect(() => {
        if (businessId) {
            setIsLoadingCsv(true);
            getCsvAnalysis(businessId, csvGranularity)
                .then(data => {
                    if (data && !data.error) setCsvStats(data);
                    else setCsvStats(null);
                })
                .catch(console.error)
                .finally(() => setIsLoadingCsv(false));
        }
    }, [businessId, csvGranularity]);

    if (isLoadingCsv) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-serif animate-pulse">Analyzing historical data patterns...</p>
            </div>
        );
    }

    if (!csvStats) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white/5 rounded-3xl border border-dashed border-slate-300 dark:border-white/10">
                <div className="text-4xl mb-4">🔮</div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Forecast Data Available</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm text-center max-w-md">
                    Upload a CSV transaction history file to unlock AI-powered sales forecasting and trend analysis.
                </p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
                <div>
                    <h2 className="text-4xl md:text-5xl font-serif font-black tracking-tight text-[#0f172a] dark:text-white flex items-center gap-3">
                        <span className="text-amber-400">✨</span> AI Prediction Hub
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Multi-series forecasting based on historic CSV data</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                    {['daily', 'weekly', 'monthly'].map((g) => (
                        <button
                            key={g}
                            onClick={() => setCsvGranularity(g)}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${csvGranularity === g
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-white hover:bg-amber-500/10 dark:hover:bg-white/5'}`}
                        >
                            {g}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* MULTI-SERIES CHART */}
                    <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Historical vs AI Forecast</h3>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Sales</span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500"></div><span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Expenses</span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div><span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Forecast</span></div>
                            </div>
                        </div>
                        <div className="h-[400px]">
                            <Line
                                data={{
                                    labels: [
                                        ...(csvStats.historical?.map(h => h.date) || []),
                                        ...(csvStats.forecast?.sales?.map(f => f.date) || [])
                                    ],
                                    datasets: [
                                        {
                                            label: 'Historical Sales',
                                            data: csvStats.historical?.map(h => h.sales) || [],
                                            borderColor: '#10b981',
                                            backgroundColor: 'rgba(16, 185, 129, 0.05)',
                                            fill: true,
                                            tension: 0.4,
                                            pointRadius: 3,
                                            borderWidth: 4
                                        },
                                        {
                                            label: 'Historical Expenses',
                                            data: csvStats.historical?.map(h => h.expenses) || [],
                                            borderColor: '#f43f5e',
                                            borderDash: [5, 5],
                                            tension: 0.4,
                                            pointRadius: 0,
                                            borderWidth: 3
                                        },
                                        {
                                            label: 'AI Sales Forecast',
                                            data: [
                                                ...(new Array(csvStats.historical?.length || 0).fill(null)),
                                                ...(csvStats.forecast?.sales?.map(f => f.value) || [])
                                            ],
                                            borderColor: '#f59e0b',
                                            backgroundColor: 'rgba(245, 158, 11, 0.05)',
                                            borderDash: [2, 2],
                                            fill: true,
                                            tension: 0.4,
                                            pointRadius: 4,
                                            pointBackgroundColor: '#f59e0b',
                                            borderWidth: 5
                                        }
                                    ]
                                }}
                                options={{
                                    ...chartOptions,
                                    plugins: { ...chartOptions.plugins, legend: { display: false } }
                                }}
                            />
                        </div>
                    </div>

                    {/* INSIGHTS & SUMMARY */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-emerald-500/[0.08] dark:bg-emerald-500/5 p-8 rounded-[2rem] border border-emerald-500/20 dark:border-emerald-500/10">
                            <h4 className="text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mb-4">AI Observations</h4>
                            <ul className="space-y-4">
                                {csvStats.insights?.map((insight, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                                        <span className="mt-1">✨</span> {insight}
                                    </li>
                                ))}
                                {csvStats.total_stats?.margin > 20 && (
                                    <li key="margin-insight" className="flex items-start gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                                        <span className="mt-1">📈</span> Healthy margin detected ({csvStats.total_stats.margin.toFixed(1)}%). Business scaling potential is high.
                                    </li>
                                )}
                            </ul>
                        </div>
                        <div className="bg-amber-500/[0.08] dark:bg-amber-500/5 p-8 rounded-[2rem] border border-amber-500/20 dark:border-amber-500/10 flex flex-col justify-center">
                            <p className="text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-[0.2em] mb-2 text-center">Projected Net Profit</p>
                            <p className="text-5xl font-serif font-black text-slate-900 dark:text-white text-center">
                                ₹{(csvStats.forecast?.profit?.reduce((acc, curr) => acc + curr.value, 0) || 0).toLocaleString()}
                            </p>
                            <p className="text-[10px] text-slate-500 text-center mt-3 font-bold uppercase tracking-widest">Next 8 Periods Cumulative</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* CATEGORY BREAKDOWN (DONUT) */}
                    <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-2xl">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Import Analysis</h3>
                        <div className="h-64 relative">
                            <Doughnut
                                data={{
                                    labels: csvStats.category_breakdown?.map(c => c.category) || [],
                                    datasets: [{
                                        data: csvStats.category_breakdown?.map(c => c.amount) || [],
                                        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
                                        borderWidth: 0,
                                        cutout: '75%'
                                    }]
                                }}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'bottom', labels: { color: textColor, font: { size: 10 }, boxWidth: 8 } } }
                                }}
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <p className="text-[10px] uppercase font-bold text-slate-500">Top Spend</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{csvStats.category_breakdown?.[0]?.category || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* QUICK STATS */}
                    <div className="space-y-4">
                        {[
                            { label: "Imported Revenue", value: csvStats.total_stats?.sales, color: "text-emerald-600 dark:text-emerald-400" },
                            { label: "Imported Expenses", value: csvStats.total_stats?.expenses, color: "text-rose-600 dark:text-rose-400" },
                            { label: "Calculated Profit", value: csvStats.total_stats?.profit, color: "text-sky-600 dark:text-sky-400" }
                        ].map((s, i) => (
                            <div key={i} className="bg-white dark:bg-white/[0.02] p-6 rounded-2xl border border-slate-200 dark:border-white/5 flex justify-between items-center group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{s.label}</span>
                                <span className={`text-2xl font-serif font-black ${s.color}`}>₹{s.value?.toLocaleString() || 0}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AiForecast;
