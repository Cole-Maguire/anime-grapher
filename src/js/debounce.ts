export default class Debounce<T> {
    private lastPassed?: {
        f: () => Promise<T>;
        resolve: (value: T | PromiseLike<T>) => void;
        reject: (reason?: any) => void;
    };

    constructor(public timeout: number) {
        setTimeout(() => { this.step() }, timeout);
    }

    debounce(f: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.lastPassed = {
                f,
                resolve,
                reject
            }
        });
    }

    private async step() {
        if (this.lastPassed) {
            try {
                const result = await this.lastPassed.f();
                this.lastPassed.resolve(result);
                this.lastPassed = null;
            } catch (err) {
                this.lastPassed.reject(err);
            }
        }

        //We do this to ensure that timeout is the minimum time between requests, 
        // not time between requests starting (as if we used setInterval)
        //Need to check whether this causes a memory leak
        setTimeout(() => { this.step() }, this.timeout)
    }
}

