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
        this.solid = false; 
        this.visible = false; 
        this.nextMapUrl = nextMapUrl;
        this.isWinGoal = isWinGoal;
    }

    update(dt: number): void {
        
    }

    render(ctx: CanvasRenderingContext2D): void {
        
        if (!this.visible) { 
            ctx.save();
            ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.restore();
        }
    }
}
