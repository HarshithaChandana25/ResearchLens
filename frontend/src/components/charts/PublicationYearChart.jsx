import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

const customTooltipStyle = {
  background: '#141522',
  border: '1px solid #2d2e42',
  borderRadius: 8,
  color: '#e2e8f0',
  fontSize: 12,
  padding: '8px 12px',
}

export default function PublicationYearChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-empty">
        <p>No publication year data available.</p>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 15, left: -20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="yearGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#222336" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#8b8ea3', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: '#727589', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={customTooltipStyle}
            formatter={(value) => [`${value} papers`, 'Published']}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#a78bfa"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#yearGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
