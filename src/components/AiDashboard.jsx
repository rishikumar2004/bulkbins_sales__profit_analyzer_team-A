import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import OwnerOnly from "./OwnerOnly";
import { getAiDashboard, exportReportExcel, exportReportPdf } from "../services/aiApi";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

function Dashboard({ businessId: propBusinessId, theme }) {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total_sales: 0,
        total_cogs: 0,
        gross_profit: 0,
        total_expenses: 0,
        net_profit: 0,
        prediction: { amount: 0, confidence: "" },
        reorder_recommendations: [],
        alerts: [],
        weekly_analysis: [],
        expense_breakdown: [],
        monthly_profit_trend: [],
        monthly_summary: {
            this_month: { sales: 0, expenses: 0, profit: 0 },
            last_month: { sales: 0, expenses: 0, profit: 0 },
            growth: { sales: 0, profit: 0 }
        },
        product_performance: {
            top_profitable: [],
            low_stock: [],
            low_margin: []
        }
    });
    const [reportGranularity, setReportGranularity] = useState('weekly');
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [showReportsMenu, setShowReportsMenu] = useState(false);

    const downloadFile = (content, fileName, type) => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    };

    const convertToCSV = (data) => {
        if (!data || !data.length) return "";
        const headers = Object.keys(data[0]);
        const rows = data.map(obj => headers.map(header => JSON.stringify(obj[header] || "")).join(","));
        return [headers.join(","), ...rows].join("\n");
    };

    const role = localStorage.getItem("role");
    const businessId = propBusinessId || localStorage.getItem("activeBusinessId");

    useEffect(() => {
        if (businessId) {
            getAiDashboard(businessId, reportGranularity).then(setStats).catch(console.error);
        }
    }, [businessId, reportGranularity]);

    //   if (!businessId) {
    //     navigate("/my-businesses");
    //     return null;
    //   }

    const isDark = theme === 'dark';
    const textColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

    // --- CHART DATA CONFIG ---
    const chartData = {
        labels: stats.weekly_analysis ? stats.weekly_analysis.map(w => w.label) : [],
        datasets: [
            {
                label: 'Revenue',
                data: stats.weekly_analysis ? stats.weekly_analysis.map(w => w.revenue) : [],
                backgroundColor: '#73C2FB', // Blue
                borderRadius: 4,
            },
            {
                label: 'Expenses',
                data: stats.weekly_analysis ? stats.weekly_analysis.map(w => w.expenses) : [],
                backgroundColor: '#FF8D9E', // Pink
                borderRadius: 4,
            },
            {
                label: 'Profit',
                data: stats.weekly_analysis ? stats.weekly_analysis.map(w => w.profit) : [],
                backgroundColor: '#7CD1C4', // Teal
                borderRadius: 4,
            }
        ]
    };

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

    const expenseChartData = {
        labels: stats.expense_breakdown ? stats.expense_breakdown.map(e => e.category) : [],
        datasets: [{
            data: stats.expense_breakdown ? stats.expense_breakdown.map(e => e.amount) : [],
            backgroundColor: ['#73C2FB', '#FF8D9E', '#7CD1C4', '#FBBF24', '#8B5CF6', '#EC4899', '#10B981'],
            borderWidth: 0,
        }]
    };

    const profitTrendData = {
        labels: stats.monthly_profit_trend ? stats.monthly_profit_trend.map(m => m.month) : [],
        datasets: [{
            label: 'Net Profit',
            data: stats.monthly_profit_trend ? stats.monthly_profit_trend.map(m => m.profit) : [],
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            borderWidth: 5,
        }]
    };

    const m = stats.monthly_summary || {
        this_month: { sales: 0, expenses: 0, profit: 0 },
        last_month: { sales: 0, expenses: 0, profit: 0 },
        growth: { sales: 0, profit: 0 }
    };

    return (
        <div className="bg-transparent font-sans text-slate-700 dark:text-slate-200 selection:bg-primary-500/30">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tight text-[#0f172a] dark:text-white">Financial Insights</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Real-time business performance analytics</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    {(role === "owner" || role === "accountant" || role === "editor" || role === "staff" || role === "Owner" || role === "Analyst") && (
                        <button
                            onClick={() => navigate("/transactions")}
                            className="px-6 py-2.5 bg-green-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:-translate-y-0.5 transition-all active:scale-95"
                        >
                            View Transactions
                        </button>
                    )}

                    {(role === "owner" || role === "accountant" || role === "Owner") && (
                        <div className="relative">
                            <button
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                className="px-6 py-2.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-2xl text-sm font-bold shadow-sm hover:bg-sky-500/20 transition-all active:scale-95 flex items-center gap-2"
                            >
                                <span>📥</span> Export for AI
                                <span className="text-[10px] opacity-50">▼</span>
                            </button>

                            {showExportMenu && (
                                <div className="absolute top-full mt-2 right-0 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden fade-in">
                                    {[
                                        { label: "JSON Format", ext: "json", type: "application/json" },
                                        { label: "CSV Spreadsheet", ext: "csv", type: "text/csv" },
                                        { label: "Excel Workbook", ext: "csv", type: "application/vnd.ms-excel" }
                                    ].map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={async () => {
                                                setShowExportMenu(false);
                                                const data = await import("../services/aiApi").then(m => m.exportAiData(businessId));
                                                let content = opt.ext === "json" ? JSON.stringify(data, null, 2) : convertToCSV(data);
                                                downloadFile(content, `ai_export_${businessId}.${opt.ext}`, opt.type);
                                                toast.success(`${opt.label} Downloaded`);
                                            }}
                                            className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-sky-400 transition-colors border-b border-slate-100 dark:border-white/5 last:border-0"
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {(role === "owner" || role === "accountant" || role === "Owner") && (
                        <div className="relative">
                            <button
                                onClick={() => setShowReportsMenu(!showReportsMenu)}
                                className="px-6 py-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl text-sm font-bold shadow-sm hover:bg-indigo-500/20 transition-all active:scale-95 flex items-center gap-2"
                            >
                                <span>📊</span> Finance Reports
                                <span className="text-[10px] opacity-50">▼</span>
                            </button>

                            {showReportsMenu && (
                                <div className="absolute top-full mt-2 right-0 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden fade-in">
                                    <button
                                        onClick={async () => {
                                            setShowReportsMenu(false);
                                            const toastId = toast.loading("Generating Excel Report...");
                                            try {
                                                const blob = await exportReportExcel(businessId);
                                                if (blob.size < 100) throw new Error("Report generation failed");
                                                const url = window.URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `Financial_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
                                                a.click();
                                                toast.success("Excel Report Exported", { id: toastId });
                                            } catch (err) {
                                                toast.error(err.message || "Failed to generate report", { id: toastId });
                                                console.error(err);
                                            }
                                        }}
                                        className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-indigo-400 transition-colors border-b border-slate-100 dark:border-white/5 flex items-center gap-2"
                                    >
                                        <span>📈</span> Full Financial Pack (Excel)
                                    </button>
                                    <button
                                        onClick={async () => {
                                            setShowReportsMenu(false);
                                            const toastId = toast.loading("Generating PDF Summary...");
                                            try {
                                                const blob = await exportReportPdf(businessId);
                                                if (blob.size < 100) throw new Error("Report generation failed");
                                                const url = window.URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `Managerial_Summary_${new Date().toISOString().split('T')[0]}.pdf`;
                                                a.click();
                                                toast.success("PDF Report Exported", { id: toastId });
                                            } catch (err) {
                                                toast.error(err.message || "Failed to generate PDF", { id: toastId });
                                                console.error(err);
                                            }
                                        }}
                                        className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-indigo-400 transition-colors flex items-center gap-2"
                                    >
                                        <span>📄</span> Managerial Summary (PDF)
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Additional Buttons Block */}
                </div>
            </div>

            {/* REPORT GRANULARITY SELECTOR */}
            <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
                <div>
                    <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">Report Frequency</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Switch between daily, weekly, and monthly performance views.</p>
                </div>
                <div className="bg-slate-100 dark:bg-white/5 p-1.5 rounded-[20px] shadow-sm border border-slate-200 dark:border-white/10 flex gap-1">
                    {['daily', 'weekly', 'monthly'].map((g) => (
                        <button
                            key={g}
                            onClick={() => setReportGranularity(g)}
                            className={`px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${reportGranularity === g
                                ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/20 scale-105'
                                : 'text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-500 hover:bg-primary-500/10 dark:hover:bg-primary-500/5'
                                }`}
                        >
                            {g}
                        </button>
                    ))}
                </div>
            </div>

            {/* TOP LEVEL STATS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <StatCard title="Total Revenue" value={`₹${stats.total_sales.toLocaleString()}`} icon="💰" color="text-emerald-500" />
                <StatCard
                    title="Gross Profit"
                    value={`₹${stats.gross_profit.toLocaleString()}`}
                    icon="⚖️"
                    color="text-sky-500"
                    subValue={<span className="text-[10px] text-slate-400">COGS: ₹{stats.total_cogs.toLocaleString()}</span>}
                />
                <StatCard title="Op. Expenses" value={`₹${stats.total_expenses.toLocaleString()}`} icon="💸" color="text-rose-500" />
                <StatCard title="Net Profit" value={`₹${stats.net_profit.toLocaleString()}`} icon="📈" color="text-indigo-500" />
            </div>

            {/* MAIN ANALYSIS BLOCK */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* WEEKLY ANALYSIS (2/3 width) */}
                <div className="lg:col-span-2 bg-white/65 dark:bg-white/[0.02] backdrop-blur-[12px] p-8 rounded-3xl shadow-2xl shadow-black/5 border border-slate-200 dark:border-white/10">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                        <span>📅</span> {reportGranularity.charAt(0).toUpperCase() + reportGranularity.slice(1)} Performance Analysis
                    </h2>
                    <div className="h-72">
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                </div>

                {/* MONTHLY SUMMARY (1/3 width) */}
                <div className="bg-white/65 dark:bg-white/[0.02] backdrop-blur-[12px] p-8 rounded-3xl shadow-2xl shadow-black/5 border border-slate-200 dark:border-white/10 flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                            <span>📊</span> Monthly Comparison
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Sales This Month</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">₹{m.this_month.sales.toLocaleString()}</span>
                                    <span className={`text-xs font-bold ${m.growth.sales >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {m.growth.sales >= 0 ? '↑' : '↓'} {Math.abs(m.growth.sales).toFixed(1)}%
                                    </span>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Net Profit This Month</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">₹{m.this_month.profit.toLocaleString()}</span>
                                    <span className={`text-xs font-bold ${m.growth.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {m.growth.profit >= 0 ? '↑' : '↓'} {Math.abs(m.growth.profit).toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">🤖</div>
                            <div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Forecast Expense</p>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">₹{stats.prediction.expense_forecast?.toLocaleString() || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>



            {/* FINANCIAL INTELLIGENCE HUB */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* CATEGORY BREAKDOWN */}
                <div className="bg-white/65 dark:bg-white/[0.02] backdrop-blur-[12px] p-8 rounded-3xl shadow-2xl shadow-black/5 border border-slate-200 dark:border-white/10">
                    <div className="mb-8">
                        <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white">Expense Anatomy</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">Where is your money going?</p>
                    </div>
                    <div className="h-64 relative">
                        {stats.expense_breakdown && stats.expense_breakdown.length > 0 ? (
                            <Doughnut
                                data={expenseChartData}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 9 }, color: textColor } } },
                                    cutout: '70%'
                                }}
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-500 text-xs italic bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">No expense categories yet</div>
                        )}
                    </div>
                </div>

                {/* PROFIT TREND */}
                <div className="bg-white/65 dark:bg-white/[0.02] backdrop-blur-[12px] p-8 rounded-3xl shadow-2xl shadow-black/5 border border-slate-200 dark:border-white/10">
                    <div className="mb-8">
                        <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white">Net Profit Trend</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">Last 6 months performance</p>
                    </div>
                    <div className="h-64">
                        <Line data={profitTrendData} options={{ ...chartOptions, plugins: { legend: { display: false } } }} />
                    </div>
                </div>

                {/* AI FINANCIAL BRIEFING */}
                <div className="p-8 bg-indigo-600 text-white rounded-[32px] shadow-xl shadow-indigo-500/50 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-6 text-indigo-200 uppercase tracking-widest font-black text-[10px]">
                            <span>✨</span> AI Financial Briefing
                        </div>

                        {stats.expense_breakdown && stats.expense_breakdown.length > 0 ? (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-xs font-bold text-indigo-200/60 uppercase mb-2">Primary Expenditure</h4>
                                    <p className="text-2xl font-serif font-bold">
                                        {stats.expense_breakdown.length > 0 ? [...stats.expense_breakdown].sort((a, b) => b.amount - a.amount)[0].category : 'N/A'}
                                    </p>
                                    <p className="text-xs text-indigo-200 mt-1">Consuming ₹{[...stats.expense_breakdown].sort((a, b) => b.amount - a.amount)[0].amount.toLocaleString()} this period.</p>
                                </div>

                                <div className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                                    <p className="text-xs font-medium italic leading-relaxed">
                                        {stats.net_profit < 0
                                            ? "⚠ Your expenses exceed revenue. Audit your primary expenditure category immediately to restore profitability."
                                            : "✔ Your business remains profitable. Reinvest your surplus into high-velocity inventory to scale."}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-indigo-100/60 italic">Waiting for more financial data to generate briefing...</p>
                        )}
                    </div>

                    <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-indigo-200">
                        <span>Health Score</span>
                        <span>{stats.net_profit > 0 ? 'Good' : 'Critical'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color, subValue }) {
    return (
        <div className="bg-white dark:bg-white/5 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-white/10 hover:shadow-md transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-full -mr-12 -mt-12 group-hover:bg-slate-200 dark:group-hover:bg-white/10 transition-colors"></div>
            <div className="relative z-10 flex justify-between items-start mb-4">
                <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-widest font-sans">{title}</p>
                <span className="text-xl p-2 bg-slate-100 dark:bg-white/5 rounded-xl group-hover:scale-110 transition-transform">{icon}</span>
            </div>
            <p className={`text-4xl font-serif font-black ${color} relative z-10`}>{value}</p>
            {subValue && <div className="mt-2 flex items-center gap-1.5 opacity-80">{subValue}</div>}
        </div>
    );
}

export default Dashboard;
