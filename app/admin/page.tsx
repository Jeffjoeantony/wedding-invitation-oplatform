'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface Guest {
  id: string
  name: string
  phone?: string
  email?: string
  unique_token: string
  rsvp_status: 'pending' | 'yes' | 'no'
  pax_count: number
  guest_category?: string
  opened_at?: string
  responded_at?: string
}

interface Event {
  id: number
  couple_1: string
  couple_2: string
  date: string
  time: string
  venue: string
  location: string
  contact: string
  maps_url?: string
}

export default function AdminPage() {
  const [admin, setAdmin] = useState(false)
  const [password, setPassword] = useState('')
  const [guests, setGuests] = useState<Guest[]>([])
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'yes' | 'no'>('all')
  const [newGuestName, setNewGuestName] = useState('')
  const [newGuestPhone, setNewGuestPhone] = useState('')
  const [newGuestCategory, setNewGuestCategory] = useState('Friends')
  const [adding, setAdding] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchData = useCallback(async () => {
    setRefreshing(true)
    const [guestRes, eventRes] = await Promise.all([
      fetch('/api/guests'),
      fetch('/api/event'),
    ])

    if (guestRes.ok) setGuests(await guestRes.json())
    if (eventRes.ok) setEvent(await eventRes.json())
    setLoading(false)
    setRefreshing(false)
    setLastUpdated(new Date())
  }, [])

  // Restore login from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('wedding_admin')
    if (saved === 'true') {
      setAdmin(true)
    } else {
      setLoading(false)
    }
  }, [])

  // Start auto-refresh when logged in, stop when logged out
  useEffect(() => {
    if (admin) {
      fetchData()
      intervalRef.current = setInterval(fetchData, 30_000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [admin, fetchData])

  // Admin password check
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'wedding123') {
      sessionStorage.setItem('wedding_admin', 'true')
      setAdmin(true)
      setPassword('')
    } else {
      alert('Incorrect password')
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('wedding_admin')
    setAdmin(false)
    setGuests([])
    setEvent(null)
  }


  const addGuest = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true)

    const res = await fetch('/api/guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newGuestName,
        phone: newGuestPhone || null,
        guest_category: newGuestCategory,
      }),
    })

    if (!res.ok) {
      alert('Error adding guest')
    } else {
      const data = await res.json()
      setGuests([data, ...guests])
      setNewGuestName('')
      setNewGuestPhone('')
    }
    setAdding(false)
  }

  const updateEvent = async (updates: Partial<Event>) => {
    await fetch('/api/event', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    setEvent({ ...event!, ...updates })
  }

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-amber-50 via-rose-50 to-amber-50">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>Wedding Management Portal</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <Label htmlFor="password">Admin Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="mt-2"
                  />
                </div>
                <Button type="submit" className="w-full bg-rose-700 hover:bg-rose-800 text-white">
                  Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const filteredGuests = guests.filter(g => filter === 'all' || g.rsvp_status === filter)
  const stats = {
    total: guests.length,
    pending: guests.filter(g => g.rsvp_status === 'pending').length,
    confirmed: guests.filter(g => g.rsvp_status === 'yes').length,
    declined: guests.filter(g => g.rsvp_status === 'no').length,
    totalPax: guests.filter(g => g.rsvp_status === 'yes').reduce((sum, g) => sum + g.pax_count, 0),
    opened: guests.filter(g => g.opened_at).length,
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-amber-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-light text-gray-900">Wedding Dashboard</h1>
            <p className="text-gray-600 font-light mt-2">Manage your invitations and RSVPs</p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-gray-500 hidden sm:block">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button
              onClick={fetchData}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="text-gray-700 border-gray-300"
            >
              {refreshing ? '↻ Refreshing...' : '↻ Refresh'}
            </Button>
            <Button onClick={handleLogout} variant="outline" className="text-gray-900">
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="guests">Guest List</TabsTrigger>
            <TabsTrigger value="add-guest">Add Guest</TabsTrigger>
            <TabsTrigger value="event">Event Details</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="bg-white/80">
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs">Total Invited</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-light text-gray-900">{stats.total}</div>
                </CardContent>
              </Card>

              <Card className="bg-white/80">
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs">Opened</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-light text-blue-600">{stats.opened}</div>
                  <p className="text-xs text-gray-600 mt-2">{Math.round((stats.opened / stats.total) * 100)}%</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80">
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs">Pending Response</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-light text-amber-600">{stats.pending}</div>
                </CardContent>
              </Card>

              <Card className="bg-white/80">
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs">Confirmed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-light text-green-600">{stats.confirmed}</div>
                </CardContent>
              </Card>

              <Card className="bg-white/80">
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs">Declined</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-light text-red-600">{stats.declined}</div>
                </CardContent>
              </Card>

              <Card className="bg-white/80">
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs">Total Attendees</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-light text-rose-700">{stats.totalPax}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Guest List */}
          <TabsContent value="guests" className="space-y-4 mt-6">
            <Card className="bg-white/80">
              <CardHeader>
                <CardTitle className="text-lg">Guest Responses</CardTitle>
                <CardDescription>Filter by RSVP status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'pending', 'yes', 'no'] as const).map(f => (
                    <Button
                      key={f}
                      onClick={() => setFilter(f)}
                      variant={filter === f ? 'default' : 'outline'}
                      className={filter === f ? 'bg-rose-700 hover:bg-rose-800' : ''}
                    >
                      {f === 'all' ? 'All' : f === 'yes' ? 'Confirmed' : f === 'no' ? 'Declined' : 'Pending'}
                    </Button>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Guests</TableHead>
                        <TableHead>Opened</TableHead>
                        <TableHead>Invite Link</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGuests.map(guest => (
                        <TableRow key={guest.id}>
                          <TableCell className="font-medium">{guest.name}</TableCell>
                          <TableCell className="text-sm text-gray-600">{guest.guest_category || '—'}</TableCell>
                          <TableCell>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              guest.rsvp_status === 'yes' ? 'bg-green-100 text-green-800' :
                              guest.rsvp_status === 'no' ? 'bg-red-100 text-red-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {guest.rsvp_status === 'yes' ? 'Yes' : guest.rsvp_status === 'no' ? 'No' : 'Pending'}
                            </span>
                          </TableCell>
                          <TableCell>{guest.pax_count}</TableCell>
                          <TableCell className="text-xs text-gray-600">
                            {guest.opened_at ? new Date(guest.opened_at).toLocaleDateString() : '—'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7 px-2 border-rose-200 text-rose-700 hover:bg-rose-50"
                              onClick={() => {
                                const link = `${window.location.origin}/invite/${guest.unique_token}`
                                navigator.clipboard.writeText(link)
                                alert(`Copied!\n\n${link}`)
                              }}
                            >
                              Copy Link
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add Guest */}
          <TabsContent value="add-guest" className="mt-6">
            <Card className="bg-white/80 max-w-md">
              <CardHeader>
                <CardTitle>Add New Guest</CardTitle>
                <CardDescription>Create a new invitation</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={addGuest} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Guest Name *</Label>
                    <Input
                      id="name"
                      value={newGuestName}
                      onChange={(e) => setNewGuestName(e.target.value)}
                      placeholder="Full name"
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newGuestPhone}
                      onChange={(e) => setNewGuestPhone(e.target.value)}
                      placeholder="+1234567890"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newGuestCategory} onValueChange={setNewGuestCategory}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Family">Family</SelectItem>
                        <SelectItem value="Friends">Friends</SelectItem>
                        <SelectItem value="Bride Side">Bride Side</SelectItem>
                        <SelectItem value="Groom Side">Groom Side</SelectItem>
                        <SelectItem value="Neighbours">Neighbours</SelectItem>
                        <SelectItem value="Office">Office</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" disabled={!newGuestName || adding} className="w-full bg-rose-700 hover:bg-rose-800 text-white">
                    {adding ? 'Adding...' : 'Add Guest'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Event Details */}
          <TabsContent value="event" className="mt-6">
            {event && (
              <Card className="bg-white/80 max-w-2xl">
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                  <CardDescription>Update your wedding information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Partner 1</Label>
                      <Input
                        defaultValue={event.couple_1}
                        onChange={(e) => updateEvent({ couple_1: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Partner 2</Label>
                      <Input
                        defaultValue={event.couple_2}
                        onChange={(e) => updateEvent({ couple_2: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        defaultValue={event.date}
                        onChange={(e) => updateEvent({ date: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Time</Label>
                      <Input
                        type="time"
                        defaultValue={event.time}
                        onChange={(e) => updateEvent({ time: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Venue</Label>
                    <Input
                      defaultValue={event.venue}
                      onChange={(e) => updateEvent({ venue: e.target.value })}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Location</Label>
                    <Input
                      defaultValue={event.location}
                      onChange={(e) => updateEvent({ location: e.target.value })}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Contact Number</Label>
                    <Input
                      defaultValue={event.contact}
                      onChange={(e) => updateEvent({ contact: e.target.value })}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Google Maps URL</Label>
                    <Input
                      defaultValue={event.maps_url || ''}
                      onChange={(e) => updateEvent({ maps_url: e.target.value })}
                      placeholder="https://maps.google.com/..."
                      className="mt-2"
                    />
                  </div>

                  <p className="text-xs text-gray-600 italic">Changes are saved automatically</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
