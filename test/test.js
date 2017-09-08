const assert = require('assert')

const {Schema} = require('prosemirror-model')
const {serializer, minimal_schema, standard_schema} = require('../src')

const {minimalNodes, minimalMarks} = minimal_schema
const {standardNodes, standardMarks} = standard_schema
const minimalSchema = new Schema({
   nodes: minimal_schema.nodes,
   marks: minimal_schema.marks
})
const standardSchema = new Schema({
   nodes: standard_schema.nodes,
   marks: standard_schema.marks
})

function serializeTestCase(schema, input) {
   const doc = schema.nodeFromJSON(input)
   return serializer.serialize(doc)
}

const serializeMinimalTestCase = serializeTestCase.bind(null, minimalSchema)
const serializeStandardTestCase = serializeTestCase.bind(null, standardSchema)

describe('Minimal Tests', function() {
   describe('Empty document', function() {
      it('should serialize to an empty string', function() {
         const input = {"type":"doc","content":[{"type":"paragraph"}]}
         const expected = ''

         const output = serializeMinimalTestCase(input)
         assert.equal(expected, output)
      })
   })

   describe('Plain paragraph', function() {
      it('should serialize to the paragraph contents', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"This is a paragraph with no formatting."}]}]}
         const expected = 'This is a paragraph with no formatting.'

         const output = serializeMinimalTestCase(input)
         assert.equal(expected, output)
      })
   })

   describe('Two plain paragraphs', function() {
      it('should serialize to the both paragraph\'s contents with two newlines in between', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"This is a paragraph with no formatting."}]},{"type":"paragraph","content":[{"type":"text","text":"This is a second paragraph."}]}]}
         const expected = 'This is a paragraph with no formatting.\n\nThis is a second paragraph.'

         const output = serializeMinimalTestCase(input)
         assert.equal(expected, output)
      })
   })

   describe('All bold paragraph', function() {
      it('should serialize to all bold text', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","marks":[{"type":"strong"}],"text":"This is a paragraph with bold formatting."}]}]}
         const expected = "'''This is a paragraph with bold formatting.'''"

         const output = serializeMinimalTestCase(input)
         assert.equal(expected, output)
      })
   })

   describe('All italic paragraph', function() {
      it('should serialize to all italic text', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","marks":[{"type":"em"}],"text":"This is a paragraph with italic formatting."}]}]}
         const expected = "''This is a paragraph with italic formatting.''"

         const output = serializeMinimalTestCase(input)
         assert.equal(expected, output)
      })
   })

   describe('All underline paragraph', function() {
      it('should serialize to all underlined text', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","marks":[{"type":"underline"}],"text":"This is a paragraph with underlined formatting."}]}]}
         const expected = "++This is a paragraph with underlined formatting.++"

         const output = serializeMinimalTestCase(input)
         assert.equal(expected, output)
      })
   })

   describe('Paragraph with bold, italic, and underline', function() {
      it('should result in formatting marks shown', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":" This is a "},{"type":"text","marks":[{"type":"strong"}],"text":"bold"},{"type":"text","text":" "},{"type":"text","marks":[{"type":"em"}],"text":"italic"},{"type":"text","text":" "},{"type":"text","marks":[{"type":"underline"}],"text":"underlined"},{"type":"text","text":" sentence."}]}]}
         const expected = "This is a '''bold''' ''italic'' ++underlined++ sentence."

         const output = serializeMinimalTestCase(input)
         assert.equal(expected, output)
      })
   })

   describe('Paragraph with nested bold and italic', function() {
      it('should result in nested bold and italic wiki tags', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":" This is a "},{"type":"text","marks":[{"type":"em"},{"type":"strong"}],"text":"paragraph"},{"type":"text","text":"."}]}]}
         const expected = "This is a '''''paragraph'''''."

         const output = serializeMinimalTestCase(input)
         assert.equal(expected, output)
      })
   })

   describe('Paragraph with nested bold, italic, and underline', function() {
      it('should result in all formatting shown at the same time', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":" This is a "},{"type":"text","marks":[{"type":"em"},{"type":"strong"},{"type":"underline"}],"text":"paragraph"},{"type":"text","text":"."}]}]}
         const expected = "This is a '''''++paragraph++'''''."

         const output = serializeMinimalTestCase(input)
         assert.equal(expected, output)
      })
   })

   describe('Paragraph with uneven nested marks', function() {
      it('should open and close the marks in correct order', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","marks":[{"type":"em"},{"type":"strong"}],"text":"This is italic and bold"},{"type":"text","marks":[{"type":"strong"}],"text":" and this is just bold"}]}]}
         const expected = "'''''This is italic and bold'' and this is just bold'''"

         const output = serializeMinimalTestCase(input)
         assert.equal(expected, output)
      })
   })

   describe('Paragraph with link', function() {
      it('should serialize into link text', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"This is text and this is a "},{"type":"text","marks":[{"type":"link","attrs":{"href":"https://ifixit.com","title":"","target":null}}],"text":"link"},{"type":"text","text":"."}]}]}
         const expected = 'This is text and this is a [https://ifixit.com|link].'

         const output = serializeMinimalTestCase(input)
         assert.equal(expected, output)
      })
   })

   describe('Paragraph with link with a target', function() {
      it('should serialize into link text with a target', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"This is text and this is a "},{"type":"text","marks":[{"type":"link","attrs":{"href":"https://ifixit.com","title":"","target": "_blank"}}],"text":"link"},{"type":"text","text":"."}]}]}
         const expected = 'This is text and this is a [https://ifixit.com|link|new_window=true].'

         const output = serializeMinimalTestCase(input)
         assert.equal(expected, output)
      })
   })
})

