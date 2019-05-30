// 通过比较两个元素，判断是否需要更新
export default function $shouldUpdateReactComponent (prevElement, nextElement) {
    if (prevElement != null && nextElement != null) {
        const prevType = typeof prevElement
        const nextType = typeof nextElement
        if (prevType === "string" || prevType === "number") {
            // 文本节点比较是否为相同类型节点
            return nextType === "string" || nextType === "number"
        } else {
            // 通过type 和 key 判断是否为同类型节点和同一个节点
            return nextType === "object" && prevElement.type === nextElement.type && prevElement.key === nextElement.key
        }
    }
    return false
}

