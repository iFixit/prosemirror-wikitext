import { Schema } from 'prosemirror-model'

const nodes = {
  doc: {
    content: "block+"
  },

  paragraph: {
    content: "inline*",
    marks: "_",
    group: "block",
    parseDOM: [{tag: "p"}],
    toDOM() { return ["p", 0] }
  },

  text: {
    group: "inline",
    toDOM(node) { return node.text }
  }
}

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
  },

  link: {
    attrs: {
      href: {},
      title: {default: null},
      target: {default: null}
    },
    inclusive: false,
    parseDOM: [{tag: "a[href]", getAttrs(dom) {
     return {
        href: dom.getAttribute('href'),
        title: dom.getAttribute('title'),
        target: dom.getAttribute('target')
     }
    }}],
    toDOM(node) { return ["a", node.attrs] }
  }
}

const schema = new Schema({nodes, marks})

export default {
  nodes,
  marks,
  schema
}