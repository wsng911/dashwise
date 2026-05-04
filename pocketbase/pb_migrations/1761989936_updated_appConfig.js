/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionBy名称OrId("pbc_3957763459")

  // update collection data
  unmarshal({
    "name": "appInfo"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionBy名称OrId("pbc_3957763459")

  // update collection data
  unmarshal({
    "name": "appConfig"
  }, collection)

  return app.save(collection)
})
