/**
 * Chris Opperwall
 *
 * 10-1-2016
 */

class WikiTextSerializer {
   constructor(nodes, marks) {
      this.nodes = nodes
      this.marks = marks
   }

   serialize(content) {
      let state = new WikiTextSerializerState(this.nodes, this.marks)
      state.renderDoc(content)
      return state.out.trim()
   }
}

exports.WikiTextSerializer = WikiTextSerializer

class WikiTextSerializerState {
   constructor(nodes, marks) {
      this.nodes = nodes
      this.marks = marks
      this.out = ""
   }

   text(text) {
      this.out += text
   }

   renderDoc(content) {
      content.forEach((n) => this.render(n))
   }

   render(node) {
      this.nodes[node.type.name](this, node)
   }
}

exports.WikiTextSerializerState = WikiTextSerializerState

const serializer = new WikiTextSerializer({
   // Nodes
   paragraph(state, node) {
      // TODO: If a paragraph is empty, should it just be thrown away?
      // No, it doesn't look like that happens.
      // HOWEVER, prosemirror might throw in an extra paragraph anyway.
      // Trim should fix this anyways
      //
      // For now this basically needs to make sure that this starts on a
      // newline and ends with a newline, and render whatever is within it.
      if (!/(^|\n)$/.test(state.out))
         state.out += "\n"

      // NOTE: Okay, so node has its own forEach which just calls foreach on
      // contents. Cool.
      node.forEach((n) => state.render(n))
      state.out += "\n"
   },
   text(state, node) {
      // TODO: This uses  state.text, which I'm not what that does
      let marks = node.marks || []

      let start = marks.reduce((str, mark) => {
         let markOpen = state.marks[mark.type.name].open
         return str += markOpen
      }, '')
      let end = marks.reverse().reduce((str, mark) => {
         let markClose = state.marks[mark.type.name].close
         return str += markClose
      }, '')

      state.out += start + node.text + end
   }
}, {
   // NOTE: At this moment it would be most helpful to know how prosemirror
   // works. Okay, so renderInline carries all of that weight.
   // Marks
   em: {
      open: "''",
      close: "''"
   },
   strong: {
      open: "'''",
      close: "'''"
   },
   underline: {
      open: "++",
      close: "++"
   }
})

exports.serializer = serializer
