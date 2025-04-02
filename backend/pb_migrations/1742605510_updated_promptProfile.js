/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2026890608")

  // update collection data
  unmarshal({
    "name": "promptProfiles"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2026890608")

  // update collection data
  unmarshal({
    "name": "promptProfile"
  }, collection)

  return app.save(collection)
})
