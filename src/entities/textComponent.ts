import { Component } from "../core/component"

export class TextComponent extends Component {
  text: string
  font: string
  color: string
  align: CanvasTextAlign
  baseline: CanvasTextBaseline

  constructor(
    text: string, x: number, y: number, font = "16px sans-serif", color = "#000", align: CanvasTextAlign = "left", baseline: CanvasTextBaseline = "top", public shadowColor: string = "rgba(0,0,0,0.5)", public shadowOffsetX: number = 2, public shadowOffsetY: number = 2, public shadowBlur: number = 2) {
    super();
    this.text = text;
    this.x = x;
    this.y = y;
    this.font = font;
    this.color = color;
    this.align = align;
    this.baseline = baseline;
  }


  update(dt: number) { }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save();

    ctx.font = this.font;
    ctx.fillStyle = this.color;
    ctx.textAlign = this.align;
    ctx.textBaseline = this.baseline;

    ctx.shadowColor = this.shadowColor;
    ctx.shadowOffsetX = this.shadowOffsetX;
    ctx.shadowOffsetY = this.shadowOffsetY;
    ctx.shadowBlur = this.shadowBlur;

    ctx.fillText(this.text, this.x, this.y);

    ctx.restore();
  }

}
