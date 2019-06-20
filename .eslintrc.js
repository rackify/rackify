module.exports = {
    'parser': '@typescript-eslint/parser',
    'plugins': ['@typescript-eslint', 'jest'],
    'extends': ['plugins:@typescript-eslint/recommended'],
    'env': {
        'node': true,
        'es6': true,
        'jest': true
    },
    'extends': 'eslint:recommended',
    'globals': {
        'Atomics': 'readonly',
        'SharedArrayBuffer': 'readonly'
    },
    'parserOptions': {
        'ecmaVersion': 2018,
        'sourceType': 'module'
    },
    'rules': {
        'indent': [ 'error', 2 ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [ 'error', 'always' ],
        'no-console': ['off']
    },
    'overrides': [
        {
            'files': ['**/*.ts', '**/*.tsx'],
            'rules': {
                'no-unused-vars': ['off'],
                'no-undef': ['off'],
                '@typescript-eslint/no-unused-vars': ['error', { 'vars': 'all', 'args': 'after-used', 'ignoreRestSiblings': false}]
            }
        }
    ]
};
