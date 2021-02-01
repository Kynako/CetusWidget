// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: fire;
/*!
 * CetusWidget.js
 *
 * Copyright (c) ©︎ 2021 Kynako
 *
 * This software is released under the MIT license.
 * See https://github.com/Kynako/CetusWidget/blob/main/LICENSE
*/
// CONFIG
const CONFIG = {
  platform: args.widgetParameter || 'pc',
  colors: {
    text: new Color('f0f0f0'),
    day: new Color('ffb340'),
    night: new Color('007aff'),
    bgLeft: new Color('202020'),
    bgRight: new Color('0f0f0f')
  }
}
console.log(pjson(CONFIG))

/* main
 * - w
     - aroundwidget
       - lstack ... name & timer
       - rstack timetable
*/
const cetus = await loadWorldState(CONFIG.platform, 'cetusCycle');
console.log(pjson(cetus));
pjson(cetus); 
const unpkg = importModule('modules/unpkg')
const moment = await unpkg('moment')

let widget = null
if (config.runsInWidget) {
  if (config.widgetFamily == "medium") {
    widget = await createWidget(cetus)
  }
  Script.setWidget(widget)
  Script.complete()
} else if (config.runsWithSiri) {
    let widget = await createMediumWidget(app)
    await widget.presentMedium()
    Script.complete()
} else {
  presentMenu(widget)
}

async function presentMenu(app) {
  let alert = new Alert()
  alert.title = 'CetusWidget'
  alert.addAction('Show Data')
  alert.addAction('View Widget')
  alert.addAction('See GitHub')
  alert.addCancelAction("Cancel")
  let idx = await alert.presentSheet()
  switch(idx) {
    case 0: {
      let widget = await QuickLook.present(cetus)
      break;
    };
    case 1: {
      let widget = await createWidget(cetus);
      await widget.presentMedium()
    };
    case 2: {
      Safari.openInApp(
        'https://github.com/Kynako/CetusWidget/', true
      );
    };
  }
}

async function createWidget(cetus){
  let bgColor = Color.green()
  let expiry = moment(cetus.expiry)
    .add(50, 'seconds') // for correctton 01/31/2021
  let w = new ListWidget()
  w.backgroundColor = bgColor
  w.refreshAfterDate = expiry.toDate()
  w.useDefaultPadding()
  
  // aroundstack
  let aroundstack = w.addStack()
  aroundstack.layoutHorizontally()
  aroundstack.useDefaultPadding()
 
  // lstack
  let lstack = aroundstack.addStack()
  lstack.backgroundColor = CONFIG.colors.bgLeft
  lstack.size = new Size(329/2, 155)
  lstack.layoutVertically()
  lstack.setPadding(15, 10, 10, 10)
  let ltext = lstack.addText(' Cetus ')
  ltext.centerAlignText()
  ltext.textColor = CONFIG.colors.text
  ltext.font = new Font('menlo', 30)
  ltext.minimumScaleFactor = 0.5
  ltext.lineLimit = 1
  lstack.addSpacer(15)
  let ldate = lstack.addDate(expiry.toDate())
  ldate.applyTimerStyle()
  ldate.centerAlignText()
  ldate.font = new Font('menlo', 30)
  ldate.textColor = getDayColor(cetus.isDay)
  lstack.addSpacer(10)

  // rstack
  let rstack = aroundstack.addStack()
  rstack.backgroundColor = CONFIG.colors.bgRight
  rstack.size = new Size(329/2, 155)
  rstack.layoutVertically()
  rstack.setPadding(10, 10, 10, 10)
  let minArr = cetus.isDay // 50min * x
    ? [0, 2, 3, 5, 6, 8]
    : [0, 1, 3, 4, 7, 8]
  let expectedBeDayArr = [
    cetus.isDay, !cetus.isDay,
    cetus.isDay, !cetus.isDay,
    cetus.isDay, !cetus.isDay
  ]
  for(i in minArr){
    let expectedBeDay = expectedBeDayArr[i]
        expectedActivation = moment(cetus.activation)
          .add(50*minArr[i], 'minutes')
    let text = expectedTimetableRow(expectedActivation, expectedBeDay)
    let rtext = rstack.addText(text)
    rtext.font = new Font('menlo', 12)
    rtext.textColor = getDayColor(expectedBeDay)
    rtext.lineLimit = 1
    rstack.addSpacer(5)
  }
  return w
}
  
// function
async function loadWorldState(platform, item){
  const api_url = `https://api.warframestat.us/${platform}/${item}`;
  const req = new Request(api_url);
  const json = await req.loadJSON();
  return json
}

function pjson(jsonOrObj){
  return JSON.stringify(jsonOrObj, null, 2);
};

function getDayColor(isDay){
  return isDay
    ? CONFIG.colors.day : CONFIG.colors.night
}

function expectedTimetableRow(activation, isDay){
  let formattedActivation = activation
    .format('HH:mm:ss')
  let min = isDay ? 50*2: 50*1
  let formattedExpiry = activation.add(min, 'minutes')
    .add(-1, 'seconds')
    .format('HH:mm:ss')
  let str = `${formattedActivation} ~ ${formattedExpiry}`
  return str
}