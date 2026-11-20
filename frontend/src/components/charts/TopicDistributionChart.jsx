import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts'

const COLORS = ['#8b5cf6', '#6366f1', '#38bdf8', '#10b981', '#f59e0b', '#ec4899']

const customTooltipStyle = {
  background: '#141522',
  border: '1px solid #2d2e42',
  borderRadius: 8,
  color: '#e2e8f0',
  fontSize: 12,
  padding: '8px 12px',
}

export default function TopicDistributionChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-empty">
        <p>No topic distribution data available.</p>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 15, left: -20, bottom: 20 }}
        >
          <CartesianGrid stroke="#222336" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#8b8ea3', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-15}
            textAnchor="end"
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: '#727589', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={customTooltipStyle}
            formatter={(value) => [`${value} papers`, 'Count']}
          />
          <Bar dataKey="count" radius={[5, 5, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
