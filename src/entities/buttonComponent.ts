import { Component } from "../core/component";
import { Input } from "../core/input";

export class ButtonComponent extends Component {
    public text: string = "Button";
    public font: string = "16px Arial";
    public color: string = "#4A4A4A"; // Default color
    public hoverColor: string = "#6A6A6A"; // Default hover color
    public textColor: string = "#FFFFFF"; // Default text color
    public onClick: (() => void) | null = null;

    private isHovering = false;
    private mouseWasPressedOnButton = false; // Tracks if the current press originated on this button

    constructor() {
        super();
        // Default size, can be overridden by setting width/height after creation
        this.width = 150;
        this.height = 40;
        this.zIndex = 100; // Ensure buttons are typically on top for rendering
    }

    update(dt: number): void {
        if (!this.enabled) return;

        const prevHovering = this.isHovering;
        this.isHovering = Input.mouseX >= this.x && Input.mouseX <= this.x + this.width &&
                           Input.mouseY >= this.y && Input.mouseY <= this.y + this.height;

        const mouseCurrentlyPressed = Input.isMousePressed();

        // --- DEBUGGING LOGS (uncomment to see detailed button state) ---
        // console.log(
        //     `Button "${this.text}": ` +
        //     `X/Y: ${this.x.toFixed(0)},${this.y.toFixed(0)} | ` +
        //     `W/H: ${this.width},${this.height} | ` +
        //     `Mouse: ${Input.mouseX.toFixed(0)},${Input.mouseY.toFixed(0)} | ` +
        //     `Hover: ${this.isHovering} | ` +
        //     `MousePressed: ${mouseCurrentlyPressed} | ` +
        //     `OriginPress: ${this.mouseWasPressedOnButton}`
        // );

        if (this.isHovering && mouseCurrentlyPressed && !this.mouseWasPressedOnButton) {
            // Mouse was just pressed down while hovering over the button
            this.mouseWasPressedOnButton = true;
            // console.log(`Button "${this.text}": MOUSE DOWN originated on button.`);
        }

        if (this.mouseWasPressedOnButton && this.isHovering && !mouseCurrentlyPressed) {
            // Mouse was released while hovering over the button, AND the press originated on this button
            if (this.onClick) {
                // console.log(`Button "${this.text}": CLICKED! Executing onClick.`);
                this.onClick();
            } else {
                // console.log(`Button "${this.text}": Clicked, but no onClick handler assigned.`);
            }
            this.mouseWasPressedOnButton = false; // Reset for the next click cycle
        }

        // If mouse is released (anywhere), or if mouse moves off the button while it was pressed,
        // reset the state indicating the press originated on this button.
        if (!mouseCurrentlyPressed || (this.mouseWasPressedOnButton && !this.isHovering)) {
            if (this.mouseWasPressedOnButton && !this.isHovering) {
                // console.log(`Button "${this.text}": Mouse dragged off button while pressed. Resetting origin press.`);
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