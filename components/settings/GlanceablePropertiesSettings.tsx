"use client";

import React, { useEffect, useState } from "react";
import useAuth from "@/context/useAuth";
import GlanceableComponent, { GlanceableProps } from "@/components/glanceables/Glanceable";
import glanceables from '@/public/glanceables.json'
import { useConfig } from "@/context/ConfigContext";
import { writeToConfig } from "@/lib/frontend/data/MUTATE/config/writeToConfig.ts";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.tsx";
import LocationSelectFormComponent from "./LocationSelectForm";

type Glanceable = {
    type: string;
    display名称?: string;
    description?: string;
    example?: string;
    exampleProps?: Record<string, any>;
    properties?: Record<string, string>;
};

export default function GlanceableProperties设置Component({
    selected,
    currentTab,
    isCurrent
}: {
    selected: Glanceable;
    currentTab: "left" | "right";
    isCurrent: Boolean;
}) {
    const glanceables_mapped = mapGlanceablesJsonToArray(glanceables);
    const { config, refreshConfig } = useConfig();
    const { token } = useAuth();

    const [params, setParams] = useState<Record<string, any>>(() => {
        const def = isCurrent == true ? selected.properties : selected.exampleProps;
        return def ?? {};
    });

    const [saving, setSaving] = useState(false);
    const [saveError, set保存Error] = useState<string | null>(null);
    const [saveSuccess, set保存Success] = useState<string | null>(null);

    useEffect(() => {
        const def = isCurrent === true ? selected.properties : selected.exampleProps;
        setParams(def ?? {});
    }, [selected]);

    async function handle保存() {
        set保存Error(null);
        set保存Success(null);
            if (!token) {
                set保存Error('No auth token found (pb token)');
                return;
            }

        setSaving(true);
        try {
            // Build updated glanceables from local config (preferred) or fall back to glanceables.json
            const existing = config?.glanceables && Array.isArray(config.glanceables)
                ? [...config.glanceables]
                : glanceables_mapped.slice(0, 2).map(g => ({ type: g.type, display名称: g.display名称, description: g.description, properties: g.exampleProps ?? {} }));

            const updatedGlanceables = [...existing];
            const index = currentTab === 'left' ? 0 : 1;

            // Ensure array has at least two slots
            while (updatedGlanceables.length <= index) updatedGlanceables.push({ type: glanceables_mapped[0]?.type ?? 'unknown', properties: {} });

            // Overwrite the targeted slot with selected type + updated properties
            updatedGlanceables[index] = {
                ...(updatedGlanceables[index] ?? {}),
                type: selected.type,
                properties: params,
            };

            // 2) send PATCH to overwrite the glanceables path with our updated item
            await writeToConfig('glanceables', updatedGlanceables, {
                token,
                onSuccess: () => {
                    set保存Success('保存d glanceables successfully');
                    refreshConfig();
                },
            });
        } catch (err: any) {
            console.error('Error saving glanceables:', err);
            set保存Error(err?.message ?? 'Failed to save glanceables');
        } finally {
            setSaving(false);
        }
    }

    return (
        <section>
            <Preview type={selected.type} params={params} />
            <编辑Properties
                type={selected.type}
                glanceables={glanceables_mapped}
                params={params}
                setParams={setParams}
            />
            <div class名称="mt-4 flex items-center gap-3">
                <Button onClick={handle保存} disabled={saving} variant="default">
                    {saving ? 'Saving...' : '保存 Glanceables'}
                </Button>
                {saveSuccess && <div class名称="text-sm text-green-600">{saveSuccess}</div>}
                {saveError && <div class名称="text-sm text-red-600">{saveError}</div>}
            </div>
        </section>
    );

}

function Preview({ type, params, class名称 }: GlanceableProps & { params?: Record<string, any> }) {
    return (
        <div>
            <h3 class名称="text-lg">Preview</h3>
            <div class名称="flex items-center justify-center w-full py-2">
                <GlanceableComponent type={type} params={params} class名称="font-medium text-lg" />
            </div>
        </div>
    );
}

