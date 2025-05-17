import { Component } from "../../../core/component";
import { CircleComponent } from "../../../entities/circleComponent"; 

export class CloudClusterComponent extends Component {
  private circles: CircleComponent[] = [];
  public size: number; 
  public speedX: number = 0;

  constructor(x: number, y: number, size: number, speedX: number = 0) {
    super();
    this.x = x;
    this.y = y;
    this.size = size;
    this.speedX = speedX;
    this.zIndex = -5; 
    this.solid = false;

    
    
    this.width = this.size * 20 * 2.5; 

    this.createCircles();
  }

  private createCircles() {
    const baseRadius = 20 * this.size;
    const offsets = [
      { dx: 0, dy: 0, radius: baseRadius },
      { dx: baseRadius * 0.8, dy: baseRadius * 0.3, radius: baseRadius * 0.9 },
      { dx: -baseRadius * 0.7, dy: baseRadius * 0.2, radius: baseRadius * 0.8 },
      { dx: baseRadius * 0.3, dy: -baseRadius * 0.4, radius: baseRadius * 0.7 }
    ];

    for (const offset of offsets) {
      const circle = new CircleComponent(
        this.x + offset.dx,
        this.y + offset.dy,
        offset.radius,
        "rgba(255, 255, 255, 0.8)"
      );
      circle.visible = false; 
      this.circles.push(circle);
    }
  }

  update(dt: number): void {
    this.x += this.speedX * dt;
    
    for (const circle of this.circles) {
        
        
        circle.x += this.speedX * dt;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    
    
    for (const circle of this.circles) {
        
        
        
        
        
        
        ctx.beginPath();
        
        
        
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        ctx.fillStyle = circle.color; 
        ctx.fill();
    }
  }
}
