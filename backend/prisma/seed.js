import 'dotenv/config'
import { prisma } from '../src/features/prisma/client.js'

async function main() {
  // --- Moduler ---
  const modules = [
    { name: 'Authentication', description: 'Login, Signup, Password reset' },
    { name: 'API', description: 'Backend endpoints' },
    { name: 'Frontend', description: 'UI components, dashboards' },
    { name: 'Database', description: 'Models and storage' },
    { name: 'Payments', description: 'Billing, subscriptions' },
    { name: 'Notifications', description: 'Email, SMS, push' },
    { name: 'Admin', description: 'Admin panel' },
    { name: 'DevOps', description: 'CI/CD and deployment scripts' },
    { name: 'Testing', description: 'Unit tests, Integration tests' },
    { name: 'Analytics', description: 'Metrics, dashboards' },
  ]

  for (const m of modules) {
    await prisma.module.upsert({
      where: { name: m.name },
      update: {},
      create: m,
    })
  }
  console.log('Seeded modules ✅')

  // --- Programmeringsspråk ---
  const languages = [
    { name: 'C' },
    { name: 'C++' },
    { name: 'JavaScript' },
    { name: 'TypeScript' },
    { name: 'Python' },
    { name: 'Java' },
    { name: 'C#' },
    { name: 'Go' },
    { name: 'Ruby' },
    { name: 'PHP' },
    { name: 'Rust' },
    { name: 'Kotlin' },
  ]

  for (const lang of languages) {
    await prisma.programmingLanguage.upsert({
      where: { name: lang.name },
      update: {},
      create: lang,
    })
  }
  console.log('Seeded programming languages ✅')

  // --- Rammeverk ---
  const frameworks = [
    { name: 'React' },
    { name: 'Vue' },
    { name: 'Angular' },
    { name: 'Express' },
    { name: 'Django' },
    { name: 'Rails' },
    { name: 'Spring' },
    { name: '.NET' },
    { name: 'Blazor' },
  ]

  for (const f of frameworks) {
    await prisma.framework.upsert({
      where: { name: f.name },
      update: {},
      create: f,
    })
  }
  console.log('Seeded frameworks ✅')

  // --- Biblioteker ---
  const libraries = [
    { name: 'Lodash' },
    { name: 'Axios' },
    { name: 'Jest' },
    { name: 'React Router' },
    { name: 'Tailwind CSS' },
    { name: 'Bootstrap' },
    { name: 'Moment.js' },
  ]

  for (const lib of libraries) {
    await prisma.library.upsert({
      where: { name: lib.name },
      update: {},
      create: lib,
    })
  }
  console.log('Seeded libraries ✅')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })