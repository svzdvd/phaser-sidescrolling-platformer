interface StateConfig
{
    name?: string;
    onEnter?: () => void;
    onUpdate?: (deltaTime: number) => void;
    onExit?: () => void;
}
export default class StateMachine
{
    private context?: any;
    private name?: string;
    private states = new Map<string,StateConfig>();
    private currentState?: StateConfig;
    private isSwitchingState: boolean = false;
    private stateQueue: string[] = [];

    constructor(context?: any, name?: string) 
    {
        this.name = name ?? 'default-fsm';
        this.context = context;
    }

    addState(name: string, config?: StateConfig)
    {
        this.states.set(name, {
            name,
            onEnter: config?.onEnter?.bind(this.context),
            onUpdate: config?.onUpdate?.bind(this.context),
            onExit: config?.onExit?.bind(this.context)
        });

        return this;
    }

    isCurrentState(name: string)
    {
        return this.currentState && this.currentState.name === name;
    }

    setState(name: string)
    {
        if (!this.states.has(name))
        {
            return;
        }

        if (this.isSwitchingState) 
        {
            this.stateQueue.push(name);
            return;
        }

        this.isSwitchingState = true;

        if (this.currentState && this.currentState?.onExit) 
        {
            this.currentState.onExit();
        }

        console.log(`StateMachine ${this.name}: from ${this.currentState?.name} to ${name}`);

        this.currentState = this.states.get(name);
        if (this.currentState?.onEnter)
        {
            this.currentState.onEnter();
        }

        this.isSwitchingState = false;

        return this;
    }

    update(deltaTime: number)
    {
        if (this.stateQueue.length > 0) 
        {
            const name = this.stateQueue.shift()!;
            this.setState(name);
            return;
        }

        if (this.currentState && this.currentState?.onUpdate) 
        {
            this.currentState.onUpdate(deltaTime);
        }
    }
}