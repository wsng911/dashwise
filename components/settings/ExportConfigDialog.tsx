"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  Dialog关闭,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCaretRight, faDownload } from "@fortawesome/free-solid-svg-icons"

export default function ExportConfigDialog({ jsonString }: { jsonString: string }) {

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "config.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog>
      <DialogTrigger class名称="grid grid-cols-subgrid border border-transparent hover-frosted items-center col-span-full p-1.5 rounded-md">
        <FontAwesomeIcon icon={faDownload} />
        <p class名称="text-left">Export Your Config</p>
        <FontAwesomeIcon icon={faCaretRight} />
      </DialogTrigger>

      <DialogContent class名称="frosted text-foreground">
        <DialogHeader>
          <DialogTitle>Export Config</DialogTitle>
        </DialogHeader>

        <pre class名称="bg-gray-900 p-4 rounded text-sm overflow-auto max-h-96">
          {JSON.stringify(JSON.parse(jsonString), null, 2)}
        </pre>


        <DialogFooter>
          <Dialog关闭 asChild>
            <Button variant="outline">关闭</Button>
          </Dialog关闭>
          <Button onClick={handleDownload}>Download JSON</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
