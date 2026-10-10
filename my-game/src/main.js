
import Phaser from 'phaser';

new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    create() {
      this.add.text(300, 280, 'Hello Phaser!', { fontSize: '32px' });
    }
  }
});