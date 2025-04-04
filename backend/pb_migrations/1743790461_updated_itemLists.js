/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_953770713")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_pJ09qp6VPe` ON `listItems` (`ListID`)"
    ],
    "name": "listItems"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_953770713")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_pJ09qp6VPe` ON `itemLists` (`ListID`)"
    ],
    "name": "itemLists"
  }, collection)

  return app.save(collection)
})
