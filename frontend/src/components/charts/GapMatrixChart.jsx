import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
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

export default function GapMatrixChart({ data = [] }) {
  if (!data || data.length === 0) return null

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 15, right: 20, left: -10, bottom: 25 }}
        >
          <CartesianGrid stroke="#222336" vertical={false} />
          <XAxis
            dataKey="topic"
            tick={{ fill: '#8b8ea3', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-15}
            textAnchor="end"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#727589', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            unit="%"
          />
          <Tooltip
            contentStyle={customTooltipStyle}
            formatter={(value, name) => [`${value}%`, name === 'studied' ? 'Literature Saturation' : 'Unaddressed Gap Severity']}
          />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ paddingBottom: 10, fontSize: 11 }}
            formatter={(val) => val === 'studied' ? 'Current Literature Saturation' : 'Unexplored Gap Severity'}
          />
          <Bar
            dataKey="studied"
            name="studied"
            fill="#6366f1"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="gap"
            name="gap"
            fill="#ec4899"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
