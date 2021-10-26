const puppeteer = require('puppeteer-core')
const fse = require('fs-extra')
const axios = require('axios')

const myFrame = (page, iframeName) =>
  page.frames().find((frame) => frame.name() === iframeName)

const resetIP = async () => {
  const TIMEOUT = 2000
  let browser
  let frame

  try {
    await fse.emptyDir('./ss')
    browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser'
    })

    const page = await browser.newPage()
    await page.setViewport({ width: 1024, height: 960 })

    await page.goto('http://192.168.1.1', { waitUntil: 'networkidle0' })
    await page.screenshot({ path: './ss/1-login-page.png' })

    frame = myFrame(page, 'loginPage')
    await frame.waitForSelector('input#User')
    await frame.$eval('input#User', (el) => (el.value = 'admin'))
    await frame.waitForSelector('input#Passwd')
    await frame.$eval('input#Passwd', (el) => (el.value = '%0|F?H@f!berhO3e'))
    await frame.waitForSelector('input#submit')
    await frame.click('input#submit')
    await page.waitForTimeout(TIMEOUT)

    if ((await page.url()) === 'http://192.168.1.1/login.html') {
      console.log('Has logged in')
      await page.screenshot({ path: './ss/2-has-logged-in.png' })
      await page.goto('http://192.168.1.1/menu.html', {
        waitUntil: 'networkidle0'
      })
      await page.waitForTimeout(TIMEOUT)
    }

    if ((await page.url()) === 'http://192.168.1.1/menu.html') {
      await page.screenshot({ path: './ss/2-menu.png' })

      frame = myFrame(page, 'loginPage')
      await frame.waitForSelector('li#Network')
      await frame.click('li#Network')
      await page.waitForTimeout(TIMEOUT)
      await page.screenshot({ path: './ss/3-network-menu.png' })

      frame = myFrame(page, 'loginPage')
      await frame.waitForSelector("div[id='BroadBand Settings']")
      await frame.click("div[id='BroadBand Settings']")
      await page.waitForTimeout(TIMEOUT)
      await page.screenshot({
        path: './ss/4-broadBand-settings.png',
        fullPage: true
      })

      frame = myFrame(page, 'frameContent')
      await frame.waitForSelector('select#wan_enable')
      await frame.select('#wan_enable', '0')
      await frame.waitForSelector('input#wApply')
      await frame.click('input#wApply')
      await page.waitForTimeout(TIMEOUT)
      await page.screenshot({
        path: './ss/5-broadBand-settings-disable.png',
        fullPage: true
      })

      frame = myFrame(page, 'frameContent')
      await frame.waitForSelector('select#wan_enable')
      await frame.select('#wan_enable', '1')
      await frame.waitForSelector('input#wApply')
      await frame.click('input#wApply')
      await page.waitForTimeout(TIMEOUT)

      let status
      while (status !== 'Connected') {
        frame = myFrame(page, 'frameContent')
        await frame.waitForSelector('#wPppoeCon_status')
        status = await frame.$eval('#wPppoeCon_status', (el) => el.innerText)
        if (status !== 'Connected') {
          await frame.waitForSelector('input#wCancel')
          await frame.click('input#wCancel')
          await page.waitForTimeout(TIMEOUT)
        }
      }
      console.log(status)
      await page.screenshot({
        path: './ss/6-broadBand-settings-reenable.png',
        fullPage: true
      })

      frame = myFrame(page, 'loginPage')
      await frame.waitForSelector('span#headerLogoutSpan')
      await frame.click('span#headerLogoutSpan')

      await browser.close()
      console.log('Finish')
    } else {
      await browser.close()
      console.log('Failed')
    }
  } catch (error) {
    console.error(error)
    frame = myFrame(page, 'loginPage')
    await frame.waitForSelector('span#headerLogoutSpan')
    await frame.click('span#headerLogoutSpan')

    await browser.close()
    console.log('Failed')
  }
}

const main = async () => {
  try {
    console.log('Checking...')
    const data = await axios({
      method: 'get',
      url: 'https://pi.setyawan.dev',
      timeout: 1000 * 10 // Wait for 10 seconds
    })
    console.log(data?.status)
  } catch (error) {
    console.log(error?.code)
    if (error?.code === 'ECONNABORTED') {
      await resetIP()
    }
  }
}

main()
