/**
 * Unit tests for the standard schema for the wiki text serializer.
 *
 * Chris Opperwall
 *
 * Oct 14, 2016
 */

const {serializer, _, standard_schema} = require('../dist/index')
const {nodes, marks, schema} = standard_schema

/**
 * Test Definitions
 */
const tests = [
   {
     'name': 'paragraph_with_subscript',
     'input': {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":" This is a "},{"type":"text","marks":[{"type":"subscript"}],"text":"subscripted"},{"type":"text","text":" word."}]}]},
     'expected': "This is a ,,subscripted,, word."
   },
   {
     'name': 'paragraph_with_superscript',
     'input': {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":" This is a "},{"type":"text","marks":[{"type":"superscript"}],"text":"superscripted"},{"type":"text","text":" word."}]}]},
     'expected': "This is a ^^superscripted^^ word."
   },
   {
     'name': 'paragraph_with_code',
     'input': {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":" This is a "},{"type":"text","marks":[{"type":"code"}],"text":"code"},{"type":"text","text":" word."}]}]},
     'expected': "This is a ``code`` word."
   },
   {
     'name': 'paragraph_with_strikethrough',
     'input': {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":" This is a "},{"type":"text","marks":[{"type":"strikethrough"}],"text":"strikethrough"},{"type":"text","text":" word."}]}]},
     'expected': "This is a ~~strikethrough~~ word."
   },
   {
     'name': 'paragraph_with_hard_break',
     'input': {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"This paragraph has a"},{"type":"hard_break"},{"type":"text","text":"hard break."}]}]},
     'expected': "This paragraph has a[br]\nhard break."
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

console.log('\nBeginning standard schema unit tests...\n')

// Run tests.
tests.forEach(doTests)
