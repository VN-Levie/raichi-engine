import { Component } from "../../core/component";

export class GoalComponent extends Component {
    public nextMapUrl?: string;
    public isWinGoal: boolean;

    constructor(x: number, y: number, width: number, height: number, nextMapUrl?: string, isWinGoal: boolean = false) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.solid = false; // It's a trigger, not a solid block
        this.visible = false; // Typically invisible
        this.nextMapUrl = nextMapUrl;
        this.isWinGoal = isWinGoal;
    }

    update(dt: number): void {
        // Static trigger, no update logic needed
    }

    render(ctx: CanvasRenderingContext2D): void {
        // Optional: render for debugging
        if (!this.visible) { // Example to make it visible for debug
            ctx.save();
            ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.restore();
        }
    }
}
