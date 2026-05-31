import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Fetch guest by token
    const { data: guest, error: guestError } = await supabase
      .from('guests')
      .select('*')
      .eq('unique_token', token)
      .single()

    if (guestError || !guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    // Track opening (only first time)
    if (!guest.opened_at) {
      await supabase
        .from('guests')
        .update({ opened_at: new Date().toISOString() })
        .eq('id', guest.id)
    }

    // Fetch event details
    const { data: event } = await supabase.from('event').select('*').single()

    return NextResponse.json({ guest, event })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
