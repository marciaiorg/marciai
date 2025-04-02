/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1568971955")

  // add field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3277857102",
    "hidden": false,
    "id": "relation136748965",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "lists",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1568971955")

  // remove field
  collection.fields.removeById("relation136748965")

  return app.save(collection)
})
