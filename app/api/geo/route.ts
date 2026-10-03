import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  // Vercel sets the ISO 3166-1 alpha-2 country code automatically
  const countryHeader = req.headers.get('x-vercel-ip-country') || 'LK';
  const country = countryHeader.toUpperCase();

  let defaultCurrency: 'USD' | 'LKR' | 'EUR' | 'GBP' = 'USD';
  let defaultZone = 'ROW';

  if (country === 'LK') {
    defaultCurrency = 'LKR';
    defaultZone = 'LK_LOCAL';
  } else if (country === 'GB') {
    defaultCurrency = 'GBP';
    defaultZone = 'EU_UK';
  } else if (['FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH', 'SE', 'NO', 'DK'].includes(country)) {
    defaultCurrency = 'EUR';
    defaultZone = 'EU_UK';
  } else if (['US', 'CA', 'AU', 'NZ'].includes(country)) {
    defaultCurrency = 'USD';
    defaultZone = 'US_CA';
  } else if (['IN', 'MV', 'AE', 'QA', 'SA', 'OM'].includes(country)) {
    defaultCurrency = 'USD';
    defaultZone = 'SAARC';
  }

  return NextResponse.json({
    country,
    defaultCurrency,
    defaultZone,
  });
}