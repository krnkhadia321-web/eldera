import 'dotenv/config'
import { prisma } from './prisma'
import { runTrendAlerts } from '../modules/ai/trends.cron'

async function main() {
  await runTrendAlerts()
  await prisma.$disconnect()
}

main()
