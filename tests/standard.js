/**
 * Unit tests for the standard schema for the wiki text serializer.
 *
 * Chris Opperwall
 *
 * Oct 14, 2016
 */

const {serializer, _, standard_schema} = require('../src')
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
   },
   {
      'name': 'code_block',
      'input': {"type":"doc","content":[{"type":"code_block","content":[{"type":"text","text":"This is in a code block."}]}]},
      'expected': "[code]\nThis is in a code block.\n[/code]"
   },
   {
      'name': 'blockquote',
      'input': {"type":"doc","content":[{"type":"blockquote","attrs":{"format":"long","attribute":"null"}, "content":[{"type":"paragraph","content":[{"type":"text","text":"This is a quote."}]}]}]},
      'expected': "[quote]\nThis is a quote.\n\n[/quote]"
   },
   {
      'name': 'blockquote_with_attribution',
      'input': {"type":"doc","content":[{"type":"blockquote","attrs":{"format":"long","attribute":"Abraham Lincoln"}, "content":[{"type":"paragraph","content":[{"type":"text","text":"This is a quote."}]}]}]},
      'expected': "[quote|Abraham Lincoln]\nThis is a quote.\n\n[/quote]"
   },
   {
      'name': 'blockquote_with_format',
      'input': {"type":"doc","content":[{"type":"blockquote","attrs":{"format":"featured","attribute":"null"}, "content":[{"type":"paragraph","content":[{"type":"text","text":"This is a quote."}]}]}]},
      'expected': "[quote|format=featured]\nThis is a quote.\n\n[/quote]"
   },

   // NOTE: We don't allow level 1 headings in wiki documents.
   {
      'name': 'heading2',
      'input': {"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Heading Two"}]}]},
      'expected': "== Heading Two =="
   },
   {
      'name': 'heading3',
      'input': {"type":"doc","content":[{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Heading Three"}]}]},
      'expected': "=== Heading Three ==="
   },
   {
      'name': 'heading4',
      'input': {"type":"doc","content":[{"type":"heading","attrs":{"level":4},"content":[{"type":"text","text":"Heading Four"}]}]},
      'expected': "==== Heading Four ===="
   },
   {
      'name': 'heading5',
      'input': {"type":"doc","content":[{"type":"heading","attrs":{"level":5},"content":[{"type":"text","text":"Heading Five"}]}]},
      'expected': "===== Heading Five ====="
   },
   {
      'name': 'heading6',
      'input': {"type":"doc","content":[{"type":"heading","attrs":{"level":6},"content":[{"type":"text","text":"Heading Six"}]}]},
      'expected': "====== Heading Six ======"
   },
   {
      'name': 'heading2_with_bold_and_italic',
      'input': {"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","marks":[{"type":"strong"}],"text":"Bold"},{"type":"text","text":" "},{"type":"text","marks":[{"type":"em"}],"text":"Italic"}]}]},
      'expected': "== '''Bold''' ''Italic'' =="
   },
   {
      'name': 'underline_and_subscript_nested',
      'input': {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","marks":[{"type":"underline"}],"text":"Hey I'm underlined, "},{"type":"text","marks":[{"type":"underline"},{"type":"subscript"}],"text":"and I'm also subscript"}]}]},
      'expected': "++Hey I'm underlined, ,,and I'm also subscript,,++"
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
