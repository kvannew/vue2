import {initState} from "./state";
import {compileToFunction} from "./compiler";
import {mountComponent} from "./lifecycle";

export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        // $是vue专属的属性
        const vm = this
        // 将用户的选项挂载到实例上
        vm.$options = options

        // 初始化状态，初始化计算属性，watch
        initState(vm)

        if(options.el) {
            vm.$mount(options.el)
        }
    }
    Vue.prototype.$mount = function (el) {
        const vm = this
        el = document.querySelector(el)
        let ops = vm.$options
        if(!ops.render) {
            let template
            if(!ops.template && el) {
                // 使用el
                template = el.outerHTML
            } else {
                // 使用template
                if(el) template = ops.template
            }
            if(template && el) {
                // 对模版进行编译
                ops.render = compileToFunction(template)
            }
        }
        // 组件的挂载
        mountComponent(vm, el)
    }
}
