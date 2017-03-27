import * as assert from 'assert';
import { flattenXML, hydrateXML } from '../src/squash-xml-json';
import fs from 'fs'

// Helper functions

const getChildAt = function (el, pos, json) {
  if (el.children[pos]){
    return json[el.children[pos]]
  }
  else return undefined
}

const getChildren = function (el, json) {
  return el.children.reduce( (acc, val) => {
   acc.push(json[val])
   return acc
  }, [] )
}

const getParent = function (el, json) {
  return json[el.parent]
}


describe('Flatten XML', () => {

  let json;

  before(function(done){
    fs.readFile('./test/fakeData/bare.odd', 'utf-8', function(err, xmlstring){
      if (err) {
        throw "Unable to read file";
      }
      json = flattenXML(xmlstring);
      done();
    });
  })

  it('should have children correctly assigned', (done) => {
    assert.ok(getChildren(json["bodyfixes"], json)[0].t)
    assert.ok(getChildren(json["bodyfixes"], json)[1].name == "elementSpec")
    assert.ok(getChildren(json["bodyfixes"], json)[2].t)
    assert.ok(getChildren(json["bodyfixes"], json)[3].name == "elementSpec")
    assert.ok(getChildren(json["bodyfixes"], json)[4].t)
    assert.ok(!getChildren(json["bodyfixes"], json)[5])
    done();
  })

  it('should store attributes', (done) => {
    assert.ok(getChildren(json["bodyfixes"], json)[1]["@"].ident == "title")
    done();
  })

  it('should have a parent correctly assigned', (done) => {
    assert.ok(getParent(json["bodyfixes"], json).name == "p");
    done();
  })

  it('should handle mixed content', (done) => {
    let ps = Object.keys(json).reduce((acc, key)=>{
       if (json[key].name == "p") {
        acc.push(json[key])
       }
       return acc
     }, []);

     let content = getChildren(ps[2], json)

    assert.ok(content[0].t)
    assert.ok(content[1].name == "date")
    assert.ok(content[2].t)
    assert.ok(!content[3])

    done();
  })

  it('should handle comments', (done) => {

   let comments = Object.keys(json).reduce((acc, key)=>{
     if (json[key].c) {
      acc.push(json[key])
     }
     return acc
   }, []);

   assert.ok(comments[1].c == '    <front>\n      <divGen type="toc"/>\n    </front>')

   done();
  });

  it('should handle processing instructions', (done) => {

   let pis = Object.keys(json).reduce((acc, key)=>{
     if (json[key].pi) {
      acc.push(json[key])
     }
     return acc
   }, []);

   assert.ok(pis[0].pi.name == "xml")

   done();
  });

  it('should handle namespace (@xmlns)', (done) => {
   assert.ok(getChildren(json["nss"], json)[1].ns[""] == "http://www.tei-c.org/ns/Examples")
   done();
  });

  it('should handle namespace (@prefix)', (done) => {
   assert.ok(getChildren(json["nss"], json)[3].ns.eg == "http://www.tei-c.org/ns/Examples")
   done();
  });

});

describe('Flatten XML and skipSpace', () => {

  let json;

  before(function(done){
    fs.readFile('./test/fakeData/bare.odd', 'utf-8', function(err, xmlstring){
      if (err) {
        throw "Unable to read file";
      }
      json = flattenXML(xmlstring, {skipSpace:true});
      done();
    });
  })

  it('should have children correctly assigned', (done) => {
    assert.ok(getChildren(json["bodyfixes"], json)[0].name == "elementSpec")
    assert.ok(getChildren(json["bodyfixes"], json)[1].name == "elementSpec")
    assert.ok(!getChildren(json["bodyfixes"], json)[2])
    done();
  })

});

describe("Hydrate XML", () => {

  let json;
  let xml;

  before(function(done){
    fs.readFile('./test/fakeData/bare.odd', 'utf-8', function(err, xmlstring){
      if (err) {
        throw "Unable to read file";
      }
      json = flattenXML(xmlstring);
      xml = xmlstring
      done();
    });
  })

  it('should generate XML', (done) => {
    assert.ok(hydrateXML(json).length > 0)
    done()
  })

})
