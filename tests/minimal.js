/**
 * Unit tests for the minimal schema for the wiki text serializer.
 *
 * Chris Opperwall
 *
 * Oct 02, 2016
 */

const {Schema} = require("prosemirror-model")
const {serializer, minimal_schema} = require('../src')
const {nodes, marks} = minimal_schema
const schema = new Schema({nodes, marks})

/**
 * Test Definitions
 */
const tests = [
   {
      'name': 'empty',
      'input': {"type":"doc","content":[{"type":"paragraph"}]},
      'expected': ''
   },
   {
      'name': 'paragraph_no_formatting',
      'input': {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"This is a paragraph with no formatting."}]}]},
      'expected': 'This is a paragraph with no formatting.'
   },
   {
      'name': 'two_paragraphs_no_formatting',
      'input': {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"This is a paragraph with no formatting."}]},{"type":"paragraph","content":[{"type":"text","text":"This is a second paragraph."}]}]},
      'expected': 'This is a paragraph with no formatting.\n\nThis is a second paragraph.'
   },
   {
      'name': 'paragraph_all_bold',
      'input': {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","marks":[{"type":"strong"}],"text":"This is a paragraph with bold formatting."}]}]},
      'expected': "'''This is a paragraph with bold formatting.'''"
   },
   {
      'name': 'paragraph_all_italics',
      'input': {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","marks":[{"type":"em"}],"text":"This is a paragraph with italic formatting."}]}]},
      'expected': "''This is a paragraph with italic formatting.''"
   },
   {
      'name': 'paragraph_all_underline',
      'input': {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","marks":[{"type":"underline"}],"text":"This is a paragraph with underlined formatting."}]}]},
      'expected': "++This is a paragraph with underlined formatting.++"
   },
   {
      'name': 'paragraph_with_bold_italics_underline',
      'input': {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":" This is a "},{"type":"text","marks":[{"type":"strong"}],"text":"bold"},{"type":"text","text":" "},{"type":"text","marks":[{"type":"em"}],"text":"italic"},{"type":"text","text":" "},{"type":"text","marks":[{"type":"underline"}],"text":"underlined"},{"type":"text","text":" sentence."}]}]},
      'expected': "This is a '''bold''' ''italic'' ++underlined++ sentence."
   },
   {
      'name': 'paragraph_with_bold_italics_nested',
      'input': {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"This is a "},{"type":"text","marks":[{"type":"em"},{"type":"strong"}],"text":"paragraph"},{"type":"text","text":"."}]}]},
      'expected': "This is a '''''paragraph'''''."
   },
   {
      'name': 'paragraph_with_bold_italics_underline_nested',
      'input': {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":" This is a "},{"type":"text","marks":[{"type":"em"},{"type":"strong"},{"type":"underline"}],"text":"paragraph"},{"type":"text","text":"."}]}]},
      'expected': "This is a '''''++paragraph++'''''."
   },
   {
      'name': 'paragraph_with_uneven_nested_marks',
      'input': {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","marks":[{"type":"em"},{"type":"strong"}],"text":"This is italic and bold"},{"type":"text","marks":[{"type":"strong"}],"text":" and this is just bold"}]}]},
      'expected': "'''''This is italic and bold'' and this is just bold'''"
   },
   {
      'name': 'paragraph_with_link',
      'input': {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"This is text and this is a "},{"type":"text","marks":[{"type":"link","attrs":{"href":"https://ifixit.com","title":"","target":null}}],"text":"link"},{"type":"text","text":"."}]}]},
      'expected': "This is text and this is a [https://ifixit.com|link]."
   },
   {
      'name': 'paragraph_with_link_with_target',
      'input': {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"This is text and this is a "},{"type":"text","marks":[{"type":"link","attrs":{"href":"https://ifixit.com","title":"","target": "_blank"}}],"text":"link"},{"type":"text","text":"."}]}]},
      'expected': 'This is text and this is a [https://ifixit.com|link|new_window=true].'
   }
]

let doTests = (test) => {
   let {name, input, expected} = test
   let doc = schema.nodeFromJSON(input)
   let output = serializer.serialize(doc)
   
   if (output != expected) {
      console.log('FAIL: ' + name)
      console.log('\tExpected: ' + expected)
      console.log('\tActual: ' + output)
   } else {
      console.log('PASS: ' + name)
   }
}

console.log('\nBeginning minimal schema unit tests...\n')

// Run tests.
tests.forEach(doTests)
