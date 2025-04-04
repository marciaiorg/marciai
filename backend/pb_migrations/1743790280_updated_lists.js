/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3277857102")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_iJkaaswqUx` ON `lists` (`CreatedBy`)"
    ]
  }, collection)

  // remove field
  collection.fields.removeById("relation2375276105")

  // add field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1539927024",
    "max": 0,
    "min": 0,
    "name": "Comment",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "number2935132621",
    "max": null,
    "min": null,
    "name": "ListOrder",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "number1623276265",
    "max": null,
    "min": null,
    "name": "ListStatusNo",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "number1480435110",
    "max": null,
    "min": null,
    "name": "ListTypeNo",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2352150823",
    "max": 0,
    "min": 0,
    "name": "RevisionTime",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1369949409",
    "max": 0,
    "min": 0,
    "name": "CreatedBy",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3277857102")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_F84dFTnheX` ON `lists` (`created`)",
      "CREATE INDEX `idx_FfPMz8FcQA` ON `lists` (`createdBy`)"
    ]
  }, collection)

  // add field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation2375276105",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "createdBy",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // remove field
  collection.fields.removeById("text1539927024")

  // remove field
  collection.fields.removeById("number2935132621")

  // remove field
  collection.fields.removeById("number1623276265")

  // remove field
  collection.fields.removeById("number1480435110")

  // remove field
  collection.fields.removeById("text2352150823")

  // remove field
  collection.fields.removeById("text1369949409")

  return app.save(collection)
})
