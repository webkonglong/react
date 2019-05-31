import instantiateReactComponent from './instantiateReactComponent'
import $shouldUpdateReactComponent from './shouldUpdateReactComponent'

function delegate (eventType, reactid, callback) {
    document.addEventListener(eventType.toLocaleLowerCase(), e => {
        if (`${e.target.dataset.reactid}` === `${reactid}`) {
            callback
        }
    })
}

// 差异更新的几种类型
const UPDATE_TYPES = {
    MOVE_EXISTING: 1,
    REMOVE_NODE: 2,
    INSERT_MARKUP: 3
}

// 全局的更新队列，所有的查一都存这个数组
let diffQueue = []

// 全局更新深度标识
let updateDepth = 0

function insertChildAt (parentNode, childNode, index) {
    const beforeChile = parentNode.children().get(index)
    beforeChile ? childNode.inserBefore(beforeChile) : childNode.appendTo(parentNode)
}

// 生成子节点elements的component集合
// prevChildren 前一个component集合
// nextChildrenElements 新传入的子节点element数组

function generateComponentChildren (prevChildren, nextChildrenElements) {
    const nextChildren = {}
    nextChildrenElements = nextChildrenElements || []
    nextChildrenElements.forEach((element, index) => {
        const name = element.key || index
        const prevChild = prevChildren && prevChildren[name]
        const prevElement = prevChild && prevChild.$currentElement
        const nextElement = element
        // 判断是否更新
        if ($shouldUpdateReactComponent(prevElement, nextElement)) {
            // 递归调用子节点receiveComponent
            prevChild.receiveComponent(nextElement)
            // 继续使用老的component
            nextChildren[name] = prevChild
        } else {
            // 如果没有老的，就新增一个，从新生成iygecomponent
            const nextChildInstance = instantiateReactComponent(nextElement, null)
            // 使用心得component
            nextChildren[name] = nextChildInstance
        }
    })
    return nextChildren
}

// 讲数组转化成映射
function flattenChildren (componentChildren) {
    let child, name;
    const childrenMap = {}
    for (let i = 0; i < componentChildren.length; i++) {
        child = componentChildren[i]
        name = child && child.$currentElement && child.$currentElement.key ? child.$currentElement.key : i.toString(36)
        childrenMap[name] = child
    }
    return childrenMap
}

export default class ReactDOMComponent {
    constructor (element) {
        this.$currentElement = element
        this.$rootNodeID = null
    }

    mountComponent (rootID) {
        this.$rootNodeID = rootID
        const props = this.$currentElement.props

        let tagOpen = `<${this.$currentElement.type}`
        const tagClose = `<${this.$currentElement.type}>`

        tagOpen += ` data-reactid=${this.$rootNodeID}`

        for (let propKey in props) {
            if (/^on[A_Za-z]/.test(propKey)) {
                const eventType = propKey.replace("on", "")
                delegate(eventType, this.$rootNodeID, props[propKey])
                
            }

            if (props[propKey] && propKey != "children" && !/^on[A_Za-z]/.test(propKey)) {
                tagOpen += ` ${propKey}=${props[propKey]}`
            }
        }

        // 渲染子节点
        let contant = ''
        const children = props.children || []
        const childrenInstances = []
        children.forEach((child, key) => {
          const  childComponentInstance = instantiateReactComponent(child)
          // 给子节点添加标记
          childComponentInstance.$mountIndex = key
          childrenInstances.push(childComponentInstance)
          const curRootId = `${this.$rootNodeID}.${key}`
          // 拿子节点渲染值
          const childMarKup = childComponentInstance.mountComponent(curRootId)
          // 拼接一起
          contant += ` ${childMarKup}`
        })
        // 保存component实例
        this.$renderedChildren = childrenInstances
        // 拼接整个html内容
        return `${tagOpen}>${contant}${tagClose}`
    }

