// Weapon system
const WeaponDefs = {
    pistol: {
        name: 'PISTOL',
        damage: 15,
        fireRate: 300, // ms between shots
        ammoPerShot: 1,
        spread: 0.02,
        projectiles: 1,
        range: 15,
        color: '#ff0',
        muzzleColor: '#ff8',
        autoFire: false,
    },
    shotgun: {
        name: 'SHOTGUN',
        damage: 10,
        fireRate: 700,
        ammoPerShot: 2,
        spread: 0.08,
        projectiles: 6,
        range: 10,
        color: '#fa0',
        muzzleColor: '#ff4',
        autoFire: false,
    },
    plasma: {
        name: 'PLASMA GUN',
        damage: 20,
        fireRate: 120,
        ammoPerShot: 1,
        spread: 0.03,
        projectiles: 1,
        range: 18,
        color: '#0af',
        muzzleColor: '#0ff',
        autoFire: true,
    }
};

class WeaponSystem {
    constructor() {
        this.weapons = {
            pistol: { unlocked: true, def: WeaponDefs.pistol },
            shotgun: { unlocked: false, def: WeaponDefs.shotgun },
            plasma: { unlocked: false, def: WeaponDefs.plasma },
        };
        this.current = 'pistol';
        this.lastFireTime = 0;
        this.firing = false;
        this.animFrame = 0;
        this.animTimer = 0;
        this.muzzleFlash = 0;
    }

    get currentWeapon() {
        return this.weapons[this.current];
    }

    get currentDef() {
        return this.currentWeapon.def;
    }

    switchTo(weaponName) {
        if (this.weapons[weaponName] && this.weapons[weaponName].unlocked) {
            this.current = weaponName;
            this.animFrame = 0;
            return true;
        }
        return false;
    }

    unlock(weaponName) {
        if (this.weapons[weaponName]) {
            this.weapons[weaponName].unlocked = true;
        }
    }

    canFire(ammo) {
        const now = performance.now();
        return ammo >= this.currentDef.ammoPerShot &&
               now - this.lastFireTime >= this.currentDef.fireRate;
    }

    fire(player, enemies, ammo) {
        if (!this.canFire(ammo)) return { hit: false, ammoUsed: 0 };

        this.lastFireTime = performance.now();
        this.muzzleFlash = 4;
        this.animFrame = 1;

        // Play sound
        switch (this.current) {
            case 'pistol': Audio.playPistol(); break;
            case 'shotgun': Audio.playShotgun(); break;
            case 'plasma': Audio.playPlasma(); break;
        }

        const def = this.currentDef;
        let totalHits = [];

        for (let p = 0; p < def.projectiles; p++) {
            const spread = (Math.random() - 0.5) * def.spread;
            const rayAngle = player.angle + spread;

            // Check each enemy for hit
            for (const enemy of enemies) {
                if (!enemy.active || enemy.health <= 0) continue;

                const dx = enemy.x - player.x;
                const dy = enemy.y - player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > def.range) continue;

                // Check if enemy is in the firing cone
                let enemyAngle = Math.atan2(dy, dx);
                let angleDiff = enemyAngle - rayAngle;
                while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
                while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

                // Hit detection - wider at closer range
                const hitWidth = 0.4 / dist;
                if (Math.abs(angleDiff) < hitWidth) {
                    // Check line of sight (simplified - check if wall is closer)
                    const blocked = this.isBlocked(player, enemy, player.currentMap);
                    if (!blocked) {
                        totalHits.push({ enemy, damage: def.damage, dist });
                    }
                }
            }
        }

        // Apply damage to closest hit per projectile
        totalHits.sort((a, b) => a.dist - b.dist);
        const hitEnemies = new Set();
        let hitResults = [];

        for (const hit of totalHits) {
            if (!hitEnemies.has(hit.enemy) || this.current === 'shotgun') {
                hit.enemy.takeDamage(hit.damage);
                hitEnemies.add(hit.enemy);
                hitResults.push(hit);
            }
        }

