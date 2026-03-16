// Procedural texture generation
const TextureGen = {
    size: 64,

    createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.width = this.size;
        canvas.height = this.size;
        return canvas;
    },

    // Stone wall texture
    stoneWall() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#555';
        ctx.fillRect(0, 0, 64, 64);

        // Stone blocks
        const blockColors = ['#4a4a4a', '#505050', '#585858', '#464646'];
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                const offset = (y % 2) ? 8 : 0;
                ctx.fillStyle = blockColors[Math.floor(Math.random() * blockColors.length)];
                ctx.fillRect(x * 16 + offset, y * 16, 15, 15);
                ctx.fillStyle = '#333';
                ctx.fillRect(x * 16 + offset, y * 16 + 15, 16, 1);
                ctx.fillRect(x * 16 + offset + 15, y * 16, 1, 16);
            }
        }
        // Noise
        this.addNoise(ctx, 0.15);
        return canvas;
    },

    // Brick wall texture
    brickWall() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(0, 0, 64, 64);

        for (let row = 0; row < 8; row++) {
            const offset = (row % 2) ? 16 : 0;
            for (let col = -1; col < 3; col++) {
                const shade = 0.85 + Math.random() * 0.3;
                const r = Math.floor(139 * shade);
                const g = Math.floor(69 * shade);
                const b = Math.floor(19 * shade);
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(col * 32 + offset + 1, row * 8 + 1, 30, 6);
            }
            // Mortar lines
            ctx.fillStyle = '#666';
            ctx.fillRect(0, row * 8, 64, 1);
        }
        this.addNoise(ctx, 0.1);
        return canvas;
    },

    // Metal wall texture
    metalWall() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#667';
        ctx.fillRect(0, 0, 64, 64);

        // Panels
        ctx.fillStyle = '#778';
        ctx.fillRect(2, 2, 28, 28);
        ctx.fillRect(34, 2, 28, 28);
        ctx.fillRect(2, 34, 28, 28);
        ctx.fillRect(34, 34, 28, 28);

        // Rivets
        ctx.fillStyle = '#99a';
        for (const [x, y] of [[4,4],[28,4],[4,28],[28,28],[36,4],[60,4],[36,28],[60,28],[4,36],[28,36],[4,60],[28,60],[36,36],[60,36],[36,60],[60,60]]) {
            ctx.fillRect(x, y, 2, 2);
        }

        // Highlights
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(2, 2, 28, 1);
        ctx.fillRect(34, 2, 28, 1);
        ctx.fillRect(2, 34, 28, 1);
        ctx.fillRect(34, 34, 28, 1);

        this.addNoise(ctx, 0.08);
        return canvas;
    },

    // Tech wall texture
    techWall() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#334';
        ctx.fillRect(0, 0, 64, 64);

        // Circuit pattern
        ctx.strokeStyle = '#0a5';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(10, 0); ctx.lineTo(10, 20); ctx.lineTo(30, 20); ctx.lineTo(30, 40);
        ctx.moveTo(50, 0); ctx.lineTo(50, 15); ctx.lineTo(35, 15); ctx.lineTo(35, 50);
        ctx.moveTo(0, 45); ctx.lineTo(20, 45); ctx.lineTo(20, 64);
        ctx.moveTo(45, 35); ctx.lineTo(64, 35);
        ctx.moveTo(45, 55); ctx.lineTo(64, 55);
        ctx.stroke();

        // Nodes
        ctx.fillStyle = '#0f8';
        for (const [x, y] of [[10, 20],[30, 40],[50, 15],[35, 50],[20, 45]]) {
            ctx.fillRect(x - 1, y - 1, 3, 3);
        }

        // Screen
        ctx.fillStyle = '#041';
        ctx.fillRect(42, 42, 18, 18);
        ctx.fillStyle = '#0f4';
        ctx.font = '8px monospace';
        ctx.fillText('OK', 46, 54);

        this.addNoise(ctx, 0.05);
        return canvas;
    },

    // Door texture
    doorTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#654';
        ctx.fillRect(0, 0, 64, 64);

        // Door panels
        ctx.fillStyle = '#543';
        ctx.fillRect(4, 4, 24, 26);
        ctx.fillRect(36, 4, 24, 26);
        ctx.fillRect(4, 34, 24, 26);
        ctx.fillRect(36, 34, 24, 26);

        // Door frame highlights
        ctx.fillStyle = '#876';
        ctx.fillRect(0, 0, 64, 2);
        ctx.fillRect(0, 0, 2, 64);
        ctx.fillStyle = '#432';
        ctx.fillRect(0, 62, 64, 2);
        ctx.fillRect(62, 0, 2, 64);

        // Handle
        ctx.fillStyle = '#aa8';
        ctx.fillRect(52, 30, 4, 6);

        this.addNoise(ctx, 0.1);
        return canvas;
    },

    // Exit texture
    exitTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#300';
        ctx.fillRect(0, 0, 64, 64);

        // Frame
        ctx.fillStyle = '#f00';
        ctx.fillRect(0, 0, 64, 3);
        ctx.fillRect(0, 61, 64, 3);
        ctx.fillRect(0, 0, 3, 64);
        ctx.fillRect(61, 0, 3, 64);

        // EXIT text
        ctx.fillStyle = '#f00';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('EXIT', 32, 37);

        // Glow
        ctx.fillStyle = 'rgba(255, 0, 0, 0.15)';
        ctx.fillRect(5, 5, 54, 54);

        return canvas;
    },

    // Wood texture
    woodWall() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#7a5230';
        ctx.fillRect(0, 0, 64, 64);

        // Wood grain
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 20; i++) {
            const y = Math.random() * 64;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.bezierCurveTo(20, y + (Math.random() - 0.5) * 8, 40, y + (Math.random() - 0.5) * 8, 64, y + (Math.random() - 0.5) * 4);
            ctx.stroke();
        }

        // Plank dividers
        ctx.fillStyle = '#5a3a1a';
        ctx.fillRect(0, 15, 64, 2);
        ctx.fillRect(0, 31, 64, 2);
        ctx.fillRect(0, 47, 64, 2);

        this.addNoise(ctx, 0.1);
        return canvas;
    },

    // Hell texture
    hellWall() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#411';
        ctx.fillRect(0, 0, 64, 64);

        // Lava cracks
        ctx.strokeStyle = '#f50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(10, 0); ctx.lineTo(15, 20); ctx.lineTo(8, 40); ctx.lineTo(20, 64);
        ctx.moveTo(40, 0); ctx.lineTo(35, 25); ctx.lineTo(50, 45); ctx.lineTo(45, 64);
        ctx.stroke();

        ctx.strokeStyle = '#fa0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(10, 0); ctx.lineTo(15, 20); ctx.lineTo(8, 40); ctx.lineTo(20, 64);
        ctx.moveTo(40, 0); ctx.lineTo(35, 25); ctx.lineTo(50, 45); ctx.lineTo(45, 64);
        ctx.stroke();

        // Skulls/faces suggestion
        ctx.fillStyle = '#633';
        ctx.beginPath();
        ctx.arc(32, 32, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#200';
        ctx.fillRect(28, 30, 3, 3);
        ctx.fillRect(34, 30, 3, 3);
        ctx.fillRect(30, 36, 5, 2);

        this.addNoise(ctx, 0.15);
        return canvas;
    },

    // Floor texture
    floorTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, 64, 64);

        // Tile pattern
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(0, 0, 31, 31);
        ctx.fillRect(33, 33, 31, 31);
        ctx.fillStyle = '#2e2e2e';
        ctx.fillRect(33, 0, 31, 31);
        ctx.fillRect(0, 33, 31, 31);

        ctx.fillStyle = '#282828';
        ctx.fillRect(31, 0, 2, 64);
        ctx.fillRect(0, 31, 64, 2);

        this.addNoise(ctx, 0.1);
        return canvas;
    },

    // Ceiling texture
    ceilingTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, 64, 64);

        // Light panel effect
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(8, 8, 48, 48);
        ctx.fillStyle = '#252525';
        ctx.fillRect(16, 16, 32, 32);

        this.addNoise(ctx, 0.08);
        return canvas;
    },

    addNoise(ctx, intensity) {
        const imageData = ctx.getImageData(0, 0, this.size, this.size);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 255 * intensity;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }
        ctx.putImageData(imageData, 0, 0);
    }
};

// Generate all textures at startup
const Textures = {};

function initTextures() {
    Textures[WALL_STONE] = TextureGen.stoneWall();
    Textures[WALL_BRICK] = TextureGen.brickWall();
    Textures[WALL_METAL] = TextureGen.metalWall();
    Textures[WALL_TECH] = TextureGen.techWall();
    Textures[WALL_DOOR] = TextureGen.doorTexture();
    Textures[WALL_EXIT] = TextureGen.exitTexture();
    Textures[WALL_WOOD] = TextureGen.woodWall();
    Textures[WALL_HELL] = TextureGen.hellWall();
    Textures.floor = TextureGen.floorTexture();
    Textures.ceiling = TextureGen.ceilingTexture();

    // Pre-extract image data for fast pixel access
    Textures.data = {};
    for (const key of Object.keys(Textures)) {
        if (key === 'data') continue;
        const canvas = Textures[key];
        const ctx = canvas.getContext('2d');
        Textures.data[key] = ctx.getImageData(0, 0, 64, 64).data;
    }
}
