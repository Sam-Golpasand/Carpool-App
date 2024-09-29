import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const licensePlate = searchParams.get('licensePlate');

  if (!licensePlate) {
    return NextResponse.json({ error: 'License plate is required' }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_SynBaseAPIKey;

  try {
    const response = await axios.get(`https://api.synsbasen.dk/v1/vehicles/registration/${licensePlate}?expand[]=engine`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching vehicle data:', error);
    return NextResponse.json({ error: 'Failed to fetch vehicle data' }, { status: 500 });
  }
}
