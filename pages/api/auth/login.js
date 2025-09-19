import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { username, password } = req.body

try {
  console.log('API: Received login attempt for:', username)
  
  const { data: admin, error } = await supabase
    .from('admins')
    .select('*')
    .eq('username', username)
    .single()

  console.log('API: Found admin:', admin ? 'YES' : 'NO', error)

  if (error || !admin) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  console.log('API: Comparing passwords...')
  const isValidPassword = await bcrypt.compare(password, admin.password_hash)
  console.log('API: Password valid:', isValidPassword)
  
  if (!isValidPassword) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

    const token = jwt.sign(
      { adminId: admin.id, username: admin.username },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: '24h' }
    )

    res.status(200).json({ token, admin: { id: admin.id, username: admin.username } })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
