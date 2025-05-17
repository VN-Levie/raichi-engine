import { Scene } from "../core/scene"
import { Input } from "../core/input"
import { BoxComponent } from "../entities/boxComponent"

export class MainScene extends Scene {
  private player: BoxComponent
  private ground: BoxComponent

  private velocityY = 0
  private gravity = 0.5
  private jumpForce = -10
  private isGrounded = false

  constructor() {
    super()

    this.player = new BoxComponent(100, 100, 32, "blue")
    this.player.width = 32
    this.player.height = 32
    this.add(this.player)

    this.ground = new BoxComponent(0, 300, 800, "green")
    this.ground.width = 800
    this.ground.height = 32
    this.add(this.ground)
  }

  override update(dt: number) {
    const speed = 3

    if (Input.isKeyDown("ArrowLeft")) this.player.x -= speed
    if (Input.isKeyDown("ArrowRight")) this.player.x += speed

    // gravity
    this.velocityY += this.gravity
    this.player.y += this.velocityY

    // ground collision
    if (this.player.y + this.player.height >= this.ground.y) {
      this.player.y = this.ground.y - this.player.height
      this.velocityY = 0
      this.isGrounded = true
    } else {
      this.isGrounded = false
    }

    // jump
    if (this.isGrounded && Input.isKeyPressed("ArrowUp")) {
      this.velocityY = this.jumpForce
    }
  }
}
