import 'dotenv/config'
import { prisma } from './prisma'
import { runWeeklyDigest } from '../modules/ai/digest.cron'

async function main() {
  await runWeeklyDigest()
  await prisma.$disconnect()
}

main()
