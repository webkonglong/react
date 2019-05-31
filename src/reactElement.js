// rect element 虚拟节点
// key 虚拟节点标识
// type 类型 可能是字符串 'div' 'span' 也可能是一个function function就是一个自定义组件
// props 虚拟界定属性

export default function reactElement(type, key, props) {
    this.type = type
    this.key = key
    this.props = props
}