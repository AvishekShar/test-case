const {test, expect} = require('@playwright/test')
const {login} = require('../utils/helpers')

test('Login', async({page}) => {
    await login(page)
})