    receiveComponent (nextElement) {
        const lastProps = this.$currentElement.props
        const nextProps = nextElement.props
        // 处理当前节点属性
        this.$updateDOMProperties(lastProps, nextProps)
        // 处理当前节点的子节点变动
        this.$updateDOMChildren(nextElement.props.children)
    }

    // 更新属性
    $updateDOMProperties (lastProps, nextProps) {
        // 当属性不在新属性的集合里面时,需要删除属性
        let propKey
        for (propKey in lastProps) {
            if (nextProps.hasOwnProperty(propKey) || !lastProps.hasOwnProperty(propKey)) {
                // 新属性中有，并且不在老属性的原型中
                continue
            }
            if (/^on[A-Za-z]/.test(propKey)) {
                const eventType = propKey.replace('on', '')
                // 需要去除data-reactid=this.$rootNodeId 监听的eventTyppe函数
                // 函数为lastProps[propKey]
                console.log(eventType)
                continue
            }
            document.querySelector(`[data-reactid]=${this.$rootNodeID}`).removeAttribute(propKey)
        }

        for (propKey in nextProps) {
            if (/^on[A-Za-z]/.test(propKey)) {
                const eventType = propKey.replace('on', '')
                lastProp[propKey] && true // 同上 取消事件 true为占位

                // 这里需要给[data-reactid=this.$rootNodeID]绑定事件 事件名 eventType.[this.$rootNodeId]
                // 事件函数 nextprops[propkey]

                continue
            }

            if (propKey == 'children') continue
            // 添加新的属性，重写同名属性
            document.querySelector(`[data-reactid]=${this.$rootNodeID}`).setAttribute(propKey, nextProps[propKey])
        }

    }

    $updateDOMChildren (nextchildElements) {
        updateDepth++
        // diff 用来递归找差别，组建查一对象，添加到更新队列diffQueue
        this.$diff(diffQueue, nextChildrenElements)
        updateDepth--
        // updateDepth === 0的时候
        if (!updateDepth) {
            // 执行具体的dom操作
            this.patch(diffQueue)
            diffQueue = []
        }
    }

