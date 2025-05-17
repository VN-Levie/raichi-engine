import { Component } from "../../../core/component";
import { PlayerComponent } from "../playerComponent";
import { BaseEnemyComponent } from "./baseEnemyComponent";

export class TurtleEnemyComponent extends BaseEnemyComponent {
    // Turtle-specific states
    isShelled = false;
    isMovingInShell = false;
    private shellSpeed = 4; // Speed when moving in shell
    private timeInShell = 0;
    private readonly shellRecoverTime = 5; // Time in seconds before recovering from shell state

    constructor(x: number, y: number, width: number, height: number) {
        super(x, y, width, height);
        this.speed = this.getDefaultSpeed();
    }

    protected getDefaultSpeed(): number {
        return 0.5;
    }

    update(dt: number) {
        if (!this.isAlive) {
            this.y += this.deathSpeed;
            this.deathSpeed += this.gravity;
            if (this.y > 800) { // Assuming off-screen Y
                this.visible = false;
                this.enabled = false;
            }
            return;
        }

        if (this.isShelled && !this.isMovingInShell) {
            this.timeInShell += dt;
            if (this.timeInShell >= this.shellRecoverTime) {
                this.isShelled = false;
                this.isMovingInShell = false;
                this.timeInShell = 0;
            }
            return; // No movement if shelled and not moving
        }

        const oldX = this.x;
        const currentSpeed = this.isMovingInShell ? this.shellSpeed : this.speed;

        // Turtles in shells fall off ledges, others turn around.
        if (!this.isMovingInShell && this.isLedgeAhead()) {
            this.direction *= -1;
        } else {
            this.x += currentSpeed * this.direction;
            if (this.checkObstacleCollision()) {
                this.x = oldX;
                this.direction *= -1;
                // If moving in shell and hits obstacle, it might interact (e.g. break block or kill other enemies)
                // For now, just reverses direction.
            }
        }

        if (this.x <= 0 && this.direction === -1) { this.x = 0; this.direction = 1; }
        
        const worldWidth = 3200; // Assuming world width
        if (this.x + this.width >= worldWidth && this.direction === 1) { this.x = worldWidth - this.width; this.direction = -1; }
    }

    stomp() {
        if (!this.isAlive) return;

        if (this.isShelled && !this.isMovingInShell) {
            this.isMovingInShell = true;
            this.timeInShell = 0; 
        } else if (this.isShelled && this.isMovingInShell) {
            this.isMovingInShell = false;
            this.timeInShell = 0; 
        } else {
            this.isShelled = true;
            this.isMovingInShell = false;
            this.timeInShell = 0;
        }
    }

    hitByPlayerNonStomp(): boolean {
        if (!this.isAlive) return false;

        if (this.isShelled && !this.isMovingInShell) {
            // Player kicks the non-moving shell
            this.isMovingInShell = true;
            this.timeInShell = 0; // Reset recovery timer
            // Determine direction based on player's approach if desired, for now, keeps current direction or picks one
            // this.direction = (player.x < this.x) ? 1 : -1; // Example
            return false; // Player doesn't die
        }
        // If turtle is not shelled, or is shelled and moving, player dies
        return true;
    }

    // kill() is inherited

    resetState() {
        super.resetState();
        this.isShelled = false;
        this.isMovingInShell = false;
        this.timeInShell = 0;
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
