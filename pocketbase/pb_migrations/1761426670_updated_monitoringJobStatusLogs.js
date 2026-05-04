/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionBy名称OrId("pbc_1853463350")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id = job.userId:lower",
    "viewRule": "@request.auth.id = job.userId:lower"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionBy名称OrId("pbc_1853463350")

  // update collection data
  unmarshal({
    "listRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
