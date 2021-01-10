import Phaser from 'phaser'

export default class Game extends Phaser.Scene 
{  
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private penguin?: Phaser.Physics.Matter.Sprite;
    private isPenguinTouchingGround = false;

    constructor()
    {
        super('game');
    }
    
    init()
    {
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    preload()
    {
        this.load.atlas('penguin','assets/penguin.png','assets/penguin.json');
        this.load.image('tiles' , 'assets/sheet.png');
        this.load.tilemapTiledJSON ('tilemap' , 'assets/game.json');
    }

    create()
    {
        this.createPenguinAnimations();

        const map = this.make.tilemap({ key : 'tilemap' });
        const tileset = map.addTilesetImage ('iceworld' , 'tiles');
    
        const ground = map.createLayer('ground', tileset);
        ground.setCollisionByProperty({ collides: true });
        this.matter.world.convertTilemapLayer(ground);

        const { width, height } = this.scale;

        const objectsLayer = map.getObjectLayer('objects');
        objectsLayer.objects.forEach(objData => {
            const { x = 0, y = 0, name, width = 0 } = objData;
            switch(name) 
            {
                case 'penguin-spawn':
                {
                    this.penguin = this.matter.add.sprite(x + (width * 0.5), y + (width * 0.5), 'penguin')
                        .play('player-idle')
                        .setFixedRotation();

                    this.penguin.setOnCollide((data: MatterJS.ICollisionPair) => {
                        this.isPenguinTouchingGround = true;
                    });
        
                    this.cameras.main.startFollow(this.penguin);

                    break;
                }
            }
        });
    }

    update()
    {
        const speed = 5;
        const jumpSpeed = 10;
        const spaceKeyIsJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.space);

        if (!this.penguin) 
        {
            return;
        }

        if (this.cursors.left.isDown) 
        {
            this.penguin.flipX = true;
            this.penguin.setVelocityX(-speed);
            this.penguin.play('player-walk', true);
        }
        else if (this.cursors.right.isDown)
        {
            this.penguin.flipX = false;            
            this.penguin.setVelocityX(speed);
            this.penguin.play('player-walk', true);
        }
        else if (spaceKeyIsJustPressed && this.isPenguinTouchingGround)
        {
            this.isPenguinTouchingGround = false;
            this.penguin.flipX = false;            
            this.penguin.setVelocityY(-jumpSpeed);
            this.penguin.play('player-walk', true);
        }
        else 
        {
            this.penguin.setVelocityX(0);
            this.penguin.play('player-idle', true);
        }
    }

    private createPenguinAnimations()
    {
        this.anims.create({
            key: 'player-idle',
            frames: [{ key: 'penguin', frame: 'penguin_walk01.png' }],
            repeat: 1
        });

        this.anims.create({
            key: 'player-walk',
            frameRate: 10,
            frames: this.anims.generateFrameNames('penguin', {
                start: 1, 
                end: 4,
                prefix: 'penguin_walk0',
                suffix: '.png'
            }),
            repeat: -1
        });
    }

}