describe('Standard Schema Tests', function() {
   describe('Paragraph with subscripts', function() {
      it('should include wiki subscript tags', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":" This is a "},{"type":"text","marks":[{"type":"subscript"}],"text":"subscripted"},{"type":"text","text":" word."}]}]}
         const expected = "This is a ,,subscripted,, word."

         const output = serializeStandardTestCase(input)
         assert.equal(expected, output)
      })
   })
   describe('Paragraph with superscripts', function() {
      it('should include wiki superscripts tags', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":" This is a "},{"type":"text","marks":[{"type":"superscript"}],"text":"superscripted"},{"type":"text","text":" word."}]}]}
         const expected = "This is a ^^superscripted^^ word."

         const output = serializeStandardTestCase(input)
         assert.equal(expected, output)
      })
   })
   describe('Paragraph with monospace', function() {
      it('should include wiki monospace/teletype tags', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":" This is a "},{"type":"text","marks":[{"type":"code"}],"text":"code"},{"type":"text","text":" word."}]}]}
         const expected = "This is a ``code`` word."

         const output = serializeStandardTestCase(input)
         assert.equal(expected, output)
      })
   })
   describe('Paragraph with strikethrough', function() {
      it('should include wiki strikethrough tags', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":" This is a "},{"type":"text","marks":[{"type":"strikethrough"}],"text":"strikethrough"},{"type":"text","text":" word."}]}]}
         const expected = "This is a ~~strikethrough~~ word."

         const output = serializeStandardTestCase(input)
         assert.equal(expected, output)
      })
   })
   describe('Paragraph with hard break', function() {
      it('should include wiki hard break tags', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"This paragraph has a"},{"type":"hard_break"},{"type":"text","text":"hard break."}]}]}
         const expected = "This paragraph has a[br]\nhard break."

         const output = serializeStandardTestCase(input)
         assert.equal(expected, output)
      })
   })
   describe('Code block', function() {
      it('should serialize into a wiki text code block', function() {
         const input = {"type":"doc","content":[{"type":"code_block","content":[{"type":"text","text":"This is in a code block."}]}]}
         const expected = "[code]\nThis is in a code block.\n[/code]"

         const output = serializeStandardTestCase(input)
         assert.equal(expected, output)
      })
   })
   describe('Blockquote', function() {
      it('should serialize into a wiki text blockquote', function() {
         const input = {"type":"doc","content":[{"type":"blockquote","attrs":{"format":"long","attribute":"null"}, "content":[{"type":"paragraph","content":[{"type":"text","text":"This is a quote."}]}]}]}
         const expected = "[quote]\nThis is a quote.\n\n[/quote]"

         const output = serializeStandardTestCase(input)
         assert.equal(expected, output)
      })
   })
   describe('Blockquote with attribution', function() {
      it('should include the attribution text', function() {
         const input = {"type":"doc","content":[{"type":"blockquote","attrs":{"format":"long","attribute":"Abraham Lincoln"}, "content":[{"type":"paragraph","content":[{"type":"text","text":"This is a quote."}]}]}]}
         const expected = "[quote|Abraham Lincoln]\nThis is a quote.\n\n[/quote]"

         const output = serializeStandardTestCase(input)
         assert.equal(expected, output)
      })
   })
   describe('Blockquote with format', function() {
      it('should include the correct format', function() {
         const input = {"type":"doc","content":[{"type":"blockquote","attrs":{"format":"featured","attribute":"null"}, "content":[{"type":"paragraph","content":[{"type":"text","text":"This is a quote."}]}]}]}
         const expected = "[quote|format=featured]\nThis is a quote.\n\n[/quote]"

         const output = serializeStandardTestCase(input)
         assert.equal(expected, output)
      })
   })
   describe('Level 2 heading', function() {
      it('should serialize into a level 2 wiki text heading', function() {
         const input = {"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Heading Two"}]}]}
         const expected = "== Heading Two =="

         const output = serializeStandardTestCase(input)
         assert.equal(expected, output)
      })
   })
   describe('Level 3 heading', function() {
      it('should serialize into a level 3 wiki text heading', function() {
         const input = {"type":"doc","content":[{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Heading Three"}]}]}
         const expected = "=== Heading Three ==="

         const output = serializeStandardTestCase(input)
         assert.equal(expected, output)
      })
   })
   describe('Level 4 heading', function() {
      it('should serialize into a level 4 wiki text heading', function() {
         const input = {"type":"doc","content":[{"type":"heading","attrs":{"level":4},"content":[{"type":"text","text":"Heading Four"}]}]}
         const expected = "==== Heading Four ===="

         const output = serializeStandardTestCase(input)
         assert.equal(expected, output)
      })
   })
   describe('Level 5 heading', function() {
      it('should serialize into a level 5 wiki text heading', function() {
         const input = {"type":"doc","content":[{"type":"heading","attrs":{"level":5},"content":[{"type":"text","text":"Heading Five"}]}]}
         const expected = "===== Heading Five ====="

         const output = serializeStandardTestCase(input)
         assert.equal(expected, output)
      })
   })
   describe('Level 6 heading', function() {
      it('should serialize into a level 6 wiki text heading', function() {
         const input = {"type":"doc","content":[{"type":"heading","attrs":{"level":6},"content":[{"type":"text","text":"Heading Six"}]}]}
         const expected = "====== Heading Six ======"

         const output = serializeStandardTestCase(input)
         assert.equal(expected, output)
      })
   })
   describe('Level 2 heading with bold and italic marks', function() {
      it('should serialize into a level 2 wiki text heading with bold and italic', function() {
         const input = {"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","marks":[{"type":"strong"}],"text":"Bold"},{"type":"text","text":" "},{"type":"text","marks":[{"type":"em"}],"text":"Italic"}]}]}
         const expected = "== '''Bold''' ''Italic'' =="

         const output = serializeStandardTestCase(input)
         assert.equal(expected, output)
      })
   })
   describe('Nested underline and subscript tags', function() {
      it('should serialize into nested marks in the correct order', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","marks":[{"type":"underline"}],"text":"Hey I'm underlined, "},{"type":"text","marks":[{"type":"underline"},{"type":"subscript"}],"text":"and I'm also subscript"}]}]}
         const expected = "++Hey I'm underlined, ,,and I'm also subscript,,++"

         const output = serializeStandardTestCase(input)
         assert.equal(expected, output)
      })
   })
})
