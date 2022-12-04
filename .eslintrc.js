module.exports = {
    extends: ['@adamhamlin/eslint-config'],
    overrides: [
        {
            files: ['**/__tests__/**'],
            plugins: ['jest'],
            extends: ['plugin:jest/all'],
            rules: {
                'jest/prefer-expect-assertions': 'off',
                'jest/prefer-lowercase-title': 'off',
                'jest/max-expects': ['error', { max: 8 }],
            },
        },
    ],
};
