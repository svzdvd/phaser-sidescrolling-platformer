import Phaser from 'phaser';
import ObstaclesController from './ObstaclesController';
import PlayerController from './PlayerController';
import SnowmanController from './SnowmanController';

export default class Game extends Phaser.Scene 
{  
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private penguin?: Phaser.Physics.Matter.Sprite;
    // private snowman?: Phaser.Physics.Matter.Sprite;
    private playerController?: PlayerController;
    private snowmanControllers: SnowmanController[] = [];
    private obstacles!: ObstaclesController;

    constructor()
    {
        super('game');
    }
    
    init()
    {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.obstacles = new ObstaclesController();
        this.snowmanControllers = [];

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.destroy();
        });   
    }

    preload()
    {
        this.load.atlas('penguin','assets/penguin.png','assets/penguin.json');
        this.load.image('tiles' , 'assets/sheet.png');
        this.load.tilemapTiledJSON('tilemap' , 'assets/game.json');
        this.load.image('star', 'assets/star.png');
        this.load.image('health', 'assets/health.png');
        this.load.atlas('snowman','assets/snowman.png','assets/snowman.json');
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
                    this.cameras.main.startFollow(this.penguin, true);
                    break;
                }
                case 'snowman':
                {
                    const snowman = this.matter.add.sprite(x + (width * 0.5), y + (width * 0.5), 'snowman')
                        .setFixedRotation();
                    snowman.setData('type', 'snowman');
                    this.snowmanControllers.push(new SnowmanController(this, snowman));
                    this.obstacles.add('snowman', snowman.body as MatterJS.BodyType);
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
                case 'health':
                {
                    const health = this.matter.add.sprite(x + (width * 0.5), y + (width * 0.5), 'health', undefined, {
                        isStatic: true,
                        isSensor: true
                    });
                    
                    // TODO resize image
                    health.setDisplaySize(70, 70);

                    health.setData('type', 'health');
                    health.setData('healthPoints', 10);
                    break;
                }                
                case 'spike':
                {
                    // console.log(objData);
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
        if (this.playerController) 
        {
            this.playerController.update(deltaTime);
        }

        this.snowmanControllers.forEach(snowman => 
        {
            snowman.update(deltaTime);
        });
    }

    destroy() 
    {
        this.scene.stop('ui');
        this.snowmanControllers.forEach(snowman => 
        {
            snowman.destroy();
        });
    }
}