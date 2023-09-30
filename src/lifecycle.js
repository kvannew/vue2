import {createElementVNode, createTextVNode} from "./vdom";
import Watcher from "./observe/watcher";
import {patch} from "./vdom/patch";

export function initLifeCycle(Vue) {
    // 挂载真实dom
    Vue.prototype._update = function (vnode) {
        const vm = this
        const el = vm.$el
        // 将vnode转换成真实dom
        vm.$el = patch(el, vnode)
    }
    // 创建元素虚拟节点
    Vue.prototype._c = function () {
        return createElementVNode(this, ...arguments)
    }
    // 创建文本虚拟节点
    Vue.prototype._v = function () {
        return createTextVNode(this, ...arguments)
    }
    Vue.prototype._s = function (value) {
        if(typeof value !== 'object') return value
        return JSON.stringify(value)
    }
    // 渲染虚拟dom
    Vue.prototype._render = function () {
        // 当渲染时会去实例中取值，就可以将属性与视图绑定在一起
        return vm.$options.render.call(this)
    }
}

export function mountComponent(vm,el){ // 这里的el 是通过querySelector处理过的
    vm.$el = el;

    // 1.调用render方法产生虚拟节点 虚拟DOM

    // 重写渲染
    const updateComponent = () => {
        vm._update(vm._render())
    }

    new Watcher(vm, updateComponent, true)

    // vm._update(vm._render()); // vm.$options.render() 虚拟节点

    // 2.根据虚拟DOM产生真实DOM

    // 3.插入到el元素中

}
// vue核心流程 1） 创造了响应式数据  2） 模板转换成ast语法树
// 3) 将ast语法树转换了render函数 4) 后续每次数据更新可以只执行render函数 (无需再次执行ast转化的过程)
// render函数会去产生虚拟节点（使用响应式数据）
// 根据生成的虚拟节点创造真实的DOM

