'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvent = async () => {
      const res = await fetch('/api/event')
      if (res.ok) {
        setEvent(await res.json())
      }
      setLoading(false)
    }

    fetchEvent()
  }, [])

  const daysUntil = event ? Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-amber-50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {loading ? (
            <div className="animate-pulse">
              <div className="h-16 bg-gray-300 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-12 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <p className="text-sm uppercase tracking-widest text-amber-900 font-light mb-4">Together with their families</p>
                <h1 className="text-6xl md:text-7xl font-light text-gray-900 mb-4">
                  <span className="font-serif italic text-rose-700">{event?.couple_1}</span>
                  <span className="text-gray-500 mx-2">&</span>
                  <span className="font-serif italic text-rose-700">{event?.couple_2}</span>
                </h1>
              </div>

              <div className="mb-12">
                <p className="text-2xl text-gray-700 font-light mb-2">Request the honor of your presence</p>
                <p className="text-lg text-gray-600 font-light">at their wedding celebration</p>
              </div>

              {/* Date & Location Preview */}
              <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-2xl mx-auto">
                <div className="bg-white/80 backdrop-blur rounded-lg p-6 shadow-lg">
                  <p className="text-sm uppercase tracking-widest text-amber-900 font-light mb-2">Date</p>
                  <p className="text-2xl font-light text-gray-900 mb-1">
                    {event?.date ? new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'TBD'}
                  </p>
                  <p className="text-gray-600 font-light">{event?.time}</p>
                </div>

                <div className="bg-white/80 backdrop-blur rounded-lg p-6 shadow-lg">
                  <p className="text-sm uppercase tracking-widest text-amber-900 font-light mb-2">Location</p>
                  <p className="text-2xl font-light text-gray-900 mb-1">{event?.venue}</p>
                  <p className="text-gray-600 font-light">{event?.location}</p>
                </div>
              </div>

              {/* Countdown */}
              {daysUntil > 0 && (
                <div className="mb-12">
                  <div className="text-5xl font-light text-rose-700 mb-2">{daysUntil}</div>
                  <p className="text-gray-600">days to celebrate</p>
                </div>
              )}

              {/* CTA Button */}
              <div>
                <p className="text-sm text-gray-600 mb-6">Have you received your personal invitation link?</p>
                <Button
                  asChild
                  className="bg-rose-700 hover:bg-rose-800 text-white px-12 py-3 text-lg rounded-full font-light"
                >
                  <Link href="/admin">View Your Invitation</Link>
                </Button>
                <p className="text-xs text-gray-500 mt-4">Or check your email for your unique invitation link</p>
              </div>

              {/* Divider */}
              <div className="mt-20 pt-12 border-t border-gray-300">
                <p className="text-gray-600 font-light italic">Together with families</p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900/95 backdrop-blur text-center py-8 text-gray-400 text-sm">
        <p>A celebration of love</p>
        {event?.contact && <p className="mt-2">Contact: {event.contact}</p>}
      </footer>
    </main>
  )
}
