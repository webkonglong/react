// 所有自定义组件的超类
export default class ReactClass {
    render () {}
    setState (newState) {
        // 拿到ReactCompositeComponent的实例
        // 在装载的时候保存
        // 代码：this.$reactInternalInstance = this
        this.$reactInternalInstance.receiveComponent(null, newState)
    }
}