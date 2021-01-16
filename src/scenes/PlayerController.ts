import Phaser from 'phaser'
import StateMachine from '../statemachine/StateMachine'

type CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;

export default class PlayerController 
{
    private sprite: Phaser.Physics.Matter.Sprite;
    private cursors: CursorKeys;
    private stateMachine: StateMachine;
    private speed: number = 5;
    private jumpSpeed: number = 10;

    constructor(sprite: Phaser.Physics.Matter.Sprite, cursors: CursorKeys)
    {
        this.sprite = sprite;
        this.cursors = cursors;

        this.createAnimations();

        this.stateMachine = new StateMachine(this, 'playerController');
        this.stateMachine
            .addState('idle', {
                onEnter: this.idleOnEnter,
                onUpdate: this.idleOnUpdate
            })
            .addState('walk', {
                onEnter: this.walkOnEnter,
                onUpdate: this.walkOnUpdate
            })
            .addState('jump', {
                onEnter: this.jumpOnEnter,
                onUpdate: this.jumpOnUpdate
            })
            .setState('idle');

        this.sprite.setOnCollide((data: MatterJS.ICollisionPair) => {
            console.log(data.collision.normal.x);
            if (this.stateMachine.isCurrentState('jump'))
            {
                this.stateMachine.setState('idle');
            }
        });
    }

    update(deltaTime: number)
    {
        this.stateMachine.update(deltaTime);
    }

    private idleOnEnter()
    {
        this.sprite.setVelocityX(0);
        this.sprite.play('player-idle');
    }

    private idleOnUpdate() 
    {
        if (this.cursors.left.isDown || this.cursors.right.isDown) 
        {
            this.stateMachine.setState('walk');
        }
        else if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) 
        {
            this.stateMachine.setState('jump');
        }
    }

    private walkOnEnter()
    {
        this.sprite.play('player-walk');
    }

    private walkOnUpdate(deltaTime: number)
    {
        const spaceKeyIsJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.space);

        if (this.cursors.left.isDown) 
        {
            this.sprite.flipX = true;
            this.sprite.setVelocityX(-this.speed);
        }
        else if (this.cursors.right.isDown)
        {
            this.sprite.flipX = false;            
            this.sprite.setVelocityX(this.speed);
        }
        
        if (spaceKeyIsJustPressed)
        {
            this.stateMachine.setState('jump');
        }

        if (!this.cursors.left.isDown && !this.cursors.right.isDown && !spaceKeyIsJustPressed) 
        {
            this.stateMachine.setState('idle');
        }
    }

    private jumpOnEnter() 
    {
        this.sprite.setVelocityY(-this.jumpSpeed);
    }

    private jumpOnUpdate() 
    {
        if (this.cursors.left.isDown) 
        {
            this.sprite.flipX = true;
            this.sprite.setVelocityX(-this.speed);
        }
        else if (this.cursors.right.isDown)
        {
            this.sprite.flipX = false;            
            this.sprite.setVelocityX(this.speed);
        }
    }

    private createAnimations()
    {
        this.sprite.anims.create({
            key: 'player-idle',
            frames: [{ key: 'penguin', frame: 'penguin_walk01.png' }],
            repeat: 1
        });

        this.sprite.anims.create({
            key: 'player-walk',
            frameRate: 10,
            frames: this.sprite.anims.generateFrameNames('penguin', {
                start: 1, 
                end: 4,
                prefix: 'penguin_walk0',
                suffix: '.png'
            }),
            repeat: -1
        });
    }
}