import Head from 'next/head';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import ExpenseChart from '../components/ExpenseChart';
import ExpenseList from '../components/ExpenseList';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/expenses');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAIAnalysis = async () => {
    if (!data?.expenses) return;
    
    setLoadingAnalysis(true);
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expenses: data.expenses }),
      });
      const result = await response.json();
      setAnalysis(result.analysis);
    } catch (error) {
      console.error('Error getting AI analysis:', error);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>CashGram Dashboard - Expense Tracker</title>
        <meta name="description" content="Track your expenses with CashGram Telegram Bot" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">Ringkasan pengeluaran dan analisis keuangan Anda</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={getAIAnalysis}
              disabled={loadingAnalysis}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loadingAnalysis ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menganalisis...
                </>
              ) : (
                <>
                  🤖 Analisis AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Pengeluaran"
            value={`Rp ${data?.stats?.total?.toLocaleString('id-ID') || 0}`}
            icon={<span className="text-2xl">💰</span>}
            color="blue"
            trend={data?.stats?.trend}
            trendValue={`${data?.stats?.monthlyChange?.toFixed(1)}%`}
          />
          <StatCard
            title="Total Transaksi"
            value={data?.stats?.transactions || 0}
            icon={<span className="text-2xl">📊</span>}
            color="green"
          />
          <StatCard
            title="Rata-rata Harian"
            value={`Rp ${Math.round(data?.stats?.avgDaily || 0).toLocaleString('id-ID')}`}
            icon={<span className="text-2xl">📈</span>}
            color="yellow"
          />
          <StatCard
            title="Kategori Aktif"
            value={data?.stats?.categories || 0}
            icon={<span className="text-2xl">🏷️</span>}
            color="purple"
          />
        </div>

        {/* AI Analysis */}
        {analysis && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 {analysis.summary}</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">💡 Insight Keuangan</h4>
                <ul className="space-y-2">
                  {analysis.insights?.map((insight, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">💰 Rekomendasi</h4>
                <ul className="space-y-2">
                  {analysis.recommendations?.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    💡 Budget Saran: Rp {analysis.budgetSuggestion?.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Tren Pengeluaran Harian</h3>
            <ExpenseChart data={data?.chartData?.daily || []} type="area" />
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🍕 Pengeluaran per Kategori</h3>
            <ExpenseChart data={data?.chartData?.category || []} type="pie" />
          </div>
        </div>

        {/* Category Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Perbandingan Kategori</h3>
          <ExpenseChart data={data?.chartData?.categoryBar || []} type="bar" />
        </div>

        {/* Recent Expenses */}
        <ExpenseList expenses={data?.expenses?.slice(0, 10) || []} />

        {/* Quick Stats */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg text-white p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">🚀 Mulai Track Pengeluaran</h3>
            <p className="text-blue-100 mb-6">
              Kirim pesan ke Telegram Bot untuk mencatat pengeluaran otomatis
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                <p className="text-sm opacity-90">Contoh pesan:</p>
                <p className="font-mono text-lg">"Makan siang Rp 50.000"</p>
              </div>
              <div className="text-2xl">→</div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                <p className="text-sm opacity-90">Otomatis tersimpan!</p>
                <p className="font-mono text-lg">✅ Data masuk dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}