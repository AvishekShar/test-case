const {test, expect} = require('@playwright/test')
const {faker, fakerJA} = require('@faker-js/faker')
const {login} = require('../utils/helpers')
const {ClubNames} = require('../test-data/clubname')
const {cover, logo} = require('../test-data/images')

test('Add New Basic Club' , async({page}) => {

    const name = faker.person.firstName()
    const uniqueId = faker.number.int({min:1000, max:9999})
    const basename = faker.helpers.arrayElement(ClubNames)
    const storedClubName = `${basename}`
    
    const randomKatakana = (length = 6) => {
    const kana = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
    return Array.from({ length }, () => kana[Math.floor(Math.random() * kana.length)]).join('');
    }

    const randomCover = faker.helpers.arrayElement(cover)
    const randomlogo = faker.helpers.arrayElement(logo)
    const randomDescription = faker.lorem.sentence()
    const city = faker.location.city()
    const street = faker.location.street()
    const buildingNo = faker.location.buildingNumber()


    await login(page)
    await page.locator('a[data-slot="sidebar-menu-button"][href="/store-information"]').click()
    await page.locator('a[href="/store-information/basic-stores"]').click()
    await page.getByRole('button', { name: 'Add New' }).click()

    //BASIC INFO
    await page.locator('input[aria-label="Upload image file"][type="file"]').first().setInputFiles(randomCover)
    await page.locator('input[aria-label="Upload image file"][type="file"]').nth(1).setInputFiles(randomlogo)
    await page.locator('[data-test="storeName"]').fill(storedClubName)
    await page.locator('[data-test="storeNameFurigana"]').fill(randomKatakana(8))
    await page.locator('[data-test="groupName"]').fill(name)
    await page.locator('[data-test="landlineNumber"]').fill('09060810770')
    await page.locator('[data-test="description"]').fill(randomDescription)

    //Club Address
    await page.locator('[data-test="postalCode"]').fill('160-0022')

    //Prefecture
    await page.locator('select[name="prefecture"]').selectOption('歌舞伎町') //Tokyo
    //await page.locator('select[name="prefecture"]').selectOption('ススキノ') //Sushikino
    //await page.locator('select[name="prefecture"]').selectOption('名古屋') //Nagoya
    //await page.locator('select[name="prefecture"]').selectOption('中洲') //Fukuoka 
    //await page.locator('select[name="prefecture"]').selectOption('キタ・ミナミ') //Kita Minami
    await page.locator('[data-test="city"]').fill(city)
    await page.locator('[data-test="street"]').fill(street)
    await page.locator('[data-test="buildingNo"]').fill(buildingNo)

    //Club Info
    await page.locator('select[name="workingTimeFrom"]').selectOption('09:00')
    await page.locator('select[name="workingTimeTo"]').selectOption('23:00')
    await page.locator('select[name="lastEntryTime"]').selectOption('22:00')
    //await page.locator('select[name="holidays"]').selectOption('') //Holidays (毎月1日,締め日翌日)
    //await page.locator('select[name="closingDate"]').selectOption('') //Closing Date (1-31)
    //await page.locator('input[placeholder="Select"]').fill('')

    //SNS
    await page.locator('[data-test="instagram"]').fill('https://www.instagram.com/hoslog_operation/')
    await page.locator('[data-test="tiktok"]').fill('https://www.tiktok.com/login')
    await page.locator('[data-test="twitter"]').fill('https://x.com/hoslog_official?lang=en')
    await page.locator('[data-test="line"]').fill('https://www.line.me/en/')
    await page.locator('[data-test="website"]').fill('https://hoslog.jp/')
    await page.locator('[data-test="googleMap"]').fill('https://maps.app.goo.gl/ZReBVHbr2bjbK45R6')
    await page.getByText('Save').click()
})