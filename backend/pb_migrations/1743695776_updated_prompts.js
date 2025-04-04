/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2721965843")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_Hf7tSV2dnL` ON `prompts` (`Topic`)",
      "CREATE INDEX `idx_i3R1AImwT6` ON `prompts` (\n  `Topic`,\n  `Activity`\n)"
    ]
  }, collection)

  // remove field
  collection.fields.removeById("number2638274075")

  // add field
  collection.fields.addAt(21, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1552019743",
    "max": 0,
    "min": 0,
    "name": "Topic",
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

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_or5N3Z2wDs` ON `prompts` (`Topic`)",
      "CREATE INDEX `idx_vqDc4gzNZU` ON `prompts` (\n  `Topic`,\n  `Activity`\n)"
    ]
  }, collection)

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "number2638274075",
    "max": null,
    "min": null,
    "name": "Topic",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // remove field
  collection.fields.removeById("text1552019743")

  return app.save(collection)
})
