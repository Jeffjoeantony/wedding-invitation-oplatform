'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import InvitationClient from './InvitationClient'

export default function InvitePage() {
  const params = useParams()
  const token = params.token as string
  const [guest, setGuest] = useState<any>(null)
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/invite?token=${encodeURIComponent(token)}`)

      if (!res.ok) {
        setError(true)
        setLoading(false)
        return
      }

      const { guest, event } = await res.json()
      setGuest(guest)
      setEvent(event)
      setLoading(false)
    }

    if (token) {
      fetchData()
    }
  }, [token])


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-rose-50 to-amber-50">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-12 h-12 bg-rose-300 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your invitation...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !guest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-rose-50 to-amber-50">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-light text-gray-900 mb-4">Invitation not found</h1>
          <p className="text-gray-600 mb-6">We couldn&apos;t find your invitation. Please check your link and try again.</p>
          <a href="/" className="text-rose-700 hover:text-rose-800 font-light">Return home</a>
        </div>
      </div>
    )
  }

  return <InvitationClient guest={guest} event={event} />
}
