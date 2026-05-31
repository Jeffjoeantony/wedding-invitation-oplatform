'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Step = 'view' | 'rsvp-yes' | 'rsvp-no' | 'confirmed'

interface AttendingMember {
  name: string
  type: 'Adult' | 'Child'
}

export default function InvitationClient({ guest, event }: any) {
  const [step, setStep] = useState<Step>('view')
  const [paxCount, setPaxCount] = useState<number>(1)
  const [attendingMembers, setAttendingMembers] = useState<AttendingMember[]>([{ name: guest.name, type: 'Adult' }])
  const [submitting, setSubmitting] = useState(false)
  const [rsvpResponse, setRsvpResponse] = useState<'yes' | 'no' | null>(null)

  const handleRsvp = async (response: 'yes' | 'no') => {
    if (response === 'yes') {
      setRsvpResponse('yes')
      setStep('rsvp-yes')
    } else {
      setRsvpResponse('no')
      submitRsvp('no', 0, [])
    }
  }

  const submitRsvp = async (status: string, count: number, members: AttendingMember[]) => {
    setSubmitting(true)

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: guest.unique_token,
          status,
          pax_count: count,
          attending_members: members,
        }),
      })

      if (!res.ok) {
        alert('Error submitting RSVP. Please try again.')
      } else {
        setStep('confirmed')
      }
    } catch (err) {
      alert('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmYes = () => {
    submitRsvp('yes', paxCount, attendingMembers)
  }

  const daysUntil = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-amber-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header with couple names */}
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-widest text-amber-900 font-light mb-4">Cordially invited</p>
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-2">
            Dear <span className="font-serif italic text-rose-700">{guest.name}</span>
          </h2>
        </div>

        {step === 'view' && (
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-2xl p-12 max-w-xl mx-auto">
            {/* Invitation Content */}
            <div className="text-center space-y-8">
              <div>
                <h1 className="text-5xl font-light text-gray-900 mb-6">
                  <span className="font-serif italic text-rose-700">{event?.couple_1}</span>
                  <span className="block text-2xl text-gray-500 my-4">&</span>
                  <span className="font-serif italic text-rose-700">{event?.couple_2}</span>
                </h1>
              </div>

              <p className="text-gray-700 font-light leading-relaxed">
                Together with their families request the honor of your presence at their wedding celebration
              </p>

              <div className="border-t border-b border-gray-200 py-8 space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-amber-900 font-light mb-2">Date & Time</p>
                  <p className="text-2xl font-light text-gray-900">
                    {new Date(event?.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-gray-600 font-light">{event?.time}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-amber-900 font-light mb-2">Venue</p>
                  <p className="text-2xl font-light text-gray-900">{event?.venue}</p>
                  <p className="text-gray-600 font-light">{event?.location}</p>
                </div>
              </div>

              {daysUntil > 0 && (
                <div className="bg-rose-50 rounded-lg p-6">
                  <p className="text-4xl font-light text-rose-700 mb-1">{daysUntil}</p>
                  <p className="text-gray-600 font-light">days to celebrate</p>
                </div>
              )}

              <div className="space-y-4 pt-4">
                <Button
                  onClick={() => handleRsvp('yes')}
                  className="w-full bg-rose-700 hover:bg-rose-800 text-white py-3 rounded-lg font-light text-lg"
                >
                  Accept with Pleasure
                </Button>
                <Button
                  onClick={() => handleRsvp('no')}
                  variant="outline"
                  className="w-full border-gray-300 text-gray-900 py-3 rounded-lg font-light text-lg"
                >
                  Regretfully Decline
                </Button>
              </div>

              {event?.contact && (
                <p className="text-sm text-gray-600 font-light">
                  Questions? Contact us at{' '}
                  <a href={`tel:${event.contact}`} className="text-rose-700 hover:text-rose-800">
                    {event.contact}
                  </a>
                </p>
              )}
            </div>
          </div>
        )}

        {step === 'rsvp-yes' && (
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-2xl p-12 max-w-xl mx-auto">
            <div className="text-center space-y-8">
              <h3 className="text-3xl font-light text-gray-900">How many will be attending?</h3>

              <div className="space-y-6">
                <div>
                  <Label className="text-gray-700 font-light mb-4 block">Total guests (including yourself)</Label>
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      onClick={() => setPaxCount(Math.max(1, paxCount - 1))}
                      variant="outline"
                      className="w-12 h-12 rounded-full"
                    >
                      −
                    </Button>
                    <span className="text-4xl font-light text-rose-700 w-12 text-center">{paxCount}</span>
                    <Button
                      onClick={() => setPaxCount(paxCount + 1)}
                      variant="outline"
                      className="w-12 h-12 rounded-full"
                    >
                      +
                    </Button>
                  </div>
                </div>

                {paxCount > 1 && (
                  <div className="bg-amber-50 rounded-lg p-6 space-y-4">
                    <p className="text-sm text-gray-700 font-light">Guest names (optional)</p>
                    {Array.from({ length: paxCount - 1 }).map((_, i) => (
                      <Input
                        key={i}
                        placeholder={`Guest ${i + 2}`}
                        className="bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                        onChange={(e) => {
                          const newMembers = [...attendingMembers]
                          if (!newMembers[i + 1]) {
                            newMembers[i + 1] = { name: '', type: 'Adult' }
                          }
                          newMembers[i + 1].name = e.target.value
                          setAttendingMembers(newMembers)
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-4">
                <Button
                  onClick={handleConfirmYes}
                  disabled={submitting}
                  className="w-full bg-rose-700 hover:bg-rose-800 text-white py-3 rounded-lg font-light text-lg"
                >
                  {submitting ? 'Confirming...' : 'Confirm Attendance'}
                </Button>
                <Button
                  onClick={() => setStep('view')}
                  variant="outline"
                  className="w-full border-gray-300 text-gray-900 py-3 rounded-lg font-light"
                  disabled={submitting}
                >
                  Back
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'confirmed' && (
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-2xl p-12 max-w-xl mx-auto text-center space-y-8">
            <div>
              <div className="text-6xl mb-4">✓</div>
              <h3 className="text-3xl font-light text-gray-900 mb-2">
                {rsvpResponse === 'yes' ? "We Can't Wait!" : 'Thank You'}
              </h3>
              <p className="text-gray-600 font-light">
                {rsvpResponse === 'yes'
                  ? 'Your RSVP has been confirmed. We look forward to celebrating with you!'
                  : 'We appreciate you letting us know. Thank you for your response.'}
              </p>
            </div>

            {rsvpResponse === 'yes' && (
              <div className="bg-rose-50 rounded-lg p-6 space-y-3">
                <p className="text-sm text-gray-700 font-light">You will be attending with</p>
                <p className="text-3xl font-light text-rose-700">{paxCount} {paxCount === 1 ? 'guest' : 'guests'}</p>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6 space-y-2">
              <p className="text-sm uppercase tracking-widest text-amber-900 font-light mb-3">Event Details</p>
              <p className="text-gray-900 font-light">
                {new Date(event?.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {event?.time}
              </p>
              <p className="text-gray-600 font-light">{event?.venue}, {event?.location}</p>
              {event?.maps_url && (
                <a href={event.maps_url} target="_blank" rel="noopener noreferrer" className="text-rose-700 hover:text-rose-800 text-sm font-light inline-block mt-2">
                  View on Maps →
                </a>
              )}
            </div>

            {event?.contact && (
              <p className="text-sm text-gray-600 font-light">
                Questions? {' '}
                <a href={`tel:${event.contact}`} className="text-rose-700 hover:text-rose-800">
                  Contact us
                </a>
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
