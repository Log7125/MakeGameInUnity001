import Phaser from 'phaser';
import './style.css';
import { Players, Tag } from './data/Players.js';

const TILE = 16;

// const MAP = [
//   '##############################',
//   '#............................#',
//   '#............................#',
//   '#..................####......#',
//   '#............................#',
//   '#............................#',
//   '#............................#',
//   '#............................#',
//   '#............................#',
//   '#............................#',
//   '#............................#',
//   '#......#####.................#',
//   '#............................#',
//   '#..................######....#',
//   '#............................#',
//   '#............................#',
//   '##############################',
// ];

class GameScene extends Phaser.Scene {
  // Unity의 Start()
  create() {

    //Map
    this.groud = this.add.rectangle(240,260,480,20,0x6666aa);
    this.physics.add.existing(this.groud, true); //true 고정
    
    this.players = {};
    for(const id in Players){
      const data = Players[id];
      const rect = this.add.rectangle(200,200,20,20,data.color);
      rect.charData = data;
      rect.setVisible(false);
      this.players[id] = rect;
      
      //creat player
      this.physics.add.existing(rect);
      this.physics.add.collider(rect, this.groud);
    }

    this.current = this.players.A;
    this.current.setVisible(true);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.tagKey = this.input.keyboard.addKey(Tag.key);
    this.lastTagTime = -Tag.cooldown;

  }

  // Unity의 Update()와 같음: 매 프레임 실행
  update(time) {
    const body = this.current.body;
    const speed = this.current.charData.speed;

    if(this.cursors.left.isDown) body.setVelocityX(-speed);
    else if(this.cursors.right.isDown) body.setVelocityX(speed);
    else body.setVelocityX(0);

    if(this.cursors.space.isDown && body.blocked.down){
      body.setVelocityY(-this.current.charData.jumpPower);
    }

    if(Phaser.Input.Keyboard.JustDown(this.tagKey)){
      this.switchTag(time);
    }
  }
  switchTag(time){
    if(time - this.lastTagTime < Tag.cooldown) return;
    this.lastTagTime = time;

    const nextId = this.current === this.players.A ? 'B' : 'A';
    const next = this.players[nextId];

    this.current.setVisible(false);
    this.current.body.enable = false; // 나머지 물리 제거
    
    next.body.enable = true;
    next.body.reset(this.current.x, this.current.y);          // 새 물리 추가
    next.setVisible(true);

    this.current = next;

  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: 480,
  height: 270,
  pixelArt: true,                             //확대해도 도트 그대로

  scale: {
    mode: Phaser.Scale.FIT,                   //비율 유지하면서 창에 맞추기
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics:{
    default: 'arcade',
    arcade: {gravity: {y: 800 }, debug: true},
  },

  scene: GameScene,
});