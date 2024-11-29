import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    let data;
    try {
      data = await request.json();
      console.log('Received request data:', data);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid request format' 
        }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (!data || !data.uniqueBlinkId || !data.codename || !data.email || !data.solanaKey) {
      return new NextResponse(
        JSON.stringify({ 
          success: false,
          error: 'Missing required fields' 
        }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const existingBlink = await prisma.blink.findUnique({
      where: {
        uniqueBlinkId: data.uniqueBlinkId
      }
    });

    if (existingBlink) {
      return new NextResponse(
        JSON.stringify({ 
          success: false,
          error: 'A blink with this ID already exists' 
        }), 
        { 
          status: 409,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const blink = await prisma.blink.create({
      data: {
        uniqueBlinkId: data.uniqueBlinkId,
        codename: data.codename,
        email: data.email,
        solanaKey: data.solanaKey,
        description: data.description ?? '',
        imageUrl: data.imageUrl ?? null
      }
    });

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: blink
      }), 
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Failed to create blink:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error'
    });

    return new NextResponse(
      JSON.stringify({ 
        success: false,
        error: 'Failed to create blink',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}