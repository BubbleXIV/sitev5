import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { token } = req.body

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET)
    res.status(200).json({ valid: true, admin: decoded })
  } catch (error) {
    res.status(401).json({ valid: false })
  }
}