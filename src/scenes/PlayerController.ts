import Phaser from 'phaser';
import StateMachine from '../statemachine/StateMachine';
import { sharedInstance as events } from './EventCenter';
import ObstaclesController from './ObstaclesController';

type CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;

export default class PlayerController 
{
    private scene: Phaser.Scene;
    private sprite: Phaser.Physics.Matter.Sprite;
    private cursors: CursorKeys;
    private obstacles: ObstaclesController;    
    private stateMachine: StateMachine;
    private speed: number = 5;
    private jumpSpeed: number = 10;
    private health: number = 100;

    constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Matter.Sprite, cursors: CursorKeys, obstacles: ObstaclesController)
    {
        this.scene = scene;
        this.sprite = sprite;
        this.cursors = cursors;
        this.obstacles = obstacles;

        this.sprite.setFriction(0.001);

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
            .addState('spike-hit', {
                onEnter: this.spikeHitOnEnter
            })
            .setState('idle');

        this.sprite.setOnCollide((data: MatterJS.ICollisionPair) => {
            // console.log(data.collision.normal.x);
            
            const body = (this.isPenguinBody(data.bodyA) ? data.bodyB : data.bodyA)  as MatterJS.BodyType;
            // console.log(body);

            // TODO why we have to check the parent?
            if (this.obstacles.has('spikes', body) || this.obstacles.has('spikes', body.parent))
            {
                this.stateMachine.setState('spike-hit');
                return;
            }

            const gameObject = body.gameObject;
            if (!gameObject) 
            {
                return;
            }

            if (gameObject instanceof Phaser.Physics.Matter.TileBody) 
            {
                if (this.stateMachine.isCurrentState('jump'))
                {
                    this.stateMachine.setState('idle');
                }
            }
            else if (gameObject instanceof Phaser.Physics.Matter.Sprite)
            {
                const type = gameObject.getData('type') as string;
                switch(type)
                {
                    case 'star':
                    {
                        events.emit('star-collected');
                        gameObject.destroy();
                        break;
                    }
                    case 'health':
                    {
                        const healthPoints = sprite.getData('healthPoints') ?? 10;

                        const previousHealth = this.health;
                        this.health = Phaser.Math.Clamp(this.health + healthPoints, 0, 100);
                        events.emit('health-changed', previousHealth, this.health);
                        gameObject.destroy();
                        break;
                    }                    
                }
            }
        });
    }

    update(deltaTime: number)
    {
        this.stateMachine.update(deltaTime);
    }

    private isPenguinBody(body: MatterJS.Body)
    {
        const gameObject = (body as MatterJS.BodyType).gameObject;
        if (gameObject instanceof Phaser.Physics.Matter.Sprite)
        {
            const type = gameObject.getData('type');
            return type === 'penguin';
        }
        return false;
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

    private spikeHitOnEnter() 
    {
        this.sprite.setVelocityY(-12);

        const previousHealth = this.health;
        this.health = Phaser.Math.Clamp(this.health - 10, 0, 100);
        // TODO use enum
        events.emit('health-changed', previousHealth, this.health);

        const startColor = Phaser.Display.Color.ValueToColor(0xffffff);
        const endColor = Phaser.Display.Color.ValueToColor(0xff0000);
        this.scene.tweens.addCounter({
            from: 0,
            to: 100,
            duration: 100,
            repeat: 2,
            yoyo: true,
            onUpdate: tween => {
                const value = tween.getValue();
                const colorObject = Phaser.Display.Color.Interpolate.ColorWithColor(
                    startColor,
                    endColor,
                    100,
                    value
                );
                const color = Phaser.Display.Color.GetColor(colorObject.r, colorObject.g, colorObject.b);
                this.sprite.setTint(color);
            }
        });
        this.stateMachine.setState('idle');
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