import Phaser from 'phaser';
import { sharedInstance as events } from './EventCenter';

export default class UI extends Phaser.Scene
{
    private starCollectedCounter: integer = 0;
    private starsLabel!: Phaser.GameObjects.Text;

    constructor()
    {
        super({
            key: 'ui'
        });
    }

    init()
    {
        this.starCollectedCounter = 0;
    }

    create()
    {
        this.starsLabel = this.add.text(10, 10, 'Stars: 0', {
            fontSize: '32px'
        });

        events.on('star-collected', this.handleStarCollected, this);
        this.events.once(Phaser.Scenes.Events.DESTROY, () => {
            events.off('star-collected', this.handleStarCollected, this);
        });
    }

    private handleStarCollected() 
    {
        this.starCollectedCounter += 1;
        this.starsLabel.text = `Stars: ${this.starCollectedCounter}`;
    }
}
