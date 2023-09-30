// 给属性赋值
export function patchProps(el, props) {
    for (const key in props) {
        if(key === 'style') {
            // 如果是样式
            for (const styleName in props.style) {
                el.style[styleName] = props.style[styleName]
            }
        } else {
            el.setAttribute(key, props[key])
        }
    }
}

// 创建元素
export function createElm(vnode) {
    let {tag, data, children, text} = vnode
    if(typeof tag === 'string') {
        // 标签
        vnode.el = document.createElement(tag)
        // 给属性赋值
        patchProps(vnode.el, data)
        // 递归创建元素
        children.forEach(child => {
            vnode.el.appendChild(createElm(child))
        })
    } else {
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}

// 创建新的dom
export function patch(oldVNode, vnode) {
    const isRealElement = oldVNode.nodeType
    if(isRealElement) {
        // 获取真实元素
        const elm = oldVNode
        const parentElm = elm.parentNode
        // 创建真实元素
        let newElm = createElm(vnode)
        parentElm.insertBefore(newElm, elm.nextSibling)
        parentElm.removeChild(elm)

        return newElm
    } else {

    }
}
