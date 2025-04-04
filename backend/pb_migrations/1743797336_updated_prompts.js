/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2721965843")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_Hf7tSV2dnL` ON `prompts` (`Topic`)",
      "CREATE INDEX `idx_CmsiBg4eRl` ON `prompts` (`PromptTypeNo`)",
      "CREATE INDEX `idx_PcwU4t2gmO` ON `prompts` (`CreatedBy`)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2721965843")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_Hf7tSV2dnL` ON `prompts` (`Topic`)",
      "CREATE INDEX `idx_i3R1AImwT6` ON `prompts` (\n  `Topic`,\n  `Activity`\n)",
      "CREATE INDEX `idx_CmsiBg4eRl` ON `prompts` (`PromptTypeNo`)",
      "CREATE INDEX `idx_PcwU4t2gmO` ON `prompts` (`CreatedBy`)"
    ]
  }, collection)

  return app.save(collection)
})
