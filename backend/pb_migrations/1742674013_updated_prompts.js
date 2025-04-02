/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2721965843")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_or5N3Z2wDs` ON `prompts` (`topic`)",
      "CREATE INDEX `idx_B1lo0SoouZ` ON `prompts` (\n  `topic`,\n  `activity`\n)",
      "CREATE INDEX `idx_wR3Mc8zTib` ON `prompts` (`createdBy`)"
    ]
  }, collection)

  // add field
  collection.fields.addAt(16, new Field({
    "autogeneratePattern": "",
    "hidden": false,
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
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2721965843")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_or5N3Z2wDs` ON `prompts` (`topic`)",
      "CREATE INDEX `idx_B1lo0SoouZ` ON `prompts` (\n  `topic`,\n  `activity`\n)"
    ]
  }, collection)

  // remove field
  collection.fields.removeById("text2675300272")

  return app.save(collection)
})
