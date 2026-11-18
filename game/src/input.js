// Keyboard and mouse input, reduced to one small state object.
// The player moves with ArrowLeft / ArrowRight or A / D, or by moving the
// mouse over the canvas. Space or Enter starts and restarts, P pauses,
// M mutes. Buttons on the overlays are plain DOM buttons, so a mouse-only
// player never needs the keyboard.

export class Input {
  constructor(canvas) {
    this.left = false;
    this.right = false;
    this.mouseX = null;
    this.pressed = new Set();
    this.canvas = canvas;

    window.addEventListener('keydown', (event) => {
      if (event.repeat) return;
      this.pressed.add(event.code);
      if (event.code === 'ArrowLeft' || event.code === 'KeyA') this.left = true;
      if (event.code === 'ArrowRight' || event.code === 'KeyD') this.right = true;
      if (['ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
    });
    window.addEventListener('keyup', (event) => {
      if (event.code === 'ArrowLeft' || event.code === 'KeyA') this.left = false;
      if (event.code === 'ArrowRight' || event.code === 'KeyD') this.right = false;
    });
    canvas.addEventListener('mousemove', (event) => {
      const rect = canvas.getBoundingClientRect();
      this.mouseX = ((event.clientX - rect.left) / rect.width) * canvas.width;
    });
    canvas.addEventListener('mouseleave', () => {
      this.mouseX = null;
    });
    window.addEventListener('blur', () => {
      this.left = false;
      this.right = false;
    });
  }

  // True once for a key pressed since the last frame, then consumed.
  consume(code) {
    if (!this.pressed.has(code)) return false;
    this.pressed.delete(code);
    return true;
  }

  // -1, 0 or 1: keyboard wins while held, otherwise the mouse steers.
  steer(playerX, width) {
    if (this.left && !this.right) return -1;
    if (this.right && !this.left) return 1;
    if (this.mouseX !== null) {
      const diff = this.mouseX - playerX;
      if (Math.abs(diff) > 4) return Math.sign(diff);
    }
    return 0;
  }
}
