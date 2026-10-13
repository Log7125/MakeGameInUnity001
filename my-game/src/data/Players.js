// src/data/Players.js
export const Players ={
    A: {
    name : 'RGB',
    type: 'ranged',
    color: 0xff4444, //임시 지정 -> 나중에 캐릭터로 바꿀 방법이 필요함.
    colorCycle: ['R','G','B'],

    maxHp: 100,
    speed: 160,
    jumpPower: 300,
    
    attack: {
        cooldown: 250,      //발사 간격
        bulletSpeed: 500,
        bulletLife: 800,    //사라지는 시간
        bulletSize: 8,
    },

    },
    B:{
    name : 'CMYK',
    type: 'melee',
    color: 0x44cccc, //임시 지정 -> 나중에 캐릭터로 바꿀 방법이 필요함.
    colorCycle: ['C','M','Y'],

    maxHp: 180,
    speed: 150,
    jumpPower: 320,

    attack: {
        cooldown: 400,      
        range: 40,      //공격 반지름
        duration: 150, //이펙트 지속시간
    },

    },

};

//Tag setup
export const Tag = {
    key : 'Q',
    cooldown: 1000, // 1000 -> 1s
}

export const ENEMY_DATA = {
    slime: {name : 'slime', maxHp:30, speed: 40},
    bat: {name: 'bat', maxHp: 20, speed: 80},
};
