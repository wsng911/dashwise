/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionBy名称OrId("pbc_3957763459")

  // update collection data
  unmarshal({
    "listRule": "",
    "viewRule": ""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionBy名称OrId("pbc_3957763459")

  // update collection data
  unmarshal({
    "listRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
