// Mock AI analysis endpoint
export default function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { expenses } = req.body;
      
      // Mock AI analysis (will be replaced with real Gemini AI later)
      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const categories = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {});
      
      const topCategory = Object.entries(categories)
        .sort(([,a], [,b]) => b - a)[0];
      
      const analysis = {
        summary: `Analisis Pengeluaran Bulan Ini`,
        insights: [
          `Total pengeluaran: Rp ${totalExpenses.toLocaleString('id-ID')}`,
          `Kategori terbesar: ${topCategory?.[0]} (Rp ${topCategory?.[1]?.toLocaleString('id-ID')})`,
          `Total transaksi: ${expenses.length} kali`,
          `Rata-rata per transaksi: Rp ${Math.round(totalExpenses / expenses.length).toLocaleString('id-ID')}`,
        ],
        recommendations: [
          `Pertimbangkan untuk mengurangi pengeluaran di kategori ${topCategory?.[0]}`,
          'Buat budget bulanan untuk mengontrol pengeluaran',
          'Catat setiap pengeluaran untuk tracking yang lebih baik',
          'Review pengeluaran setiap minggu untuk evaluasi'
        ],
        budgetSuggestion: Math.ceil(totalExpenses * 0.8 / 100000) * 100000
      };

      res.status(200).json({
        analysis,
        success: true
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to analyze expenses',
        success: false 
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}