import 'dotenv/config';
import { PrismaClient, UserRole, GuildRank, RarityTier } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['query'],
});

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.cartItem.deleteMany();
  await prisma.orderLineItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.boxItemMapping.deleteMany();
  await prisma.item.deleteMany();
  await prisma.boxTheme.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing data');

  // Create Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@ds3.world',
      passwordHash: hashedPassword,
      username: 'DS3_Admin',
      role: UserRole.ADMIN,
      loyaltyPoints: 1000,
    },
  });

  // Create Admin Profile
  await prisma.profile.create({
    data: {
      userId: adminUser.id,
      avatarUrl: 'https://images.unsplash.com/photo-1579532586980-283c242d3a4b?w=150&h=150&fit=crop&crop=face',
      bio: 'Guardian of the DS3 realm and keeper of ancient mysteries.',
      guildRank: GuildRank.LEGENDARY,
    },
  });

  // Create Box Theme: "The Dark Wizard's Desk"
  const darkWizardBox = await prisma.boxTheme.create({
    data: {
      name: "The Dark Wizard's Desk",
      description: "A mysterious collection of arcane artifacts and dark magical items gathered from a wizard's secret study. Each box contains 3-5 randomly selected items of varying rarity.",
      price: 49.99,
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      isActive: true,
      isSoldOut: false,
    },
  });

  // Create Items with varying rarity
  const items = await Promise.all([
    // Common Items
    prisma.item.create({
      data: {
        name: 'Amethyst Crystal',
        sku: 'CRYSTAL-001',
        stockQuantity: 100,
        costPrice: 2.50,
        rarityTier: RarityTier.COMMON,
      },
    }),
    prisma.item.create({
      data: {
        name: 'Mystical Rune Stone',
        sku: 'RUNE-001',
        stockQuantity: 80,
        costPrice: 3.00,
        rarityTier: RarityTier.COMMON,
      },
    }),
    prisma.item.create({
      data: {
        name: 'Silver Charm Bracelet',
        sku: 'CHARM-001',
        stockQuantity: 60,
        costPrice: 4.00,
        rarityTier: RarityTier.COMMON,
      },
    }),

    // Rare Items
    prisma.item.create({
      data: {
        name: 'Dragon Scale Fragment',
        sku: 'DRAGON-001',
        stockQuantity: 30,
        costPrice: 8.00,
        rarityTier: RarityTier.RARE,
      },
    }),
    prisma.item.create({
      data: {
        name: 'Enchanted Quill Pen',
        sku: 'QUILL-001',
        stockQuantity: 25,
        costPrice: 10.00,
        rarityTier: RarityTier.RARE,
      },
    }),

    // Epic Items
    prisma.item.create({
      data: {
        name: 'Crystal Ball Orb',
        sku: 'ORB-001',
        stockQuantity: 15,
        costPrice: 15.00,
        rarityTier: RarityTier.EPIC,
      },
    }),

    // Legendary Items
    prisma.item.create({
      data: {
        name: 'Dragon Statue Miniature',
        sku: 'STATUE-001',
        stockQuantity: 5,
        costPrice: 25.00,
        rarityTier: RarityTier.LEGENDARY,
      },
    }),

    // Mythic Item (Super Rare)
    prisma.item.create({
      data: {
        name: 'Ancient Spell Tome',
        sku: 'TOME-001',
        stockQuantity: 2,
        costPrice: 50.00,
        rarityTier: RarityTier.MYTHIC,
      },
    }),
  ]);

  // Create BoxItemMappings with drop chances
  await Promise.all([
    // Common Items (High drop chance)
    prisma.boxItemMapping.create({
      data: {
        boxThemeId: darkWizardBox.id,
        itemId: items[0].id, // Amethyst Crystal
        dropChance: 25.0,
        isGuaranteed: false,
      },
    }),
    prisma.boxItemMapping.create({
      data: {
        boxThemeId: darkWizardBox.id,
        itemId: items[1].id, // Mystical Rune Stone
        dropChance: 20.0,
        isGuaranteed: false,
      },
    }),
    prisma.boxItemMapping.create({
      data: {
        boxThemeId: darkWizardBox.id,
        itemId: items[2].id, // Silver Charm Bracelet
        dropChance: 15.0,
        isGuaranteed: false,
      },

    }),

    // Rare Items (Medium drop chance)
    prisma.boxItemMapping.create({
      data: {
        boxThemeId: darkWizardBox.id,
        itemId: items[3].id, // Dragon Scale Fragment
        dropChance: 12.0,
        isGuaranteed: false,
      },
    }),
    prisma.boxItemMapping.create({
      data: {
        boxThemeId: darkWizardBox.id,
        itemId: items[4].id, // Enchanted Quill Pen
        dropChance: 10.0,
        isGuaranteed: false,
      },
    }),

    // Epic Item (Lower drop chance)
    prisma.boxItemMapping.create({
      data: {
        boxThemeId: darkWizardBox.id,
        itemId: items[5].id, // Crystal Ball Orb
        dropChance: 5.0,
        isGuaranteed: false,
      },
    }),

    // Legendary Item (Very low drop chance)
    prisma.boxItemMapping.create({
      data: {
        boxThemeId: darkWizardBox.id,
        itemId: items[6].id, // Dragon Statue Miniature
        dropChance: 2.0,
        isGuaranteed: false,
      },
    }),

    // Mythic Item (Extremely rare)
    prisma.boxItemMapping.create({
      data: {
        boxThemeId: darkWizardBox.id,
        itemId: items[7].id, // Ancient Spell Tome
        dropChance: 0.5,
        isGuaranteed: false,
      },
    }),
  ]);

  console.log('✅ Database seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Admin User: ${adminUser.username} (${adminUser.email})`);
  console.log(`- Box Theme: "${darkWizardBox.name}" - $${darkWizardBox.price}`);
  console.log(`- Total Items: ${items.length}`);
  console.log(`- Total Mappings: 8 (with varying drop chances)`);
  console.log('\n🎲 Drop Chance Distribution:');
  console.log('- Common Items: 15-25% chance');
  console.log('- Rare Items: 10-12% chance');
  console.log('- Epic Items: 5% chance');
  console.log('- Legendary Items: 2% chance');
  console.log('- Mythic Items: 0.5% chance');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
