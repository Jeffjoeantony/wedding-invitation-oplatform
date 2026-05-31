import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { token, status, pax_count, attending_members } = await req.json()

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('guests')
      .update({
        rsvp_status: status,
        pax_count: pax_count || 0,
        attending_members: attending_members || [],
        responded_at: new Date().toISOString(),
      })
      .eq('unique_token', token)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('RSVP error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
