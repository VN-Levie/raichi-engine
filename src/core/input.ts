export class Input {
  private static keys = new Set<string>()
  private static mouseDown = false
  static mouseX = 0
  static mouseY = 0
  private static canvas: HTMLCanvasElement | null = null;

  static init(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvas) {
      this.addWindowListeners();
      return;
    }
    this.addCanvasListeners(this.canvas);
    this.addWindowKeyListeners();
  }

  private static addWindowKeyListeners() {
    window.addEventListener("keydown", (e) => {
      Input.keys.add(e.key)
    });
    window.addEventListener("keyup", (e) => {
      Input.keys.delete(e.key)
    });
  }

  private static addCanvasListeners(canvas: HTMLCanvasElement) {
    canvas.addEventListener("mousedown", (e) => {
      if (e.button === 0) {
        Input.mouseDown = true;
      }

      const rect = canvas.getBoundingClientRect();
      Input.mouseX = e.clientX - rect.left;
      Input.mouseY = e.clientY - rect.top;
    });

    canvas.addEventListener("mouseup", (e) => {
      if (e.button === 0) {
        Input.mouseDown = false;
      }
      const rect = canvas.getBoundingClientRect();
      Input.mouseX = e.clientX - rect.left;
      Input.mouseY = e.clientY - rect.top;
    });

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      Input.mouseX = e.clientX - rect.left;
      Input.mouseY = e.clientY - rect.top;
    });


    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  private static addWindowListeners() {
    this.addWindowKeyListeners();
    window.addEventListener("mousedown", (e) => {
      if (e.button === 0) Input.mouseDown = true;
    });
    window.addEventListener("mouseup", (e) => {
      if (e.button === 0) Input.mouseDown = false;
    });
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


}
