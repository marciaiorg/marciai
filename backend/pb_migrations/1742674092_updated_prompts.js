/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2721965843")

  // update field
  collection.fields.addAt(16, new Field({
    "autogeneratePattern": "",
    "hidden": true,
    "id": "text2675300272",
    "max": 0,
    "min": 0,
    "name": "externalId",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2721965843")

  // update field
  collection.fields.addAt(16, new Field({
    "autogeneratePattern": "",
    "hidden": true,
    "id": "text2675300272",
    "max": 0,
    "min": 0,
    "name": "external_id",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
})
