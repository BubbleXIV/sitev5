import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.NEXTAUTH_SECRET)
  } catch (error) {
    return null
  }
}

export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.NEXTAUTH_SECRET, { expiresIn: '24h' })
}

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12)
}

export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword)
}

export const getAuthenticatedUser = (req) => {
  const token = req.headers.authorization?.replace('Bearer ', '') ||
                req.cookies?.admin_token

  if (!token) return null

  return verifyToken(token)
}

export const requireAuth = (handler) => {
  return async (req, res) => {
    const user = getAuthenticatedUser(req)

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    req.user = user
    return handler(req, res)
  }
}