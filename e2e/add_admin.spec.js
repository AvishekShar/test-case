const { test, expect } = require('@playwright/test')
const { faker } = require('@faker-js/faker')
const { login } = require('../utils/helpers')

test('Add Admin Staff', async ({ page, context }) => {
    test.setTimeout(120_000) // give the OTP polling loop enough room

    const username = faker.person.firstName()
    const uniqueId = faker.number.int({ min: 1000, max: 9999 })
    const randomWord = faker.word.adjective().toLowerCase().replace(/\W/g, '')
    const staticEmail = `${randomWord}${uniqueId}@yopmail.com`
    const phoneNumber = `090860${faker.string.numeric(5)}`

    console.log(username)

    await login(page)
    await page.locator('a[data-slot="sidebar-menu-button"][href="/users"]').click()
    await page.getByRole('link', { name: 'Admin Staffs' }).click()
    await page.getByRole('button', { name: 'Add New' }).click()
    await page.locator('[data-test="userName"]').fill(username)
    await page.locator('[data-test="email"]').fill(staticEmail)
    await page.locator('[data-test="contactNumber"]').fill(phoneNumber)
    await page.locator('select[name="role"]').selectOption('Avishek API')
    await page.locator('select[name="status"]').selectOption('Active')
    await page.getByText('Submit').click()

    console.log('⏳ Waiting for OTP email to arrive...')

    // ── Open YopMail via the homepage (direct ?login= URLs can trigger a
    //    redirect/ad chain that snowballs into an HTTP 414) ──
    const yopPage = await context.newPage()
    const inboxName = staticEmail.replace('@yopmail.com', '')

    await yopPage.goto('https://yopmail.com')
    await yopPage.waitForLoadState('domcontentloaded')

    await yopPage.locator('#login').fill(inboxName)
    await yopPage.locator('#login').press('Enter')
    await yopPage.waitForLoadState('domcontentloaded')

    // The inbox list lives inside the #ifinbox iframe
    const inboxFrame = yopPage.frameLocator('#ifinbox')

    let tempPassword = null
    const maxAttempts = 15 // ~15 * 4s = up to ~60s of polling

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`🔄 Checking inbox (attempt ${attempt}/${maxAttempts})...`)

        // Click refresh if it's there so YopMail re-checks for new mail
        const refreshBtn = yopPage.locator('#refresh')
        if (await refreshBtn.isVisible().catch(() => false)) {
            await refreshBtn.click()
        }

        await yopPage.waitForTimeout(4000)

        // Mail rows are normally id="mail0", "mail1"... or class "m"
        const firstMail = inboxFrame.locator('.m, [id^="mail"]').first()
        const hasMail = await firstMail.isVisible().catch(() => false)

        if (hasMail) {
            await firstMail.click()

            const mailFrame = yopPage.frameLocator('#ifmail')
            await mailFrame.locator('#mail').waitFor({ timeout: 10000 }).catch(() => null)

            const emailText = await mailFrame.locator('#mail').innerText().catch(() => '')
            const match = emailText.match(/パスワード[:：]\s*([A-Za-z0-9]+)/)

            if (match) {
                tempPassword = match[1]
                console.log(`✅ Temporary Password: ${tempPassword}`)
                break
            } else {
                console.log('📧 Email found, but password pattern not matched yet — retrying...')
            }
        }
    }

    if (!tempPassword) {
        await yopPage.close()
        throw new Error('❌ Temporary password not found after polling YopMail.')
    }

    await yopPage.close()

    // tempPassword is now available to use in the rest of the test,
    // e.g. logging in as the new admin staff with this temp password.

    // ── Switch back to registration page and enter OTP ────────────────────
    await page.bringToFront()
    await page.locator('.lucide.lucide-logout-circle').click()
    await page.getByRole('button', { name: 'Confirm' }).click()
    await page.locator('[data-test="loginId"]').fill(username)
    await page.locator('[data-test="password"]').fill(tempPassword)
    await page.getByRole('button',{name: 'Login'}).click()
})