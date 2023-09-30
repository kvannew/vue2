let oldArrayProto = Array.prototype

let newArrayProto = Object.create(oldArrayProto)

let methods = [
    "push",
    "pop",
    "shift",
    "unshift",
    "reverse",
    "sort",
    "splice"
] // concat slice不会改变原来的数组

methods.forEach(method => {
    // 重写数组的方法
    newArrayProto[method] = function (...args) {
        const result = oldArrayProto[method].call(this, ...args)

        let inserted
        let ob = this.__ob__
        switch (method) {
            case "push":
            case "unshift":
                inserted = args
                break
            case "splice":
                inserted = args.slice(2)
                break
            default:
                break
        }
        if(inserted) {
            // 观测新增的数组
            // 观测新增的数组
            // 观测新增的数组
            // 观测新增的数组
            // 观测新增的数组
            ob.observeArray(inserted)
        }
        //. 数组辩护了，通知对应watcher进行更新
        ob.dep.notify()
        return result
    }
})