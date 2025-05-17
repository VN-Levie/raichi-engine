import { Component } from "../../../core/component";
import { CircleComponent } from "../../../entities/circleComponent"; // Assuming CircleComponent is used

export class CloudClusterComponent extends Component {
  private circles: CircleComponent[] = [];
  public size: number; // Make size public if accessed for width calculation elsewhere
  public speedX: number = 0;

  constructor(x: number, y: number, size: number, speedX: number = 0) {
    super();
    this.x = x;
    this.y = y;
    this.size = size;
    this.speedX = speedX;
    this.zIndex = -5; // Behind most things
    this.solid = false;

    // Approximate width based on size and typical circle arrangement
    // Assuming circles are about 20*size radius and overlap
    this.width = this.size * 20 * 2.5; // Rough estimate of total width

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
      circle.visible = false; // Circles themselves are not directly rendered by Scene loop
      this.circles.push(circle);
    }
  }

  update(dt: number): void {
    this.x += this.speedX * dt;
    // Update individual circle positions if they are independently managed by this component
    for (const circle of this.circles) {
        // If circles store relative offsets, their absolute x needs updating when parent x changes
        // Assuming circle.x was set to absolute initially, this line updates them:
        circle.x += this.speedX * dt;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    // The CloudClusterComponent itself doesn't draw, its constituent circles do.
    // However, if we want to render them relative to this component's x,y:
    for (const circle of this.circles) {
        // To render relative to this.x, this.y, adjust circle rendering logic or store relative offsets.
        // For simplicity, assuming circles are already at absolute positions or factory handles this.
        // If circles are children components, Scene handles their rendering.
        // If they are internal, this component must render them.
        // Based on current structure, CloudClusterComponent is a "logical" group.
        // Let's assume it should render its parts.
        ctx.beginPath();
        // Calculate render X based on current this.x and original relative offset
        // This requires storing original relative offsets if not done already.
        // For now, let's assume circle.x, circle.y are absolute and updated in this.update()
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        ctx.fillStyle = circle.color; // circle.color should be "rgba(255, 255, 255, 0.8)"
        ctx.fill();
    }
  }
}
