const { test, expect } = require('@playwright/test')
const { login } = require('../utils/helpers')
const { StoreNames } = require('../test-data/storename')
const { cover, logo, docs } = require('../test-data/storeimages')
const { faker } = require('@faker-js/faker')
const path = require('path')

test ('Add new Store', async ({ page }) => {
    const selectedClub = faker.helpers.arrayElement(StoreNames)
    const storedClubName = selectedClub.en          // English → primary field
    const storedClubFurigana = selectedClub.ja      // Japanese → furigana field

    const clubName = faker.person.firstName()
    const uniqueId = faker.number.int({ min: 1000, max: 9999 })

    const randomKatakana = (length = 6) => {
    const kana = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
    return Array.from({ length }, () => kana[Math.floor(Math.random() * kana.length)]).join('');
    };

    const randomLogo = faker.helpers.arrayElement(logo)
    const randomCover = faker.helpers.arrayElement(cover)
    const randomDoc = faker.helpers.arrayElement(docs)
    const randomDescription = faker.lorem.sentence()
    const location = faker.location.city()
    const city = faker.location.street()
    const buildingNo = faker.location.buildingNumber()
    const landlineNumber = `090${faker.string.numeric(8)}`;
    const mobileNumber = `090${faker.string.numeric(8)}`;

    const randomWord = faker.word.adjective().toLowerCase().replace(/\W/g, '')
    const staticEmail = `${randomWord}${uniqueId}@yopmail.com`

    await login(page)
    await page.locator('a[data-slot="sidebar-menu-button"][href="/store-information"]').click()
    await page.getByRole('button', { name: 'Add New' }).click()

    // Files are staged in the form; the app requests presigned URLs on submission.
    const uploadFile = async (index, filePath) => {
        const preview = page.locator(`img[alt="${path.basename(filePath)}"]`)
        const previousPreviewCount = await preview.count()
        await page.locator('input[type="file"][aria-label="Upload image file"]').nth(index).setInputFiles(filePath)
        await expect(preview).toHaveCount(previousPreviewCount + 1)
    }

    // Upload images
    await uploadFile(0, randomCover)
    await uploadFile(1, randomLogo)

    // === Club Name (English primary) ===
    await page.locator('[data-test="storeName"]').fill(storedClubName)

    // === Japanese Name (instead of random katakana) ===
    await page.locator('[data-test="storeNameFurigana"]').fill(storedClubFurigana)

    await page.locator('[data-test="groupName"]').fill(clubName)
    await page.locator('[data-test="description"]').fill(randomDescription)

    //Business Info
    await page.locator('select[name="businessType"]').selectOption({label: 'Sole Proprietorship'})
    await page.locator('[data-test="ceoFullName"]').fill(clubName)
    await page.locator('[data-test="ceoFurigana"]').fill(randomKatakana())
    await page.locator('[data-test="companyAddress"]').fill(location)
    await page.locator('[data-test="landlineNumber"]').fill(landlineNumber)
    await page.locator('[data-test="mobileNumber"]').fill(mobileNumber)
    await page.locator('[data-test="emailAddress"]').fill(staticEmail)

    //Documents
    await page.locator('select[name="identificationType"]').selectOption({label: 'Drivers License'})
    await uploadFile(2, randomDoc)
    await uploadFile(3, randomDoc)
    await uploadFile(4, randomDoc)
    await page.locator('[data-test="businessLicenseNumber"]').fill('123456789')
    // await page.getByRole('button', { name: 'YYYY/MM/DD' }).click()
    // await page.getByRole('button', { name: 'Tuesday, September 08th,' }).click()

    const submissionNetworkErrors = []
    const uploadRequestUrls = []
    const seenRequestUrls = []
    const isUploadRequest = url => /upload|presign|s3|amazonaws/i.test(url)
    const describeRequest = request => {
        const url = new URL(request.url())
        return `${request.method()} ${url.origin}${url.pathname}`
    }
    const onRequest = request => {
        const description = describeRequest(request)
        seenRequestUrls.push(description)
        if (isUploadRequest(request.url())) uploadRequestUrls.push(description)
    }
    const onRequestFailed = request => {
        submissionNetworkErrors.push(
            `NETWORK ${describeRequest(request)} - ${request.failure()?.errorText || 'unknown error'}`
        )
    }
    const onResponse = response => {
        if (!response.ok()) {
            submissionNetworkErrors.push(`HTTP ${response.status()} ${describeRequest(response.request())}`)
        }
    }

    // The app may request presigned URLs while advancing from the upload step.
    page.on('request', onRequest)
    page.on('requestfailed', onRequestFailed)
    page.on('response', onResponse)
    await page.getByText('Next').click()

    //Store Info
    await page.locator('[data-test="latitude"]').fill('35.68952983669874')
    await page.locator('[data-test="longitude"]').fill('139.7002708587484')
    await page.locator('[data-test="postalCode"]').fill('169-0074')

    //Prefectures
    await page.locator('select[name="prefecture"]').selectOption('歌舞伎町') //Tokyo
    // await page.locator('select[name="prefecture"]').selectOption('ススキノ') //Sushikino
    // await page.locator('select[name="prefecture"]').selectOption('名古屋') //Nagoya
    //await page.locator('select[name="prefecture"]').selectOption('中洲') //Fukuoka 
    //await page.locator('select[name="prefecture"]').selectOption('キタ・ミナミ') //Kita Minami

    await page.locator('[data-test="city"]').fill(city)
    await page.locator('[data-test="street"]').fill(city)
    await page.locator('[data-test="buildingNo"]').fill(buildingNo)

    //Club Info
    await page.locator('select[name="workingTimeFrom"]').selectOption('09:00')
    await page.locator('select[name="workingTimeTo"]').selectOption('23:00')
    await page.locator('select[name="lastEntryTime"]').selectOption('22:00')
    //await page.locator('select[name="holidays"]').selectOption('') //Holidays (毎月1日,締め日翌日)
    //await page.locator('select[name="closingDate"]').selectOption('') //Closing Date (1-31)

    //SNS
    await page.locator('[data-test="instagram"]').fill('https://www.instagram.com/hoslog_operation/')
    await page.locator('[data-test="tiktok"]').fill('https://www.tiktok.com/en/')
    await page.locator('[data-test="twitter"]').fill('https://x.com/hoslog_official?lang=en')
    await page.locator('[data-test="line"]').fill('https://www.line.me/en/')
    await page.locator('[data-test="website"]').fill('https://hoslog.jp/')
    await page.locator('[data-test="googleMap"]').fill('https://maps.app.goo.gl/fbJgfXqUPRCmoMrF6')

    const submitButton = page.locator('[data-slot="button"]').filter({ hasText: /^\s*Submit\s*$/ })
    await expect(submitButton).toHaveCount(1)
    await submitButton.click()
    await page.waitForLoadState('networkidle')

    page.off('request', onRequest)
    page.off('requestfailed', onRequestFailed)
    page.off('response', onResponse)

    console.log('Presigned/upload requests:', uploadRequestUrls)
    console.log('Requests during Next and Submit:', [...new Set(seenRequestUrls)])
    if (submissionNetworkErrors.length) {
        console.error('Network errors during submission:\n' + submissionNetworkErrors.join('\n'))
    }
    expect(submissionNetworkErrors, 'Network errors occurred during form submission').toEqual([])

})    
    

