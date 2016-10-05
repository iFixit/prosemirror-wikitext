const {Schema} = require("prosemirror-model")

const nodes = {
  doc: {
    content: "block+"
  },

  paragraph: {
    content: "inline<_>*",
    group: "block",
    parseDOM: [{tag: "p"}],
    toDOM() { return ["p", 0] }
  },

  text: {
    group: "inline",
    toDOM(node) { return node.text }
  }
}
exports.nodes = nodes

const marks = {
  em: {
    parseDOM: [{tag: "i"}, {tag: "em"},
               {style: "font-style", getAttrs: value => value == "italic" && null}],
    toDOM() { return ["em"] }
  },

  strong: {
    parseDOM: [{tag: "strong"},
               {tag: "b", getAttrs: node => node.style.fontWeight != "normal" && null},
               {style: "font-weight", getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null}],
    toDOM() { return ["strong"] }
  },

  underline: {
    parseDOM: [{tag: "u"},
               {style: "text-decoration", getAttrs: value => value == "italic" && null}],
    toDOM() { return ["u"] }
  }
}
exports.marks = marks

const minimal_schema = new Schema({nodes, marks})
exports.minimal_schema = minimal_schema
