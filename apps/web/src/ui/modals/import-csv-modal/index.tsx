"use client";

import { api } from "@/trpc/react";
import {
    AnimatedSizeContainer,
    Button,
    Logo,
    Modal,
    TableIcon,
    useRouterStuff,
} from "@freelii/ui";
import { ArrowRight } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
    Dispatch,
    SetStateAction,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    Control,
    UseFormSetValue,
    UseFormWatch,
    useForm,
} from "react-hook-form";
import toast from "react-hot-toast";
import { FieldMapping } from "./field-mapping";
import { SelectFile } from "./select-file";



export const mappableFields = {
    type: { label: "Client Type", required: false, default: "person" },
    name: { label: "Name", required: true, },
    email: { label: "Email", required: false },
    tax_number: { label: "Tax Number", required: false },
    street: { label: "Street Address", required: false },
    city: { label: "City", required: false },
    state: { label: "State", required: false },
    country: { label: "Country", required: false },
    currency: { label: "Currency", required: false },
    zipCode: { label: "ZIP Code", required: false },
    paymentMethod: { label: "Payment Method", required: false },
    // Local Bank
    bankName: { label: "Bank Name", required: false },
    accountNumber: { label: "Account Number", required: false },
    routingNumber: { label: "Routing Number", required: false },
    accountType: { label: "Account Type", required: false },
    accountHolderName: { label: "Account Holder Name", required: false },
    // Blockchain
    walletAddress: { label: "Wallet Address", required: false },
    network: { label: "Network", required: false },
    // E-wallet
    ewalletProvider: { label: "E-wallet Provider", required: false },
    mobileNumber: { label: "Mobile Number", required: false },
    transferMethod: { label: "Transfer Method", required: false },
} as const;

function fillDefaults(client: Record<string, string>) {
    if (!client.type) {
        client.type = "person";
    }

    if (!client.network && !!client.walletAddress) {
        client.network = "stellar";
    }

    if (!client.currency) {
        if (client.country === "United States") {
            client.currency = "USD";
        } else if (client.country === "Philippines") {
            client.currency = "PHP";
        } else if (client.country === "Mexico") {
            client.currency = "MXN";
        }
    }
    return client;
}

export type ImportCsvFormData = {
    file: File | null;
} & Record<keyof typeof mappableFields, string>;

const ImportCsvContext = createContext<{
    fileColumns: string[] | null;
    setFileColumns: (columns: string[] | null) => void;
    firstRows: Record<string, string>[] | null;
    setFirstRows: (rows: Record<string, string>[] | null) => void;
    control: Control<ImportCsvFormData>;
    watch: UseFormWatch<ImportCsvFormData>;
    setValue: UseFormSetValue<ImportCsvFormData>;
} | null>(null);

export function useCsvContext() {
    const context = useContext(ImportCsvContext);
    if (!context)
        throw new Error(
            "useCsvContext must be used within an ImportCsvContext.Provider",
        );

    return context;
}

const pages = ["select-file", "confirm-import"] as const;

