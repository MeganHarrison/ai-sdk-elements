'use client'

import { useCurrentUserImage } from '@/hooks/use-current-user-image'
import { useCurrentUserName } from '@/hooks/use-current-user-name'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export const CurrentUserAvatar = () => {
  const profileImage = useCurrentUserImage()
  const name = useCurrentUserName()
  const initials = name
    ?.split(' ')
    ?.map((word) => word[0])
    ?.join('')
    ?.toUpperCase()
    ?.slice(0, 2)

  return (
    <Avatar>
      <AvatarImage 
        src={profileImage || "/logos/Alleato Favicon.png"} 
        alt={name || "User"} 
      />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
}
