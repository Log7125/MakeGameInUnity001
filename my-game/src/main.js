import Phaser from 'phaser';
import './style.css';
import { Players, Tag } from './data/Players.js';

const TILE = 16;

// '#' = 벽/바닥, '.' = 빈칸 (한 줄 30글자, 총 17줄)
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
    //캐릭터 데이터로 사각형 만들기
    this.players = {};
    for(const id in Players){
      const data = Players[id];
      const rect = this.add.rectangle(200,200,20,20,data.color);
      rect.data = data;
      rect.setVisible(false);
      //this.players[id] = rect;
    }

    this.current = this.players.A;
    this.current.setVisible(true);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.tagKey = this.input.keyboard.addKey(Tag.key);
    this.lastTagTime = -Tag.cooldown;
    


    // 맵 만들기: 문자열을 읽어서 벽 사각형을 배치
    // this.walls = this.add.group();
    // MAP.forEach((row, y) => {
    //   [...row].forEach((ch, x) => {
    //     if (ch === '#') {
    //       const tile = this.add.rectangle(x * TILE + 8, y * TILE + 8, TILE, TILE, 0x6666aa);
    //       this.physics.add.existing(tile, true); // true = 안 움직이는 물체
    //       this.walls.add(tile);
    //     }
    //   });
    // });

    // 플레이어 만들기 (Unity의 Rigidbody2D + Collider가 붙은 오브젝트)
    //this.player = this.add.rectangle(32, 32, TILE, TILE, PLAYER_DATA.color);
    //this.physics.add.existing(this.player);

    // 플레이어와 벽이 서로 통과하지 않게 함
    //this.physics.add.collider(this.player, this.walls);

    // 입력 (Unity의 Input)
    //this.cursors = this.input.keyboard.createCursorKeys();
  }

  // Unity의 Update()와 같음: 매 프레임 실행
  update(time) {
    const speed = this.current.data.speed;
    const move = speed / 60; // 60fps 기준으로 속도 보정

      if(this.cursors.left.isDown) this.current.x -= move;
      if(this.cursors.right.isDown) this.current.x += move;

      if(Phaser.Input.Keyboard.JustDown(this.tagKey)){
        this.switchTag(time);
      }
  }
  switchTag(time){
    if(time - this.lastTagTime < Tag.cooldown) return;
    this.lastTagTime = time;

    const nextId = this.current === this.players.A ? 'B' : 'A';
    const next = this.players[nextId];
    next.x = this.current.x;
    next.y = this.current.y;
    this.current.setVisible(false);
    next.setVisible(true);
    this.current = next;
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: 480,
  height: 270,
  scene: GameScene,
});