// Enemy definitions and AI
const EnemyDefs = {
    [ENTITY_ENEMY_IMP]: {
        health: 40,
        speed: 1.2,
        damage: 8,
        attackRange: 8,
        attackRate: 1500,
        sprite: 'imp',
        deadSprite: 'deadImp',
        score: 100,
        sightRange: 12,
    },
    [ENTITY_ENEMY_DEMON]: {
        health: 80,
        speed: 1.8,
        damage: 15,
        attackRange: 2.5,
        attackRate: 1000,
        sprite: 'demon',
        deadSprite: 'deadDemon',
        score: 200,
        sightRange: 10,
    },
    [ENTITY_ENEMY_BARON]: {
        health: 200,
        speed: 1.0,
        damage: 25,
        attackRange: 10,
        attackRate: 2000,
        sprite: 'baron',
        deadSprite: 'deadBaron',
        score: 500,
        sightRange: 15,
    }
};

class Enemy {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        const def = EnemyDefs[type];
        this.health = def.health;
        this.maxHealth = def.health;
        this.speed = def.speed;
        this.damage = def.damage;
        this.attackRange = def.attackRange;
        this.attackRate = def.attackRate;
        this.sightRange = def.sightRange;
        this.score = def.score;
        this.active = true;
        this.state = 'idle'; // idle, chase, attack, hurt, dead
        this.lastAttackTime = 0;
        this.hurtTimer = 0;
        this.deathTimer = 0;
        this.spriteCanvas = Sprites[def.sprite];
        this.deadSpriteCanvas = Sprites[def.deadSprite];
        this.angle = Math.random() * Math.PI * 2;
        this.alertTimer = 0;
        this.moveTimer = 0;
        this.isEnemy = true;
    }

    takeDamage(amount) {
        if (this.state === 'dead') return;
        this.health -= amount;
        this.hurtTimer = 150;
        this.state = 'chase'; // Always chase when hit

        if (this.health <= 0) {
            this.health = 0;
            this.state = 'dead';
            this.deathTimer = 500;
            Audio.playEnemyDeath();
        } else {
            Audio.playEnemyHurt();
        }
    }

    update(dt, player, map, enemies) {
        if (this.state === 'dead') {
            if (this.deathTimer > 0) {
                this.deathTimer -= dt;
                if (this.deathTimer <= 0) {
                    // Switch to dead sprite
                    this.spriteCanvas = this.deadSpriteCanvas;
                }
            }
            return;
        }

        if (this.hurtTimer > 0) {
            this.hurtTimer -= dt;
        }

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distToPlayer = Math.sqrt(dx * dx + dy * dy);
        const angleToPlayer = Math.atan2(dy, dx);

        // Check line of sight
        const canSeePlayer = this.hasLineOfSight(player, map) && distToPlayer < this.sightRange;

        switch (this.state) {
            case 'idle':
                // Wander slightly
                this.moveTimer += dt;
                if (this.moveTimer > 2000) {
                    this.angle = Math.random() * Math.PI * 2;
                    this.moveTimer = 0;
                }
                // Move slowly in current direction
                this.tryMove(Math.cos(this.angle) * this.speed * 0.2 * dt / 1000,
                           Math.sin(this.angle) * this.speed * 0.2 * dt / 1000, map, enemies);

                if (canSeePlayer) {
                    this.state = 'chase';
                }
                break;

            case 'chase':
                this.angle = angleToPlayer;

                if (distToPlayer > this.attackRange) {
                    // Move toward player
                    const moveSpeed = this.speed * dt / 1000;
                    const moveX = Math.cos(angleToPlayer) * moveSpeed;
                    const moveY = Math.sin(angleToPlayer) * moveSpeed;
                    this.tryMove(moveX, moveY, map, enemies);
                } else {
                    this.state = 'attack';
                }

                // Lose interest if can't see player for a while
                if (!canSeePlayer) {
                    this.alertTimer += dt;
                    if (this.alertTimer > 5000) {
                        this.state = 'idle';
                        this.alertTimer = 0;
                    }
                } else {
                    this.alertTimer = 0;
                }
                break;

            case 'attack':
                this.angle = angleToPlayer;

                if (distToPlayer > this.attackRange * 1.2) {
                    this.state = 'chase';
                    break;
                }

                const now = performance.now();
                if (now - this.lastAttackTime >= this.attackRate) {
                    this.lastAttackTime = now;
                    // Attack player
                    if (canSeePlayer) {
                        return { type: 'attack', damage: this.damage, enemy: this };
                    }
                }
                break;
        }
        return null;
    }

    tryMove(moveX, moveY, map, enemies) {
        // Check wall collision
        const newX = this.x + moveX;
        const newY = this.y + moveY;
        const margin = 0.3;

        // Check map bounds
        const mapH = map.length;
        const mapW = map[0].length;

        // Check X movement
        const cellX = Math.floor(newX);
        const cellY = Math.floor(this.y);
        if (cellX >= 0 && cellX < mapW && cellY >= 0 && cellY < mapH &&
            map[cellY][cellX] === 0) {
            // Check margin
            const cXp = Math.floor(newX + margin);
            const cXn = Math.floor(newX - margin);
            const okXp = cXp >= 0 && cXp < mapW && map[cellY][cXp] === 0;
            const okXn = cXn >= 0 && cXn < mapW && map[cellY][cXn] === 0;
            if (okXp && okXn) this.x = newX;
        }

        // Check Y movement
        const cellX2 = Math.floor(this.x);
        const cellY2 = Math.floor(newY);
        if (cellX2 >= 0 && cellX2 < mapW && cellY2 >= 0 && cellY2 < mapH &&
            map[cellY2][cellX2] === 0) {
            const cYp = Math.floor(newY + margin);
            const cYn = Math.floor(newY - margin);
            const okYp = cYp >= 0 && cYp < mapH && map[cYp][cellX2] === 0;
            const okYn = cYn >= 0 && cYn < mapH && map[cYn][cellX2] === 0;
            if (okYp && okYn) this.y = newY;
        }

        // Avoid other enemies
        for (const other of enemies) {
            if (other === this || other.state === 'dead') continue;
            const edx = other.x - this.x;
            const edy = other.y - this.y;
            const eDist = Math.sqrt(edx * edx + edy * edy);
            if (eDist < 0.6) {
                this.x -= edx * 0.05;
                this.y -= edy * 0.05;
            }
        }
    }

    hasLineOfSight(player, map) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.floor(dist * 3);

        if (steps <= 0) return true;

        const stepX = dx / steps;
        const stepY = dy / steps;

        for (let i = 1; i < steps; i++) {
            const checkX = Math.floor(this.x + stepX * i);
            const checkY = Math.floor(this.y + stepY * i);
            if (checkY >= 0 && checkY < map.length && checkX >= 0 && checkX < map[0].length) {
                const cell = map[checkY][checkX];
                if (cell > 0 && cell !== WALL_DOOR) return false;
            }
        }
        return true;
    }
}

