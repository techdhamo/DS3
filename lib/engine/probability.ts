// Types for the probability engine
export interface RollResult {
  rolledItems: any[];
  guaranteedItems: any[];
  randomItems: any[];
  totalValue: number;
  rarityBreakdown: Record<string, number>;
}

export interface BoxThemeWithMappings {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  isActive: boolean;
  isSoldOut: boolean;
  boxItemMappings: BoxItemMappingWithItem[];
}

export interface BoxItemMappingWithItem {
  id: string;
  boxThemeId: string;
  itemId: string;
  dropChance: number;
  isGuaranteed: boolean;
  item: {
    id: string;
    name: string;
    sku: string;
    stockQuantity: number;
    costPrice: number;
    rarityTier: string;
  };
}

/**
 * Probability Engine for Mystery Box Rolling
 * 
 * This engine handles the weighted random selection of items from a mystery box
 * based on their drop chances and guaranteed status.
 */
export class ProbabilityEngine {
  /**
   * Roll a mystery box and return the selected items
   * 
   * @param boxTheme - The box theme with included mappings
   * @param options - Optional configuration for the roll
   * @returns RollResult - The rolled items and metadata
   */
  rollBox(
    boxTheme: BoxThemeWithMappings,
    options: {
      forceRollCount?: number;
      excludeGuaranteed?: boolean;
    } = {}
  ): RollResult {
    const { boxItemMappings } = boxTheme;
    
    // Validate box theme
    if (!boxTheme.isActive) {
      throw new Error(`Box theme ${boxTheme.name} is not active`);
    }

    if (boxTheme.isSoldOut) {
      throw new Error(`Box theme ${boxTheme.name} is sold out`);
    }

    // Separate guaranteed and random items
    const guaranteedMappings = boxItemMappings.filter(mapping => mapping.isGuaranteed);
    const randomMappings = boxItemMappings.filter(mapping => !mapping.isGuaranteed);

    // Get guaranteed items (always included unless excluded)
    const guaranteedItems = options.excludeGuaranteed 
      ? [] 
      : guaranteedMappings.map(mapping => mapping.item);

    // Determine how many random items to roll
    const randomItemCount = options.forceRollCount ?? this.calculateRandomItemCount(boxTheme);
    
    // Roll random items using weighted selection
    const randomItems = this.rollRandomItems(randomMappings, randomItemCount);

    // Combine all rolled items
    const rolledItems = [...guaranteedItems, ...randomItems];

    // Calculate metadata
    const totalValue = rolledItems.reduce((sum: number, item: any) => sum + Number(item.costPrice), 0);
    const rarityBreakdown = this.calculateRarityBreakdown(rolledItems);

    return {
      rolledItems,
      guaranteedItems,
      randomItems,
      totalValue,
      rarityBreakdown
    };
  }

  /**
   * Calculate how many random items should be rolled for a box
   * 
   * This is a configurable business logic function.
   * For now, we'll use a simple rule: 1 guaranteed + 2-4 random items
   * 
   * @param boxTheme - The box theme
   * @returns number - How many random items to roll
   */
  private calculateRandomItemCount(boxTheme: BoxThemeWithMappings): number {
    // Business logic: Different boxes can have different roll counts
    // For "The Dark Wizard's Desk", we'll roll 3 random items
    if (boxTheme.name.includes("Dark Wizard")) {
      return 3;
    }
    
    // Default: Roll 2-4 random items based on price tier
    const price = Number(boxTheme.price);
    if (price >= 50) return 4; // Premium boxes get more items
    if (price >= 30) return 3; // Mid-tier boxes
    return 2; // Budget boxes
  }

