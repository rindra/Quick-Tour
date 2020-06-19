import TweenMax from 'gsap'
import Draggable from 'gsap/Draggable'
import TextPlugin from 'gsap/TextPlugin'
import MorphSVGPlugin from './plugins/MorphSVGPlugin'

//import GSDevTools from 'gsap';
require('./reset.less')
require('./index.less')

const plugins = [TextPlugin, MorphSVGPlugin],
  template = require("./section.hbs"),
  moment = require('moment')

function delay(t) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), t)
  })
}

function init() {
  let qt, menu
  fetch('https://quicktour-db.herokuapp.com/qt')
    .then(data => data.json())
    .then(data => {
      qt = data
      return fetch('https://quicktour-db.herokuapp.com/menu')
    })
    .then(data => data.json())
    .then(data => {
      menu = data
      populate(qt, menu)
    })
}

function wait(t) {
  return TweenMax.to({}, t, {})
}

function focus(section, clipath) {
  let b = {
    s: 0,
    e: 0,
    x: 0,
    y: 0
  }

  if (clipath) {
    return TweenMax.to(b, 1, {
      startAt: {
        s: clipath.start[0],
        e: clipath.start[1],
        x: clipath.start[2],
        y: clipath.start[3]
      },
      s: clipath.end[0],
      e: clipath.end[1],
      x: clipath.end[2],
      y: clipath.end[3],
      onUpdate: function (b) {
        //      document.querySelector('.overlay').style.clipPath = `circle(${b.v}px at ${x}px ${y}px)`
        document.querySelector(`#${section.name} .overlay`).style.clipPath = `inset(${b.s}px ${b.e}px ${b.x}px ${b.y}px)`
      },
      onUpdateParams: [b],
      //      roundProps: 'v',
      ease: Quint.easeOut
    })
  } else {
    return TweenMax.set({}, {})
  }
}

function svg(name) {
  return TweenMax.set('.text', {
    className: `+=${name}`
  })
}

function updateTimeline() {
  let prc = this.progress() * (document.querySelector('.progress_bar').offsetWidth - 10),
    t = Math.trunc(this.time())

  TweenMax.set('.progress', {
    x: prc
  })
  TweenMax.set('.progress_last', {
    width: prc + 5
  })
  document.querySelector('.time').innerHTML = moment(new Date(this.time() * 1000)).format('mm:ss')

  if (t > 0 && t < 11) {
    carret(2)
  }
  if (t > 11 && t < 32) {
    carret(12)
  }
  if (t > 32 && t < 69) {
    carret(33)
  }
  if (t > 69 && t < 90) {
    carret(70)
  }
  if (t > 90) {
    carret(91)
  }
}

function carret(time) {
  //  return new TimelineLite()
  //    .add(TweenMax.to(`span`, .25, {
  //      opacity: 0
  //    }))
  //    .add(TweenMax.to(`[data-time="${time}"] span`, .25, {
  //      opacity: 1
  //    }))
  //    .add(TweenMax.to({}, 1, {
  //      onComplete: function () {
  //        current_state = true
  //      }
  //    }))
  TweenMax.set('span', {
    opacity: 0
  })
  TweenMax.set(`[data-time="${time}"] span`, {
    opacity: 1
  })
}

function text(name, scene) {
  //  return TweenMax.to('.text', 1, {
  //    text: copy,
  //    ease: Quint.easeOut
  //  })
  //  console.log(name)
  if (scene.title && scene.description) {
    return new TimelineLite()
      .add(TweenMax.to(`article`, .25, {
        opacity: 0,
        y: -10
      }), '-=.50')
      .add(TweenMax.to(`#${name}`, .25, {
        opacity: 1,
        y: 0
      }), '-=.25')
  } else {
    return TweenMax.set('.text', {})
  }
}

function intro(tl) {
  tl
    .add(TweenMax.to('.phone_wrapper', 1, {
      startAt: {
        opacity: 0
      },
      opacity: 1
    }))
}

function add_sections(tl, qt) {
  qt.forEach(section => {
    tl
    //      .add(carret(section.name))
      .add(TweenMax.to(`#${section.name}`, 1, {
        y: 0
      }))
      .add(text(`${section.name}_0`, section.scenes[0]))

    add_scenes(tl, qt, section)
  })
}

