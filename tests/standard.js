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
   },
   {
      'name': 'code_block',
      'input': {"type":"doc","content":[{"type":"code_block","content":[{"type":"text","text":"This is a code block"}]}]},
      'expected': "[code]\nThis is in a code block.[\\code]"
   },
   // NOTE: We don't allow level 1 headings in wiki documents.
   {
      'name': 'heading2',
      'input': {"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Header Two"}]}]},
      'expected': "== Heading Two =="
   },
   {
      'name': 'heading3',
      'input': {"type":"doc","content":[{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Header Three"}]}]},
      'expected': "=== Heading Three ==="
   },
   {
      'name': 'heading4',
      'input': {"type":"doc","content":[{"type":"heading","attrs":{"level":4},"content":[{"type":"text","text":"Header Four"}]}]},
      'expected': "==== Heading Four ===="
   },
   {
      'name': 'heading5',
      'input': {"type":"doc","content":[{"type":"heading","attrs":{"level":5},"content":[{"type":"text","text":"Header Five"}]}]},
      'expected': "===== Heading Five ====="
   },
   {
      'name': 'heading6',
      'input': {"type":"doc","content":[{"type":"heading","attrs":{"level":6},"content":[{"type":"text","text":"Header Six"}]}]},
      'expected': "====== Heading Six ======"
   },
   {
      'name': 'heading2_with_bold_and_italic',
      'input': {"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","marks":[{"type":"strong"}],"text":"Bold"},{"type":"text","text":" "},{"type":"text","marks":[{"type":"em"}],"text":"Italic"}]}]},
      'expected': ""
   },
   {
      'name': 'ordered_list_one_level',
      'input': {"type":"doc","content":[{"type":"ordered_list","attrs":{"order":1},"content":[{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"First list item"}]}]},{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"Second list item"}]}]},{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"Third list item"}]}]}]}]},
      'expected': "# First list item\n# Second list item\n# Third list item"
   },
   {
      'name': 'ordered_list_two_levels',
      'input': {"type":"doc","content":[{"type":"ordered_list","attrs":{"order":1},"content":[{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"one"}]},{"type":"ordered_list","attrs":{"order":1},"content":[{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"two"}]}]}]}]}]}]},
      'expected': "# one\n## two"
   },
   {
      'name': 'ordered_list_three_levels',
      'input': {"type":"doc","content":[{"type":"ordered_list","attrs":{"order":1},"content":[{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"one"}]},{"type":"ordered_list","attrs":{"order":1},"content":[{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"two"}]},{"type":"ordered_list","attrs":{"order":1},"content":[{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"three"}]}]}]}]}]}]}]}]},
      'expected': "# one\n## two\n### three"
   },
   {
      'name': 'unordered_list_one_level',
      'input': {"type":"doc","content":[{"type":"bullet_list","content":[{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"First list item"}]}]},{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"Second list item"}]}]},{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"Third list item"}]}]}]}]},
      'expected': "* First list item\n* Second list item\n* Third list item"
   },
   {
      'name': 'unordered_list_two_levels',
      'input': {"type":"doc","content":[{"type":"bullet_list","content":[{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"one"}]},{"type":"bullet_list","content":[{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"two"}]}]}]}]}]}]},
      'expected': "* one\n** two"
   },
   {
      'name': 'unordered_list_three_levels',
      'input': {"type":"doc","content":[{"type":"bullet_list","content":[{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"one"}]},{"type":"bullet_list","content":[{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"two"}]},{"type":"bullet_list","content":[{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"three"}]}]}]}]}]}]}]}]},
      'expected': "* one\n** two\n*** three"
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
