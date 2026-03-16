// Game constants
const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 480;
const TILE_SIZE = 64;
const FOV = Math.PI / 3; // 60 degrees
const HALF_FOV = FOV / 2;
const NUM_RAYS = SCREEN_WIDTH;
const DELTA_ANGLE = FOV / NUM_RAYS;
const MAX_DEPTH = 20;
const WALL_HEIGHT_SCALE = TILE_SIZE * 3;
const PLAYER_SPEED = 3.0;
const PLAYER_ROT_SPEED = 0.003;
const PLAYER_SIZE = 0.3;
const MOUSE_SENSITIVITY = 0.003;

// Wall types
const WALL_EMPTY = 0;
const WALL_STONE = 1;
const WALL_BRICK = 2;
const WALL_METAL = 3;
const WALL_TECH = 4;
const WALL_DOOR = 5;
const WALL_EXIT = 6;
const WALL_WOOD = 7;
const WALL_HELL = 8;

// Entity types
const ENTITY_ENEMY_IMP = 'imp';
const ENTITY_ENEMY_DEMON = 'demon';
const ENTITY_ENEMY_BARON = 'baron';
const ENTITY_PICKUP_HEALTH = 'health';
const ENTITY_PICKUP_ARMOR = 'armor';
const ENTITY_PICKUP_AMMO = 'ammo';
const ENTITY_PICKUP_SHOTGUN = 'shotgun_pickup';
const ENTITY_PICKUP_PLASMA = 'plasma_pickup';
const ENTITY_BARREL = 'barrel';
const ENTITY_LAMP = 'lamp';

// Game states
const STATE_MENU = 'menu';
const STATE_PLAYING = 'playing';
const STATE_PAUSED = 'paused';
const STATE_LEVEL_COMPLETE = 'level_complete';
const STATE_GAME_OVER = 'game_over';
const STATE_GAME_WON = 'game_won';
