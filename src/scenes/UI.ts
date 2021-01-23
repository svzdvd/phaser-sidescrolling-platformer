import Phaser from 'phaser';
import { sharedInstance as events } from './EventCenter';

// TODO max_health constant
const max_health = 100;

export default class UI extends Phaser.Scene
{
    private starCollectedCounter: integer = 0;
    private starsLabel!: Phaser.GameObjects.Text;
    private graphics!: Phaser.GameObjects.Graphics;

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
        this.graphics = this.add.graphics();
        this.setHealthBar(max_health);

        this.starsLabel = this.add.text(10, 35, 'Stars: 0', {
            fontSize: '32px'
        });

        events.on('star-collected', this.handleStarCollected, this);
        this.events.once(Phaser.Scenes.Events.DESTROY, () => {
            events.off('star-collected', this.handleStarCollected, this);
        });

        events.on('health-changed', this.handleHealthChanged, this);
        this.events.once(Phaser.Scenes.Events.DESTROY, () => {
            events.off('health-changed', this.handleHealthChanged, this);
        });
    }

    private handleStarCollected() 
    {
        this.starCollectedCounter += 1;
        this.starsLabel.text = `Stars: ${this.starCollectedCounter}`;
    }

    private handleHealthChanged(previousHealth: number, health: number)
    {
        // console.log(`from ${previousHealth} to ${health}`)

        this.tweens.addCounter({
            from: previousHealth,
            to: health,
            duration: 200,
            onUpdate: tween => {
                const value = tween.getValue();
                this.setHealthBar(value);
            }
        });
    }

    private setHealthBar(health: number) 
    {
        const width = 200;
        const percent = Phaser.Math.Clamp(health, 0, max_health) / max_health;

        this.graphics.clear();
        this.graphics.fillStyle(0x808080);
        this.graphics.fillRoundedRect(10, 10, width, 20, 5);
        if (percent > 0) 
        {
            this.graphics.fillStyle(0x00ff00);
            this.graphics.fillRoundedRect(10, 10, width * percent, 20, 5); 
        }
    }
}
