import { getMe } from '@/app/(main)/actions/users'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const user = await getMe()
    return NextResponse.json({ 
      authenticated: !!user, 
      user: user ? { email: user.email, role: user.role } : null 
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
