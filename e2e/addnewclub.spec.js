const {test, expect} = require('@playwright/test')
const {login} = require('../utils/helpers')
const {ClubNames} = require('../test-data/clubname')
const {cover, logo, docs} = require('../test-data/storeimages')
const {faker, fakerJA} = require('@faker-js/faker')
const fs = require('fs');
const path = require('path');
 
test('Add New Club', async({page}) => {

    const clubName = faker.person.firstName()
    //`${faker.company.name()}`+"@yopmail.com"
    const uniqueId = faker.number.int({ min: 1000, max: 9999 })
    // 2. Pick a random name from your hostClubNames.js list
    const baseName = faker.helpers.arrayElement(ClubNames)
    // 3. Store it with the ID so it's globally unique for this test run
    const storedClubName = `${baseName}`

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

    //  Generate a random word + static @yopmail.com
    // .replace(/\W/g, '') removes any symbols or spaces to keep the email valid
    const randomWord = faker.word.adjective().toLowerCase().replace(/\W/g, '');
    const staticEmail = `${randomWord}${uniqueId}@yopmail.com`;

    await login(page)
    await page.locator('a[data-slot="sidebar-menu-button"][href="/store-information"]').click()
    await page.getByRole('button', { name: 'Add New' }).click()

        page.on('response', async (response) => {
    if (response.url().includes('amazonaws.com') && !response.ok()) {
    console.log(response.status(), response.url());
    try {
      console.log(await response.text());
    } catch (e) {
      console.log('could not read body', e);
    }
    }
    });

    await page.locator('input[type="file"][aria-label="Upload image file"]').first().setInputFiles(randomCover);
    await page.locator('input[type="file"][aria-label="Upload image file"]').nth(1).setInputFiles(randomLogo);
    await page.locator('[data-test="storeName"]').fill(storedClubName)
    await page.locator('[data-test="storeNameFurigana"]').fill(randomKatakana())
    await page.locator('[data-test="groupName"]').fill(clubName)
    await page.locator('[data-test="description"]').fill(randomDescription)

    //Business Info
    await page.locator('select[name="businessType"]').selectOption({label: 'Sole Proprietorship'})
    await page.locator('[data-test="ceoFullName"]').fill(clubName)
    await page.locator('[data-test="ceoFurigana"]').fill(randomKatakana())
    await page.locator('[data-test="companyAddress"]').fill(location)
    await page.locator('[data-test="landlineNumber"]').fill('09060787878')
    await page.locator('[data-test="mobileNumber"]').fill('09060989898')
    await page.locator('[data-test="emailAddress"]').fill(staticEmail)

    //Documents
    await page.locator('select[name="identificationType"]').selectOption({label: 'Drivers License'})
    await page.locator('input[type="file"][aria-label="Upload image file"]').nth(2).setInputFiles(randomDoc)
    await page.locator('input[type="file"][aria-label="Upload image file"]').nth(3).setInputFiles(randomDoc)
    await page.locator('input[type="file"][aria-label="Upload image file"]').nth(4).setInputFiles(randomDoc)
    await page.locator('[data-test="businessLicenseNumber"]').fill('123456789')
    // await page.getByRole('button', { name: 'YYYY/MM/DD' }).click()
    // await page.getByRole('button', { name: 'Tuesday, September 08th,' }).click()
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
    await page.getByText('Submit').click()
})