import { hashAdminPassword } from '../server/adminAuth.js'

const password = process.argv.slice(2).join(' ')

if (!password) {
  console.error('Usage: npm run hash -- "your password"')
  process.exit(1)
}

if (password.length < 12) {
  console.error('Use at least 12 characters for the admin password.')
  process.exit(1)
}

console.log(hashAdminPassword(password))
