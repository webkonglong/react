import { ReactDOMTextComponent, ReactDOMComponent, ReactCompositeComponent } from "./reactDom"

function instantiateReactComponent (node) {
    // 文本节点
    if (typeof node === "string" || typeof node === "number") {
        return new ReactDOMTextComponent(node)
    }

    // 浏览器默认节点的情况
    if (typeof node === "object" && typeof node.type === "string") {
        return new ReactDOMComponent(node)
    }

    // 自定义节点
    if (typeof node === "object" && typeof node.type === "function") {
        return new ReactCompositeComponent(node)
    }
}

export default instantiateReactComponent