function position_ldots(tl, menu) {
  //  let prc = this.progress() * (document.querySelector('.progress_bar').offsetWidth - 10)
  //  console.log(tl.totalDuration(), (document.querySelector('.progress_bar').offsetWidth - 10))
  document.querySelectorAll('.ldot').forEach((d, i) => {
    TweenMax.set(d, {
      x: (menu[i].time / tl.totalDuration()) * (document.querySelector('.progress_bar').offsetWidth - 10)
    })
  })
}

function add_scenes(tl, qt, section) {
  section.scenes.forEach((scene, index) => {
    if (index > 0) {
      tl
        .add(text(`${section.name}_${index}`, scene))
        .add(TweenMax.to(`#${section.name}`, 1, {
          x: `-=${scene.x}`,
          y: `-=${scene.y}`
        }))
        .add(focus(section, scene.clipath))

      add_header_footer(tl, qt, section, scene)

      tl
        .add(wait(scene.delay))
    } else {
      tl
        .add(wait(scene.delay))
    }
  })
}

function add_header_footer(tl, qt, section, scene) {
  if (scene.header) {
    tl
      .add(TweenMax.to(`#${section.name}_header`, 1, {
        y: 0
      }), "-=1")
  } else {
    tl
      .add(TweenMax.to(`#${section.name}_header`, 1, {
        y: -50
      }), "-=1")
  }
  if (scene.header) {
    tl
      .add(TweenMax.to(`#${section.name}_footer`, 1, {
        y: 0
      }), "-=1")
  } else {
    tl
      .add(TweenMax.to(`#${section.name}_footer`, 1, {
        y: 40
      }), "-=1")
  }
}

function init_nav(tl) {
  let playing = true
  document.querySelector('.pause').classList.add('on')
  document.querySelector('.controller').onclick = e => {
    if (playing) {
      document.querySelector('.play').classList.add('on')
      document.querySelector('.pause').classList.remove('on')
      playing = false
      tl.pause()
    } else {
      document.querySelector('.play').classList.remove('on')
      document.querySelector('.pause').classList.add('on')
      playing = true
      tl.play()
    }
  }
  document.querySelectorAll('.menu p').forEach(p => {
    p.onclick = e => {
      if (e.currentTarget.getAttribute('data-time') != '') tl.time(e.currentTarget.getAttribute('data-time'))
    }
  })
}

function blob(start_blob, end_blob, color) {
  return TweenMax.to(document.querySelector(`#${start_blob}`), 20, {
    morphSVG: document.querySelector(`#${end_blob}`),
    fill: color,
    ease: Linear.EaseNone
  })
}

function populate(qt, menu) {
  let tl = new TimelineLite({
      onUpdate: updateTimeline,
      onUpdateParams: [tl]
    }),
    blob_tl = new TimelineMax({
      repeat: -1,
      yoyo: true
    })

  document.querySelector('main').innerHTML = template({
    qt: qt,
    menu: menu
  })

  TweenMax.set('.section', {
    y: 500
  });
  TweenMax.set('.header', {
    y: -44
  });
  TweenMax.set('.footer', {
    y: 34
  });
  TweenMax.set('span', {
    opacity: 0
  });
  TweenMax.set('article', {
    opacity: 0,
    y: 10
  });

  intro(tl)

  add_sections(tl, qt)

  position_ldots(tl, menu)


  blob_tl
    .add(wait(3))
    .add(blob('blob5', 'blob1', '#FA4700'))
    .add(wait(3))
    .add(blob('blob5', 'blob2', '#6C1DBA'))
    .add(wait(3))
    .add(blob('blob5', 'blob3', '#FEC90D'))
    .add(wait(3))
    .add(blob('blob5', 'blob4', '#00C288'))

  let d = Draggable.create(".progress", {
    type: "x",
    edgeResistance: 0.65,
    bounds: ".progress_bar",
    onDrag: function () {
      if (this.x > 0 && this.x < 300) tl.progress(this.x / 300)
    }
  })

  init_nav(tl)
}

init()
