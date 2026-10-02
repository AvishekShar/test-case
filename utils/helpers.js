async function login(page, username = 'Avishek07', password = '23dVK94k') {
    await page.goto('https://qa-admin-v2.hoslog.jp/login')
    await page.locator('[data-test="loginId"]').fill(username)
    await page.locator('[data-test="password"]').fill(password)
    await page.getByText('Login').click()
}

module.exports = { login };