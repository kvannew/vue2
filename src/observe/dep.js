import watcher from "./watcher";

let id = 0

class Dep {
    constructor() {
        this.id = id++

        // 用于存放watcher
        this.subs = []
    }
    depend() {
        // this.subs.push(Dep.target) // 会重复watcher

        // 双向标记,dep与watcher多对多
        Dep.target.addDep(this)
    }
    addSub(watcher) {
        this.subs.push(watcher)
    }
    notify() {
        this.subs.forEach(watcher => watcher.update())
    }
}
Dep.target = null

let stack = []
export function pushTarget(watcher) {
    stack.push(watcher)
    Dep.target = watcher
}

export function popTarget() {
    stack.pop()
    Dep.target = stack[stack.length - 1]
}

export default Dep