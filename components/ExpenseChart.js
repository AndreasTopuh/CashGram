import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const ExpenseChart = ({ data, type = 'area' }) => {
  const colors = ['#0ea5e9', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6'];

  if (type === 'area') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(value) => [`Rp ${value.toLocaleString('id-ID')}`, 'Pengeluaran']} />
          <Area type="monotone" dataKey="amount" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.6} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`Rp ${value.toLocaleString('id-ID')}`, 'Total']} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip formatter={(value) => [`Rp ${value.toLocaleString('id-ID')}`, 'Pengeluaran']} />
          <Bar dataKey="amount" fill="#0ea5e9" />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return null;
};

export default ExpenseChart;