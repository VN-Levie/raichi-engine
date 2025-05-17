import { Component } from "../../core/component";
import { PlayerComponent } from "./playerComponent";

export class TurtleEnemyComponent extends Component {
    private speed = 0.5; // Slower than Goomba
    private direction = 1;
    isAlive = true;
    private deathSpeed = 0;
    private readonly gravity = 0.5;
    private scene: Component[] = [];
    initialX: number;
    initialY: number;
    initialDirection: number;

    // Turtle-specific states
    isShelled = false;
    isMovingInShell = false;
    private shellSpeed = 4; // Speed when moving in shell
    private timeInShell = 0;
    private readonly shellRecoverTime = 5; // Time in seconds before recovering from shell state

    constructor(x: number, y: number, width: number, height: number) {
        super();
        this.x = x;
        this.y = y;
        this.initialX = x;
        this.initialY = y;
        this.width = width;
        this.height = height;
        this.solid = false; // Player should not be "blocked" by enemies via generic collision.
        this.zIndex = 5;
        this.initialDirection = 1;
        this.direction = this.initialDirection;
        this.isShelled = false;
        this.isMovingInShell = false;
    }

    setScene(scene: Component[]) {
        this.scene = scene;
    }

    update(dt: number) {
        if (!this.isAlive) {
            this.y += this.deathSpeed;
            this.deathSpeed += this.gravity;
            if (this.y > 800) {
                this.visible = false;
                this.enabled = false;
            }
            return;
        }

        if (this.isShelled && !this.isMovingInShell) {
            this.timeInShell += dt;
            if (this.timeInShell >= this.shellRecoverTime) {
                // Recover from shell state
                this.isShelled = false;
                this.isMovingInShell = false;
                this.timeInShell = 0;
            }
            // No movement if shelled and not moving
            return;
        }

        const oldX = this.x;
        const currentSpeed = this.isMovingInShell ? this.shellSpeed : this.speed;

        if (this.isLedgeAhead() && !this.isMovingInShell) { // Don't check for ledges if moving in shell (shells fall off)
            this.direction *= -1;
        } else {
            this.x += currentSpeed * this.direction;
            if (this.checkObstacleCollision()) {
                this.x = oldX;
                this.direction *= -1;
            }
        }

        if (this.x <= 0 && this.direction === -1) { this.x = 0; this.direction = 1; }

        const worldWidth = 3200;
        if (this.x + this.width >= worldWidth && this.direction === 1) { this.x = worldWidth - this.width; this.direction = -1; }
    }

    private checkObstacleCollision(): boolean {
        for (const c of this.scene) {
            if (c === this || !c.solid || c instanceof PlayerComponent) continue;
            if (
                this.x < c.x + c.width &&
                this.x + this.width > c.x &&
                this.y < c.y + c.height &&
                this.y + this.height > c.y
            ) {
                if (this.isMovingInShell) {
                    // Potentially add logic here to "break" certain blocks if hit by shell
                }
                return true;
            }
        }
        return false;
    }

    private isLedgeAhead(): boolean {
        const probeX = this.x + (this.direction === 1 ? this.width : -1);
        const probeY = this.y + this.height + 1;
        for (const c of this.scene) {
            if (c === this || !c.solid || c instanceof PlayerComponent) continue;
            if (probeX >= c.x && probeX < c.x + c.width && probeY >= c.y && probeY < c.y + c.height) {
                return false;
            }
        }
        return true;
    }

    stomp() {
        if (!this.isAlive) return;

        if (this.isShelled && !this.isMovingInShell) {
            this.isMovingInShell = true;
            this.timeInShell = 0; // Reset recovery timer
        } else if (this.isShelled && this.isMovingInShell) {
            this.isMovingInShell = false;
            this.timeInShell = 0; // Reset recovery timer
        } else {
            this.isShelled = true;
            this.isMovingInShell = false;
            this.timeInShell = 0;
        }
    }

    hitByPlayerNonStomp(): boolean {
        if (!this.isAlive) return false;

        if (this.isShelled && !this.isMovingInShell) {
            this.isMovingInShell = true;
            this.timeInShell = 0;
            return false;
        }
        return true;
    }

    kill() {
        if (!this.isAlive) return;
        this.isAlive = false;
        this.solid = false;
        this.deathSpeed = -8;
    }

    resetState() {
        this.x = this.initialX;
        this.y = this.initialY;
        this.isAlive = true;
        this.visible = true;
        this.enabled = true;
        this.solid = false; // Keep it false
        this.direction = this.initialDirection;
        this.deathSpeed = 0;
        this.isShelled = false;
        this.isMovingInShell = false;
        this.timeInShell = 0;
        this.speed = 0.5;
    }

    public isHarmfulOnContact(): boolean {
        return this.isAlive && (!this.isShelled || (this.isShelled && this.isMovingInShell));
    }

    private drawAliveTurtle(ctx: CanvasRenderingContext2D) {
        const shellColor = "#008000";
        const bodyColor = "#FFD700";

        ctx.save();

        ctx.fillStyle = shellColor;
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + this.height * 0.4, this.width * 0.45, this.height * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = bodyColor;

        ctx.fillRect(this.x + this.width * (this.direction === 1 ? 0.7 : 0.05), this.y + this.height * 0.3, this.width * 0.25, this.height * 0.2);

        ctx.fillRect(this.x + this.width * 0.15, this.y + this.height * 0.7, this.width * 0.2, this.height * 0.2);
        ctx.fillRect(this.x + this.width * 0.65, this.y + this.height * 0.7, this.width * 0.2, this.height * 0.2);

        ctx.restore();
    }

    private drawShelledTurtle(ctx: CanvasRenderingContext2D) {
        const shellColor = "#008000";

        ctx.save();

        ctx.fillStyle = shellColor;
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + this.height * 0.5, this.width * 0.45, this.height * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    private drawFlippingTurtle(ctx: CanvasRenderingContext2D) {
        ctx.save();

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width * 0.3, this.y + this.height * 0.3);
        ctx.lineTo(this.x + this.width * 0.7, this.y + this.height * 0.7);
        ctx.stroke();

        ctx.restore();
    }

    render(ctx: CanvasRenderingContext2D) {
        if (!this.visible) return;

        if (!this.isAlive) {
            this.drawFlippingTurtle(ctx);
        } else if (this.isShelled) {
            this.drawShelledTurtle(ctx);
        } else {
            this.drawAliveTurtle(ctx);
        }
    }
}
