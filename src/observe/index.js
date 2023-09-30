import Dep from "./dep";

class Observer {
    constructor(data) {
        // 所有dep增加属性
        this.dep = new Dep()

        Object.defineProperty(data, "__ob__", {
            value: this,
            // 不可枚举，循环的时候无法获取（解决死循环问题）
            enumerable: false
        })
        // data.__ob__ = this
        // Object.defineProperty只能劫持已经存在的属性
        if(Array.isArray(data)) {
            data.__proto__ = newArrayProto
            this.observeArray(data)
        } else {
            this.walk(data)
        }
    }

    // 循环对象，对属性依次劫持
    walk(data) {
        // 重新定义属性
        Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
    }

    // 观测数组
    observeArray(data) {
        data.forEach(item => observe(item))
    }
}

// 深层次嵌套会递归，递归多了性能差，不存在的属性监控不到，存在的属性要重写方法  vue3->proxy解决这些问题
function dependArray(value) {
    for (let i = 0; i < value.length; i++) {
        let current = value[i]
        current.__ob__ && current.__ob__.dep.depend()
        if(Array.isArray(current)) {
            dependArray(current)
        }
    }
}

// 将属性定义为响应式的
export function defineReactive(target, key, value) {
    // 对所有对象进行属性劫持,childOb.dep用来进项依赖收集
    let childOb = observe(value)
    // 给每个属性增加一个dep
    let dep = new Dep()
    Object.defineProperty(target, key, {
        // 取值时，会执行get
        get() {
            if(Dep.target) {
                dep.depend()
                if(childOb) {
                    childOb.dep.depend()

                    if(Array.isArray(value)) {
                        dependArray(value)
                    }
                }
            }
            return value
        },

        // 修改的时候，会执行set
        set(newValue) {
            if(newValue === value) return
            // 设置值劫持
            observe(newValue)
            value = newValue
            dep.notify()
        }
    })
}

export function observe(data) {
    // 对对象进行劫持
    if(typeof data !== 'object' || data == null) {
        return
    }

    // 判断这个对象是否被监测过了
    if(data.__ob__ instanceof Observer) {
        return data.__ob__
    }

    return new Observer(data)
}