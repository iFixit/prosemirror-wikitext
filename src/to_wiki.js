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

   closeMarks(marks) {
      marks.forEach(mark => {
         this.out += this.marks[mark.type.name].close
      })
   }

   openMarks(marks) {
      marks.forEach(mark => {
         this.out += this.marks[mark.type.name].open
      })
   }
}

const serializer = new WikiTextSerializer({
   // Nodes
   paragraph(state, node) {
      // For now this basically needs to make sure that this starts on a
      // newline and ends with a newline, and render whatever is within it.
      if (!/(^|\n)$/.test(state.out))
         state.out += "\n\n"

      let openMarks = []

      let handleMarks = (node) => {
         let marks = node.marks || []

         // If there are marks that aren't in the openMarks list, then apply
         // them, this is where they start.
         //
         // Also add them to active.
         //
         // Mark train has no breaks.
         let toClose = openMarks.filter(mark => marks.indexOf(mark) < 0)
         state.closeMarks(toClose.reverse())
         openMarks = openMarks.filter(mark => toClose.indexOf(mark) < 0)

         // new nodes are in marks, but not in openMarks
         let toOpen = marks.filter(mark => openMarks.indexOf(mark) < 0)
         openMarks = toOpen.concat(openMarks)

         state.openMarks(toOpen)

         state.render(node)
         // If there are any active marks that are no in the marks variable, it
         // is time to close them.
      }

      node.forEach(handleMarks)
      state.closeMarks(openMarks.reverse())

      state.out += "\n\n"
   },
   text(state, node) {
      // TODO: This uses  state.text, which I'm not what that does

      state.out += node.text
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

module.exports = serializer
