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

   // Render inline text with their marks.
   inline(node) {
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
         this.closeMarks(toClose.reverse())
         openMarks = openMarks.filter(mark => toClose.indexOf(mark) < 0)

         // new nodes are in marks, but not in openMarks
         let toOpen = marks.filter(mark => openMarks.indexOf(mark) < 0)
         openMarks = toOpen.concat(openMarks)

         this.openMarks(toOpen)

         this.render(node)
         // If there are any active marks that are no in the marks variable, it
         // is time to close them.
      }

      node.forEach(handleMarks)
      this.closeMarks(openMarks.reverse())
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
      state.inline(node);
      state.out += "\n\n"
   },

   text(state, node) {
      state.out += node.text
   },

   hard_break(state, node) {
      state.out += "[br]\n"
   },

   heading(state, node) {
      let headerTag = "=".repeat(node.attrs.level)
      state.out += headerTag + " "
      state.inline(node);
      state.out += " " + headerTag + "\n"
   },

   code_block(state, node) {
      state.out += "[code]\n"
      state.inline(node)
      state.out += "\n[/code]\n"
   }
}, {
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
   },
   subscript: {
      open: ",,",
      close: ",,",
   },
   superscript: {
      open: "^^",
      close: "^^",
   },
   code: {
      open: "``",
      close: "``",
   },
   strikethrough: {
      open: "~~",
      close: "~~",
   }
})

module.exports = serializer
