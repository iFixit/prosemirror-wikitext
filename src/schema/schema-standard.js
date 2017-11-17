const {Schema} = require("prosemirror-model")

const nodes = {
  doc: {
    content: "block+"
  },

  paragraph: {
    content: "inline*",
    marks: "_",
    group: "block quoteless",
    parseDOM: [{tag: "p"}],
    toDOM() { return ["p", 0] }
  },

  text: {
    group: "inline",
    toDOM(node) { return node.text }
  },

  hard_break: {
    inline: true,
    group: "inline",
    selectable: false,
    parseDOM: [{tag: "br"}],
    toDOM() { return ["br"] }
  },

  // Wikis only support headings with levels 2-6.
  heading: {
      attrs: {level: {default: 1}},
      content: "text*",
      marks: "_",
      group: "block quoteless",
      parseDOM: [{tag: "h2", attrs: {level: 2}},
                 {tag: "h3", attrs: {level: 3}},
                 {tag: "h4", attrs: {level: 4}},
                 {tag: "h5", attrs: {level: 5}},
                 {tag: "h6", attrs: {level: 6}}],
      toDOM(node) { return ["h" + node.attrs.level, 0] }
  },

  code_block: {
    content: "text*",
    group: "block quoteless",
    code: true,
    parseDOM: [{tag: "pre", preserveWhitespace: true}],
    toDOM() { return ["pre", ["code", 0]] }
  },

  blockquote: {
     attrs: {
        format: {default: "long"},
        attribute: {default: null}
     },
     content: "quoteless+",
     group: "block",
     parseDOM: [{tag: "blockquote"}],
     toDOM() { return ["blockquote", 0] }
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
      {style: "text-decoration", getAttrs: value => value == "underline" && null}],
    toDOM() { return ["u"] }
  },

  subscript: {
    parseDOM: [{tag: "sub"}],
    toDOM() { return ["sub"] }
  },

  superscript: {
    parseDOM: [{tag: "sup"}],
    toDOM() { return ["sup"] }
  },

  code: {
    parseDOM: [{tag: "tt"}],
    toDOM() { return ["tt"] }
  },

  strikethrough: {
    parseDOM: [{tag: "strike"},
      {style: "text-decoration", getAttrs: value => value == "line-through" && null}],
    toDOM() { return ["strike"] }
  },
  link: {
    attrs: {
      href: {},
      title: {default: null},
      target: {default: null}
    },
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

exports.marks = marks

const schema = new Schema({nodes, marks})
exports.schema = schema
