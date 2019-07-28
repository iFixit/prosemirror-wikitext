import { Schema } from 'prosemirror-model';
import { addListNodes } from 'prosemirror-schema-list';
import { serializer, minimal_schema, standard_schema } from '../index';

const minimalSchema = new Schema({
   nodes: minimal_schema.nodes,
   marks: minimal_schema.marks
})
const standardSchema = new Schema({
   nodes: standard_schema.nodes,
   marks: standard_schema.marks
})
const listSchema = new Schema({
   nodes: addListNodes(standardSchema.spec.nodes, "paragraph block*", "block"),
   marks: standardSchema.spec.marks
})

function serializeTestCase(schema, input) {
   const doc = schema.nodeFromJSON(input)
   return serializer.serialize(doc)
}

const serializeMinimalTestCase = serializeTestCase.bind(null, minimalSchema)
const serializeStandardTestCase = serializeTestCase.bind(null, standardSchema)
const serializeListTestCase = serializeTestCase.bind(null, listSchema)

describe('Minimal Tests', function() {
   describe('Empty document', function() {
      it('should serialize to an empty string', function() {
         const input = {"type":"doc","content":[{"type":"paragraph"}]}
         const expected = ''

         const output = serializeMinimalTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Plain paragraph', function() {
      it('should serialize to the paragraph contents', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"This is a paragraph with no formatting."}]}]}
         const expected = 'This is a paragraph with no formatting.'

         const output = serializeMinimalTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Two plain paragraphs', function() {
      it('should serialize to the both paragraph\'s contents with two newlines in between', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"This is a paragraph with no formatting."}]},{"type":"paragraph","content":[{"type":"text","text":"This is a second paragraph."}]}]}
         const expected = 'This is a paragraph with no formatting.\n\nThis is a second paragraph.'

         const output = serializeMinimalTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('All bold paragraph', function() {
      it('should serialize to all bold text', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","marks":[{"type":"strong"}],"text":"This is a paragraph with bold formatting."}]}]}
         const expected = "'''This is a paragraph with bold formatting.'''"

         const output = serializeMinimalTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('All italic paragraph', function() {
      it('should serialize to all italic text', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","marks":[{"type":"em"}],"text":"This is a paragraph with italic formatting."}]}]}
         const expected = "''This is a paragraph with italic formatting.''"

         const output = serializeMinimalTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('All underline paragraph', function() {
      it('should serialize to all underlined text', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","marks":[{"type":"underline"}],"text":"This is a paragraph with underlined formatting."}]}]}
         const expected = "++This is a paragraph with underlined formatting.++"

         const output = serializeMinimalTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Paragraph with bold, italic, and underline', function() {
      it('should result in formatting marks shown', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":" This is a "},{"type":"text","marks":[{"type":"strong"}],"text":"bold"},{"type":"text","text":" "},{"type":"text","marks":[{"type":"em"}],"text":"italic"},{"type":"text","text":" "},{"type":"text","marks":[{"type":"underline"}],"text":"underlined"},{"type":"text","text":" sentence."}]}]}
         const expected = "This is a '''bold''' ''italic'' ++underlined++ sentence."

         const output = serializeMinimalTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Paragraph with nested bold and italic', function() {
      it('should result in nested bold and italic wiki tags', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":" This is a "},{"type":"text","marks":[{"type":"em"},{"type":"strong"}],"text":"paragraph"},{"type":"text","text":"."}]}]}
         const expected = "This is a '''''paragraph'''''."

         const output = serializeMinimalTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Paragraph with nested bold, italic, and underline', function() {
      it('should result in all formatting shown at the same time', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":" This is a "},{"type":"text","marks":[{"type":"em"},{"type":"strong"},{"type":"underline"}],"text":"paragraph"},{"type":"text","text":"."}]}]}
         const expected = "This is a '''''++paragraph++'''''."

         const output = serializeMinimalTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Paragraph with uneven nested marks', function() {
      it('should open and close the marks in correct order', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","marks":[{"type":"em"},{"type":"strong"}],"text":"This is italic and bold"},{"type":"text","marks":[{"type":"strong"}],"text":" and this is just bold"}]}]}
         const expected = "'''''This is italic and bold'' and this is just bold'''"

         const output = serializeMinimalTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Paragraph with link', function() {
      it('should serialize into link text', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"This is text and this is a "},{"type":"text","marks":[{"type":"link","attrs":{"href":"https://ifixit.com","title":"","target":null}}],"text":"link"},{"type":"text","text":"."}]}]}
         const expected = 'This is text and this is a [https://ifixit.com|link].'

         const output = serializeMinimalTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Paragraph with link with a target', function() {
      it('should serialize into link text with a target', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"This is text and this is a "},{"type":"text","marks":[{"type":"link","attrs":{"href":"https://ifixit.com","title":"","target": "_blank"}}],"text":"link"},{"type":"text","text":"."}]}]}
         const expected = 'This is text and this is a [https://ifixit.com|link|new_window=true].'

         const output = serializeMinimalTestCase(input)
         expect(output).toEqual(expected);
      })
   })
})

