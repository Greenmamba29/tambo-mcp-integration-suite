
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const configId = searchParams.get('configId');
    const days = parseInt(searchParams.get('days') || '7');

    if (!configId) {
      return NextResponse.json(
        { error: 'Configuration ID is required' },
        { status: 400 }
      );
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await prisma.analytics.findMany({
      where: {
        mcpConfigId: configId,
        date: {
          gte: startDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Calculate aggregated stats
    const totalRequests = analytics.reduce((sum, a) => sum + a.totalRequests, 0);
    const avgSuccessRate = analytics.length > 0 ? 
      analytics.reduce((sum, a) => sum + a.successRate, 0) / analytics.length : 0;
    const avgResponseTime = analytics.length > 0 ? 
      analytics.reduce((sum, a) => sum + a.avgResponse, 0) / analytics.length : 0;
    const totalErrors = analytics.reduce((sum, a) => sum + a.errorCount, 0);

    // Route distribution
    const routeDistribution: Record<string, number> = {};
    analytics.forEach(a => {
      const routes = a.routingData as Record<string, number>;
      Object.entries(routes).forEach(([route, count]) => {
        routeDistribution[route] = (routeDistribution[route] || 0) + count;
      });
    });

    return NextResponse.json({
      analytics,
      summary: {
        totalRequests,
        avgSuccessRate,
        avgResponseTime,
        totalErrors,
        routeDistribution,
        period: `${days} days`
      }
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      mcpConfigId, 
      totalRequests, 
      successRate, 
      avgResponse, 
      routingData, 
      errorCount 
    } = body;

    if (!mcpConfigId) {
      return NextResponse.json(
        { error: 'MCP Configuration ID is required' },
        { status: 400 }
      );
    }

    // Create or update today's analytics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const analytics = await prisma.analytics.upsert({
      where: {
        mcpConfigId_date: {
          mcpConfigId,
          date: today
        }
      },
      update: {
        totalRequests: totalRequests || 0,
        successRate: successRate || 0,
        avgResponse: avgResponse || 0,
        routingData: routingData || {},
        errorCount: errorCount || 0,
      },
      create: {
        mcpConfigId,
        date: today,
        totalRequests: totalRequests || 0,
        successRate: successRate || 0,
        avgResponse: avgResponse || 0,
        routingData: routingData || {},
        errorCount: errorCount || 0,
      }
    });

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Error saving analytics:', error);
    return NextResponse.json(
      { error: 'Failed to save analytics' },
      { status: 500 }
    );
  }
}
