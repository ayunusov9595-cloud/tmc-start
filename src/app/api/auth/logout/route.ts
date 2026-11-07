import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const response = NextResponse.json(
      { message: 'Tizimdan muvaffaqiyatli chiqdingiz' },
      { status: 200 }
    )

    response.cookies.set('tmc_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Chiqishda xatolik yuz berdi' },
      { status: 500 }
    )
  }
}
