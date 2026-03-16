// Main game controller
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.raycaster = new Raycaster(this.canvas);
        this.player = new Player();
        this.state = STATE_MENU;
        this.currentLevel = 0;
        this.entities = [];
        this.enemies = [];
        this.map = null;
        this.message = '';
        this.messageTimer = 0;
        this.lastTime = 0;
        this.minimapCanvas = document.getElementById('minimap-canvas');
        this.minimapCtx = this.minimapCanvas.getContext('2d');
        this.pointerLocked = false;

        this.setupInput();
        this.setupUI();
    }

    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.player.keys[e.key.toLowerCase()] = true;

            if (e.key === 'Escape') {
                if (this.state === STATE_PLAYING) {
                    this.state = STATE_PAUSED;
                    document.exitPointerLock();
                } else if (this.state === STATE_PAUSED) {
                    this.state = STATE_PLAYING;
                    this.canvas.requestPointerLock();
                }
            }

            if (e.key.toLowerCase() === 'e' && this.state === STATE_PLAYING) {
                const result = this.player.tryInteract(this.map);
                if (result === 'door_opened') {
                    this.showMessage('Door opened');
                } else if (result === 'exit_reached') {
                    this.levelComplete();
                }
            }

            if (e.key === 'Enter' && this.state === STATE_GAME_OVER) {
                this.restartLevel();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.player.keys[e.key.toLowerCase()] = false;
        });

        document.addEventListener('mousemove', (e) => {
            if (this.pointerLocked && this.state === STATE_PLAYING) {
                this.player.mouseDX += e.movementX;
            }
        });

        document.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.player.mouseDown = true;
                if (this.state === STATE_PLAYING && !this.pointerLocked) {
                    this.canvas.requestPointerLock();
                }
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.player.mouseDown = false;
        });

        document.addEventListener('pointerlockchange', () => {
            this.pointerLocked = document.pointerLockElement === this.canvas;
            if (!this.pointerLocked && this.state === STATE_PLAYING) {
                this.state = STATE_PAUSED;
            }
        });

        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    setupUI() {
        document.getElementById('btn-new-game').addEventListener('click', () => {
            Audio.init();
            Audio.resume();
            this.startNewGame();
        });

        document.getElementById('btn-controls').addEventListener('click', () => {
            document.getElementById('controls-info').classList.toggle('hidden');
        });

        document.getElementById('btn-next-level').addEventListener('click', () => {
            this.nextLevel();
        });

        document.getElementById('btn-play-again').addEventListener('click', () => {
            this.startNewGame();
        });
    }

    startNewGame() {
        this.player.fullReset();
        this.currentLevel = 0;
        this.loadLevel(0);
        this.state = STATE_PLAYING;
        document.getElementById('title-screen').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
        document.getElementById('minimap-container').classList.remove('hidden');
        document.getElementById('level-complete').classList.add('hidden');
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('game-won').classList.add('hidden');
        this.canvas.requestPointerLock();
        this.showMessage(Levels[0].name);
    }

    loadLevel(levelIndex) {
        const level = Levels[levelIndex];
        // Deep copy map so doors can be opened
        this.map = level.map.map(row => [...row]);
        this.player.x = level.playerStart.x;
        this.player.y = level.playerStart.y;
        this.player.angle = level.playerStart.angle;
        this.player.kills = 0;

        // Create entities
        this.entities = [];
        this.enemies = [];

        for (const eDef of level.entities) {
            if (eDef.type.startsWith('imp') || eDef.type.startsWith('demon') || eDef.type.startsWith('baron')) {
                const enemy = new Enemy(eDef.type, eDef.x, eDef.y);
                this.entities.push(enemy);
                this.enemies.push(enemy);
            } else if (eDef.type === ENTITY_BARREL || eDef.type === ENTITY_LAMP) {
                this.entities.push(new Decoration(eDef.type, eDef.x, eDef.y));
            } else {
                this.entities.push(new Pickup(eDef.type, eDef.x, eDef.y));
            }
        }

        // Setup minimap
        this.minimapCanvas.width = this.map[0].length * 5;
        this.minimapCanvas.height = this.map.length * 5;
    }

    restartLevel() {
        this.player.health = 100;
        this.player.armor = 0;
        this.player.ammo = 50;
        this.player.kills = 0;
        this.loadLevel(this.currentLevel);
        this.state = STATE_PLAYING;
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
        document.getElementById('minimap-container').classList.remove('hidden');
        this.canvas.requestPointerLock();
        this.showMessage(Levels[this.currentLevel].name);
    }

    levelComplete() {
        this.state = STATE_LEVEL_COMPLETE;
        document.exitPointerLock();

        const level = Levels[this.currentLevel];
        const totalEnemies = this.enemies.length;
        const killPercent = totalEnemies > 0 ? Math.floor((this.player.kills / totalEnemies) * 100) : 100;

        document.getElementById('level-stats').innerHTML =
            `Kills: ${this.player.kills}/${totalEnemies} (${killPercent}%)<br>` +
            `Health: ${this.player.health}%`;
        document.getElementById('level-complete').classList.remove('hidden');

        this.player.totalKills += this.player.kills;
    }

    nextLevel() {
        this.currentLevel++;
        if (this.currentLevel >= Levels.length) {
            this.gameWon();
            return;
        }
        this.loadLevel(this.currentLevel);
        this.state = STATE_PLAYING;
        document.getElementById('level-complete').classList.add('hidden');
        this.canvas.requestPointerLock();
        this.showMessage(Levels[this.currentLevel].name);
    }

    gameWon() {
        this.state = STATE_GAME_WON;
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('minimap-container').classList.add('hidden');
        document.getElementById('level-complete').classList.add('hidden');
        document.getElementById('final-stats').innerHTML =
            `Total Kills: ${this.player.totalKills}<br>Score: ${this.player.score}`;
        document.getElementById('game-won').classList.remove('hidden');
    }

    gameOver() {
        this.state = STATE_GAME_OVER;
        document.exitPointerLock();
        document.getElementById('game-over').classList.remove('hidden');
    }

    showMessage(text) {
        this.message = text;
        this.messageTimer = 2000;
        const el = document.getElementById('message-display');
        el.textContent = text;
        el.classList.remove('hidden');
    }

    update(dt) {
        if (this.state !== STATE_PLAYING) return;

        // Clamp dt to prevent huge jumps
        dt = Math.min(dt, 50);

        // Update player
        this.player.update(dt, this.map);

        // Handle shooting
        if (this.player.mouseDown) {
            const def = this.player.weaponSystem.currentDef;
            if (def.autoFire || !this._wasFiring) {
                const result = this.player.weaponSystem.fire(this.player, this.enemies, this.player.ammo);
                if (result.ammoUsed > 0) {
                    this.player.ammo -= result.ammoUsed;
                }
            }
        }
        this._wasFiring = this.player.mouseDown;

        // Update enemies
        for (const enemy of this.enemies) {
            const result = enemy.update(dt, this.player, this.map, this.enemies);
            if (result && result.type === 'attack') {
                this.player.takeDamage(result.damage);
                this.showDamageOverlay();
            }
        }

        // Check pickups
        for (const entity of this.entities) {
            if (!entity.active || entity.isEnemy || entity.isDecoration) continue;

            const dx = entity.x - this.player.x;
            const dy = entity.y - this.player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 0.7) {
                this.handlePickup(entity);
            }
        }

        // Count kills
        let killCount = 0;
        for (const enemy of this.enemies) {
            if (enemy.state === 'dead') killCount++;
        }
        this.player.kills = killCount;

        // Check if player reached exit (by walking into it)
        const cellX = Math.floor(this.player.x);
        const cellY = Math.floor(this.player.y);
        // Check adjacent cells for exit
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const cy = cellY + dy;
                const cx = cellX + dx;
                if (cy >= 0 && cy < this.map.length && cx >= 0 && cx < this.map[0].length) {
                    if (this.map[cy][cx] === WALL_EXIT) {
                        const distToExit = Math.sqrt((this.player.x - (cx + 0.5)) ** 2 + (this.player.y - (cy + 0.5)) ** 2);
                        if (distToExit < 1.2) {
                            // Check if player presses E near exit
                        }
                    }
                }
            }
        }

        // Message timer
        if (this.messageTimer > 0) {
            this.messageTimer -= dt;
            if (this.messageTimer <= 0) {
                document.getElementById('message-display').classList.add('hidden');
            }
        }

        // Check death
        if (this.player.health <= 0) {
            this.gameOver();
        }

        // Update HUD
        this.updateHUD();
    }

    handlePickup(pickup) {
        let pickedUp = false;

        switch (pickup.type) {
            case ENTITY_PICKUP_HEALTH:
                if (this.player.health < this.player.maxHealth) {
                    this.player.heal(25);
                    this.showMessage('+25 Health');
                    pickedUp = true;
                }
                break;
            case ENTITY_PICKUP_ARMOR:
                if (this.player.armor < this.player.maxArmor) {
                    this.player.addArmor(50);
                    this.showMessage('+50 Armor');
                    pickedUp = true;
                }
                break;
            case ENTITY_PICKUP_AMMO:
                if (this.player.ammo < this.player.maxAmmo) {
                    this.player.addAmmo(20);
                    this.showMessage('+20 Ammo');
                    pickedUp = true;
                }
                break;
            case ENTITY_PICKUP_SHOTGUN:
                this.player.weaponSystem.unlock('shotgun');
                this.player.weaponSystem.switchTo('shotgun');
                this.player.addAmmo(10);
                this.showMessage('Got Shotgun!');
                pickedUp = true;
                break;
            case ENTITY_PICKUP_PLASMA:
                this.player.weaponSystem.unlock('plasma');
                this.player.weaponSystem.switchTo('plasma');
                this.player.addAmmo(30);
                this.showMessage('Got Plasma Gun!');
                pickedUp = true;
                break;
        }

        if (pickedUp) {
            pickup.active = false;
            Audio.playPickup();
            this.player.score += 50;
        }
    }

    showDamageOverlay() {
        const overlay = document.getElementById('damage-overlay');
        overlay.classList.remove('hidden');
        // Force reflow for animation restart
        overlay.offsetHeight;
        overlay.style.animation = 'none';
        overlay.offsetHeight;
        overlay.style.animation = '';
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }

    updateHUD() {
        document.getElementById('health-value').textContent = this.player.health;
        document.getElementById('armor-value').textContent = this.player.armor;
        document.getElementById('ammo-value').textContent = this.player.ammo;
        document.getElementById('kills-value').textContent = this.player.kills;
        document.getElementById('weapon-name').textContent = this.player.weaponSystem.currentDef.name;
        document.getElementById('health-bar').style.width = this.player.health + '%';
        document.getElementById('armor-bar').style.width = this.player.armor + '%';

        // Color health bar based on health
        const hBar = document.getElementById('health-bar');
        if (this.player.health > 60) {
            hBar.style.background = 'linear-gradient(to right, #0a0, #0f0)';
        } else if (this.player.health > 30) {
            hBar.style.background = 'linear-gradient(to right, #aa0, #ff0)';
        } else {
            hBar.style.background = 'linear-gradient(to right, #a00, #f00)';
        }
    }

    render() {
        // Render 3D view
        this.raycaster.render(this.player, this.map, this.entities);

        // Draw weapon on top
        this.player.weaponSystem.drawWeapon(this.ctx);

        // Draw minimap
        this.drawMinimap();
    }

    drawMinimap() {
        const ctx = this.minimapCtx;
        const scale = 5;

        ctx.clearRect(0, 0, this.minimapCanvas.width, this.minimapCanvas.height);

        // Draw map
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                if (this.map[y][x] > 0) {
                    switch (this.map[y][x]) {
                        case WALL_DOOR: ctx.fillStyle = '#a80'; break;
                        case WALL_EXIT: ctx.fillStyle = '#f00'; break;
                        default: ctx.fillStyle = '#666'; break;
                    }
                    ctx.fillRect(x * scale, y * scale, scale, scale);
                } else {
                    ctx.fillStyle = '#222';
                    ctx.fillRect(x * scale, y * scale, scale, scale);
                }
            }
        }

        // Draw enemies
        for (const enemy of this.enemies) {
            if (enemy.state === 'dead') continue;
            ctx.fillStyle = '#f00';
            ctx.fillRect(enemy.x * scale - 1, enemy.y * scale - 1, 3, 3);
        }

        // Draw player
        ctx.fillStyle = '#0f0';
        ctx.fillRect(this.player.x * scale - 2, this.player.y * scale - 2, 4, 4);

        // Draw player direction
        ctx.strokeStyle = '#0f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.player.x * scale, this.player.y * scale);
        ctx.lineTo(
            this.player.x * scale + Math.cos(this.player.angle) * 10,
            this.player.y * scale + Math.sin(this.player.angle) * 10
        );
        ctx.stroke();
    }

    gameLoop(timestamp) {
        const dt = this.lastTime ? timestamp - this.lastTime : 16;
        this.lastTime = timestamp;

        if (this.state === STATE_PLAYING || this.state === STATE_PAUSED) {
            this.update(dt);
            this.render();
        }

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    start() {
        requestAnimationFrame((t) => this.gameLoop(t));
    }
}
