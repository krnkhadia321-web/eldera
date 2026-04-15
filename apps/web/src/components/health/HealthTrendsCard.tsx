import React, { useEffect, useState } from 'react'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import api from '../../lib/api'

interface MetricTrend {
  metric: string
  label: string
  direction: 'improving' | 'declining' | 'stable' | 'no_data'
  severity: 'info' | 'warning' | 'critical'
  previousAvg: number | null
  currentAvg: number | null
  delta: number | null
  message: string
}

interface TrendReport {
  elderId: string
  windowDays: number
  logsConsidered: number
  generatedAt: string
  trends: MetricTrend[]
  concerns: MetricTrend[]
}

interface Props {
  elderId: string
  className?: string
}

const severityVariant = (
  s: MetricTrend['severity']
): 'green' | 'yellow' | 'red' | 'gray' => {
  if (s === 'critical') return 'red'
  if (s === 'warning') return 'yellow'
  return 'gray'
}

const directionIcon = (d: MetricTrend['direction']) => {
  if (d === 'declining') return '📉'
  if (d === 'improving') return '📈'
  if (d === 'stable') return '➡️'
  return '❔'
}

const deltaStr = (t: MetricTrend) => {
  if (t.delta === null) return ''
  const sign = t.delta > 0 ? '+' : ''
  return ` (${sign}${t.delta})`
}

export const HealthTrendsCard: React.FC<Props> = ({ elderId, className }) => {
  const [report, setReport] = useState<TrendReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/ai/trends/${elderId}?days=14`)
        setReport(res.data.data)
      } catch (err) {
        setError('Could not load health trends')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [elderId])

  if (loading) {
    return (
      <Card className={className}>
        <h4 className="font-semibold text-gray-900 mb-3">Health Trends 🧠</h4>
        <p className="text-sm text-gray-400">Analyzing recent logs…</p>
      </Card>
    )
  }

  if (error || !report) {
    return (
      <Card className={className}>
        <h4 className="font-semibold text-gray-900 mb-3">Health Trends 🧠</h4>
        <p className="text-sm text-gray-400">{error ?? 'No data'}</p>
      </Card>
    )
  }

  if (report.logsConsidered < 2) {
    return (
      <Card className={className}>
        <h4 className="font-semibold text-gray-900 mb-3">Health Trends 🧠</h4>
        <p className="text-sm text-gray-400">
          Not enough health logs yet. Add a few daily logs to see trends.
        </p>
      </Card>
    )
  }

  const hasConcerns = report.concerns.length > 0

  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">Health Trends 🧠</h4>
        <span className="text-xs text-gray-400">
          Last {report.windowDays} days · {report.logsConsidered} logs
        </span>
      </div>

      {hasConcerns && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-3">
          <p className="text-xs font-medium text-red-700 mb-2">
            {report.concerns.length} concern
            {report.concerns.length === 1 ? '' : 's'} detected
          </p>
          <div className="space-y-1">
            {report.concerns.map((c) => (
              <div key={c.metric} className="flex items-center gap-2">
                <span>{directionIcon(c.direction)}</span>
                <p className="text-sm text-red-800 flex-1">{c.message}</p>
                <Badge label={c.severity} variant={severityVariant(c.severity)} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {report.trends.map((t) => (
          <div
            key={t.metric}
            className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
          >
            <div className="flex items-center gap-2">
              <span>{directionIcon(t.direction)}</span>
              <p className="text-sm font-medium text-gray-900">{t.label}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {t.currentAvg ?? '—'}
                {deltaStr(t)}
              </span>
              <Badge label={t.direction} variant={severityVariant(t.severity)} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
