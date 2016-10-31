const {Schema} = require("../../model")
const {addListNodes} = require("../../schema-list")
const {serializer, _, standard_schema} = require('../dist/index')
const {nodes, marks} = standard_schema

const schema = new Schema({nodes, marks})
const list_schema = new Schema({
   nodes: addListNodes(schema.nodeSpec, "paragraph block*", "block"),
   marks: schema.markSpec
})

const tests = [
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
   let doc = list_schema.nodeFromJSON(input)
   let output = serializer.serialize(doc)

   if (output != expected) {
      console.log('FAIL: ' + name)
      console.log('\tExpected: ' + expected)
      console.log('\tActual: ' + output)
   } else {
      console.log('PASS: ' + name)
   }
}

console.log('\nBeginning list schema unit tests...\n')

// Run tests.
tests.forEach(doTests)
