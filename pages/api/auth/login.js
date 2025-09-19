import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { username, password } = req.body

  try {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single()

    if (error || !admin) {
      return res.status(401).json({ message: 'User not found' })
    }

    // Temporary plain text comparison
    if (password !== admin.password_hash) {
      return res.status(401).json({ message: 'Wrong password' })
    }

    res.status(200).json({ 
      token: `admin_${admin.id}`, 
      admin: { id: admin.id, username: admin.username } 
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}
