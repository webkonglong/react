import instantiateReactComponent from './instantiateReactComponent'
import ReactClass from './reactClass'
import ReactElement from './reactElement'

// function triggle (element, method) {
//     return element[method]()
// }

export default {
    nextReactRootIndex: 0,
    createClass (spec) {
        const Constructor = function (props) {
            this.props = props
            this.state = this.getInitialState ? this.getInitialState() : null
        }
        Constructor.prototype = new ReactClass()
        Constructor.prototype.constructor = Constructor

        Object.assign(Constructor.prototype, spec)
        return Constructor
    },
    // type 元素的 component 类型 config 元素配置 children 元素的子元素
    createElement (type, configs, children) {
        const props = {}
        let propName;
        const config = configs || {}
        const key = config.key || null
        for (propName in config) {
            if (config.hasOwnProperty(propName) && propName !== 'key') {
                props[propName] = config[propName]
            }
        }

        const childrenLength = arguments.length - 2
        if (childrenLength === 1) {
            props.children = Array.isArray(children) ? children : [children]
        } else if (childrenLength > 1) {
            const childArray = []
            for (let i = 0; i < childrenLength; i++) {
                childArray[i] = arguments[i + 2]
            }
            props.children = childArray
        }
        return new ReactElement(type, key, props)
    },
    render (element, container) {
        const componentInstance = instantiateReactComponent(element)
        const markup = componentInstance.mountComponent(this.nextReactRootIndex++)
        console.log(container)
        container.innerHTML = markup
        // triggle(document, 'mountReady')
    }
}
