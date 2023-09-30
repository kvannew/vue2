// h()  _c()  创建元素虚拟节点
export function createElementVNode(vm, tag, data, ...children) {
    if(data == null) data = {}
    let key = data.key
    if(key) {
        delete data.key
    }
    return vnode(vm, tag, key, data, children)
}

// 创建文本虚拟节点
export function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text)
}

// 创建虚拟dom
function vnode(vm, tag, key, data, children, text) {
    return {
        vm,
        tag,
        key,
        data,
        children,
        text
    }
}