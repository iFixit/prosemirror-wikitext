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

      // Keep track of currently open marks so that we know when they need to
      // be closed.
      this.currentlyOpenMarks = [];
      // Store spaces from the end of a node to be output after the wiki markup
      this.spaces = '';
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
   // Find lengths of each continuous mark use and store in Map. (This can't be
   // done simultaneously with the next step, because we need to know the full
   // length of each mark in order to put them on in the right order.)
   // For each text node (this is done in the renderer for text nodes):
   //   1. Find closing marks
   //   2. Pop marks off the stack until all the closing marks are gone. Close
   //   all marks popped off.
   //   3. Generate start characters for all marks present on this node and
   //   not already on stack. Push onto the stack in the order generated. This
   //   will include any marks popped in step 2 which are supposed to be on the
   //   node.
   //
   inline(node) {
      const currentMarkLengths = new Map()
      const nodeMarkLengths = new Map()
      // Compute mark lengths
      let findMarkLengths = (node) => {
         // Gather all the marks on this node (by name, so they will match the
         // marks from previous nodes).
         let marks = node.marks.map(m => m.type.name)

         // Marks that exist for the current node, but not in currentMarkLengths
         // are new marks, so they should be added and set to 0. We'll add the
         // length of the current text to both the new and old marks next.
         marks.forEach(m => {
            if (!currentMarkLengths.has(m)) {
               currentMarkLengths.set(m, 0)
            }
         });
         currentMarkLengths.forEach((v, k) => currentMarkLengths.set(k, v + node.text.length))

         // Marks in currentMarkLengths that do not exist on the current node are no
         // longer needed. Remove them. The ones that do exist, however, should
         // be in the list of lengths for the marks on this node.
         let lengths = new Map()
         currentMarkLengths.forEach((v, k) => {
            if (marks.indexOf(k) < 0) {
               currentMarkLengths.delete(k)
            } else {
               lengths.set(k, v)
            }
         });
         // Store the list of lengths for later use by the renderer.
         nodeMarkLengths.set(node, lengths)
      };

      const children = []
      node.forEach(c => children.push(c))
      children.reverse()
      children.forEach(findMarkLengths)

      node.forEach(child => this.text(child, nodeMarkLengths))

      this.end_inline()
   }

   end_inline() {
      // After all nodes have been handled, close any marks that are still open
      this.closeMarks(this.currentlyOpenMarks)
      this.currentlyOpenMarks = []
      // Throw away spaces that were at the end of the text. We don't need them.
      this.spaces = ''
   }

   /**
    * Render a text node to the output
    *
    * If marklengths is available, it will be used to decide in what order to
    * apply marks to the text
    */
   text(node, marklengths) {
      let marks = node.marks.map(m => m.type.name)

      let firstNeedle = function(haystack, needles) {
         return needles.reduce((min, needle) =>
          Math.min(min, haystack.indexOf(needle)), haystack.length)
      }

      // If openMarks includes marks that do not exist on the current node,
      // close those marks before adding new marks and the inline text to
      // the output.
      const toClose = this.currentlyOpenMarks.
       filter(openMark => marks.indexOf(openMark) < 0)
      // We need to close all marks that were opened after the oldest mark we
      // need to close, so that we don't get overlapping marks (i.e. `<i>italic
      // <b>italic bold</i> bold</b>`, but in wiki text).
      const earliestClose = firstNeedle(this.currentlyOpenMarks, toClose)

      this.closeMarks(this.currentlyOpenMarks.slice(earliestClose))
      // Remove closed marks from openMarks.
      this.currentlyOpenMarks = this.currentlyOpenMarks.slice(0, earliestClose)

      // Marks that exist for the current node, but not in currentlyOpenMarks
      // are new marks, so they should be opened. This will include marks that
      // were closed to get to the earliest close mark, since they won't be in
      // currentlyOpenMarks.
      const toOpen = []
      marks.forEach(mark => {
         if (this.currentlyOpenMarks.indexOf(mark) < 0) {
            toOpen.push(mark)
         }
      })
      const lengths = marklengths.get(node)
      // Don't blow up if we don't have length information available. We
      // probably were handed a lone text node.
      if (lengths) {
         // For efficiency: open the marks that will stay open the longest first.
         toOpen.sort((a, b) => lengths.get(b) - lengths.get(a))
      }

      // Borrows from src/to_markdown.js from prosemirror-markdown
      const [_, start, text, end] = node.text.match(/^(\s*)(.*?)(\s*)$/)

      this.out += this.spaces
      this.out += start
      this.spaces = end

      this.currentlyOpenMarks = this.currentlyOpenMarks.concat(toOpen)
      this.openMarks(toOpen)

      this.out += text
   }

   closeMarks(marks) {
      this.out += marks.reduceRight((carry, mark) => {
         let close = this.marks[mark].close
         let markText = (typeof close == "function") ? close(mark) : close

         return carry + markText
      }, '')
   }

   openMarks(marks) {
      this.out += marks.reduce((carry, mark) => {
         let open = this.marks[mark].open
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
      state.text(node)
      // A lone text node is in effect a very short inline.
      state.end_inline()
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
