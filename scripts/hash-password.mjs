import { createHash } from 'node:crypto'

const password = process.argv.slice(2).join(' ')

if (!password) {
  console.error('Usage: npm run hash -- "your password"')
  process.exit(1)
}

console.log(createHash('sha256').update(password).digest('hex'))
