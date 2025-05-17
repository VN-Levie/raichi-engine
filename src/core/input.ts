export class Input {
  private static keys = new Set<string>()
  private static mouseDown = false
  static mouseX = 0
  static mouseY = 0
  private static canvas: HTMLCanvasElement | null = null;

  static init(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvas) {
      console.error(`[InputSystem] CRITICAL: Canvas with ID "${canvasId}" not found. Attempting to use window listeners as a fallback.`);
      console.warn("[InputSystem] FALLBACK: Mouse coordinates will be viewport-relative (e.clientX, e.clientY). If the canvas is not at viewport 0,0, button clicks and mouse interactions WILL LIKELY FAIL or be inaccurate.");
      console.warn(`[InputSystem] ADVICE: Ensure your HTML has a <canvas id="${canvasId}"> element.`);
      this.addWindowListeners();
      return;
    }

    console.log(`[InputSystem] SUCCESS: Canvas with ID "${canvasId}" found and initialized for input.`);
    console.log("[InputSystem] Mouse coordinates will be canvas-relative.");
    this.addCanvasListeners(this.canvas);
    this.addWindowKeyListeners(); // Keep key listeners on window
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
      if (e.button === 0) { // Primary button (usually left)
        Input.mouseDown = true;
      }
      // Update mouse coordinates on mousedown as well, in case it's a quick click
      const rect = canvas.getBoundingClientRect();
      Input.mouseX = e.clientX - rect.left;
      Input.mouseY = e.clientY - rect.top;
    });

    canvas.addEventListener("mouseup", (e) => {
      if (e.button === 0) { // Primary button
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
      console.log(`[InputSystem] Mouse moved to (canvas-relative): (${Input.mouseX.toFixed(2)}, ${Input.mouseY.toFixed(2)})`);
    });

    // Prevent context menu on right-click on canvas if desired
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  }
  
  private static addWindowListeners() { // Fallback if canvas not found during init
    console.warn("[InputSystem] Initializing input with window listeners (fallback mode). Mouse coordinates might be inaccurate if canvas is offset from viewport origin.");
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
      console.log(`Mouse moved to: (${Input.mouseX}, ${Input.mouseY})`);
      
    });
  }

  static isKeyDown(key: string) {
    return Input.keys.has(key);
  }
  static isMousePressed() {
    return Input.mouseDown
  }

  // Removed redundant isKeyPressed
}
