/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2721965843")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_or5N3Z2wDs` ON `prompts` (`Topic`)",
      "CREATE INDEX `idx_vqDc4gzNZU` ON `prompts` (\n  `Topic`,\n  `Activity`\n)"
    ]
  }, collection)

  // remove field
  collection.fields.removeById("number2893285722")

  // remove field
  collection.fields.removeById("relation3545646658")

  // remove field
  collection.fields.removeById("bool4208731335")

  // remove field
  collection.fields.removeById("text3839242249")

  // remove field
  collection.fields.removeById("text2675300272")

  // add field
  collection.fields.addAt(3, new Field({
    "exceptDomains": null,
    "hidden": false,
    "id": "url1880404908",
    "name": "AuthorURL",
    "onlyDomains": null,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "url"
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "hidden": false,
    "id": "json4116581109",
    "maxSize": 0,
    "name": "AuxIndexS",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(14, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text4238056986",
    "max": 0,
    "min": 0,
    "name": "CanonicalURL",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(15, new Field({
    "hidden": false,
    "id": "json1703053275",
    "maxSize": 0,
    "name": "EndpointS",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(16, new Field({
    "hidden": false,
    "id": "json2556389182",
    "maxSize": 0,
    "name": "GizmoCodeS",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(17, new Field({
    "hidden": false,
    "id": "json3625194999",
    "maxSize": 0,
    "name": "ModelS",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(18, new Field({
    "hidden": false,
    "id": "number1561957230",
    "max": null,
    "min": null,
    "name": "PromptFeatureBitset",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(19, new Field({
    "hidden": false,
    "id": "number761156797",
    "max": null,
    "min": null,
    "name": "PromptTypeNo",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(20, new Field({
    "hidden": false,
    "id": "json2508112358",
    "maxSize": 0,
    "name": "SystemS",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(21, new Field({
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

  // update field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1379736654",
    "max": 0,
    "min": 0,
    "name": "Activity",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1544500581",
    "max": 0,
    "min": 0,
    "name": "AuthorName",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // update field
  collection.fields.addAt(4, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2600247600",
    "max": 0,
    "min": 0,
    "name": "PromptHint",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // update field
  collection.fields.addAt(5, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text51371988",
    "max": 0,
    "min": 0,
    "name": "Teaser",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // update field
  collection.fields.addAt(6, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text724990059",
    "max": 0,
    "min": 0,
    "name": "Title",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // update field
  collection.fields.addAt(7, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1659857976",
    "max": 50000,
    "min": 0,
    "name": "Prompt",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // update field
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

  // update field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "number1272665449",
    "max": null,
    "min": null,
    "name": "Usages",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "number300981383",
    "max": null,
    "min": null,
    "name": "Views",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "number1368095439",
    "max": null,
    "min": null,
    "name": "Votes",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(12, new Field({
    "hidden": false,
    "id": "date2483233503",
    "max": "",
    "min": "",
    "name": "RevisionTime",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
}, (app) => {
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
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "number2893285722",
    "max": null,
    "min": null,
    "name": "activity",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(12, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation3545646658",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "createdBy",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "hidden": false,
    "id": "bool4208731335",
    "name": "isPublic",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(14, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3839242249",
    "max": 0,
    "min": 0,
    "name": "models",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(16, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2675300272",
    "max": 0,
    "min": 0,
    "name": "externalId",
    "pattern": "",
    "presentable": true,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // remove field
  collection.fields.removeById("url1880404908")

  // remove field
  collection.fields.removeById("json4116581109")

  // remove field
  collection.fields.removeById("text4238056986")

  // remove field
  collection.fields.removeById("json1703053275")

  // remove field
  collection.fields.removeById("json2556389182")

  // remove field
  collection.fields.removeById("json3625194999")

  // remove field
  collection.fields.removeById("number1561957230")

  // remove field
  collection.fields.removeById("number761156797")

  // remove field
  collection.fields.removeById("json2508112358")

  // remove field
  collection.fields.removeById("text1369949409")

  // update field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1379736654",
    "max": 0,
    "min": 0,
    "name": "authorName",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1544500581",
    "max": 0,
    "min": 0,
    "name": "authorUrl",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // update field
  collection.fields.addAt(3, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2600247600",
    "max": 0,
    "min": 0,
    "name": "promptHint",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // update field
  collection.fields.addAt(4, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text51371988",
    "max": 0,
    "min": 0,
    "name": "teaser",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // update field
  collection.fields.addAt(5, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text724990059",
    "max": 0,
    "min": 0,
    "name": "title",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // update field
  collection.fields.addAt(6, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1659857976",
    "max": 50000,
    "min": 0,
    "name": "prompt",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // update field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "number2638274075",
    "max": null,
    "min": null,
    "name": "topic",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "number1272665449",
    "max": null,
    "min": null,
    "name": "usages",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "number300981383",
    "max": null,
    "min": null,
    "name": "views",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "number1368095439",
    "max": null,
    "min": null,
    "name": "votes",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(15, new Field({
    "hidden": false,
    "id": "date2483233503",
    "max": "",
    "min": "",
    "name": "revisionTime",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
})
