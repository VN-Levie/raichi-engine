export class Input {
  private static keys = new Set<string>()

  static init() {
    window.addEventListener("keydown", (e) => {
      Input.keys.add(e.key)
    })
    window.addEventListener("keyup", (e) => {
      Input.keys.delete(e.key)
    })
  }

  static isKeyDown(key: string) {
    return Input.keys.has(key)
  }
}
