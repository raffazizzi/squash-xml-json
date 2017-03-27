# Squash XML JSON

A library to convert XML data to a flat JSON structure, and back.

This is a library suited for those who think of
XML as an asset, not a nuisance. It aims to offers a simple and efficient way of manipulating XML documents without a DOM.

*Squash XML JSON* can handle:
* mixed content
* namespaces and namespace prefixes
* two-way transformation XML <=> JSON

**Dependencies**
* requires [sax.js](https://github.com/isaacs/sax-js) (browser build will bundle it)

## Installation

```shell
npm install squash-xml-json
```

To build and test:

```shell
npm run build && npm test

# to build for use in browser
npm run build-web
```

## Usage

```
// ES6
import {flattenXML, hydrateXML} from "squash-xml-json"

// node
var sxj = require("squash-xml-json")

// browser
<script src="squash-xml-json-web.js"></script>
<script>console.log(sxj)</script>
```

## XML to JSON: flattenXML()

*Squash XML JSON* creates a flat structure of "nodes", each identified by an UUID or an element's `xml:id` attribute when present.
This simplifies element lookup in the JSON structure.

```JavaScript
let xml = `<text xmlns="http://www.tei-c.org/ns/1.0">
      <body>
         <p xml:id="p1">Some <emph>text</emph> here.</p>
      </body>
  </text>`
let json = flattenXML(xml)
```

This will result in a JSON object containing each XML node. An element will look like this:

```JSON
{
	'p1': {
		'name': 'p',
		'children': ['>td8340e43',
			'>eeb0d435c',
			'>t11da3f7e'
		],
		'@': {
			'xml:id': 'p1'
		},
		'ns': {
			'': 'http://www.tei-c.org/ns/1.0'
		},
		'parent': '>ed8b1db33',
		'id': 'p1'
	}
}
```

The element includes its children's and parent's IDs, which can be used to retrieve those nodes directly form the JSON object. Note that the ID of this element `p1` is derived from its `xml:id` attribute, while other elements get assigned a UUID (truncated in the example).

### Before root

The IDs of processing instructions and text nodes before the root element are listed in a dedicated property called  `>before_root`.

```JSON
{
	'>before_root': ['>t8b1ef55d'],
	'>t8b1ef55d': {
		'pi' {
			name: 'xml',
			'body': 'version="1.0" encoding="utf-8"'
		}
	}
}
```

### Options

Set `skipSpace` to `true` to exclude empty text nodes. Do this if you want a leaner JSON and don't care about pretty printing or preserving original spacing.

```JavaScript
flattenXML(xml, {skipSpace : true})
```

## JSON to XML: hydrateXML()

Use `hydrateXML` To serialize a compliant JSON structure back into an XML string:

```JavaScript
let json = {
	'>before_root': [],
	'>ee0c1ac32': {
		name: 'root',
		children: ['>e3cadaf0c'],
		'@': {},
		ns: {},
		parent: null,
		id: '>ee0c1ac32'
	},
	'>e3cadaf0c': {
		name: 'el',
		children: ['>t62d02a9f'],
		'@': {},
		ns: {},
		parent: '>ee0c1ac32',
		id: '>e3cadaf0c'
	},
	'>t62d02a9f': {
		t: 'text',
		parent: '>e3cadaf0c'
	}
}

hydrateXML(json)

//returns "<root><el>text</el></root>"
```