    // diff 递归找出差别，组装差异对象，添加到更新对象diffqueue 
    $diff (diffQueue, nextChildrenElements) {
        // 拿到之前的子节点的 component类型对象的集合,这个是在刚开始渲染时赋值的
        // renderedChildren 本来是数组，我们搞成map
        const prevChildren = flattenChildren(this.$renderedChildren)
        // 生成新的子节点的compinent对象集合，这里会福永老的component对象
        const nextChildren = generateCompinentChild(prevChild, nextChildrenElements)
        // 重新赋值$renderedChildren使用最新的
        this.$renderedChildren = []
        nextChildren.forEach(instance => {
            this.$renderedChildren.push(instance)
        })

        let lastIndex = 0 // 访问的最后一次的老的集合位置
        let nextIndex = 0 // 到达的新节点的index
        //通过对比两个集合的差异,组装差异节点添加到队列中
        for (name in nextChildren) {
            if (!nextChildren.hasOwnProperty(name)) continue
            const prevChild = prevChildren && prevChildren[name]
            const nextChild = nextChildren[name]
            // 相同的花，说明是使用的同一个component,所以我们需要移动操作
            if (prevChild === nextChild) {
                // 添加差异对象，类型MOVE_EXISTING
                prevChild.$mountIndex < lastIndex && diffQueue.push({
                    parentId: this.$rootNodeID,
                    parentNode: document.querySelector(`[data-reactid="${this.$rootNodeID}"]`),
                    type: UPDATE_TYPES>REMOVE_NODE,
                    fromIndex: prevChild.$mountIndex,
                    toIndex: null
                })
                lastIndex = Math.max(prevChild.$mountIndex, lastIndex)
            } else {
                // 如果不相同，说明是新增加的节点
                // 但是如果老的还存在，就是element不同，但是compinent一样，我们需要把它对应的老的element删除
                if (prevChild) {
                    // 添加差异对象，类型REMOVE_NODE
                    diffQueue.push({
                        parentId: this.$rootNodeID,
                        parentNode: document.querySelector(`[data-reactid="${this.$rootNodeID}"]`),
                        type: UPDATE_TYPES.REMOVE_NODE,
                        fromIndex: prevChild.$mountIndex,
                        toIndex: null
                    })
                    // 如果以前一斤渲染过了，先去除以前所有的事件监听，通过命名空间全部清楚
                    if (prevChild.$rootNodeID) {
                        // 命名空间 .prevChild.$rootNodeID
                    }

                    lastIndex = Math.max(prevChild.$mountIndex, lastIndex)
                }
                // 新增加的节点，也组装差异对象放到队列里
                // 添加差异对象，类型INSER_MARKUP
                diffQueue.push({
                    parentId: this.$rootNodeID,
                    parentNode: document.querySelector(`[data-reactid="${this.$rootNodeID}"]`),
                    type: UPDATE_TYPES.INSERT_MARKUP,
                    fromIndex: null,
                    toIndex: nextIndex,
                    markup: nextChild.mountComponent(`${this.$rootNodeID}.${name}`) // 新增加的节点，多一个此属性表示新节点的dom内容
                })
            }
            // 更新mount的index
            nextChild.$mountIndex = nextIndex
            nextIndex++
        }

        // 对于老的节点里有，新的节点里没有的那些，也全部删除
        for (name in prevChildren) {
            if (prevChildren.hasOwnProperty(name) && !(nextChildren && nextChildren.hasOwnProperty(name))) {
                // 添加差异对象， 类型REMOVE_NODE
                diffQueue.push({
                    parentId: this.$rootNodeID,
                    parentNode: document.querySelector(`[data-reactid="${this.$rootNodeID}"]`),
                    type: UPDATE_TYPES.REMOVE_NODE,
                    fromIndex: prevChildren[name].$mountIndex,
                    toIndex: null
                })
                // 如果以前已经渲染过来，就先去掉以前所有的事件监听
                if (prevChildren[name].$rootNodeID) {
                    // 清楚 .prevchildren[name].$rootNodeID事件
                }
            }
        }
    }

    $patch (updates) {
        let update
        const initialChildren = {}
        const deleteChildren = []

        for (let i = 0; i < update.length; i++) {
            update = updates[i]
            if (update.type === UPDATE_TYPES.MOVE_EXISTING || update.type === UPDATE_TYPES.REMOVE_NODE) {
                const updatedIndex = update.fromIndex
                const updatedChild = document.querySelector(update.parentNode.children().get(updatedIndex))
                const parentID = update.parentID
                // 所有需要更新的节点都保存下来，方便后面使用
                initialChildren[parentID] = initialChildren[parentID] || []
                // 使用parentID作为简易命名空间
                initialChildren[parentID][updatedIndex] = updatedChild
                // 所有需要修改的节点先删除，对于move的，后面重新插入到正确位置就行
                deleteChildren.push(updatedChild)
            }
        }

        // 删除所有需要先删除的
        deleteChildren.forEach(child => {
            child.removeNode(true)
        })

        // 在遍历一次，这次处理新增加节点，还有修改的节点这里也需要重新插入
        for (let k = 0; k < updates.length; k++) {
            update = updates[k]
            switch (update.type) {
                case UPDATE_TYPES.INSERT_MARKUP:
                    insertChildAt(update.parentNode, document.querySelector(update.markup), update.toIndex)
                    break
                case UPDATE_TYPES.MOVE_EXISTING:
                    insertChildAt(update.parentNode, initialChildren[update.parentID][update.fromIndex], update.toIndex)
                    break
                case UPDATE_TYPES.REMOVE_NODE:
                    // 什么都不做，上面已经删除了
                    break
            }
        }
    }
}