function ImportCsvModal({
    showImportCsvModal,
    setShowImportCsvModal,
}: {
    showImportCsvModal: boolean;
    setShowImportCsvModal: Dispatch<SetStateAction<boolean>>;
}) {
    const router = useRouter();
    const { slug } = useParams() as { slug?: string };
    const { queryParams } = useRouterStuff();
    const searchParams = useSearchParams();

    useEffect(
        () => setShowImportCsvModal(searchParams?.get("import") === "csv"),
        [searchParams],
    );

    const {
        control,
        watch,
        setValue,
        handleSubmit,
        reset,
        formState: { isSubmitting, isValid },
    } = useForm<ImportCsvFormData>({
        defaultValues: {},
    });

    const [pageNumber, setPageNumber] = useState<number>(0);
    const page = pages[pageNumber];

    const [fileColumns, setFileColumns] = useState<string[] | null>(null);
    const [firstRows, setFirstRows] = useState<Record<string, string>[] | null>(
        null,
    );

    const file = watch("file");

    const trpcUtils = api.useUtils();
    const { mutateAsync: createClients } = api.clients.create.useMutation({
        onSuccess: () => {
            void trpcUtils.clients.invalidate();
        },
    });

    // Go to second page if file looks good
    useEffect(() => {
        if (file && fileColumns && pageNumber === 0) {
            setPageNumber(1);
        }
    }, [file, fileColumns, pageNumber]);

    return (
        <Modal
            showModal={showImportCsvModal}
            setShowModal={setShowImportCsvModal}
            className="max-h-[95dvh] max-w-lg"
            onClose={() =>
                queryParams({
                    del: "import",
                })
            }
        >
            <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 px-4 py-8 sm:px-16" >
                <div className="flex items-center gap-x-3 py-4">
                    <div className="flex size-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
                        <TableIcon className="size-5" />
                    </div>
                    <ArrowRight className="size-5 text-gray-600" />
                    <div className="relative">
                        <Logo className="size-10" />
                    </div>
                </div>
                <h3 className="text-lg font-medium relative inline-flex items-center gap-2">
                    Import Clients From CSV
                    <div className="relative">
                        <span className="flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-100 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 ">
                                <span className=" text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">✨</span>
                            </span>
                        </span>
                    </div>
                </h3>
                <p className="text-balance text-center text-sm text-gray-500">
                    Let&apos;s use AI to automatically map your CSV columns to the right fields.
                </p>
            </div>

            < div className="relative" >
                {page === "confirm-import" && (
                    <div className="absolute inset-x-0 -top-6 mx-4 grid grid-cols-[1fr_min-content_1fr] items-center gap-x-4 gap-y-2 rounded-md border border-gray-200 bg-white p-2 text-center text-sm font-medium uppercase text-gray-600 sm:mx-12" >
                        <p>CSV data column </p>
                        < ArrowRight className="size-4 text-gray-500" />
                        <p>Recipient data field </p>
                    </div>
                )}

                <AnimatedSizeContainer height >
                    <ImportCsvContext.Provider
                        value={
                            {
                                fileColumns,
                                setFileColumns,
                                firstRows,
                                setFirstRows,
                                control,
                                watch,
                                setValue,
                            }
                        }
                    >
                        <div className="flex flex-col gap-y-6 bg-gray-50 px-4 py-8 text-left sm:px-12" >
                            <form
                                onSubmit={handleSubmit(async (data) => {
                                    const loadingId = toast.loading("Adding clients to import queue...");
                                    try {
                                        // Process clients in chunks of 50
                                        if (!data.file) {
                                            throw new Error("No file selected");
                                        }

                                        const text = await data.file.text();
                                        const rows = text.split('\n').map(row =>
                                            row.split(',').map(cell => cell.trim())
                                        );

                                        const headers = rows[0];
                                        const clientRows = rows.slice(1).filter(row => row.length === headers.length);

                                        // Process in chunks of 50
                                        const chunkSize = 50;
                                        for (let i = 0; i < clientRows.length; i += chunkSize) {
                                            const chunk = clientRows.slice(i, i + chunkSize);
                                            const clients = chunk.map(row => {
                                                const client: Record<string, string> = {};

                                                // Map each field using the user-defined mapping
                                                Object.entries(mappableFields).forEach(([field, _]) => {
                                                    const mappedColumn = data[field as keyof typeof mappableFields];
                                                    if (mappedColumn) {
                                                        const columnIndex = headers.indexOf(mappedColumn);
                                                        if (columnIndex !== -1) {
                                                            client[field] = row[columnIndex];
                                                        }
                                                    }
                                                });
                                                return client;
                                            });
                                            await Promise.all(clients.map(client => createClients(
                                                fillDefaults(client)
                                            )));
                                        }

                                        toast.success(
                                            "Successfully started client import! You will receive an email when the import is complete.",
                                        );
                                    } catch (error) {
                                        console.error(error);
                                        toast.error("Error importing clients");
                                    } finally {
                                        toast.dismiss(loadingId);
                                    }
                                })}
                                className="flex flex-col gap-y-4"
                            >
                                {page === "select-file" && <SelectFile />}

                                {page === "confirm-import" && (
                                    <>
                                        <FieldMapping />
                                        < Button
                                            text="Confirm import"
                                            disabled={!isValid}
                                        />
                                        < button
                                            type="button"
                                            className="-mt-1 text-center text-xs text-gray-600 underline underline-offset-2 transition-colors hover:text-gray-800"
                                            onClick={() => {
                                                setPageNumber(0);
                                                reset();
                                                setFileColumns(null);
                                                setFirstRows(null);
                                            }}
                                        >
                                            Choose another file
                                        </button>
                                    </>
                                )}
                            </form>
                        </div>
                    </ImportCsvContext.Provider>
                </AnimatedSizeContainer>
            </div>
        </Modal>
    );
}

export function useImportCsvModal() {
    const [showImportCsvModal, setShowImportCsvModal] = useState(false);

    const ImportCsvModalCallback = useCallback(() => {
        return (
            <ImportCsvModal
                showImportCsvModal={showImportCsvModal}
                setShowImportCsvModal={setShowImportCsvModal}
            />
        );
    }, [showImportCsvModal, setShowImportCsvModal]);

    return useMemo(
        () => ({
            setShowImportCsvModal,
            ImportCsvModal: ImportCsvModalCallback,
        }),
        [setShowImportCsvModal, ImportCsvModalCallback],
    );
}
