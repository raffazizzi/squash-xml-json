export function hydrateXML (json) {

  let xmlstring = "";

  let walkNodes = (node) => {
    if (node.name) {
      xmlstring += `<${node.name}`

      let attrs = node["@"]

      for (let att of Object.keys(attrs)) {
        let value = attrs[att]
        let q = value.indexOf('"') > -1 ? "'" : '"'

        xmlstring += ` ${att}=${q+value+q}`
      }

      if (node.children.length > 0) {
        xmlstring += ">"

        for (let child of node.children) {
          let childNode = json[child]
          walkNodes(childNode)
        }

        xmlstring += `</${node.name}>`
      }
      else {
        xmlstring += "/>"
      }

    }
    else if (node.t) {
      xmlstring += node.t
    }
    else if (node.c) {
      xmlstring += `<!--${node.c}-->`
    }
    else if (node.pi) {
      xmlstring += `<?${node.pi.name} ${node.pi.body}?>`
    }
    else {
      throw "unexpected token"
    }
  }

  // Start with "nodes" before the root element
  // Only text nodes and instructions should be there.
  for (let id of json.before_root) {
    let node = json[id]
    if (node.t) {
      xmlstring += node.t
    }
    else if (node.pi) {
      xmlstring += `<?${node.pi.name} ${node.pi.body}?>`
    }
  }

  // locate root node
  let root = Object.keys(json).reduce((acc, key)=>{
    if (!json[key].parent && json[key].name) {
     acc.push(json[key])
    }
    return acc
  }, [])[0];

  walkNodes(root)

  return xmlstring
}
