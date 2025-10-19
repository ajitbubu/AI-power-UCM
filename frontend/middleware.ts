
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const EU = new Set(['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','IS','LI','NO']);

export function middleware(request: NextRequest) {
  const mock = new URL(request.url).searchParams.get('mockCountry');
  const country = (mock || request.geo?.country || 'US').toUpperCase();
  const region = EU.has(country) ? 'EU' : 'US';
  const res = NextResponse.next();
  res.cookies.set('ucm_region', region, { path: '/', sameSite: 'Lax' });
  return res;
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
