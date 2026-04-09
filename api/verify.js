import jwt from 'jsonwebtoken'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { token } = req.body || {}
  const secret = process.env.ADMIN_SECRET

  if (!secret) {
    return res.status(500).json({ error: 'Server misconfigured' })
  }

  if (!token) {
    return res.status(401).json({ valid: false })
  }

  try {
    jwt.verify(token, secret)
    return res.status(200).json({ valid: true })
  } catch {
    return res.status(401).json({ valid: false })
  }
}