describe('Standard Schema Tests', function() {
   describe('Paragraph with subscripts', function() {
      it('should include wiki subscript tags', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":" This is a "},{"type":"text","marks":[{"type":"subscript"}],"text":"subscripted"},{"type":"text","text":" word."}]}]}
         const expected = "This is a ,,subscripted,, word."

         const output = serializeStandardTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Paragraph with superscripts', function() {
      it('should include wiki superscripts tags', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":" This is a "},{"type":"text","marks":[{"type":"superscript"}],"text":"superscripted"},{"type":"text","text":" word."}]}]}
         const expected = "This is a ^^superscripted^^ word."

         const output = serializeStandardTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Paragraph with monospace', function() {
      it('should include wiki monospace/teletype tags', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":" This is a "},{"type":"text","marks":[{"type":"code"}],"text":"code"},{"type":"text","text":" word."}]}]}
         const expected = "This is a ``code`` word."

         const output = serializeStandardTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Paragraph with strikethrough', function() {
      it('should include wiki strikethrough tags', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":" This is a "},{"type":"text","marks":[{"type":"strikethrough"}],"text":"strikethrough"},{"type":"text","text":" word."}]}]}
         const expected = "This is a ~~strikethrough~~ word."

         const output = serializeStandardTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Paragraph with hard break', function() {
      it('should include wiki hard break tags', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"This paragraph has a"},{"type":"hard_break"},{"type":"text","text":"hard break."}]}]}
         const expected = "This paragraph has a[br]\nhard break."

         const output = serializeStandardTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Code block', function() {
      it('should serialize into a wiki text code block', function() {
         const input = {"type":"doc","content":[{"type":"code_block","content":[{"type":"text","text":"This is in a code block."}]}]}
         const expected = "[code]\nThis is in a code block.\n[/code]"

         const output = serializeStandardTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Blockquote', function() {
      it('should serialize into a wiki text blockquote', function() {
         const input = {"type":"doc","content":[{"type":"blockquote","attrs":{"format":"long","attribute":"null"}, "content":[{"type":"paragraph","content":[{"type":"text","text":"This is a quote."}]}]}]}
         const expected = "[quote]\nThis is a quote.\n\n[/quote]"

         const output = serializeStandardTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Blockquote with attribution', function() {
      it('should include the attribution text', function() {
         const input = {"type":"doc","content":[{"type":"blockquote","attrs":{"format":"long","attribute": {"type": "paragraph", "content": [{"type": "text", "text": "Abraham Lincoln"}]}}, "content":[{"type":"paragraph","content":[{"type":"text","text":"This is a quote."}]}]}]}
         const expected = "[quote|Abraham Lincoln]\nThis is a quote.\n\n[/quote]"

         const output = serializeStandardTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Blockquote with bold attribution', function() {
      it('should include the bolded attribution text', function() {
         const input = {"type":"doc","content":[{"type":"blockquote","attrs":{"format":"long","attribute": {"type": "paragraph", "content": [{"type": "text", "marks": [{"type": "strong"}], "text": "Abraham"}, {"type": "text", "text": " Lincoln"}]}}, "content":[{"type":"paragraph","content":[{"type":"text","text":"This is a quote."}]}]}]}
         const expected = "[quote|'''Abraham''' Lincoln]\nThis is a quote.\n\n[/quote]"

         const output = serializeStandardTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Blockquote with format', function() {
      it('should include the correct format', function() {
         const input = {"type":"doc","content":[{"type":"blockquote","attrs":{"format":"featured","attribute":"null"}, "content":[{"type":"paragraph","content":[{"type":"text","text":"This is a quote."}]}]}]}
         const expected = "[quote|format=featured]\nThis is a quote.\n\n[/quote]"

         const output = serializeStandardTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Level 2 heading', function() {
      it('should serialize into a level 2 wiki text heading', function() {
         const input = {"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Heading Two"}]}]}
         const expected = "== Heading Two =="

         const output = serializeStandardTestCase(input)
      })
   })

   describe('Level 3 heading', function() {
      it('should serialize into a level 3 wiki text heading', function() {
         const input = {"type":"doc","content":[{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Heading Three"}]}]}
         const expected = "=== Heading Three ==="

         const output = serializeStandardTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Level 4 heading', function() {
      it('should serialize into a level 4 wiki text heading', function() {
         const input = {"type":"doc","content":[{"type":"heading","attrs":{"level":4},"content":[{"type":"text","text":"Heading Four"}]}]}
         const expected = "==== Heading Four ===="

         const output = serializeStandardTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Level 5 heading', function() {
      it('should serialize into a level 5 wiki text heading', function() {
         const input = {"type":"doc","content":[{"type":"heading","attrs":{"level":5},"content":[{"type":"text","text":"Heading Five"}]}]}
         const expected = "===== Heading Five ====="

         const output = serializeStandardTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Level 6 heading', function() {
      it('should serialize into a level 6 wiki text heading', function() {
         const input = {"type":"doc","content":[{"type":"heading","attrs":{"level":6},"content":[{"type":"text","text":"Heading Six"}]}]}
         const expected = "====== Heading Six ======"

         const output = serializeStandardTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Level 2 heading with bold and italic marks', function() {
      it('should serialize into a level 2 wiki text heading with bold and italic', function() {
         const input = {"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","marks":[{"type":"strong"}],"text":"Bold"},{"type":"text","text":" "},{"type":"text","marks":[{"type":"em"}],"text":"Italic"}]}]}
         const expected = "== '''Bold''' ''Italic'' =="

         const output = serializeStandardTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Nested underline and subscript tags', function() {
      it('should serialize into nested marks in the correct order', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","marks":[{"type":"underline"}],"text":"Hey I'm underlined, "},{"type":"text","marks":[{"type":"underline"},{"type":"subscript"}],"text":"and I'm also subscript"}]}]}
         const expected = "++Hey I'm underlined, ,,and I'm also subscript,,++"

         const output = serializeStandardTestCase(input)
         expect(output).toEqual(expected);
      })
   })
})

describe('List Schema Tests', function() {
   describe('One level ordered list', function() {
      it('should serialize into a one level ordered list', function() {
         const input = {"type":"doc","content":[{"type":"ordered_list","attrs":{"order":1},"content":[{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"First list item"}]}]},{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"Second list item"}]}]},{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"Third list item"}]}]}]}]}
         const expected = "# First list item\n# Second list item\n# Third list item"

         const output = serializeListTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Two level ordered list', function() {
      it('should serialize into a two level ordered list', function() {
         const input = {"type":"doc","content":[{"type":"ordered_list","attrs":{"order":1},"content":[{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"one"}]},{"type":"ordered_list","attrs":{"order":1},"content":[{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"two"}]}]}]}]}]}]}
         const expected = "# one\n## two"

         const output = serializeListTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Three level ordered list', function() {
      it('should serialize into a three level ordered list', function() {
         const input = {"type":"doc","content":[{"type":"ordered_list","attrs":{"order":1},"content":[{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"one"}]},{"type":"ordered_list","attrs":{"order":1},"content":[{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"two"}]},{"type":"ordered_list","attrs":{"order":1},"content":[{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"three"}]}]}]}]}]}]}]}]}
         const expected = "# one\n## two\n### three"

         const output = serializeListTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('One level bulleted list', function() {
      it('should serialize into a one level bulleted list', function() {
         const input = {"type":"doc","content":[{"type":"bullet_list","content":[{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"First list item"}]}]},{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"Second list item"}]}]},{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"Third list item"}]}]}]}]}
         const expected = "* First list item\n* Second list item\n* Third list item"

         const output = serializeListTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Two level bulleted list', function() {
      it('should serialize into a two level bulleted list', function() {
         const input = {"type":"doc","content":[{"type":"bullet_list","content":[{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"one"}]},{"type":"bullet_list","content":[{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"two"}]}]}]}]}]}]}
         const expected = "* one\n** two"

         const output = serializeListTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Three level bulleted list', function() {
      it('should serialize into a three level bulleted list', function() {
         const input = {"type":"doc","content":[{"type":"bullet_list","content":[{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"one"}]},{"type":"bullet_list","content":[{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"two"}]},{"type":"bullet_list","content":[{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"three"}]}]}]}]}]}]}]}]}
         const expected = "* one\n** two\n*** three"

         const output = serializeListTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('A one level and two level bulleted list', function() {
      it('should serialize into one level bulleted list with a second level list entry', function() {
         const input = {"type":"doc","content":[{"type":"bullet_list","content":[{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"One"}]},{"type":"bullet_list","content":[{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"One again"}]}]}]}]},{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"Two"}]}]}]}]}
         const expected = "* One\n** One again\n* Two"

         const output = serializeListTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Nested ordered and bulleted lists', function() {
      it('should serialize into an ordered list with a bulleted sublist', function() {
         const input = {"type":"doc","content":[{"type":"ordered_list","attrs":{"order":1},"content":[{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"First Ordered"}]},{"type":"bullet_list","content":[{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"Second Nested Bullet"}]}]}]}]}]}]}
         const expected = "# First Ordered\n** Second Nested Bullet"

         const output = serializeListTestCase(input)
         expect(output).toEqual(expected);
      })
   })
})

