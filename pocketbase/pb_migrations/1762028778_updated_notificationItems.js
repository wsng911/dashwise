/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionBy名称OrId("pbc_1477109113")

  // update collection data
  unmarshal({
    "listRule": "",
    "viewRule": ""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionBy名称OrId("pbc_1477109113")

  // update collection data
  unmarshal({
    "listRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
