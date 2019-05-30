import instantiateReactComponent from './instantiateReactComponent'

// 这个事件绑定目前还没完善
function triggle (element, method) {
    return element[method]()
}

const React = {
    nextReactRootIndex: 0,
    render (element, container) {
        const componentInstance = instantiateReactComponent(element)
        const markup = componentInstance.mountComponent(this.nextReactRootIndex++)
        document.querySelector(container).innerHTML = markup
        triggle(document, 'mountReady')
    }
}

export default React