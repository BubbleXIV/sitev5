import { supabase } from '@/lib/supabase'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  console.log('Login attempt started')
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { username, password } = req.body
  console.log('Username received:', username)
  console.log('Password received:', password)

  try {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single()

    console.log('Database query result:', admin ? 'Found user' : 'No user found')
    console.log('Database error:', error)

    if (error || !admin) {
      console.log('Returning 401: User not found')
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    console.log('Stored hash:', admin.password_hash)
    
    // Create hash of provided password
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex')
    console.log('Computed hash:', passwordHash)
    
    if (passwordHash !== admin.password_hash) {
      console.log('Returning 401: Hash mismatch')
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin.id, 
        username: admin.username,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
      },
      process.env.NEXTAUTH_SECRET
    )

    console.log('Login successful')
    res.status(200).json({ 
      token, 
      admin: { id: admin.id, username: admin.username } 
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
