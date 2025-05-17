export class Input {
  private static keys = new Set<string>()
  private static mouseDown = false
  static mouseX = 0
  static mouseY = 0
  static init() {
    window.addEventListener("keydown", (e) => {
      Input.keys.add(e.key)
    });
    window.addEventListener("keyup", (e) => {
      Input.keys.delete(e.key)
    });
    window.addEventListener("mousedown", () => Input.mouseDown = true)
    window.addEventListener("mouseup", () => Input.mouseDown = false)
    window.addEventListener("mousemove", (e) => {
      Input.mouseX = e.clientX
      Input.mouseY = e.clientY
    });
  }

  static isKeyDown(key: string) {
    return Input.keys.has(key);
  }
  static isMousePressed() {
    return Input.mouseDown
  }

  //isKeyPressed
  static isKeyPressed(key: string) {
    return Input.keys.has(key);
  }
}
