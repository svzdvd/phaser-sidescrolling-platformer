const createKey = (name: string, id: number) => {
    return `${name}-${id}`;
}

export default class ObstaclesController
{
    private obstacles = new Map<string,MatterJS.BodyType>()

    add(name: string, body: MatterJS.BodyType)
    {
        const key = createKey(name, body.id);
        this.obstacles.set(key, body);
    }

    has(name: string, body: MatterJS.BodyType)
    {
        const key = createKey(name, body.id);
        return this.obstacles.has(key);
    }
}