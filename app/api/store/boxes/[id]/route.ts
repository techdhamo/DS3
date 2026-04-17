import { NextRequest, NextResponse } from 'next/server';
import { ProbabilityEngine } from '../../../../../lib/engine/probability';
import { use } from 'react';

// Types for the API
interface BoxResponse {
  success: boolean;
  box?: {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string | null;
    isActive: boolean;
    isSoldOut: boolean;
    probabilityDistribution: {
      guaranteed: Array<{
        item: {
          id: string;
          name: string;
          sku: string;
          rarityTier: string;
        };
        count: number;
      }>;
      random: Array<{
        item: {
          id: string;
          name: string;
          sku: string;
          rarityTier: string;
        };
        dropChance: number;
        probability: number;
      }>;
      expectedRolls: number;
    };
  };
  error?: string;
}

/**
 * GET /api/store/boxes/[id]
 * 
 * Returns box theme details with public drop chance information
 * This is legally required for fair trade compliance
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<BoxResponse>> {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Box ID is required' },
        { status: 400 }
      );
    }

    // For now, return mock data to test the API structure
    // In production, this would fetch from the database
    const mockBoxTheme = {
      id: id,
      name: "The Dark Wizard's Desk",
      description: "A mysterious collection of arcane artifacts and dark magical items gathered from a wizard's secret study. Each box contains 3-5 randomly selected items of varying rarity.",
      price: 49.99,
      imageUrl: 'https://images.unsplash.com/photo-1579532586980-283c242d3a4b?w=400&h=300&fit=crop',
      isActive: true,
      isSoldOut: false,
      boxItemMappings: [
        {
          id: 'mapping-1',
          boxThemeId: id,
          itemId: 'item-1',
          dropChance: 25.0,
          isGuaranteed: false,
          item: {
            id: 'item-1',
            name: 'Amethyst Crystal',
            sku: 'CRYSTAL-001',
            stockQuantity: 100,
            costPrice: 2.50,
            rarityTier: 'COMMON'
          }
        },
        {
          id: 'mapping-2',
          boxThemeId: id,
          itemId: 'item-2',
          dropChance: 20.0,
          isGuaranteed: false,
          item: {
            id: 'item-2',
            name: 'Mystical Rune Stone',
            sku: 'RUNE-001',
            stockQuantity: 80,
            costPrice: 3.00,
            rarityTier: 'COMMON'
          }
        },
        {
          id: 'mapping-3',
          boxThemeId: id,
          itemId: 'item-3',
          dropChance: 12.0,
          isGuaranteed: false,
          item: {
            id: 'item-3',
            name: 'Dragon Scale Fragment',
            sku: 'DRAGON-001',
            stockQuantity: 30,
            costPrice: 8.00,
            rarityTier: 'RARE'
          }
        },
        {
          id: 'mapping-4',
          boxThemeId: id,
          itemId: 'item-4',
          dropChance: 5.0,
          isGuaranteed: false,
          item: {
            id: 'item-4',
            name: 'Crystal Ball Orb',
            sku: 'ORB-001',
            stockQuantity: 15,
            costPrice: 15.00,
            rarityTier: 'EPIC'
          }
        },
        {
          id: 'mapping-5',
          boxThemeId: id,
          itemId: 'item-5',
          dropChance: 2.0,
          isGuaranteed: false,
          item: {
            id: 'item-5',
            name: 'Dragon Statue Miniature',
            sku: 'STATUE-001',
            stockQuantity: 5,
            costPrice: 25.00,
            rarityTier: 'LEGENDARY'
          }
        },
        {
          id: 'mapping-6',
          boxThemeId: id,
          itemId: 'item-6',
          dropChance: 0.5,
          isGuaranteed: false,
          item: {
            id: 'item-6',
            name: 'Ancient Spell Tome',
            sku: 'TOME-001',
            stockQuantity: 2,
            costPrice: 50.00,
            rarityTier: 'MYTHIC'
          }
        }
      ]
    };

    // Use the probability engine to calculate the distribution
    const probabilityEngine = new ProbabilityEngine();
    const distribution = probabilityEngine.getProbabilityDistribution(mockBoxTheme as any);

    // Calculate probabilities for random items
    const guaranteedMappings = mockBoxTheme.boxItemMappings.filter((mapping: any) => mapping.isGuaranteed);
    const randomMappings = mockBoxTheme.boxItemMappings.filter((mapping: any) => !mapping.isGuaranteed);

    const totalRandomWeight = randomMappings.reduce((sum: number, mapping: any) => sum + mapping.dropChance, 0);

    const probabilityDistribution = {
      guaranteed: guaranteedMappings.map((mapping: any) => ({
        item: {
          id: mapping.item.id,
          name: mapping.item.name,
          sku: mapping.item.sku,
          rarityTier: mapping.item.rarityTier
        },
        count: 1 // Guaranteed items appear once
      })),
      random: randomMappings.map((mapping: any) => ({
        item: {
          id: mapping.item.id,
          name: mapping.item.name,
          sku: mapping.item.sku,
          rarityTier: mapping.item.rarityTier
        },
        dropChance: mapping.dropChance,
        probability: totalRandomWeight > 0 ? (mapping.dropChance / totalRandomWeight) * 100 : 0
      })),
      expectedRolls: distribution.expectedRolls
    };

    const boxResponse = {
      id: mockBoxTheme.id,
      name: mockBoxTheme.name,
      description: mockBoxTheme.description,
      price: Number(mockBoxTheme.price),
      imageUrl: mockBoxTheme.imageUrl,
      isActive: mockBoxTheme.isActive,
      isSoldOut: mockBoxTheme.isSoldOut,
      probabilityDistribution
    };

    return NextResponse.json({
      success: true,
      box: boxResponse
    });

  } catch (error) {
    console.error('API Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
