import {parseHTML} from "./parse";

// 生成props
function genProps(attrs) {
    let str = ''
    for (let i = 0; i < attrs.length; i++) {
        let attr = attrs[i]
        if (attr.name === 'style') {
            let obj = {}
            attr.value.split(';').forEach(item => {
                let [key, value] = item.split(':')
                obj[key] = value
            })
            attr.value = obj
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`
    }
    return `{${str.slice(0, -1)}}`
}

// 生成属性
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{ asdsadsa }}  匹配到的内容就是我们表达式的变量\
function gen(node) {
    if (node.type === 1) {
        return genCode(node)
    } else {
        let text = node.text
        if (!defaultTagRE.test(text)) {
            // 纯文本情况
            return `_v(${JSON.stringify(text)})`
        } else {
            // {{name}}hello情况
            let tokens = []
            let match
            defaultTagRE.lastIndex = 0
            let lastIndex = 0
            while (match = defaultTagRE.exec(text)) {
                // 匹配的位置
                let index = match.index
                if (index > lastIndex) {
                    tokens.push(JSON.stringify(text.slice(lastIndex, index)))
                }
                tokens.push(`_s(${match[1].trim()})`)
                lastIndex = index + match[0].length
            }
            if (lastIndex < text.length) {
                tokens.push(JSON.stringify(text.slice(lastIndex)))
            }
            return `_v(${tokens.join('+')})`
        }
    }
}

// 生成子元素
function genChildren(children) {
    return children.map(child => gen(child)).join(',')
}

// 生成字符串
function genCode(ast) {
    let children = genChildren(ast.children)
    return (`_c('${ast.tag}',${ast.attrs.length > 0 ? genProps(ast.attrs) : 'null'}${ast.children.length ? `,${children}` : ''})`)
}

export function compileToFunction(template) {
    // 将template转化成ast语法树
    let ast = parseHTML(template)

    // 模版引擎实现原理：with + new Function

    // 生成render函数
    let code = genCode(ast)
    code = `with(this){return ${code}}`
    return new Function(code)
}