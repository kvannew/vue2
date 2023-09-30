import Dep, {popTarget, pushTarget} from "./dep";

let id = 0
class Watcher {
    constructor(vm, exprOrFn, options, cb) {
        this.id = id++

        // 是一个渲染watcher
        this.renderWatcher = options

        if(typeof exprOrFn === "string") {
            this.getter = function () {
                return vm[exprOrFn]
            }
        } else {
            this.getter = exprOrFn
        }

        this.getter = exprOrFn

        // 实现计算属性与清理工作需要用
        this.deps = []

        this.depsId = new Set()

        this.lazy = options.lazy

        // 缓存值
        this.dirty = this.lazy

        this.vm = vm

        this.cb = cb

        this.user = options.user

        this.value = this.lazy ? undefined : this.get()
    }

    addDep(dep) {
        // 一个组件，对应多个属性
        let id = dep.id
        if(!this.depsId.has(id)) {
            this.deps.push(dep)
            this.depsId.add(id)
            dep.addSub(this)
        }
    }

    evaluate() {
        this.value = this.get()
        this.dirty = false
    }

    get() {
        // Dep.target = this
        pushTarget(this)
        let value = this.getter.call(vm)
        // Dep.target = null
        popTarget()
        return value
    }

    depend() {
        let i = this.deps.length
        while (i--) {
            // 让计算属性也收集渲染watcher
            this.deps[i].depend()
        }
    }

    update() {
        if(this.dirty) {
            // 如果是计算属性 依赖值变化了，就表示为脏
            this.dirty = true
        }
        // 把当前watcher暂存起来
        queueWatcher(this)
        // this.get()
    }
    run() {
        let oldValue = this.value
        let newValue = this.get()
        if(this.user) {
            this.cb.call(newValue, oldValue)
        }
    }
}

let queue = []
let has = {}
// 防抖处理
let pending = false

function flushSchedulerQueue() {
    let flushQueue = queue.slice(0)
    queue = []
    has = {}
    pending = false
    flushQueue.forEach(q => q.run())
}

function queueWatcher(watcher) {
    const id = watcher.id
    if(!has[id]) {
        queue.push(watcher)
        has[id] = true
        if(!pending) {
            nextTick(flushSchedulerQueue, 0)
            pending = true
        }
    }
}

let callbacks = []
let waiting = false

function flushCallbacks() {
    let cbs = callbacks.slice(0)
    waiting = true
    callbacks = []
    cbs.forEach(cb => cb())
}

// 优雅降级，优先采用最快的执行方式
let timerFunc
if(Promise) {
    timerFunc = () => {
        Promise.resolve().then(flushCallbacks)
    }
} else if(MutationObserver) {
    let observe = new MutationObserver(flushCallbacks)
    let textNode = document.createTextNode("1")
    observe.observe(textNode, {
        characterData: true
    })
    timerFunc = () => {
        textNode.textContent = "2"
    }
} else if(setImmediate) {
    timerFunc = () => {
        setImmediate(flushCallbacks)
    }
} else {
    timerFunc = () => {
        setTimeout(flushCallbacks)
    }
}

export function nextTick(cb) {
    callbacks.push(cb)
    if(!waiting) {
        // setTimeout(flushCallbacks, 0)
        timerFunc()
        waiting = true
    }
}

// 需要给每一个属性增加一个dep，目的是收集watcher
// dep与watcher是多对多关系

export default Watcher