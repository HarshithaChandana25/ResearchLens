import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const chartStyle = {
  background: '#171827',
  border: '1px solid #34344a',
  borderRadius: 10,
  color: '#fff',
}

function TrendChart({ title, subtitle, data, dataKey, emptyMessage }) {
  return (
    <section className="panel trend-chart-panel">
      <div className="panel-title">
        <div><h3>{title}</h3><p>{subtitle}</p></div>
      </div>
      {data.length ? (
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 12, left: -20, bottom: 8 }}>
              <CartesianGrid stroke="#242538" vertical={false}/>
              <XAxis dataKey="name" tick={{ fill: '#9294aa', fontSize: 10 }} axisLine={false} tickLine={false}/>
              <YAxis allowDecimals={false} tick={{ fill: '#777b95', fontSize: 10 }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={chartStyle}/>
              <Bar dataKey={dataKey} fill="#9a72ff" radius={[4, 4, 0, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : <div className="trend-empty">{emptyMessage}</div>}
    </section>
  )
}

export default function ResearchTrends({ papers }) {
  const publishedPapers = papers.filter(paper => paper.venue !== 'Demo collection')
  const publicationsByYear = Object.entries(publishedPapers.reduce((counts, paper) => {
    counts[paper.year] = (counts[paper.year] ?? 0) + 1
    return counts
  }, {})).map(([name, count]) => ({ name, count })).sort((a, b) => Number(a.name) - Number(b.name))
  const topics = Object.entries(publishedPapers.reduce((counts, paper) => {
    counts[paper.topic] = (counts[paper.topic] ?? 0) + 1
    return counts
  }, {})).map(([name, count]) => ({ name, count }))
  const methods = Object.entries(publishedPapers.reduce((counts, paper) => {
    for (const method of paper.methods ?? []) counts[method] = (counts[method] ?? 0) + 1
    return counts
  }, {})).map(([name, count]) => ({ name, count }))
  const datasets = Object.entries(publishedPapers.reduce((counts, paper) => {
    for (const dataset of paper.datasets ?? []) counts[dataset] = (counts[dataset] ?? 0) + 1
    return counts
  }, {})).map(([name, count]) => ({ name, count }))

  return (
    <section className="research-trends">
      <div className="trends-heading">
        <div><h2>Research trends</h2><p>Computed from the local sample-paper metadata, not live research analytics.</p></div>
        <span className="sample-tag">SAMPLE DATA</span>
      </div>
      <div className="trend-chart-grid">
        <TrendChart title="Publications by year" subtitle="Sample collection records" data={publicationsByYear} dataKey="count" emptyMessage="No publication year metadata available."/>
        <TrendChart title="Research topic distribution" subtitle="Sample collection records" data={topics} dataKey="count" emptyMessage="No topic metadata available."/>
        <TrendChart title="Frequently used methods" subtitle="Explicit method metadata only" data={methods} dataKey="count" emptyMessage="No methods are recorded in the available paper metadata."/>
        <TrendChart title="Dataset distribution" subtitle="Explicit dataset metadata only" data={datasets} dataKey="count" emptyMessage="No datasets are recorded in the available paper metadata."/>
      </div>
    </section>
  )
}
