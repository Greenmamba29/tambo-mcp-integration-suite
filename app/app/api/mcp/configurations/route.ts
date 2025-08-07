
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default-user';

    const configurations = await prisma.mcpConfiguration.findMany({
      where: {
        userId: userId,
      },
      include: {
        _count: {
          select: {
            testSuites: true,
            routingTests: true,
            analytics: true,
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json(configurations);

  } catch (error) {
    console.error('Error fetching configurations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configurations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, description, appId, baseUrl, config } = body;

    if (!name || !appId || !baseUrl) {
      return NextResponse.json(
        { error: 'Name, appId, and baseUrl are required' },
        { status: 400 }
      );
    }

    const configuration = await prisma.mcpConfiguration.create({
      data: {
        userId: userId || 'default-user',
        name,
        description,
        appId,
        baseUrl,
        config: config || {},
        isActive: true,
      },
    });

    return NextResponse.json(configuration);

  } catch (error) {
    console.error('Error creating configuration:', error);
    return NextResponse.json(
      { error: 'Failed to create configuration' },
      { status: 500 }
    );
  }
}
