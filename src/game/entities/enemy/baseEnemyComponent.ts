import { Component } from "../../../core/component";
import { PlayerComponent } from "../playerComponent";

export abstract class BaseEnemyComponent extends Component {
  public isAlive: boolean = true;
  protected speed: number = 1;
  protected direction: number = 1;
  protected deathSpeed: number = 0;
  protected readonly gravity: number = 0.5;
  protected scene: Component[] = [];

  public initialX: number;
  public initialY: number;
  public initialDirection: number;
  public hitSfx?: string = undefined;

  constructor(x: number, y: number, width: number, height: number) {
    super();
    this.x = x;
    this.y = y;
    this.initialX = x;
    this.initialY = y;
    this.width = width;
    this.height = height;
    this.solid = false; 
    this.zIndex = 5;
    this.initialDirection = 1;
    this.direction = this.initialDirection;
  }

  setScene(scene: Component[]): void {
    this.scene = scene;
  }

  protected checkObstacleCollision(): boolean {
    const collisionEpsilon = 0.1; 

    for (const c of this.scene) {
      if (c === this || !c.solid || c instanceof PlayerComponent) continue;
      if (
        this.x < c.x + c.width &&
        this.x + this.width > c.x &&
        this.y < c.y + c.height &&
        (this.y + this.height) > (c.y + collisionEpsilon) 
      ) {
        const verticalOverlap = (this.y + this.height > c.y + collisionEpsilon) && (this.y < c.y + c.height - collisionEpsilon);

        if (verticalOverlap) {
            return true;
        }
      }
    }
    return false;
  }

  protected isLedgeAhead(): boolean {
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

  public kill(): void {
    if (!this.isAlive) return;
    this.isAlive = false;
    this.solid = false; 
    this.deathSpeed = -8; 
  }

  public resetState(): void {
    this.x = this.initialX;
    this.y = this.initialY;
    this.isAlive = true;
    this.visible = true;
    this.enabled = true;
    this.solid = false;
    this.direction = this.initialDirection;
    this.deathSpeed = 0;
    this.speed = this.getDefaultSpeed();
  }

  protected abstract getDefaultSpeed(): number;

  abstract update(dt: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;
  abstract stomp(): void;
  abstract isHarmfulOnContact(): boolean;
}
