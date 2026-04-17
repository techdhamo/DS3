import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { hostname, pathname } = request.nextUrl
  
  // Redirect ds3.store to ds3.world/store
  if (hostname === 'ds3.store' || hostname === 'www.ds3.store') {
    const url = request.nextUrl.clone()
    url.hostname = 'ds3.world'
    
    // If accessing root, redirect to /store
    if (pathname === '/') {
      url.pathname = '/store'
    }
    
    return NextResponse.redirect(url, 301)
  }
  
  // Handle store.ds3.world subdomain - redirect to main domain /store
  if (hostname === 'store.ds3.world') {
    const url = request.nextUrl.clone()
    url.hostname = 'ds3.world'
    url.pathname = `/store${pathname}`
    return NextResponse.redirect(url, 301)
  }
  
  // Ensure /store path is accessible
  if (pathname.startsWith('/store')) {
    return NextResponse.next()
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
