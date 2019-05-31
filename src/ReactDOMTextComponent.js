export default class ReactDOMTextComponent {
    constructor (text) {
        this.$currentElement = `${text}`
        this.$rootNodeID = null
    }

    mountComponent (rootID) {
        this.$rootNodeID = rootID
        return `<span data-reactid="${rootID}">${this.$currentElement}</span>`
    }

    receiveComponent (nextText) {
        const nextStringText = `${nextText}`
        if (nextStringText !== this.$currentElement) {
            this.$currentElement = nextStringText
            document.querySelector(`[data-reactid="${this.$rootNodeID}"]`)
        }
    }
}