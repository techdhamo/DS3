import { NextRequest, NextResponse } from 'next/server';

// Mock dungeon raid data for now
const mockRooms = [
  {
    id: 'dungeon-123',
    name: 'Dragon\'s Lair Raid',
    boxThemeId: 'dark-wizard-desk',
    maxPlayers: 10,
    currentPlayers: 7,
    players: [
      { id: '1', username: 'DragonSlayer99', avatar: null, joinedAt: new Date(), isReady: true },
      { id: '2', username: 'MagicUser', avatar: null, joinedAt: new Date(), isReady: true },
      { id: '3', username: 'RogueNinja', avatar: null, joinedAt: new Date(), isReady: false }
    ],
    status: 'waiting' as const
  }
];

/**
 * GET /api/dungeon-raid
 * 
 * Get all active dungeon raid rooms
 */
export async function GET(): Promise<NextResponse<{ success: boolean; rooms?: any[]; error?: string }>> {
  try {
    return NextResponse.json({
      success: true,
      rooms: mockRooms.filter(room => room.status === 'waiting')
    });

  } catch (error) {
    console.error('Error fetching dungeon rooms:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/dungeon-raid
 * 
 * Create a new dungeon raid room
 */
export async function POST(request: NextRequest): Promise<NextResponse<{ success: boolean; room?: any; error?: string }>> {
  try {
    const body = await request.json();
    const { boxThemeId, roomName } = body;

    if (!boxThemeId) {
      return NextResponse.json(
        { success: false, error: 'Box theme ID is required' },
        { status: 400 }
      );
    }

    const newRoom = {
      id: Math.random().toString(36).substr(2, 9),
      name: roomName || `Dungeon Raid #${Math.random().toString(36).substr(2, 6)}`,
      boxThemeId,
      maxPlayers: 10,
      currentPlayers: 0,
      players: [],
      status: 'waiting' as const
    };

    mockRooms.push(newRoom);

    return NextResponse.json({
      success: true,
      room: newRoom
    });

  } catch (error) {
    console.error('Error creating dungeon room:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