  /**
   * Roll random items using weighted random selection based on drop chances
   * 
   * @param mappings - Array of item mappings with drop chances
   * @param count - How many items to roll
   * @returns Array<any> - The randomly selected items
   */
  private rollRandomItems(mappings: BoxItemMappingWithItem[], count: number): any[] {
    if (mappings.length === 0) return [];

    const rolledItems: any[] = [];
    const availableMappings = [...mappings]; // Copy to avoid modifying original

    for (let i = 0; i < count && availableMappings.length > 0; i++) {
      const selectedItem = this.weightedRandomSelection(availableMappings);
      if (selectedItem) {
        rolledItems.push(selectedItem.item);
        
        // Remove the selected item from available mappings to prevent duplicates
        // unless the item has multiple stock (in which case we could allow duplicates)
        const index = availableMappings.indexOf(selectedItem);
        if (index > -1) {
          availableMappings.splice(index, 1);
        }
      }
    }

    return rolledItems;
  }

  /**
   * Perform weighted random selection based on drop chances
   * 
   * @param mappings - Array of item mappings with drop chances
   * @returns BoxItemMappingWithItem | null - The selected mapping or null if selection fails
   */
  private weightedRandomSelection(mappings: BoxItemMappingWithItem[]): BoxItemMappingWithItem | null {
    if (mappings.length === 0) return null;

    // Calculate total weight (sum of all drop chances)
    const totalWeight = mappings.reduce((sum: number, mapping: BoxItemMappingWithItem) => sum + mapping.dropChance, 0);
    
    if (totalWeight <= 0) return null;

    // Generate random number between 0 and totalWeight
    const random = Math.random() * totalWeight;
    
    // Find which mapping the random number falls into
    let currentWeight = 0;
    for (const mapping of mappings) {
      currentWeight += mapping.dropChance;
      if (random <= currentWeight) {
        return mapping;
      }
    }

    // Fallback (shouldn't happen with proper calculations)
    return mappings[mappings.length - 1];
  }

  /**
   * Calculate rarity breakdown for rolled items
   * 
   * @param items - Array of rolled items
   * @returns Record<string, number> - Count of items by rarity
   */
  private calculateRarityBreakdown(items: any[]): Record<string, number> {
    const breakdown: Record<string, number> = {
      COMMON: 0,
      RARE: 0,
      EPIC: 0,
      LEGENDARY: 0,
      MYTHIC: 0
    };

    items.forEach(item => {
      if (item.rarityTier && breakdown.hasOwnProperty(item.rarityTier)) {
        breakdown[item.rarityTier]++;
      }
    });

    return breakdown;
  }

  /**
   * Get the theoretical probability distribution for a box theme
   * 
   * This is useful for frontend display and transparency
   * 
   * @param boxTheme - The box theme with mappings
   * @returns Probability distribution by rarity
   */
  getProbabilityDistribution(boxTheme: BoxThemeWithMappings): {
    guaranteed: { item: any; count: number }[];
    random: { item: any; probability: number }[];
    expectedRolls: number;
  } {
    const guaranteedMappings = boxTheme.boxItemMappings.filter(mapping => mapping.isGuaranteed);
    const randomMappings = boxTheme.boxItemMappings.filter(mapping => !mapping.isGuaranteed);

    const guaranteed = guaranteedMappings.map(mapping => ({
      item: mapping.item,
      count: 1 // Guaranteed items appear once
    }));

    // Calculate probabilities for random items
    const totalRandomWeight = randomMappings.reduce((sum: number, mapping: BoxItemMappingWithItem) => sum + mapping.dropChance, 0);
    const random = randomMappings.map(mapping => ({
      item: mapping.item,
      probability: totalRandomWeight > 0 ? (mapping.dropChance / totalRandomWeight) * 100 : 0
    }));

    const expectedRolls = this.calculateRandomItemCount(boxTheme);

    return {
      guaranteed,
      random,
      expectedRolls
    };
  }
}

/**
 * Utility function to roll a box (convenience wrapper)
 * 
 * @param boxTheme - The box theme with mappings
 * @param options - Roll configuration options
 * @returns RollResult - The roll result
 */
export function rollMysteryBox(
  boxTheme: BoxThemeWithMappings,
  options?: {
    forceRollCount?: number;
    excludeGuaranteed?: boolean;
  }
): RollResult {
  const engine = new ProbabilityEngine();
  return engine.rollBox(boxTheme, options);
}
