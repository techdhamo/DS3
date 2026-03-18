import 'dotenv/config';
import { ProbabilityEngine } from './lib/engine/probability';

// Mock box theme data for testing
const mockBoxTheme = {
  id: 'test-box-1',
  name: "The Dark Wizard's Desk",
  description: "A mysterious collection of arcane artifacts",
  price: 49.99,
  imageUrl: 'https://example.com/image.jpg',
  isActive: true,
  isSoldOut: false,
  boxItemMappings: [
    {
      id: 'mapping-1',
      boxThemeId: 'test-box-1',
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
      boxThemeId: 'test-box-1',
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
      boxThemeId: 'test-box-1',
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
      boxThemeId: 'test-box-1',
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
      boxThemeId: 'test-box-1',
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
      boxThemeId: 'test-box-1',
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

async function testProbabilityEngine() {
  console.log('🎲 Testing Probability Engine...\n');
  
  const engine = new ProbabilityEngine();
  
  try {
    // Test single roll
    console.log('📦 Single Roll Test:');
    const result1 = engine.rollBox(mockBoxTheme);
    console.log(`Rolled ${result1.rolledItems.length} items:`);
    result1.rolledItems.forEach(item => {
      console.log(`  - ${item.name} (${item.rarityTier}) - $${item.costPrice}`);
    });
    console.log(`Total Value: $${result1.totalValue}`);
    console.log(`Rarity Breakdown:`, result1.rarityBreakdown);
    console.log('');

    // Test probability distribution
    console.log('📊 Probability Distribution Test:');
    const distribution = engine.getProbabilityDistribution(mockBoxTheme);
    console.log(`Expected Rolls: ${distribution.expectedRolls}`);
    console.log('Random Items Probabilities:');
    distribution.random.forEach(item => {
      console.log(`  - ${item.item.name} (${item.item.rarityTier}): ${item.probability.toFixed(2)}%`);
    });
    console.log('');

    // Test multiple rolls to see distribution
    console.log('🎯 Multiple Rolls Test (100 rolls):');
    const rarityCounts = { COMMON: 0, RARE: 0, EPIC: 0, LEGENDARY: 0, MYTHIC: 0 };
    
    for (let i = 0; i < 100; i++) {
      const result = engine.rollBox(mockBoxTheme);
      result.rolledItems.forEach(item => {
        if (rarityCounts.hasOwnProperty(item.rarityTier)) {
          rarityCounts[item.rarityTier as keyof typeof rarityCounts]++;
        }
      });
    }
    
    console.log('Rarity Distribution from 100 rolls:');
    Object.entries(rarityCounts).forEach(([rarity, count]) => {
      console.log(`  - ${rarity}: ${count} items (${(count / 3).toFixed(1)}% of rolls)`);
    });
    
    console.log('\n✅ Probability Engine Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testProbabilityEngine().catch(console.error);
