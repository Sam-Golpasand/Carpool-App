import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin');
  const destinations = searchParams.get('destinations');
  const apiKey = searchParams.get('apiKey');

  if (!origin || !destinations || !apiKey) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destinations}&key=${apiKey}`
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching distance matrix:', error);
    return NextResponse.json({ error: 'Failed to fetch distance matrix data' }, { status: 500 });
  }
}
