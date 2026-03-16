// Procedural sprite generation for enemies and pickups
const SpriteGen = {
    createCanvas(w, h) {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        return canvas;
    },

    // Imp enemy - brown/tan demon
    impSprite() {
        const canvas = this.createCanvas(64, 64);
        const ctx = canvas.getContext('2d');

        // Body
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(20, 20, 24, 30);

        // Head
        ctx.fillStyle = '#A0522D';
        ctx.beginPath();
        ctx.arc(32, 16, 10, 0, Math.PI * 2);
        ctx.fill();

        // Eyes (glowing red)
        ctx.fillStyle = '#f00';
        ctx.fillRect(27, 13, 3, 3);
        ctx.fillRect(34, 13, 3, 3);

        // Horns
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.moveTo(24, 8); ctx.lineTo(22, 0); ctx.lineTo(27, 8);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(37, 8); ctx.lineTo(42, 0); ctx.lineTo(40, 8);
        ctx.fill();

        // Arms
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(12, 22, 8, 6);
        ctx.fillRect(44, 22, 8, 6);

        // Claws
        ctx.fillStyle = '#654321';
        ctx.fillRect(10, 28, 3, 5);
        ctx.fillRect(14, 28, 3, 5);
        ctx.fillRect(47, 28, 3, 5);
        ctx.fillRect(51, 28, 3, 5);

        // Legs
        ctx.fillStyle = '#7B3F00';
        ctx.fillRect(22, 50, 8, 14);
        ctx.fillRect(34, 50, 8, 14);

        return canvas;
    },

    // Demon - pink/red bigger enemy
    demonSprite() {
        const canvas = this.createCanvas(64, 64);
        const ctx = canvas.getContext('2d');

        // Body (larger)
        ctx.fillStyle = '#C0392B';
        ctx.fillRect(14, 16, 36, 34);

        // Head
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath();
        ctx.arc(32, 14, 12, 0, Math.PI * 2);
        ctx.fill();

        // Jaw
        ctx.fillStyle = '#C0392B';
        ctx.fillRect(22, 18, 20, 8);

        // Teeth
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(24 + i * 4, 22, 2, 4);
        }

        // Eyes
        ctx.fillStyle = '#ff0';
        ctx.fillRect(25, 10, 4, 4);
        ctx.fillRect(35, 10, 4, 4);
        ctx.fillStyle = '#f00';
        ctx.fillRect(26, 11, 2, 2);
        ctx.fillRect(36, 11, 2, 2);

        // Arms/claws
        ctx.fillStyle = '#C0392B';
        ctx.fillRect(6, 20, 8, 20);
        ctx.fillRect(50, 20, 8, 20);

        // Legs
        ctx.fillStyle = '#922B21';
        ctx.fillRect(18, 50, 10, 14);
        ctx.fillRect(36, 50, 10, 14);

        return canvas;
    },

    // Baron of Hell - tall, green/brown
    baronSprite() {
        const canvas = this.createCanvas(64, 64);
        const ctx = canvas.getContext('2d');

        // Body
        ctx.fillStyle = '#2E4A1E';
        ctx.fillRect(16, 10, 32, 38);

        // Head
        ctx.fillStyle = '#3D5E2A';
        ctx.beginPath();
        ctx.arc(32, 10, 12, 0, Math.PI * 2);
        ctx.fill();

        // Horns (large)
        ctx.fillStyle = '#5A3E1B';
        ctx.beginPath();
        ctx.moveTo(22, 2); ctx.lineTo(16, -8); ctx.lineTo(26, 4);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(42, 2); ctx.lineTo(48, -8); ctx.lineTo(38, 4);
        ctx.fill();

        // Eyes (green fire)
        ctx.fillStyle = '#0f0';
        ctx.fillRect(26, 7, 4, 4);
        ctx.fillRect(34, 7, 4, 4);

        // Chest detail
        ctx.fillStyle = '#4A6E2E';
        ctx.fillRect(22, 18, 20, 4);

        // Arms (muscular)
        ctx.fillStyle = '#2E4A1E';
        ctx.fillRect(6, 14, 10, 24);
        ctx.fillRect(48, 14, 10, 24);

        // Fists (glowing)
        ctx.fillStyle = '#0f0';
        ctx.fillRect(6, 38, 10, 8);
        ctx.fillRect(48, 38, 10, 8);

        // Legs
        ctx.fillStyle = '#1E3A0E';
        ctx.fillRect(20, 48, 10, 16);
        ctx.fillRect(34, 48, 10, 16);

        // Hooves
        ctx.fillStyle = '#5A3E1B';
        ctx.fillRect(18, 60, 14, 4);
        ctx.fillRect(32, 60, 14, 4);

        return canvas;
    },

    // Health pickup
    healthPickup() {
        const canvas = this.createCanvas(32, 32);
        const ctx = canvas.getContext('2d');

        // Vial
        ctx.fillStyle = '#06f';
        ctx.fillRect(10, 8, 12, 20);

        // Cross
        ctx.fillStyle = '#fff';
        ctx.fillRect(13, 12, 6, 2);
        ctx.fillRect(15, 10, 2, 6);

        // Cap
        ctx.fillStyle = '#888';
        ctx.fillRect(10, 6, 12, 3);

        // Glow
        ctx.fillStyle = 'rgba(0, 100, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(16, 18, 12, 0, Math.PI * 2);
        ctx.fill();

        return canvas;
    },

    // Armor pickup
    armorPickup() {
        const canvas = this.createCanvas(32, 32);
        const ctx = canvas.getContext('2d');

        // Shield
        ctx.fillStyle = '#080';
        ctx.beginPath();
        ctx.moveTo(16, 4);
        ctx.lineTo(26, 10);
        ctx.lineTo(24, 24);
        ctx.lineTo(16, 28);
        ctx.lineTo(8, 24);
        ctx.lineTo(6, 10);
        ctx.closePath();
        ctx.fill();

        // Inner shield
        ctx.fillStyle = '#0a0';
        ctx.beginPath();
        ctx.moveTo(16, 8);
        ctx.lineTo(22, 12);
        ctx.lineTo(21, 22);
        ctx.lineTo(16, 25);
        ctx.lineTo(11, 22);
        ctx.lineTo(10, 12);
        ctx.closePath();
        ctx.fill();

        return canvas;
    },

    // Ammo pickup
    ammoPickup() {
        const canvas = this.createCanvas(32, 32);
        const ctx = canvas.getContext('2d');

        // Box
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(6, 10, 20, 16);

        // Label
        ctx.fillStyle = '#ff0';
        ctx.font = 'bold 8px monospace';
        ctx.fillText('AMMO', 7, 21);

        // Bullets poking out
        ctx.fillStyle = '#da0';
        ctx.fillRect(8, 6, 3, 6);
        ctx.fillRect(13, 4, 3, 8);
        ctx.fillRect(18, 6, 3, 6);

        // Bullet tips
        ctx.fillStyle = '#a80';
        ctx.fillRect(8, 4, 3, 3);
        ctx.fillRect(13, 2, 3, 3);
        ctx.fillRect(18, 4, 3, 3);

        return canvas;
    },

    // Shotgun pickup
    shotgunPickup() {
        const canvas = this.createCanvas(48, 32);
        const ctx = canvas.getContext('2d');

        // Barrel
        ctx.fillStyle = '#555';
        ctx.fillRect(4, 12, 30, 4);

        // Stock
        ctx.fillStyle = '#7a5230';
        ctx.fillRect(34, 10, 12, 8);

        // Pump
        ctx.fillStyle = '#444';
        ctx.fillRect(14, 10, 8, 8);

        // Glow
        ctx.fillStyle = 'rgba(255, 200, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(24, 16, 14, 0, Math.PI * 2);
        ctx.fill();

        return canvas;
    },

    // Plasma gun pickup
    plasmaPickup() {
        const canvas = this.createCanvas(48, 32);
        const ctx = canvas.getContext('2d');

        // Body
        ctx.fillStyle = '#336';
        ctx.fillRect(6, 10, 28, 10);

        // Barrel
        ctx.fillStyle = '#448';
        ctx.fillRect(2, 12, 6, 6);

        // Energy cell
        ctx.fillStyle = '#08f';
        ctx.fillRect(34, 8, 10, 14);
        ctx.fillStyle = '#0af';
        ctx.fillRect(36, 10, 6, 10);

        // Glow
        ctx.fillStyle = 'rgba(0, 150, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(24, 16, 14, 0, Math.PI * 2);
        ctx.fill();

        return canvas;
    },

    // Barrel (explosive)
    barrelSprite() {
        const canvas = this.createCanvas(32, 48);
        const ctx = canvas.getContext('2d');

        // Barrel body
        ctx.fillStyle = '#4a4';
        ctx.fillRect(6, 8, 20, 36);

        // Top
        ctx.fillStyle = '#5b5';
        ctx.beginPath();
        ctx.ellipse(16, 10, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hazard symbol
        ctx.fillStyle = '#ff0';
        ctx.beginPath();
        ctx.moveTo(16, 18);
        ctx.lineTo(22, 30);
        ctx.lineTo(10, 30);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText('!', 14, 29);

        // Bands
        ctx.fillStyle = '#383';
        ctx.fillRect(6, 14, 20, 2);
        ctx.fillRect(6, 36, 20, 2);

        return canvas;
    },

    // Lamp sprite
    lampSprite() {
        const canvas = this.createCanvas(16, 48);
        const ctx = canvas.getContext('2d');

        // Pole
        ctx.fillStyle = '#666';
        ctx.fillRect(6, 16, 4, 32);

        // Base
        ctx.fillStyle = '#555';
        ctx.fillRect(2, 44, 12, 4);

        // Light
        ctx.fillStyle = '#ff8';
        ctx.beginPath();
        ctx.arc(8, 12, 6, 0, Math.PI * 2);
        ctx.fill();

        // Glow
        ctx.fillStyle = 'rgba(255, 255, 100, 0.3)';
        ctx.beginPath();
        ctx.arc(8, 12, 10, 0, Math.PI * 2);
        ctx.fill();

        return canvas;
    },

    // Dead enemy sprite
    deadSprite(color) {
        const canvas = this.createCanvas(64, 32);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = color;
        ctx.fillRect(8, 10, 48, 12);

        // Blood pool
        ctx.fillStyle = 'rgba(150, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.ellipse(32, 22, 24, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        return canvas;
    }
};

const Sprites = {};

function initSprites() {
    Sprites.imp = SpriteGen.impSprite();
    Sprites.demon = SpriteGen.demonSprite();
    Sprites.baron = SpriteGen.baronSprite();
    Sprites.health = SpriteGen.healthPickup();
    Sprites.armor = SpriteGen.armorPickup();
    Sprites.ammo = SpriteGen.ammoPickup();
    Sprites.shotgun_pickup = SpriteGen.shotgunPickup();
    Sprites.plasma_pickup = SpriteGen.plasmaPickup();
    Sprites.barrel = SpriteGen.barrelSprite();
    Sprites.lamp = SpriteGen.lampSprite();
    Sprites.deadImp = SpriteGen.deadSprite('#8B4513');
    Sprites.deadDemon = SpriteGen.deadSprite('#C0392B');
    Sprites.deadBaron = SpriteGen.deadSprite('#2E4A1E');
}
