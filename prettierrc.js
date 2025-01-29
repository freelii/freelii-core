module.exports = {
    plugins: [require.resolve('@trivago/prettier-plugin-sort-imports')],
    importOrder: [
        '^@core/(.*)$',
        '^@server/(.*)$',
        '^@ui/(.*)$',
        '^[./]'
    ],
    importOrderSeparation: true,
    importOrderSortSpecifiers: true
} 