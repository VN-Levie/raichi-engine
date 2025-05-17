import { CircleComponent } from "../../../entities/circleComponent";
import { Component } from "../../../core/component";

export class CloudClusterComponent extends Component {
  private parts: CircleComponent[] = [];

  constructor(x: number, y: number, size: number) {
    super();
    this.x = x;
    this.y = y;
    this.zIndex = -5;
    this.solid = false;

    const baseSize = 20 * size;
    const cloudColor = "#ffffff";

    this.parts.push(new CircleComponent(x, y, baseSize, cloudColor));

    const variations = [
      { xOffset: -baseSize * 0.6, yOffset: -baseSize * 0.2, sizeRatio: 0.7 },
      { xOffset: baseSize * 0.7, yOffset: -baseSize * 0.3, sizeRatio: 0.8 },
      { xOffset: -baseSize * 0.8, yOffset: baseSize * 0.1, sizeRatio: 0.6 },
      { xOffset: baseSize * 0.5, yOffset: baseSize * 0.2, sizeRatio: 0.7 },
      { xOffset: 0, yOffset: -baseSize * 0.4, sizeRatio: 0.9 },
      { xOffset: -baseSize * 0.3, yOffset: baseSize * 0.3, sizeRatio: 0.6 },
      { xOffset: baseSize * 0.2, yOffset: baseSize * 0.1, sizeRatio: 0.8 },
    ];

    for (const v of variations) {
      this.parts.push(new CircleComponent(
        x + v.xOffset,
        y + v.yOffset,
        baseSize * v.sizeRatio,
        cloudColor
      ));
    }
    this.parts.forEach(p => {
        p.zIndex = this.zIndex;
        p.solid = this.solid;
    });
  }

  update(dt: number): void {
    // Clouds are static or could have slow movement
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.parts.forEach(part => {
        // If CloudClusterComponent can move, update part.x and part.y relative to this.x, this.y
        // part.x = this.x + original_offset_x_for_this_part
        // part.y = this.y + original_offset_y_for_this_part
        part.render(ctx);
    });
  }
}
