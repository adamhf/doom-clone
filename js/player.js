// Player class
class Player {
    constructor() {
        this.x = 2;
        this.y = 2;
        this.angle = 0;
        this.health = 100;
        this.maxHealth = 100;
        this.armor = 0;
        this.maxArmor = 100;
        this.ammo = 50;
        this.maxAmmo = 200;
        this.kills = 0;
        this.totalKills = 0;
        this.score = 0;
        this.weaponSystem = new WeaponSystem();
        this.currentMap = null;

        // Input state
        this.keys = {};
        this.mouseDown = false;
        this.mouseDX = 0;

        // Head bob
        this.bobPhase = 0;
        this.isMoving = false;
    }

    reset(startPos) {
        this.x = startPos.x;
        this.y = startPos.y;
        this.angle = startPos.angle;
        this.health = 100;
        this.armor = 0;
        this.ammo = 50;
        this.kills = 0;
        this.weaponSystem = new WeaponSystem();
    }

    fullReset() {
        this.health = 100;
        this.armor = 0;
        this.ammo = 50;
        this.kills = 0;
        this.totalKills = 0;
        this.score = 0;
        this.weaponSystem = new WeaponSystem();
    }

    update(dt, map) {
        this.currentMap = map;

        // Mouse look
        this.angle += this.mouseDX * MOUSE_SENSITIVITY;
        this.mouseDX = 0;

        // Movement
        let moveX = 0;
        let moveY = 0;
        const speed = PLAYER_SPEED * dt / 1000;

        this.isMoving = false;

        if (this.keys['w'] || this.keys['arrowup']) {
            moveX += Math.cos(this.angle) * speed;
            moveY += Math.sin(this.angle) * speed;
            this.isMoving = true;
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            moveX -= Math.cos(this.angle) * speed;
            moveY -= Math.sin(this.angle) * speed;
            this.isMoving = true;
        }
        if (this.keys['a'] || this.keys['arrowleft']) {
            moveX += Math.cos(this.angle - Math.PI / 2) * speed;
            moveY += Math.sin(this.angle - Math.PI / 2) * speed;
            this.isMoving = true;
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            moveX -= Math.cos(this.angle - Math.PI / 2) * speed;
            moveY -= Math.sin(this.angle - Math.PI / 2) * speed;
            this.isMoving = true;
        }

        // Apply movement with collision
        this.move(moveX, moveY, map);

        // Head bob
        if (this.isMoving) {
            this.bobPhase += dt * 0.008;
        }

        // Weapon switching
        if (this.keys['1']) this.weaponSystem.switchTo('pistol');
        if (this.keys['2']) this.weaponSystem.switchTo('shotgun');
        if (this.keys['3']) this.weaponSystem.switchTo('plasma');

        // Weapon update
        this.weaponSystem.update(dt);
    }

    move(moveX, moveY, map) {
        const margin = PLAYER_SIZE;

        // Separate X and Y collision for sliding along walls
        const newX = this.x + moveX;
        const newY = this.y + moveY;

        // Check X
        if (this.isPassable(newX + (moveX > 0 ? margin : -margin), this.y, map) &&
            this.isPassable(newX + (moveX > 0 ? margin : -margin), this.y + margin, map) &&
            this.isPassable(newX + (moveX > 0 ? margin : -margin), this.y - margin, map)) {
            this.x = newX;
        }

        // Check Y
        if (this.isPassable(this.x, newY + (moveY > 0 ? margin : -margin), map) &&
            this.isPassable(this.x + margin, newY + (moveY > 0 ? margin : -margin), map) &&
            this.isPassable(this.x - margin, newY + (moveY > 0 ? margin : -margin), map)) {
            this.y = newY;
        }
    }

    isPassable(x, y, map) {
        const cellX = Math.floor(x);
        const cellY = Math.floor(y);
        if (cellY < 0 || cellY >= map.length || cellX < 0 || cellX >= map[0].length) return false;
        const cell = map[cellY][cellX];
        return cell === 0;
    }

    takeDamage(amount) {
        // Armor absorbs some damage
        if (this.armor > 0) {
            const armorAbsorb = Math.min(this.armor, Math.floor(amount * 0.6));
            this.armor -= armorAbsorb;
            amount -= armorAbsorb;
        }
        this.health -= amount;
        if (this.health < 0) this.health = 0;
        Audio.playPlayerHurt();
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    addArmor(amount) {
        this.armor = Math.min(this.maxArmor, this.armor + amount);
    }

    addAmmo(amount) {
        this.ammo = Math.min(this.maxAmmo, this.ammo + amount);
    }

    // Try to interact with a door nearby
    tryInteract(map) {
        // Check cells in front of the player
        for (let dist = 0.5; dist <= 1.5; dist += 0.5) {
            const checkX = Math.floor(this.x + Math.cos(this.angle) * dist);
            const checkY = Math.floor(this.y + Math.sin(this.angle) * dist);

            if (checkY >= 0 && checkY < map.length && checkX >= 0 && checkX < map[0].length) {
                if (map[checkY][checkX] === WALL_DOOR) {
                    // Open door
                    map[checkY][checkX] = 0;
                    Audio.playDoorOpen();
                    return 'door_opened';
                }
                if (map[checkY][checkX] === WALL_EXIT) {
                    return 'exit_reached';
                }
            }
        }
        return null;
    }
}
