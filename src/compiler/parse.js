const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 他匹配到的分组是一个 标签名  <xxx 匹配到的是开始 标签的名字
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);  // 匹配的是</xxxx>  最终匹配到的分组就是结束标签的名字
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;  // 匹配属性
// 第一个分组就是属性的key value 就是 分组3/分组4/分组五
const startTagClose = /^\s*(\/?)>/;  // <div> <br/>

export function parseHTML(html) {
    const ELEMENT_TYPE = 1
    const TEXT_TYPE = 3
    // 用于存放栈元素的
    const stack = []
    // 指向栈中最后一个元素
    let currentParent
    let root

    // 用于转换成一颗抽象语法树
    function createASTElement(tag, attrs) {
        return {
            tag,
            type: ELEMENT_TYPE,
            children: [],
            attrs,
            parent: null
        }
    }

    // 开始标签
    function start(tag, attrs) {
        // 创建ast节点
        let node = createASTElement(tag, attrs)
        if(!root) {
            root = node
        }
        if(currentParent) {
            node.parent = currentParent
            currentParent.children.push(node)
        }
        stack.push(node)
        currentParent = node
    }

    // 文本
    function chars(text) {
        text = text.replace(/\s/g, '')
        text && currentParent.children.push({
            type: TEXT_TYPE,
            text,
            parent: currentParent
        })
    }

    // 结束标签
    function end(tag) {
        // 弹出最后一个元素
        stack.pop()
        currentParent = stack[stack.length - 1]
    }

    // 截取已经匹配完的字符串
    function advance(length) {
        html = html.substring(length)
    }

    // 解析开始标签
    function parseStartTag() {
        const start = html.match(startTagOpen)
        if(start) {
            const match = {
                tagName: start[1],
                attrs: []
            }
            advance(start[0].length)

            let attr,end
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                advance(attr[0].length)
                match.attrs.push({name: attr[1], value: attr[3] || attr[4] || attr[5]})
            }

            if(end) {
                advance(end[0].length)
            }
            return match
        }

        return false
    }

    while (html) {
        // 判断是否是标签
        let textEnd = html.indexOf('<')
        if(textEnd === 0) {
            // 匹配开始标签
            const startTagMatch = parseStartTag()

            if(startTagMatch) {
                start(startTagMatch.tagName, startTagMatch.attrs)
                continue
            }

            // 解析结束标签
            let endTagMatch = html.match(endTag)
            if(endTagMatch) {
                advance(endTagMatch[0].length)
                end(endTagMatch[1])
                continue
            }
        }
        if(textEnd > 0) {
            // 解析文本
            let text = html.substring(0, textEnd)

            if(text) {
                chars(text)
                advance(text.length)
            }
        }
    }
    return root
}
