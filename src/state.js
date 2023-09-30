import {observe} from "./observe";
import Watcher, {nextTick} from "./observe/watcher";
import Dep from "./observe/dep";

export function initState(vm) {
    const opts = vm.$options
    if (opts.data) {
        initData(vm)
    }
    if (opts.computed) {
        initComputed(vm)
    }
    if (opts.watch) {
        initWatch(vm)
    }
}

// 初始化data
function initData(vm) {
    let data = vm.$options.data
    // 判断data是函数还是对象
    data = typeof data == 'function' ? data.call(vm) : data

    vm._data = data
    // 对数据进行劫持
    observe(data)

    // 将vm._data用vm来代理
    for (const key in data) {
        proxy(vm, '_data', key)
    }
}

// 代理data到this下
function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
        get() {
            return vm[target][key]
        },
        set(newValue) {
            vm[target][key] = newValue
        }
    })
}

function initWatch(vm) {
    let watch = vm.$options.watch
    for (const key in watch) {
        const handler = watch[key]
        if(Array.isArray(handler)) {
            for (let i = 0; i < handler.length; i++) {
                createWatcher(vm, key, handler[i])
            }
        } else {
            createWatcher(vm, key, handler)
        }
    }
}

function createWatcher(vm, key, handler) {
    if(typeof handler === "string") {
        handler = vm[handler]
    }
    return vm.$watch(key, handler)
}

function initComputed(vm) {
    const computed = vm.$options.computed
    // 将计算属性watcher保存到vm
    const watcher = vm._computedWatchers = {}
    for (const key in computed) {
        let userDef = computed[key]

        let fn = typeof userDef === "function" ? userDef : userDef.get
        // 如果直接new watcher，会默认执行fn
        watcher[key] = new Watcher(vm, fn, {
            lazy: true
        })

        defineComputed(vm, key, userDef)
    }
}

function defineComputed(target, key, userDef) {
    // const getter = typeof userDef === "function" ? userDef : userDef.get
    const setter = userDef.set || (() => {
    })
    Object.defineProperty(target, key, {
        get: createComputedGetter(key),
        set: setter
    })
}

function createComputedGetter(key) {
    // 需要检测是否需要执行getter
    return function () {
        const watcher = this._computedWatchers[key]
        if (watcher.dirty) {
            watcher.evaluate()
        }
        if (Dep.target) {
            // 计算属性出栈后，还要渲染watcher，我们应该让计算属性watcher里面的属性 也去收集上一层watcher
            watcher.depend()
        }
        return watcher.value
    }
}

export function initStateMixin(Vue) {

    Vue.prototype.$nextTick = nextTick

    Vue.prototype.$watch = function (exprOrFn, cb) {
        // 值变化之后执行cb函数
        new Watcher(this, exprOrFn, {user: true}, cb)
    }

}