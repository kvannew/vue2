
import {mergeOptions} from '../../../../../Downloads/vue(1)/jiagouke5-vue-master/2.vue-dep/src/utils'





export function initGlobalAPI(Vue) {
    // 静态方法
   
    Vue.options = {}
    Vue.mixin = function (mixin) {
        // 我们期望将用户的选项和 全局的options进行合并 '
        this.options = mergeOptions(this.options, mixin);
        return this;
    }

}