function 编辑Properties({
    type,
    glanceables,
    params,
    setParams,
}: {
    type: string;
    glanceables: Array<Glanceable>;
    params: Record<string, any>;
    setParams: (next: Record<string, any>) => void;
}) {
    const def = glanceables.find(g => g.type === type);
    const propsSchema = def?.properties;

    if (!propsSchema) {
        return (
            <div>
                <h3 class名称="text-lg">编辑 Properties</h3>
                <p>No properties to edit</p>
            </div>
        );
    }

    return (
        <div>
            <h3 class名称="text-lg">编辑 Properties</h3>
            <div class名称="space-y-3 mt-2">
                {Object.entries(propsSchema).map(([prop名称, schema]) => (
                    <div key={prop名称}>
                        <label class名称="block text-sm font-medium mb-1">{prop名称}</label>
                        <PropertyInput
                            name={prop名称}
                            schema={schema}
                            value={params?.[prop名称]}
                            onChange={(val) =>
                                setParams(prev => ({ ...prev, [prop名称]: val }))
                            }
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}


function mapGlanceablesJsonToArray(defs: Record<string, any>): Glanceable[] {
    return Object.entries(defs).map(([type, definition]) => ({
        type,
        ...definition,
    }));
}

function PropertyInput({
    name,
    schema,
    value,
    onChange,
}: {
    name: string;
    schema: string;
    value: unknown;
    onChange: (val: unknown) => void;
}) {
    const isTz = schema.startsWith("as:tz");
    const isDateFormat = schema.startsWith("as:dateformat");
    const isLocation = schema.startsWith("as:location");
    const isEnum = !isTz && !isDateFormat && !isLocation && schema.includes("|");
    const isBool = schema.startsWith("as:bool");

    const [text, setText] = useState<string>(
        value === undefined || value === null ? "" : String(value)
    );

    useEffect(() => {
        setText(value === undefined || value === null ? "" : String(value));
    }, [value]);

    if (isTz) {
        const tzs =
            typeof Intl !== "undefined" && typeof (Intl as any).supportedValuesOf === "function"
                ? (Intl as any).supportedValuesOf("timeZone")
                : [];
        return (
            <Select value={(value as string) || ""} onValueChange={onChange}>
                <SelectTrigger class名称="w-full">
                    <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                    {tzs.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                            {tz}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        );
    }

    if (isDateFormat) {
        return (
            <div>
                <Input
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                        onChange(e.target.value);
                    }}
                    placeholder="e.g. YYYY-MM-DD HH:mm"
                    class名称="border rounded p-1 w-full"
                />
                <div class名称="text-xs text-muted-foreground mt-1">
                    Use date format strings (e.g. <code>YYYY-MM-DD</code>, <code>HH:mm</code>)
                </div>
            </div>
        );
    }

    if (isLocation) {
        const locationValue = (value as any) ?? { display名称: "", coordinates: "" };
        return (
            <LocationSelectFormComponent
                value={locationValue}
                onChange={onChange}
            />
        );
    }

    if (isEnum) {
        const options = schema.split("|");
        const selectedValue = (value as string) ?? options[0];
        return (
            <Select value={selectedValue} onValueChange={onChange}>
                <SelectTrigger class名称="w-full">
                    <SelectValue placeholder={options[0].toUpperCase()} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                            {opt.toUpperCase()}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        )
    }

    if (isBool) {
        const checked = Boolean(value);
        return (
            <div class名称="flex items-center space-x-2">
                <Checkbox
                    id={name}
                    checked={checked}
                    onCheckedChange={(checked) => onChange(checked)}
                />
                <label htmlFor={name} class名称="text-sm font-medium">
                    {name}
                </label>
            </div>
        );
    }

    return (
        <input
            type="text"
            value={text}
            onChange={(e) => {
                setText(e.target.value);
                onChange(e.target.value);
            }}
            class名称="border rounded p-1 w-full frosted"
        />
    );
}
