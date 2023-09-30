import babel from 'rollup-plugin-babel'
import resolve from "@rollup/plugin-node-resolve";

// rollup默认导出一个对象，作为打包配置文件
export default {
    input: './src/index.js',
    output: {
        file: './dist/vue.js',
        // 挂载到global
        name: 'Vue',
        // umd
        format: 'umd',
        // 调试源代码
        sourcemap: true
    },
    plugins: [
        babel({
            exclude: 'node_modules/**'
        }),
        resolve()
    ]
}