// Pickup entity
class Pickup {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.active = true;
        this.bobOffset = Math.random() * Math.PI * 2;
        this.isEnemy = false;

        switch (type) {
            case ENTITY_PICKUP_HEALTH:
                this.spriteCanvas = Sprites.health;
                break;
            case ENTITY_PICKUP_ARMOR:
                this.spriteCanvas = Sprites.armor;
                break;
            case ENTITY_PICKUP_AMMO:
                this.spriteCanvas = Sprites.ammo;
                break;
            case ENTITY_PICKUP_SHOTGUN:
                this.spriteCanvas = Sprites.shotgun_pickup;
                break;
            case ENTITY_PICKUP_PLASMA:
                this.spriteCanvas = Sprites.plasma_pickup;
                break;
        }
    }
}

// Decoration entity (barrel, lamp)
class Decoration {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.active = true;
        this.isEnemy = false;
        this.isDecoration = true;
        this.health = type === ENTITY_BARREL ? 20 : Infinity;

        switch (type) {
            case ENTITY_BARREL:
                this.spriteCanvas = Sprites.barrel;
                break;
            case ENTITY_LAMP:
                this.spriteCanvas = Sprites.lamp;
                break;
        }
    }

    takeDamage(amount) {
        if (this.type !== ENTITY_BARREL) return;
        this.health -= amount;
        if (this.health <= 0) {
            this.active = false;
            Audio.playExplosion();
            return { type: 'explosion', x: this.x, y: this.y, radius: 3, damage: 40 };
        }
        return null;
    }
}
