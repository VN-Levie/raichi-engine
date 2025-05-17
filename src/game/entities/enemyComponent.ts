import { Component } from "../../core/component"
import { BoxComponent } from "../../entities/boxComponent"

export class EnemyComponent extends Component {
  private speed = 1
  private direction = 1
  isAlive = true
  private deathSpeed = 0
  private readonly gravity = 0.5
  
  constructor(x: number, y: number, width: number, height: number) {
    super()
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.solid = true
    this.zIndex = 5
  }
  
  update(dt: number) {
    if (this.isAlive) {
      // Move the enemy based on its direction
      this.x += this.speed * this.direction
      
      // Change direction at boundaries
      if (this.x <= 0 || this.x + this.width >= 3200) {
        this.direction *= -1
      }
    } else {
      // Death animation - fall down
      this.y += this.deathSpeed
      this.deathSpeed += this.gravity
      
      // Remove when off screen
      if (this.y > 800) {
        this.visible = false
        this.solid = false
      }
    }
  }
  
  render(ctx: CanvasRenderingContext2D) {
    if (!this.isAlive) {
      this.drawDeadEnemy(ctx)
    } else {
      this.drawAliveEnemy(ctx)
    }
  }
  
  private drawAliveEnemy(ctx: CanvasRenderingContext2D) {
    const bodyColor = "#8B0000"
    const headColor = "#FF0000"
    const eyeColor = "#FFFFFF"
    const pupilColor = "#000000"
    
    // Draw body (bottom half)
    ctx.fillStyle = bodyColor
    ctx.fillRect(this.x, this.y + this.height/2, this.width, this.height/2)
    
    // Draw cap (top half)
    ctx.fillStyle = headColor
    ctx.beginPath()
    ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI, true)
    ctx.fill()
    
    // Draw eyes
    const eyeSize = this.width / 10
    const eyeOffset = this.width / 4
    
    ctx.fillStyle = eyeColor
    ctx.beginPath()
    ctx.arc(this.x + this.width/2 - eyeOffset, this.y + this.height/2 - eyeOffset/2, eyeSize * 2, 0, Math.PI * 2)
    ctx.arc(this.x + this.width/2 + eyeOffset, this.y + this.height/2 - eyeOffset/2, eyeSize * 2, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = pupilColor
    ctx.beginPath()
    ctx.arc(this.x + this.width/2 - eyeOffset + (this.direction > 0 ? eyeSize/2 : -eyeSize/2), 
            this.y + this.height/2 - eyeOffset/2, eyeSize, 0, Math.PI * 2)
    ctx.arc(this.x + this.width/2 + eyeOffset + (this.direction > 0 ? eyeSize/2 : -eyeSize/2), 
            this.y + this.height/2 - eyeOffset/2, eyeSize, 0, Math.PI * 2)
    ctx.fill()
  }
  
  private drawDeadEnemy(ctx: CanvasRenderingContext2D) {
    const bodyColor = "#8B0000"
    const headColor = "#FF0000"
    
    ctx.save()
    ctx.translate(this.x + this.width/2, this.y + this.height/2)
    ctx.rotate(Math.PI)
    ctx.translate(-this.width/2, -this.height/2)
    
    ctx.fillStyle = bodyColor
    ctx.fillRect(0, this.height/2, this.width, this.height/2)
    
    ctx.fillStyle = headColor
    ctx.beginPath()
    ctx.arc(this.width/2, this.height/2, this.width/2, 0, Math.PI, true)
    ctx.fill()
    
    ctx.restore()
  }
  
  kill() {
    this.isAlive = false
    this.solid = false
    this.deathSpeed = -5
  }
  
  checkPlayerCollision(player: BoxComponent): boolean {
    const playerBottom = player.y + player.height
    const enemyTop = this.y
    
    // Check if player is landing on top of the enemy
    if (playerBottom <= enemyTop + 10 && playerBottom >= enemyTop - 5) {
      this.kill()
      return false
    }
    
    // Player hit enemy from side
    return true
  }
}
