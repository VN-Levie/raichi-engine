import { Component } from "../core/component";
import { Input } from "../core/input";

export class ButtonComponent extends Component {
    public text: string = "Button";
    public font: string = "16px Arial";
    public color: string = "#4A4A4A"; 
    public hoverColor: string = "#6A6A6A"; 
    public textColor: string = "#FFFFFF"; 
    public onClick: (() => void) | null = null;

    private isHovering = false;
    private mouseWasPressedOnButton = false; 

    constructor() {
        super();
        
        this.width = 150;
        this.height = 40;
        this.zIndex = 100; 
    }

    update(dt: number): void {
        if (!this.enabled) return;

        const prevHovering = this.isHovering;
        this.isHovering = Input.mouseX >= this.x && Input.mouseX <= this.x + this.width &&
                           Input.mouseY >= this.y && Input.mouseY <= this.y + this.height;

        const mouseCurrentlyPressed = Input.isMousePressed();

        
        
        
        
        
        
        
        
        
        

        if (this.isHovering && mouseCurrentlyPressed && !this.mouseWasPressedOnButton) {
            
            this.mouseWasPressedOnButton = true;
            
        }

        if (this.mouseWasPressedOnButton && this.isHovering && !mouseCurrentlyPressed) {
            
            if (this.onClick) {
                
                this.onClick();
            } else {
                
            }
            this.mouseWasPressedOnButton = false; 
        }

        
        
        if (!mouseCurrentlyPressed || (this.mouseWasPressedOnButton && !this.isHovering)) {
            if (this.mouseWasPressedOnButton && !this.isHovering) {
                
            }
            this.mouseWasPressedOnButton = false;
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (!this.visible) return;

        ctx.fillStyle = this.isHovering ? this.hoverColor : this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = this.textColor;
        ctx.font = this.font;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);
    }
}