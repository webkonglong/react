import $shouldUpdateReactComponent from './shouldUpdateReactComponent'
import instantiateReactComponent from './instantiateReactComponent'


export default class ReactCompositeComponent {
    constructor (element) {
        // 存放元素element对象
        this.$currentElement = element
        // 存放唯一标识
        this.$rootNodeID = null
        // 存放对应的reactClass实例
        this.$instance = null
    }

    // 类 装载方法
    mountComponent (rootID) {
        this.$rootNodeID = rootID
        // 当前元素属性
        const publicProps = this.$currentElement.props
        // 对应的react class
        const ReactClass = this.$currentElement.type
        const inst = new ReactClass(publicProps)
        this.$instance = inst
        // 保留对当前component的引用
        inst.$reactInternalInstance = this
        // 生命周期
        // 这里在原始的reactjs 其实还有一个处理 就是componentWillMount调用setState 不会触发rerender而是自动提前合并，这里为了简单就省略了
        inst.componentWillMount && inst.componentWillMount()
        // 调用ReactClass实例的render 返回一个element或文本节点
        const renderedElement = this.$instance.render()
        // this.$renderedComponen存起来留作后用
        const renderedComponentInstance = this.$renderedComponen = instantiateReactComponent(renderedElement)
        const renderedMarkup = renderedComponentInstance.mountComponent(this.$rootNodeID)

        // dom装在到html 后调用生命周期
        window.addEventListener('load', _ => {
            inst.componentDidMount && inst.componentDidMount()
        })

        return renderedMarkup
    }

    // 类 更新
    receiveComponent (nextElement, newState) {
        // 如果有新的lement 则用新的element
        this.$currentElement = nextElement || this.$currentElement
        const inst = this.$instance
        // 合并state
        const nextState = Object.assign(inst.state, newState)
        const nextProps = this.$currentElement.props
        // 更新state
        inst.state = nextState
        // 生命周期方法
        if (inst.shouldComponentUpdate && !inst.shouldComponentUpdate(nextProps, nextState)) {
            // 如果声明周期 shouldComponentUpdate 返回false，则不需要继续往下执行更新
            return
        }

        // 声明周期方法
        inst.componentWillUpdate && inst.componentWillUpdate(nextProps, nextState)

        // 获取老的element
        const prevComponentInstance = this.$renderedComponen
        const prevRenderedElement = prevComponentInstance.$currentElement

        // 通过重新render 获取新的element
        const nextRenderedElement = this.$instance.render()
        // 比较新旧元素
        if ($shouldUpdateReactComponent(prevRenderedElement, nextRenderedElement)) {
            // 两种元素相同，需要更新，执行子节点更新
            prevComponentInstance.receiveComponent(nextRenderedElement)
            // 生命周期方法
            inst.componentDidUpdate && inst.componentDidUpdate()
        } else {
            // 两种方法不同，直接重新状态dom
            this.$renderedComponen = this.$instantiateReactComponent(nextRenderedElement)
            document.querySelector(`[data-reactid="${this.$rootNodeID}"]`).replaceWith($renderedComponent.mountComponent(this.$rootNodeID))
        }
    }
}