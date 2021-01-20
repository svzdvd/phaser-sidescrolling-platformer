import Phaser from 'phaser'
import ObstaclesController from './ObstaclesController';
import PlayerController from './PlayerController'

export default class Game extends Phaser.Scene 
{  
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private penguin?: Phaser.Physics.Matter.Sprite;
    private playerController?: PlayerController;
    private obstacles!: ObstaclesController;

    constructor()
    {
        super('game');
    }
    
    init()
    {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.obstacles = new ObstaclesController();
    }

    preload()
    {
        this.load.atlas('penguin','assets/penguin.png','assets/penguin.json');
        this.load.image('tiles' , 'assets/sheet.png');
        this.load.tilemapTiledJSON('tilemap' , 'assets/game.json');
        this.load.image('star', 'assets/star.png');
    }

    create()
    {
        this.scene.launch('ui');

        const map = this.make.tilemap({ key : 'tilemap' });
        const tileset = map.addTilesetImage('iceworld' , 'tiles');
    
        const ground = map.createLayer('ground', tileset);
        ground.setCollisionByProperty({ collides: true });
        this.matter.world.convertTilemapLayer(ground);

        map.createLayer('obstacles', tileset);

        const { width, height } = this.scale;

        const objectsLayer = map.getObjectLayer('objects');
        objectsLayer.objects.forEach(objData => {
            const { x = 0, y = 0, name, width = 0 } = objData;
            switch(name) 
            {
                case 'penguin-spawn':
                {
                    this.penguin = this.matter.add.sprite(x + (width * 0.5), y + (width * 0.5), 'penguin')
                        .setFixedRotation();
                    this.penguin.setData('type', 'penguin');                        
                    this.playerController = new PlayerController(this, this.penguin, this.cursors, this.obstacles);        
                    this.cameras.main.startFollow(this.penguin);
                    break;
                }
                case 'star':
                {
                    const star = this.matter.add.sprite(x + (width * 0.5), y + (width * 0.5), 'star', undefined, {
                        isStatic: true,
                        isSensor: true
                    });
                    star.setData('type', 'star');
                    break;
                }
                case 'spike':
                {
                    console.log(objData);
                    // TODO fix x and y
                    const spike = this.matter.add.fromVertices(x + 35, y - (35 / 2), objData.polygon!, {
                        isStatic: true
                    });
                    this.obstacles.add('spikes', spike);
                    break;
                }
            }
        });
    }

    update(time: number, deltaTime: number)
    {
        if (!this.playerController) 
        {
            return;
        }

        this.playerController.update(deltaTime);
    }
}