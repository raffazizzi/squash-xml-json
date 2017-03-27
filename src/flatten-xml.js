import sax from "sax"
import {generateUUID} from "./utils"

const strict = true
const parser = sax.parser(strict, {xmlns: true})

const SID = ">"

// OPTIONS
let options = {
  // Skip empty text nodes (TODO: but respect xml:space="preserve")
  skipSpace : false
}

export function flattenXML (xmlstring, options = {}) {

  let output = {}
  let before_root = output[">before_root"] = []

  let stacks = {
    text : [],
    elements : [],
    others : []
  }

  parser.onerror = function (e) {
    // an error happened.
    throw e
  };
  parser.ontext = function (t) {

    if (!options.skipSpace || t.trim()) {
      let id = SID + "t" + generateUUID()

      // add id to parent
      let parent = null;
      if (stacks.elements.length > 0) {
        parent = stacks.elements[stacks.elements.length-1]
        output[parent].children.push(id)
      }
      else {
        before_root.push(id)
      }

      output[id] = {t: t, parent : parent}
    }

  };
  parser.onopentag = function (node) {
    let id = SID + "e" + generateUUID()
    if ("xml:id" in node.attributes){
      id = node.attributes["xml:id"].value
    }
    else {
      let id = SID + "e" + generateUUID()
    }

    // add id to parent
    let parent = null;
    if (stacks.elements.length > 0) {
      parent = stacks.elements[stacks.elements.length-1]
      output[parent].children.push(id)
    }

    // add to stack
    stacks.elements.push(id)

    // collect attributes
    let attributes = {}
    for (let att of Object.keys(node.attributes)){
      attributes[att] = node.attributes[att].value
    }

    // Namespace: when there are multiple namespaces, remove the default ns
    if (Object.keys(node.ns).length > 1) {
      delete node.ns[""]
    }

    output[id] = {
      name : node.name,
      children: [],
      "@": attributes,
      ns: node.ns,
      parent: parent,
      id: id
    }
  };
  parser.onclosetag = function () {
    // pull from stack
    stacks.elements.pop()
  };

  parser.oncomment = function (c) {
    let id = SID + "c" + generateUUID()

    // add id to parent
    let parent = null;
    if (stacks.elements.length > 0) {
      parent = stacks.elements[stacks.elements.length-1]
      output[parent].children.push(id)
    }
    else {
      // noop because this would be not well-formed XML.
    }

    output[id] = {c: c}
  }

  parser.onprocessinginstruction = function (pi) {
    let id = SID + "c" + generateUUID()

    // add id to parent
    let parent = null;
    if (stacks.elements.length > 0) {
      parent = stacks.elements[stacks.elements.length-1]
      output[parent].children.push(id)
    }
    else {
      before_root.push(id)
    }

    output[id] = {pi: pi}
  }

  parser.onsgmldeclaration = function (decl) {
    console.log("SGML Declaration not supported")
  }

  parser.ondoctype = function (decl) {
    console.log("Doctype not supported")
  }

  parser.onopencdata = function () {}
  parser.cdata = function () {
    console.log("CDATA not supported")
  }

  parser.onopennamespace = function () {}
  parser.onclosenamespace = function () {}

  parser.write(xmlstring).close();

  // console.log(output)

  return(output)

}
