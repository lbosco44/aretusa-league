import jwt from 'jsonwebtoken'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { password } = req.body || {}
  const adminPassword = process.env.ADMIN_PASSWORD
  const secret = process.env.ADMIN_SECRET

  if (!adminPassword || !secret) {
    return res.status(500).json({ error: 'Server misconfigured' })
  }

  if (password !== adminPassword) {
    return res.status(401).json({ error: 'Password errata' })
  }

  const token = jwt.sign({ role: 'admin' }, secret, { expiresIn: '24h' })
  return res.status(200).json({ token })
}
