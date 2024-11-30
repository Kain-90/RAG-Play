import { NextRequest, NextResponse } from 'next/server'

const isMobileDevice = (userAgent: string): boolean => {
  const mobileDevicePattern = /Mobile|Android|iP(hone|ad)/i;
  return mobileDevicePattern.test(userAgent);
}

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || ''
  
  if (request.nextUrl.pathname.startsWith('/experiment')) {
    if (isMobileDevice(userAgent)) {
      return NextResponse.rewrite(new URL('/device-not-supported', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/experiment/:path*'
} 