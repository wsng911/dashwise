/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionBy名称OrId("pbc_1477109113")

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "select1585803230",
    "maxSelect": 1,
    "name": "forward状态",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "none",
      "queued",
      "done"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionBy名称OrId("pbc_1477109113")

  // remove field
  collection.fields.removeById("select1585803230")

  return app.save(collection)
})
