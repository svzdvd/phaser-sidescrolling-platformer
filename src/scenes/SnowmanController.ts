import Phaser from 'phaser';
import StateMachine from '../statemachine/StateMachine';

export default class SnowmanController 
{
    private sprite: Phaser.Physics.Matter.Sprite;
    private stateMachine: StateMachine;
    private moveTime: number = 0;
    private speed: number = 10;

    constructor(sprite: Phaser.Physics.Matter.Sprite)
    {
        this.sprite = sprite;

        this.createAnimations();

        this.stateMachine = new StateMachine(this, 'snowman');
        this.stateMachine
            .addState('idle', {
                onEnter: this.idleOnEnter
            })
            .addState('move-left', {
                onEnter: this.moveLeftOnEnter,
                onUpdate: this.moveLeftOnUpdate
            })
            .addState('move-right', {
                onEnter: this.moveRightOnEnter,
                onUpdate: this.moveRightOnUpdate
            })
            .addState('dead')
            .setState('idle');        
    }

    update(deltaTime: number)
    {
        this.stateMachine.update(deltaTime);
    }

    private createAnimations()
    {
        this.sprite.anims.create({
            key: 'snowman-idle',
            frames: [{ key: 'snowman', frame: 'snowman_left_1.png' }],
            repeat: 1
        });

        this.sprite.anims.create({
            key: 'snowman-walk-left',
            frameRate: 10,
            frames: this.sprite.anims.generateFrameNames('snowman', {
                start: 1, 
                end: 2,
                prefix: 'snowman_left_',
                suffix: '.png'
            }),
            repeat: -1
        });

        this.sprite.anims.create({
            key: 'snowman-walk-right',
            frameRate: 10,
            frames: this.sprite.anims.generateFrameNames('snowman', {
                start: 1, 
                end: 2,
                prefix: 'snowman_right_',
                suffix: '.png'
            }),
            repeat: -1
        });        
    }

    private idleOnEnter()
    {
        this.sprite.play('snowman-idle');

        const random = Phaser.Math.Between(1, 100);
        if (random < 50)
        {
            this.stateMachine.setState('move-left');
        }
        else
        {
            this.stateMachine.setState('move-right');
        }
    }

    private moveLeftOnEnter()
    {
        this.sprite.play('snowman-walk-left');
        this.moveTime = 0;
    }

    private moveLeftOnUpdate(deltaTime: number)
    {
        this.sprite.setVelocityX(-this.speed);
        this.moveTime += deltaTime;
        if (this.moveTime > 2000) {
            this.stateMachine.setState('move-right');
        }
    }

    private moveRightOnEnter()
    {
        this.sprite.play('snowman-walk-right');
        this.moveTime = 0;
    }

    private moveRightOnUpdate(deltaTime: number)
    {
        this.sprite.setVelocityX(this.speed);
        this.moveTime += deltaTime;
        if (this.moveTime > 2000) {
            this.stateMachine.setState('move-left');
        }        
    }

}