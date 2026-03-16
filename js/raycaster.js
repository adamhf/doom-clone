// Raycasting engine
class Raycaster {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = SCREEN_WIDTH;
        this.canvas.height = SCREEN_HEIGHT;
        this.imageData = this.ctx.createImageData(SCREEN_WIDTH, SCREEN_HEIGHT);
        this.depthBuffer = new Float32Array(SCREEN_WIDTH);
    }

    castRays(player, map) {
        const rays = [];
        for (let i = 0; i < NUM_RAYS; i++) {
            const rayAngle = player.angle - HALF_FOV + i * DELTA_ANGLE;
            const ray = this.castSingleRay(player.x, player.y, rayAngle, map);
            // Fix fisheye distortion
            ray.correctedDist = ray.distance * Math.cos(rayAngle - player.angle);
            rays.push(ray);
            this.depthBuffer[i] = ray.correctedDist;
        }
        return rays;
    }

    castSingleRay(originX, originY, angle, map) {
        const sinA = Math.sin(angle);
        const cosA = Math.cos(angle);

        // Horizontal intersections
        let hDist = Infinity, hX = 0, hY = 0, hTex = 0, hOffset = 0;
        {
            const yDir = sinA > 0 ? 1 : -1;
            const firstY = sinA > 0 ? Math.floor(originY) + 1 : Math.floor(originY);
            const firstX = originX + (firstY - originY) / sinA * cosA;
            const stepY = yDir;
            const stepX = stepY / sinA * cosA;

            let mapX = firstX;
            let mapY = firstY;

            for (let i = 0; i < MAX_DEPTH * 2; i++) {
                const cellX = Math.floor(mapX);
                const cellY = sinA > 0 ? Math.floor(mapY) : Math.floor(mapY) - 1;

                if (cellX < 0 || cellY < 0 || cellY >= map.length || cellX >= map[0].length) break;

                if (map[cellY] && map[cellY][cellX] > 0) {
                    hTex = map[cellY][cellX];
                    hX = mapX;
                    hY = mapY;
                    hDist = Math.sqrt((mapX - originX) ** 2 + (mapY - originY) ** 2);
                    hOffset = mapX - Math.floor(mapX);
                    break;
                }
                mapX += stepX;
                mapY += stepY;
            }
        }

        // Vertical intersections
        let vDist = Infinity, vX = 0, vY = 0, vTex = 0, vOffset = 0;
        {
            const xDir = cosA > 0 ? 1 : -1;
            const firstX = cosA > 0 ? Math.floor(originX) + 1 : Math.floor(originX);
            const firstY = originY + (firstX - originX) / cosA * sinA;
            const stepX = xDir;
            const stepY = stepX / cosA * sinA;

            let mapX = firstX;
            let mapY = firstY;

            for (let i = 0; i < MAX_DEPTH * 2; i++) {
                const cellX = cosA > 0 ? Math.floor(mapX) : Math.floor(mapX) - 1;
                const cellY = Math.floor(mapY);

                if (cellX < 0 || cellY < 0 || cellY >= map.length || cellX >= map[0].length) break;

                if (map[cellY] && map[cellY][cellX] > 0) {
                    vTex = map[cellY][cellX];
                    vX = mapX;
                    vY = mapY;
                    vDist = Math.sqrt((mapX - originX) ** 2 + (mapY - originY) ** 2);
                    vOffset = mapY - Math.floor(mapY);
                    break;
                }
                mapX += stepX;
                mapY += stepY;
            }
        }

        if (hDist < vDist) {
            return { distance: hDist, wallType: hTex, textureOffset: hOffset, hitX: hX, hitY: hY, side: 0 };
        } else {
            return { distance: vDist, wallType: vTex, textureOffset: vOffset, hitX: vX, hitY: vY, side: 1 };
        }
    }

    render(player, map, entities) {
        const data = this.imageData.data;

        // Clear to black
        data.fill(0);

        // Draw ceiling and floor gradients
        for (let y = 0; y < SCREEN_HEIGHT; y++) {
            for (let x = 0; x < SCREEN_WIDTH; x++) {
                const idx = (y * SCREEN_WIDTH + x) * 4;
                if (y < SCREEN_HEIGHT / 2) {
                    // Ceiling - dark gray gradient
                    const shade = Math.floor(30 * (1 - y / (SCREEN_HEIGHT / 2)));
                    data[idx] = shade;
                    data[idx + 1] = shade;
                    data[idx + 2] = shade + 5;
                    data[idx + 3] = 255;
                } else {
                    // Floor - dark gradient
                    const shade = Math.floor(40 * ((y - SCREEN_HEIGHT / 2) / (SCREEN_HEIGHT / 2)));
                    data[idx] = shade;
                    data[idx + 1] = shade;
                    data[idx + 2] = shade;
                    data[idx + 3] = 255;
                }
            }
        }

        // Cast rays and draw walls
        const rays = this.castRays(player, map);

        for (let x = 0; x < NUM_RAYS; x++) {
            const ray = rays[x];
            if (ray.correctedDist <= 0) continue;

            const wallHeight = Math.min(SCREEN_HEIGHT * 2, WALL_HEIGHT_SCALE / ray.correctedDist);
            const wallTop = Math.floor((SCREEN_HEIGHT - wallHeight) / 2);
            const wallBottom = Math.floor(wallTop + wallHeight);

            // Get texture data
            const texData = Textures.data[ray.wallType];
            const texX = Math.floor(ray.textureOffset * 64) % 64;

            // Shade based on distance and side
            const distShade = Math.max(0.15, 1 - ray.correctedDist / MAX_DEPTH);
            const sideShade = ray.side === 1 ? 0.8 : 1.0;
            const shade = distShade * sideShade;

            for (let y = Math.max(0, wallTop); y < Math.min(SCREEN_HEIGHT, wallBottom); y++) {
                const texY = Math.floor(((y - wallTop) / wallHeight) * 64) % 64;
                const texIdx = (texY * 64 + texX) * 4;
                const idx = (y * SCREEN_WIDTH + x) * 4;

                if (texData) {
                    data[idx] = Math.floor(texData[texIdx] * shade);
                    data[idx + 1] = Math.floor(texData[texIdx + 1] * shade);
                    data[idx + 2] = Math.floor(texData[texIdx + 2] * shade);
                } else {
                    data[idx] = Math.floor(100 * shade);
                    data[idx + 1] = Math.floor(100 * shade);
                    data[idx + 2] = Math.floor(100 * shade);
                }
                data[idx + 3] = 255;
            }
        }

        this.ctx.putImageData(this.imageData, 0, 0);

        // Draw sprites (entities) on top using canvas 2D
        this.renderSprites(player, entities);
    }

    renderSprites(player, entities) {
        // Calculate distance and angle for each entity
        const visibleSprites = [];

        for (const entity of entities) {
            if (!entity.active) continue;

            const dx = entity.x - player.x;
            const dy = entity.y - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 0.3 || dist > MAX_DEPTH) continue;

            let angle = Math.atan2(dy, dx) - player.angle;
            // Normalize angle
            while (angle > Math.PI) angle -= 2 * Math.PI;
            while (angle < -Math.PI) angle += 2 * Math.PI;

            // Check if in view
            if (Math.abs(angle) > HALF_FOV + 0.2) continue;

            visibleSprites.push({ entity, dist, angle });
        }

        // Sort back to front
        visibleSprites.sort((a, b) => b.dist - a.dist);

        const ctx = this.ctx;

        for (const { entity, dist, angle } of visibleSprites) {
            const screenX = (0.5 + angle / FOV) * SCREEN_WIDTH;

            // Sprite size based on distance
            const spriteHeight = Math.min(SCREEN_HEIGHT, WALL_HEIGHT_SCALE / dist);
            const spriteWidth = spriteHeight * (entity.spriteCanvas.width / entity.spriteCanvas.height);

            const drawX = screenX - spriteWidth / 2;
            const drawY = (SCREEN_HEIGHT - spriteHeight) / 2;

            // Only draw if not fully behind a wall
            const centerCol = Math.floor(screenX);
            if (centerCol >= 0 && centerCol < SCREEN_WIDTH && this.depthBuffer[centerCol] < dist) {
                // Check if mostly occluded
                let visibleCols = 0;
                const startCol = Math.max(0, Math.floor(drawX));
                const endCol = Math.min(SCREEN_WIDTH - 1, Math.floor(drawX + spriteWidth));
                for (let c = startCol; c <= endCol; c += 4) {
                    if (this.depthBuffer[c] >= dist) visibleCols++;
                }
                if (visibleCols === 0) continue;
            }

            // Distance-based darkening
            const shade = Math.max(0.15, 1 - dist / MAX_DEPTH);
            ctx.save();
            ctx.globalAlpha = shade;

            // Clip sprite columns against depth buffer
            ctx.beginPath();
            for (let col = Math.max(0, Math.floor(drawX)); col < Math.min(SCREEN_WIDTH, Math.ceil(drawX + spriteWidth)); col++) {
                if (this.depthBuffer[col] >= dist) {
                    ctx.rect(col, drawY, 1, spriteHeight);
                }
            }
            ctx.clip();

            ctx.drawImage(entity.spriteCanvas, drawX, drawY, spriteWidth, spriteHeight);
            ctx.restore();
        }
    }
}
