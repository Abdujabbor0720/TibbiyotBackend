import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Clone the response
  const response = NextResponse.next()
  
  // Add ngrok-skip-browser-warning header to skip ngrok warning page
  response.headers.set('ngrok-skip-browser-warning', 'true')
  
  return response
}

// Apply to all routes
export const config = {
  matcher: '/:path*',
}