describe('Advanced Formatting Tests', function() {
   describe('Interleaved inline marks', function() {
      it('should open and close correctly', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[ { "type": "text", "marks": [{"type": "strong"}], "text": "this " }, { "type": "text", "marks": [{"type": "strong"},{"type": "em"}], "text": "is " }, { "type": "text", "marks": [{"type": "strong"},{"type": "em"},{"type": "underline"}], "text": "text " }, { "type": "text", "marks": [{"type": "em"},{"type": "underline"}], "text": "with " }, { "type": "text", "marks": [{"type": "underline"}], "text": "styles" } ]}]}
         const expected = "'''this ''is ++text++''''' ++''with'' styles++"

         const output = serializeStandardTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Interleaved bold and italic marks', function() {
      it('should open and close correctly', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[ { "type": "text", "marks": [{"type": "strong"}], "text": "this " }, { "type": "text", "marks": [{"type": "strong"},{"type": "em"}], "text": "is " }, { "type": "text", "marks": [{"type": "em"}], "text": "text " }, { "type": "text", "marks": [{"type": "strong"}], "text": "with styles" } ]}]}
         const expected = "'''this ''is''''' ''text'' '''with styles'''"

         const output = serializeStandardTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Interleaved bold and italic marks without spaces ', function() {
      it('should open and close correctly', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[ { "type": "text", "marks": [{"type": "strong"}], "text": "this" }, { "type": "text", "marks": [{"type": "strong"},{"type": "em"}], "text": "is" }, { "type": "text", "marks": [{"type": "em"}], "text": "text" }, { "type": "text", "marks": [{"type": "strong"}], "text": "with styles" } ]}]}
         const expected = "'''this''is'''''''text'''''with styles'''"

         const output = serializeStandardTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Formatted words with punctuation', function() {
      it('should have their marks open and close correctly', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","marks":[],"text":"This is a "},{"type":"text","marks":[{"type":"strong"},{"type":"em"},{"type":"underline"}],"text":"thing!"},]}]}
         const expected = "This is a '''''++thing!++'''''"

         const output = serializeStandardTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Adjacent links', function() {
      it('should render correctly', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","marks":[{"type":"link","attrs":{"href":"http://example.com"}}],"text":"this link"},{"type":"text","marks":[{"type":"link","attrs":{"href":"https://www.ifixit.com"}}],"text":"is near this one"},]}]}
         const expected = "[http://example.com|this link][https://www.ifixit.com|is near this one]"

         const output = serializeStandardTestCase(input)
         expect(output).toEqual(expected);
      })
   })

   describe('Images', function() {
      it('should render correctly', function() {
         const input = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"image","attrs":{"imageid": 1024,"src":"https://image.com","size":"standard","align":"left"}}]}]}
         const expected = "[image|1024|align=left|size=standard]"

         const output = serializeStandardTestCase(input);
         expect(output).toEqual(expected);
      })
   })
})
