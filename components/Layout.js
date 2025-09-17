import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="text-2xl">💰</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CashGram</h1>
                <p className="text-xs text-gray-500">Expense Tracker Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {new Date().toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                U
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>© 2025 CashGram. Powered by Next.js & Vercel</p>
            <p className="mt-1">Track your expenses with Telegram Bot</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;