        return { hit: hitResults.length > 0, ammoUsed: def.ammoPerShot, hits: hitResults };
    }

    isBlocked(player, enemy, map) {
        if (!map) return false;
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.floor(dist * 4);
        const stepX = dx / steps;
        const stepY = dy / steps;

        for (let i = 1; i < steps; i++) {
            const checkX = Math.floor(player.x + stepX * i);
            const checkY = Math.floor(player.y + stepY * i);
            if (checkY >= 0 && checkY < map.length && checkX >= 0 && checkX < map[0].length) {
                if (map[checkY][checkX] > 0) {
                    return true;
                }
            }
        }
        return false;
    }

    update(dt) {
        if (this.muzzleFlash > 0) this.muzzleFlash--;

        this.animTimer += dt;
        if (this.animTimer > 50) {
            this.animTimer = 0;
            if (this.animFrame > 0) {
                this.animFrame++;
                if (this.animFrame > 4) this.animFrame = 0;
            }
        }
    }

    drawWeapon(ctx) {
        const centerX = SCREEN_WIDTH / 2;
        const baseY = SCREEN_HEIGHT;
        const bobX = Math.sin(performance.now() / 200) * 3;
        const bobY = Math.abs(Math.cos(performance.now() / 200)) * 3;

        // Recoil animation
        let recoilY = 0;
        if (this.animFrame > 0) {
            recoilY = this.animFrame === 1 ? -20 : this.animFrame === 2 ? -15 : this.animFrame === 3 ? -8 : 0;
        }

        ctx.save();
        ctx.translate(bobX, bobY + recoilY);

        switch (this.current) {
            case 'pistol':
                this.drawPistol(ctx, centerX, baseY);
                break;
            case 'shotgun':
                this.drawShotgunWeapon(ctx, centerX, baseY);
                break;
            case 'plasma':
                this.drawPlasmaGun(ctx, centerX, baseY);
                break;
        }

        // Muzzle flash
        if (this.muzzleFlash > 0) {
            this.drawMuzzleFlash(ctx, centerX, baseY - 200);
        }

        ctx.restore();
    }

    drawPistol(ctx, cx, by) {
        // Barrel
        ctx.fillStyle = '#555';
        ctx.fillRect(cx - 8, by - 200, 16, 80);
        // Slide
        ctx.fillStyle = '#444';
        ctx.fillRect(cx - 10, by - 180, 20, 60);
        // Grip
        ctx.fillStyle = '#3a2a1a';
        ctx.fillRect(cx - 12, by - 120, 24, 80);
        // Trigger guard
        ctx.fillStyle = '#444';
        ctx.beginPath();
        ctx.arc(cx, by - 115, 8, 0, Math.PI);
        ctx.fill();
        // Sight
        ctx.fillStyle = '#666';
        ctx.fillRect(cx - 3, by - 205, 6, 8);
        // Highlight
        ctx.fillStyle = '#666';
        ctx.fillRect(cx - 8, by - 200, 2, 80);
    }

    drawShotgunWeapon(ctx, cx, by) {
        // Barrels (double)
        ctx.fillStyle = '#444';
        ctx.fillRect(cx - 14, by - 240, 12, 120);
        ctx.fillRect(cx + 2, by - 240, 12, 120);
        // Barrel openings
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(cx - 8, by - 240, 5, 0, Math.PI * 2);
        ctx.arc(cx + 8, by - 240, 5, 0, Math.PI * 2);
        ctx.fill();
        // Pump
        ctx.fillStyle = '#7a5230';
        ctx.fillRect(cx - 16, by - 160, 32, 30);
        // Stock
        ctx.fillStyle = '#5a3a1a';
        ctx.fillRect(cx - 12, by - 130, 24, 100);
        // Receiver
        ctx.fillStyle = '#555';
        ctx.fillRect(cx - 14, by - 120, 28, 20);
        // Highlight
        ctx.fillStyle = '#555';
        ctx.fillRect(cx - 14, by - 240, 2, 120);
    }

    drawPlasmaGun(ctx, cx, by) {
        // Main body
        ctx.fillStyle = '#336';
        ctx.fillRect(cx - 18, by - 200, 36, 80);
        // Barrel
        ctx.fillStyle = '#448';
        ctx.fillRect(cx - 10, by - 240, 20, 50);
        // Energy core (glowing)
        const pulse = Math.sin(performance.now() / 100) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(0, 150, 255, ${pulse})`;
        ctx.beginPath();
        ctx.arc(cx, by - 160, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(100, 200, 255, ${pulse * 0.5})`;
        ctx.beginPath();
        ctx.arc(cx, by - 160, 16, 0, Math.PI * 2);
        ctx.fill();
        // Barrel opening
        ctx.fillStyle = '#0af';
        ctx.beginPath();
        ctx.arc(cx, by - 240, 6, 0, Math.PI * 2);
        ctx.fill();
        // Grip
        ctx.fillStyle = '#224';
        ctx.fillRect(cx - 14, by - 120, 28, 80);
        // Details
        ctx.fillStyle = '#08f';
        ctx.fillRect(cx - 16, by - 190, 2, 40);
        ctx.fillRect(cx + 14, by - 190, 2, 40);
    }

    drawMuzzleFlash(ctx, cx, y) {
        const def = this.currentDef;
        const size = this.current === 'shotgun' ? 40 : 25;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        // Outer glow
        const gradient = ctx.createRadialGradient(cx, y, 0, cx, y, size);
        gradient.addColorStop(0, def.muzzleColor);
        gradient.addColorStop(0.5, def.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(cx - size, y - size, size * 2, size * 2);

        // Inner flash
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(cx, y, size * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
