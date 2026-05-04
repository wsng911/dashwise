"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { WidgetInfo } from "@/app/(config-wrapper)/settings/widgets/page";
import LocationSelectFormComponent from "../LocationSelectForm";

interface Widget编辑DialogProps {
    open: boolean;
    widget: WidgetInfo | null;
    on关闭: () => void;
    on保存: (updatedWidget: WidgetInfo) => void;
}

export default function Widget编辑Dialog({ open, widget, on关闭, on保存 }: Widget编辑DialogProps) {
    const [editedWidget, set编辑edWidget] = useState<WidgetInfo | null>(widget);

    useEffect(() => {
        set编辑edWidget(widget);
    }, [widget]);

    if (!editedWidget) return null;

    console.log(editedWidget)

    return (
        <Dialog open={open} onOpenChange={on关闭}>
            <DialogContent class名称="frosted text-foreground max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>编辑 Widget</DialogTitle>
                </DialogHeader>

                <div class名称="space-y-4 py-4">
                    {editedWidget.slug?.includes("weather") ? (
                        <LocationSelectFormComponent
                            value={{
                                display名称: editedWidget.properties?.locationDisplayname ?? "",
                                coordinates: editedWidget.properties?.locationCoordinates ?? "",
                            }}
                            onChange={(val) =>
                                set编辑edWidget((prev) =>
                                    prev
                                        ? {
                                            ...prev,
                                            properties: {
                                                ...(prev.properties || {}),
                                                locationDisplayname: val.display名称,
                                                locationCoordinates: val.coordinates,
                                            },
                                        }
                                        : prev
                                )
                            }
                        />
                    ) : (
                        <>
                            {editedWidget.properties &&
                                Object.entries(editedWidget.properties).map(([key, value]) => (
                                    <Property编辑Input
                                        key={key}
                                        propKey={key}
                                        value={value}
                                        placeholder={editedWidget.exampleProps?.[key]}
                                        onChange={(newVal) =>
                                            set编辑edWidget((prev) =>
                                                prev
                                                    ? {
                                                        ...prev,
                                                        properties: {
                                                            ...(prev.properties || {}),
                                                            [key]: newVal,
                                                        },
                                                    }
                                                    : prev
                                            )
                                        }
                                    />
                                ))}
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={on关闭}>
                        取消
                    </Button>
                    <Button onClick={() => editedWidget && on保存(editedWidget)}>保存</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface Property编辑InputProps {
    propKey: string;
    value: any;
    placeholder?: string;
    onChange: (newVal: any) => void;
}

function Property编辑Input({ propKey, value, placeholder, onChange }: Property编辑InputProps) {
    const propertyType =
        typeof value === "string" && value.startsWith("as:") ? value.replace("as:", "") : typeof value;
console.log(propKey, propertyType)
    const inputPlaceholder = propertyType === "string" ? placeholder ?? undefined : undefined;


    return (
        <div class名称="space-y-2">
            <Label htmlFor={propKey}>{propKey}</Label>

            {propertyType.includes("bool") ? (
                <Switch
                    id={propKey}
                    checked={Boolean(value)}
                    onCheckedChange={(checked) => onChange(Boolean(checked))}
                />
            ) : (
                <Input
                    id={propKey}
                    placeholder={inputPlaceholder}
                    onChange={(e) => onChange(e.target.value)}
                />
            )}
        </div>
    );
}