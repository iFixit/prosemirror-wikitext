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
      this.prefix = ""
      this.out = ""
   }

   text(text) {
      this.out += text
   }

   renderDoc(content) {
      content.forEach(n => this.render(n))
   }

   render(node) {
      this.nodes[node.type.name](this, node)
   }

   /**
    * Give a node, prefix, and a callback, replace the current prefix with the
    * characters from the given prefix and append the given prefix.
    *
    * This is mostly useful for rendering nested lists. If the current prefix
    * is '#' for an ordered lists and this is called with the prefix '*' for a
    * bullet list, the prefix will become '**' so that the new list will be
    * correctly rendered as a nested bullet list.
    *
    * After the callback has completed, restore the prefix to the old value.
    */
   renderPrefix(node, prefix, func) {
      let oldPrefix = this.prefix
      let prefixDepth = oldPrefix.length + prefix.length
      this.prefix = prefix.repeat(prefixDepth)

      func()

      this.prefix = oldPrefix
   }

   // Prefix a node's text with the given list syntax.
   renderList(node, prefix) {
      // Need to run renderPrefix() on each child of node.
      // In this case node is either the ordered_list or bullet_list node, and
      // prefix is either '#' or '*' based on the node type.
      //
      // Also the function given to prefix can use the child node type to
      // determine whether or not to add a space to state.out
      node.forEach(child => {
         this.renderPrefix(child, prefix, () => {
            child.forEach(lineItemChild => this.render(lineItemChild))
         })
      })
   }

   // Apply marks to inline text.
   inline(node) {
      // Keep track of currently open marks so that we know when they need to
      // be closed.
      let openMarks = []

      let handleMarks = node => {
         let marks = node.marks || []

         // If openMarks includes marks that do not exist on the current node,
         // close those marks before adding new marks and the inline text to
         // the output.
         let toClose = openMarks.filter(mark => marks.indexOf(mark) < 0)
         this.closeMarks(toClose)

         // Remove closed marks from openMarks.
         openMarks = openMarks.filter(mark => toClose.indexOf(mark) < 0)

         // Marks that exist for the current node, but not in openMarks are new
         // marks, so they should be opened.
         let toOpen = marks.filter(mark => openMarks.indexOf(mark) < 0)
         openMarks = toOpen.concat(openMarks)

         this.openMarks(toOpen)
         this.render(node)
      }

      node.forEach(handleMarks)

      // After all nodes have been handled, close any marks that are in
      // openMarks, but in the reverse that they were added.
      this.closeMarks(openMarks.reverse())
   }

   closeMarks(marks) {
      this.out += marks.reduceRight((carry, mark) => {
         let close = this.marks[mark.type.name].close
         let markText = (typeof close == "function") ? close(mark) : close

         return carry + markText
      }, '')
   }

   openMarks(marks) {
      this.out += marks.reduce((carry, mark) => {
         let open = this.marks[mark.type.name].open
         let markText = (typeof open == "function") ? open(mark) : open

         return carry + markText
      }, '')
   }
}

const serializer = new WikiTextSerializer({
   // Nodes
   paragraph(state, node) {
      if (state.prefix) {
         state.out += state.prefix + " "
      }

      state.inline(node)
      state.out += "\n"

      if (!state.prefix) {
         state.out += "\n"
      }
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
      state.inline(node)
      state.out += " " + headerTag + "\n"
   },

   code_block(state, node) {
      state.out += "[code]\n"
      state.inline(node)
      state.out += "\n[/code]\n"
   },

   blockquote(state, node) {
      let {attribute, format} = node.attrs
      let attrSpec = node.type.spec.attrs

      if (attribute === "null") {
         attribute = null
      }

      state.out += "[quote"

      if (attribute && attribute !== attrSpec.attribute.default) {
         state.out += "|" + attribute
      }

      if (format && format !== attrSpec.format.default) {
         state.out += "|format=" + format
      }

      state.out += "]\n"
      state.inline(node)
      state.out += "[/quote]\n"
   },

   ordered_list(state, node) {
      state.renderList(node, '#')
   },

   bullet_list(state, node) {
      state.renderList(node, '*')
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
   },
   link: {
      open: mark => "[" + mark.attrs.href + "|",
      close: mark => (mark.attrs.target === "_blank") ? '|new_window=true]' : ']'
   }
})

module.exports = serializer
