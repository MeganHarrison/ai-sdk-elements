import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

interface CurrentUser {
  name: string
  email: string
  avatar: string | null
}

export const useCurrentUser = (): CurrentUser | null => {
  const [user, setUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await createClient().auth.getSession()
      if (error || !data.session) {
        console.error('Error fetching user session:', error)
        return
      }

      const { user: sessionUser } = data.session
      
      setUser({
        name: sessionUser.user_metadata.full_name || sessionUser.email?.split('@')[0] || 'User',
        email: sessionUser.email || '',
        avatar: sessionUser.user_metadata.avatar_url || null
      })
    }

    fetchUser()
  }, [])

  return user
}