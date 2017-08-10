"use strict"

const serializer = require('../src/to_wiki.js')
const standard_schema = require('../src/schema/schema-standard.js');

const schema = standard_schema.schema;

const tests = [
   {
      'name': 'interleaved formatting',
      'input': {"type":"doc","content":[{"type":"paragraph","content":[
         {
            "type": "text",
            "marks": [{"type": "strong"}],
	    "text": "this "
         },
         {
            "type": "text",
            "marks": [{"type": "strong"},{"type": "em"}],
	    "text": "is "
         },
         {
            "type": "text",
            "marks": [{"type": "strong"},{"type": "em"},{"type": "underline"}],
	    "text": "text "
         },
         {
            "type": "text",
            "marks": [{"type": "em"},{"type": "underline"}],
	    "text": "with "
         },
         {
            "type": "text",
            "marks": [{"type": "underline"}],
	    "text": "styles"
         }
      ]}]},
      'expected': "'''this ''is ++text++''''' ++''with'' styles++"
   },
]

let doTests = (test) => {
   let doc = schema.nodeFromJSON(test.input)
   let output = serializer.serialize(doc)

   if (output != test.expected) {
      console.log('FAIL: ' + test.name)
      console.log('\tExpected: ' + test.expected)
      console.log('\tActual: ' + output)
   } else {
      console.log('PASS: ' + test.name)
   }
}

console.log('\nBeginning wiki styling tests...\n')

// Run tests.
tests.forEach(doTests)
