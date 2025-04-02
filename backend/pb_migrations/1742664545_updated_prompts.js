/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2721965843")

  // remove field
  collection.fields.removeById("number3125501255")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2721965843")

  // add field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "number3125501255",
    "max": null,
    "min": null,
    "name": "totalView",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
})
