/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_953770713")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_pJ09qp6VPe` ON `listItems` (`ListID`)",
      "CREATE INDEX `idx_UJ1PUKprc9` ON `listItems` (\n  `ListID`,\n  `PromptID`\n)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_953770713")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_pJ09qp6VPe` ON `listItems` (`ListID`)"
    ]
  }, collection)

  return app.save(collection)
})
