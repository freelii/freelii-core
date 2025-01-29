module.exports = {
    plugins: ['import', 'simple-import-sort'],
    rules: {
        'import/order': [
            'error',
            {
                groups: [
                    'builtin',     // Built-in imports (come from NodeJS)
                    'external',    // npm install packages
                    'internal',    // Imports from within the app
                    ['sibling', 'parent'], // Relative imports
                    'index',      // Imports from index file
                ],
                'newlines-between': 'always',
                alphabetize: {
                    order: 'asc', // Sort in ascending order
                    caseInsensitive: true // Ignore case
                },
            },
        ],
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error'
    },
} 