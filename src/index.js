import React from "./react"

const TodoList = React.createClass({
    getInitialState () {
        return { items: [111, 222, 333] }
    },
    componentDidMount () {
        console.log('componentDidMount')
    },

    onChange () {

    },
    add () {

    },
    render () {
        var createItem = function(itemText) {
            return React.createElement("div", null, itemText);
        };

        var lists = this.state.items.map(createItem);
        var input = React.createElement("input", {
            onkeyup: this.onChange.bind(this),
            value: this.state.text
        });
        var button = React.createElement(
            "p",
            { onclick: this.add.bind(this) },
            "Add#" + (this.state.items.length + 1)
        );
        var children = [input, button].concat(lists);

        return React.createElement("div", null, children);
    }
})

var Entry = React.createElement(TodoList);
var root = document.getElementById("root");
React.render(Entry, root)