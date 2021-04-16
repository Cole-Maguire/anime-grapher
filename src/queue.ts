// a queue 

export default class Queue<T> {
    // private _queue: (() => Promise<T>)[] = [];
    private _queue: {
        f: () => Promise<T>;
        resolve: (value: T | PromiseLike<T>) => void;
        reject: (reason?: any) => void;
    }[] = [];

    constructor(public timeout: number, public requests_per_timeout: number) {
        setTimeout(() => { this.step() }, timeout);
    }

    queue(f: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this._queue.push({
                f,
                resolve,
                reject,
            });
        });
    }

    private async step() {
        const items = this._queue.splice(0, this.requests_per_timeout);
        if (!items) {
            return;
        }
        await Promise.allSettled(
            items.map(async item => {
                try {
                    let result = await item.f();
                    item.resolve(result);
                } catch (err) {
                    item.reject(err);
                }
            }))

        //We do this to ensure that timeout is the minimum time between requests, 
        // not time between requests starting (as if we used setInterval)

        //Need to check whether this causes a memory leak
        setTimeout(() => { this.step() }, this.timeout)
    }
}

