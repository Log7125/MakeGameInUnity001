import Phaser from 'phaser';
import './style.css';
import { Players, Tag } from './data/Players.js';
import { BackGround } from './data/BackGround.js';


class GameScene extends Phaser.Scene {

  preload(){
    this.load.image(BackGround.key, BackGround.path);
  }

  // Unity의 Start()
  create() {

    //Map
    const w = this.scale.width;
    const h = this.scale.height;
    this.add.image(w / 2, h / 2, BackGround.key).setDisplaySize(w, h);

    this.groud = this.add.rectangle(240,260,480,20,0x3b5139);
    this.physics.add.existing(this.groud, true); //true 고정

    this.tagGauge = 0;
    this.buffUntil = 0;         //이 때까지 유지
    this.rightWasDown = false;

    //UI
    this.gaugeBar = this.add.graphics().setDepth(100);
    
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

    this.dummy = this.add.rectangle(380, 200, 24, 40, 0xaaaaaa);
    this.physics.add.existing(this.dummy, true); //true

    this.current = this.players.A;
    this.current.setVisible(true);

    this.lastTagTime = -Tag.cooldown;
    this.input.mouse.disableContextMenu();

    this.facing = 1;          //1 = right, -1 = left
    this.lastAttackTime = 0;
    this.input.mouse.disableContextMenu(); //우클 메뉴 방지

    //add keyboard
    this.keys = this.input.keyboard.addKeys({
      left: 'A',
      right: 'D',
      up: 'Space',
      down: 'S',
    })
  }

  // Unity의 Update()와 같음: 매 프레임 실행
  update(time, delta) {
    const body = this.current.body;
    const pointer = this.input.activePointer; //Mouse
    const buffed = this.isBuffed();

    //게이지 자동 충전
    this.addGauge(Tag.regenPerSec * delta / 1000);

    //버프 중이면 배율 적용
    const speed = this.current.charData.speed * (buffed ? Tag.skill.speedMul : 1);

    this.facing = pointer.worldX < this.current.x ? -1 : 1;


    if(pointer.leftButtonDown()){ //ing
      this.attack(time);
    }
    if(pointer.rightButtonDown() && !this.rightWasDown){
      this.switchTag(time);
    }
    this.rightWasDown = pointer.rightButtonDown();


    if(this.keys.left.isDown) {
      body.setVelocityX(-speed);
      this.facing = -1;
    } else if(this.keys.right.isDown){
      body.setVelocityX(speed);
      this.facing = 1;
    } else body.setVelocityX(0);

    if(this.keys.up.isDown && body.blocked.down){
      body.setVelocityY(-this.current.charData.jumpPower);
    }

  }

  addGauge(amount){
    this.tagGauge = Math.min(Tag.gaugeMax, this.tagGauge + amount);
  }

  drawGauge(buffed){
    const g = this.gaugeBar;
    g.clear();
    g.fillStyle(0x000000, 0.6);
    g.fillRect(10,10,100,8);          //background
    const ratio = this.tagGauge / Tag.gaugeMax;
    g.fillStyle(buffed ? 0xffdd33 : (ratio >= 1 ? 0x66ff66 : 0x66aaff), 1);
    g.fillRect(10,10,100 * ratio, 9);

  }
  switchTag(time){
    if(time - this.lastTagTime < Tag.cooldown) return;
    this.lastTagTime = time;

    const nextId = this.current === this.players.A ? 'B' : 'A';
    const next = this.players[nextId];

    // 전환 전 속도 저장
    const vx = this.current.body.velocity.x;
    const vy = this.current.body.velocity.y;

    this.current.setVisible(false);
    this.current.body.enable = false; // 나머지 물리 제거
    
    next.body.enable = true;
    next.body.reset(this.current.x, this.current.y);          // 새 물리 추가
    next.body.setVelocity(vx,vy);
    next.setVisible(true);

    this.current = next;

    //게이지가 가득 차 있다면 태그 스킬 발동되기
    if(this.tagGauge >= Tag.gaugeMax){
      this.tagGauge = 0;
      this.buffUntil = time + Tag.skill.duration;
    }

  }
  attack(time){
    const atk = this.current.charData.attack;
    const mul = time < this.buffUntil ? Tag.skill.attackMul : 1;
    if(time - this.lastAttackTime < atk.cooldown) return; //cooldown
    this.lastAttackTime = time;

    this.addGauge(Tag.gainOnAttack);

    // char -> mouse angle
    const pointer = this.input.activePointer;
    const angle = Phaser.Math.Angle.Between(
      this.current.x, this.current.y,
      pointer.worldX, pointer.worldY
    );

    if(this.current.charData.type ==='ranged'){
      this.shootBullet(atk,angle);
    } else{
      this.slash(atk,angle);
    }
  };

  shootBullet(atk, angle){
    const bullet = this.add.rectangle(
      this.current.x, this.current.y,
      atk.bulletSize, atk.bulletSize, 0xffff66
    );
    this.physics.add.existing(bullet);
    bullet.body.setAllowGravity(false);
    bullet.body.setVelocity(
      Math.cos(angle) * atk.bulletSpeed,
      Math.sin(angle) * atk.bulletSpeed
    );

    this.time.delayedCall(atk.bulletLife, () => bullet.destroy());
  };

  slash(atk,angle) {
  // 반달: 부채꼴을 그려서 잠깐 보여주고 지움
  const g = this.add.graphics();
  const buffed = this.isBuffed();

  g.fillStyle(0xffffff, 0.8);
  g.slice(0, 0, atk.range, Phaser.Math.DegToRad(-70), Phaser.Math.DegToRad(70), false);
  g.fillPath();

  //버프중이면 색 바꾸기
  g.fillStyle(buffed ? 0xffdd33 : 0xffffff, 0.8);

  g.x = this.current.x;
  g.y = this.current.y;
  g.rotation = angle;

  // 살짝 커지면서 사라지는 연출
  this.tweens.add({
    targets: g,
    alpha: 0,
    scale: 1.3,
    duration: atk.duration,
    onComplete: () => g.destroy(),
  });

  this.drawGauge(buffed);
}

isBuffed(){
  return this.time.now < this.buffUntil;
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