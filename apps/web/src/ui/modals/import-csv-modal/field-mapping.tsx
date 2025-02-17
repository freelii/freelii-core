"use client";

import { generateCsvMapping } from "@/lib/ai/generate-csv-mapping";
import {
    ArrowRight,
    Button,
    Check,
    IconMenu,
    LoadingSpinner,
    Popover,
    TableIcon,
    Tooltip
} from "@freelii/ui";
import {
    truncate
} from "@freelii/utils";
import { readStreamableValue } from "ai/rsc";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller } from "react-hook-form";
import { mappableFields, useCsvContext } from ".";

export function FieldMapping() {
    const { fileColumns, firstRows, setValue } = useCsvContext();
    const [isStreaming, setIsStreaming] = useState(true);
    const [mappedFields, setMappedFields] = useState<Set<string>>(new Set());
    const [showAllFields, setShowAllFields] = useState(false);

    useEffect(() => {
        if (!fileColumns || !firstRows) return;
        setMappedFields(new Set());
        generateCsvMapping(fileColumns, firstRows)
            .then(async ({ object }) => {
                setIsStreaming(true);
                for await (const partialObject of readStreamableValue(object)) {
                    if (partialObject) {
                        Object.entries(partialObject).forEach((entry) => {
                            const [field, value] = entry as [string, string];
                            if (
                                Object.keys(mappableFields).includes(field) &&
                                fileColumns.includes(value)
                            ) {
                                setMappedFields(prev => new Set([...prev, field]));
                                setValue(field as keyof typeof mappableFields, value, {
                                    shouldValidate: true,
                                });
                            }
                        });
                    }
                }
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => setIsStreaming(false));
    }, [fileColumns, firstRows]);

    const visibleFields = (Object.keys(mappableFields) as (keyof typeof mappableFields)[])
        .filter(field => showAllFields || mappedFields.has(field) || mappableFields[field].required);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    className="text-sm text-gray-600"
                    onClick={() => setShowAllFields(!showAllFields)}
                >
                    {showAllFields ? (
                        <span className="flex items-center gap-2">
                            <EyeOff className="size-4" />
                            Hide unmapped fields
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <Eye className="size-4" />
                            Show all fields ({Object.keys(mappableFields).length - visibleFields.length} hidden)
                        </span>
                    )}
                </Button>
            </div>

            <div className="grid grid-cols-[1fr_min-content_1fr] gap-x-4 gap-y-2">
                {visibleFields.map((field) => (
                    <FieldRow
                        key={field}
                        field={field}
                        isStreaming={isStreaming}
                    />
                ))}
            </div>
        </div>
    );
}

function FieldRow({
    field,
    isStreaming,
}: {
    field: keyof typeof mappableFields;
    isStreaming: boolean;
}) {
    const { label, required } = mappableFields[field];
    const { control, watch, fileColumns, firstRows } = useCsvContext();
    const value = watch(field);
    const [defaultValue, setDefaultValue] = useState("");
    const [showDefaultInput, setShowDefaultInput] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const isLoading = isStreaming && !value;

    const examples = useMemo(() => {
        if (!firstRows) return [];
        let values = firstRows?.map((row) => row[value]).filter(Boolean);
        values = values.map((e) => truncate(e, 32)!);
        return values;
    }, [firstRows, value]);

    return (
        <>
            <div className="relative flex min-w-0 items-center gap-2">
                <Controller
                    control={control}
                    name={field}
                    rules={{ required }}
                    render={({ field }) => (
                        <Popover
                            align="end"
                            content={
                                <div className="w-full p-2 md:w-48">
                                    {(fileColumns ?? [])?.map((column) => (
                                        <button
                                            key={column}
                                            onClick={() => {
                                                field.onChange(column);
                                                setIsOpen(false);
                                            }}
                                            className="flex w-full items-center justify-between space-x-2 rounded-md px-1 py-2 hover:bg-gray-100 active:bg-gray-200"
                                        >
                                            <IconMenu
                                                text={column}
                                                icon={<TableIcon className="size-4 flex-none" />}
                                            />
                                            {field.value === column && (
                                                <Check className="size-4 shrink-0" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            }
                            openPopover={isOpen}
                            setOpenPopover={setIsOpen}
                        >
                            <Button
                                variant="secondary"
                                className="h-9 min-w-0 px-3"
                                onClick={() => setIsOpen((o) => !o)}
                                disabled={isLoading}
                            >
                                <div className="flex w-full grow items-center justify-between gap-1">
                                    <span className="flex-1 truncate whitespace-nowrap text-left text-gray-800">
                                        {field.value || <span className="text-gray-600">Select column...</span>}
                                    </span>
                                    {isLoading ? (
                                        <LoadingSpinner className="size-4 shrink-0" />
                                    ) : (
                                        <ChevronDown className="size-4 shrink-0 text-gray-400 transition-transform duration-75 group-data-[state=open]:rotate-180" />
                                    )}
                                </div>
                            </Button>
                        </Popover>
                    )}
                />
            </div>
            {Boolean(examples?.length) ? (
                <Tooltip
                    content={
                        <div className="block px-4 py-3 text-sm">
                            <span className="font-medium text-gray-950">Example values:</span>
                            <ul className="mt-0.5">
                                {examples?.map((example, idx) => (
                                    <li
                                        key={(example ?? "") + idx}
                                        className="block text-xs leading-tight text-gray-500"
                                    >
                                        <span className="translate-y-1 text-base text-gray-600">
                                            &bull;
                                        </span>{" "}
                                        {example}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    }
                >
                    <div className="flex items-center justify-end">
                        <ArrowRight className="size-4 text-gray-500" />
                    </div>
                </Tooltip>
            ) : (
                <div className="flex items-center justify-end">
                    <ArrowRight className="size-4 text-gray-500" />
                </div>
            )}
            <span className="flex h-9 items-center gap-1 rounded-md border border-gray-200 bg-gray-100 px-3">
                <span className="grow whitespace-nowrap text-sm font-normal text-gray-700">
                    {label} {required && <span className="text-red-700">*</span>}
                </span>
            </span>
        </>
    );
}
