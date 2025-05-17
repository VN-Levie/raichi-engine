export class Camera {
    static x = 0
    static y = 0
    static target: { x: number, y: number } | null = null

    static follow(target: { x: number, y: number }) {
        this.target = target
    }

    static update() {
        if (this.target) {
            this.x = this.target.x - 200
            if (this.x < 0) this.x = 0
        }
    }

    static apply(ctx: CanvasRenderingContext2D) {
        ctx.translate(-this.x, -this.y)
    }

    static reset(ctx: CanvasRenderingContext2D) {
        ctx.setTransform(1, 0, 0, 1, 0, 0)
    }
}
