import { prisma } from '../../lib/prisma'

type Direction = 'improving' | 'declining' | 'stable' | 'no_data'
type Severity = 'info' | 'warning' | 'critical'

export interface MetricTrend {
  metric: 'mood' | 'bpSystolic' | 'bpDiastolic' | 'spo2' | 'weightKg'
  label: string
  direction: Direction
  severity: Severity
  previousAvg: number | null
  currentAvg: number | null
  delta: number | null
  message: string
}

export interface TrendReport {
  elderId: string
  windowDays: number
  logsConsidered: number
  generatedAt: string
  trends: MetricTrend[]
  concerns: MetricTrend[]
}

const avg = (nums: number[]) =>
  nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null

const classify = (
  metric: MetricTrend['metric'],
  previous: number | null,
  current: number | null,
): { direction: Direction; severity: Severity; message: string } => {
  if (previous === null || current === null) {
    return {
      direction: 'no_data',
      severity: 'info',
      message: 'Not enough recent data to assess trend.',
    }
  }

  const delta = current - previous

  switch (metric) {
    case 'mood': {
      if (delta <= -2) {
        return {
          direction: 'declining',
          severity: 'warning',
          message: `Mood has declined noticeably (avg ${previous.toFixed(1)} → ${current.toFixed(1)}).`,
        }
      }
      if (delta >= 1) {
        return {
          direction: 'improving',
          severity: 'info',
          message: `Mood is trending up (avg ${previous.toFixed(1)} → ${current.toFixed(1)}).`,
        }
      }
      return {
        direction: 'stable',
        severity: 'info',
        message: `Mood is stable around ${current.toFixed(1)}/10.`,
      }
    }

    case 'bpSystolic': {
      if (current >= 160 || delta >= 15) {
        return {
          direction: 'declining',
          severity: 'critical',
          message: `Systolic BP is high (${previous.toFixed(0)} → ${current.toFixed(0)}).`,
        }
      }
      if (delta >= 8) {
        return {
          direction: 'declining',
          severity: 'warning',
          message: `Systolic BP is creeping up (${previous.toFixed(0)} → ${current.toFixed(0)}).`,
        }
      }
      if (delta <= -8) {
        return {
          direction: 'improving',
          severity: 'info',
          message: `Systolic BP has come down (${previous.toFixed(0)} → ${current.toFixed(0)}).`,
        }
      }
      return {
        direction: 'stable',
        severity: 'info',
        message: `Systolic BP stable around ${current.toFixed(0)}.`,
      }
    }

    case 'bpDiastolic': {
      if (current >= 100 || delta >= 10) {
        return {
          direction: 'declining',
          severity: 'critical',
          message: `Diastolic BP is high (${previous.toFixed(0)} → ${current.toFixed(0)}).`,
        }
      }
      if (delta >= 5) {
        return {
          direction: 'declining',
          severity: 'warning',
          message: `Diastolic BP is trending up (${previous.toFixed(0)} → ${current.toFixed(0)}).`,
        }
      }
      return {
        direction: 'stable',
        severity: 'info',
        message: `Diastolic BP stable around ${current.toFixed(0)}.`,
      }
    }

    case 'spo2': {
      if (current < 92) {
        return {
          direction: 'declining',
          severity: 'critical',
          message: `SpO₂ has dropped into concerning territory (${current.toFixed(0)}%).`,
        }
      }
      if (delta <= -2) {
        return {
          direction: 'declining',
          severity: 'warning',
          message: `SpO₂ is trending down (${previous.toFixed(0)}% → ${current.toFixed(0)}%).`,
        }
      }
      return {
        direction: 'stable',
        severity: 'info',
        message: `SpO₂ stable around ${current.toFixed(0)}%.`,
      }
    }

    case 'weightKg': {
      const pctChange = (delta / previous) * 100
      if (pctChange <= -3) {
        return {
          direction: 'declining',
          severity: 'warning',
          message: `Weight dropped ${Math.abs(pctChange).toFixed(1)}% (${previous.toFixed(1)}kg → ${current.toFixed(1)}kg).`,
        }
      }
      if (pctChange >= 3) {
        return {
          direction: 'declining',
          severity: 'info',
          message: `Weight up ${pctChange.toFixed(1)}% (${previous.toFixed(1)}kg → ${current.toFixed(1)}kg).`,
        }
      }
      return {
        direction: 'stable',
        severity: 'info',
        message: `Weight stable around ${current.toFixed(1)}kg.`,
      }
    }
  }
}

export const analyzeTrends = async (
  elderId: string,
  windowDays = 14,
): Promise<TrendReport> => {
  const now = Date.now()
  const windowStart = new Date(now - windowDays * 24 * 60 * 60 * 1000)
  const midpoint = new Date(now - (windowDays / 2) * 24 * 60 * 60 * 1000)

  const logs = await prisma.healthLog.findMany({
    where: { elderId, loggedAt: { gte: windowStart } },
    orderBy: { loggedAt: 'asc' },
  })

  const previous = logs.filter((l) => l.loggedAt < midpoint)
  const current = logs.filter((l) => l.loggedAt >= midpoint)

  const metricConfigs: Array<{
    metric: MetricTrend['metric']
    label: string
    pick: (l: (typeof logs)[number]) => number | null
  }> = [
    { metric: 'mood', label: 'Mood', pick: (l) => l.moodScore ?? null },
    {
      metric: 'bpSystolic',
      label: 'Systolic BP',
      pick: (l) => l.bpSystolic ?? null,
    },
    {
      metric: 'bpDiastolic',
      label: 'Diastolic BP',
      pick: (l) => l.bpDiastolic ?? null,
    },
    { metric: 'spo2', label: 'SpO₂', pick: (l) => l.spo2 ?? null },
    { metric: 'weightKg', label: 'Weight', pick: (l) => l.weightKg ?? null },
  ]

  const trends: MetricTrend[] = metricConfigs.map(({ metric, label, pick }) => {
    const prevVals = previous.map(pick).filter((v): v is number => v !== null)
    const currVals = current.map(pick).filter((v): v is number => v !== null)
    const previousAvg = avg(prevVals)
    const currentAvg = avg(currVals)
    const { direction, severity, message } = classify(
      metric,
      previousAvg,
      currentAvg,
    )
    return {
      metric,
      label,
      direction,
      severity,
      previousAvg:
        previousAvg !== null ? Math.round(previousAvg * 10) / 10 : null,
      currentAvg: currentAvg !== null ? Math.round(currentAvg * 10) / 10 : null,
      delta:
        previousAvg !== null && currentAvg !== null
          ? Math.round((currentAvg - previousAvg) * 10) / 10
          : null,
      message,
    }
  })

  const concerns = trends.filter(
    (t) => t.severity === 'warning' || t.severity === 'critical',
  )

  return {
    elderId,
    windowDays,
    logsConsidered: logs.length,
    generatedAt: new Date().toISOString(),
    trends,
    concerns,
  }
}
