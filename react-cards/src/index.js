import { render } from 'react-dom'
import React, { useState, useEffect } from 'react'
import { useSprings, animated, interpolate } from 'react-spring'
import { useDrag } from 'react-use-gesture'
import './styles.css'

function difference(setA, setB) {
  let _difference = new Set(setA)
  for (let elem of setB) {
      _difference.delete(elem)
  }
  return _difference
}

function to_int(setA) {
  let _difference = new Set()
  for (let elem of setA) {
      _difference.add(parseInt(elem))
  }
  return _difference
}

const cards = [
  'https://upload.wikimedia.org/wikipedia/en/f/f5/RWS_Tarot_08_Strength.jpg',
  'https://upload.wikimedia.org/wikipedia/en/5/53/RWS_Tarot_16_Tower.jpg',
  'https://upload.wikimedia.org/wikipedia/en/9/9b/RWS_Tarot_07_Chariot.jpg',
  'https://upload.wikimedia.org/wikipedia/en/d/db/RWS_Tarot_06_Lovers.jpg',
  'https://upload.wikimedia.org/wikipedia/en/thumb/8/88/RWS_Tarot_02_High_Priestess.jpg/690px-RWS_Tarot_02_High_Priestess.jpg',
  'https://upload.wikimedia.org/wikipedia/en/d/de/RWS_Tarot_01_Magician.jpg'
]


const to = i => ({ x: 0, y: i * -4, scale: 1, rot: -10 + Math.random() * 20, delay: i * 100 })
const clear_pos = i => ({x: -((100 + window.innerWidth)), config: { friction: 50, tension: 200} })
const from = i => ({ x: 0, rot: 0, scale: 1.5, y: -1000, zIndex: 0  })

const trans = (r, s) => `perspective(1500px) rotateX(30deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`
let zi = 1

function Deck(properties) {
  const [gone, setGone] = useState(() => new Set())
  const [props, set] = useSprings(cards.length, i => ({ ...to(i), from: from(i) }))
  
  useEffect(() => {
    setGone(difference(gone, properties.data))
    set(i => properties.data.has(i)? {immediate: true, zIndex: ++zi}:{})
    set(i => properties.data.has(i)? to(i):{})
  }, [properties.data])

  useEffect(() => {
    if (properties.clear) {
      let all_cards = new Set([5,4,3,2,1,0])
      setGone(() => all_cards)
      set(i => all_cards.has(i)? clear_pos(i):{})
      console.log('clear')
    }

  }, [properties.clear])


  const bind = useDrag(({ args: [index], down, movement: [xDelta], distance, direction: [xDir], velocity }) => {
    const trigger = velocity > 0.2 
    const dir = xDir < 0 ? -1 : 1
    if (!down && trigger) {
      gone.add(index)
      if (properties.ws){
        properties.ws.send(JSON.stringify({
          'message': String(index),
          'name': properties.name
        }))        
      }

    }
    
    set(i => {
      if (index !== i) return
      const isGone = gone.has(index)
      const x = isGone ? (200 + window.innerWidth) * dir : down ? xDelta : 0
      const rot = xDelta / 100 + (isGone ? dir * 10 * velocity : 0)
      const scale = down ? 1.1 : 1 
      return { x, rot, scale, delay: undefined, config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 } }
    })
    if (!down && gone.size === cards.length && 0) setTimeout(() => {
      gone.clear()
      set(i => to(i))
    }, 600)
  })

  return props.map(({ x, y, rot, scale, zIndex }, i) => (
    <animated.div key={i} style={{ zIndex, transform: interpolate([x, y], (x, y) => `translate3d(${x}px,${y}px,0)`) }}>
      <animated.div {...bind(i)} style={{ zIndex, transform: interpolate([rot, scale], trans), backgroundImage: `url(${cards[i]})` }} />
    </animated.div>
  ))
}





class Panel extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      button_type: "Random"
    };
  }

  handel_button_click(){
    this.return_value()
  }

  handel_input_change(){
    let channel_name = document.getElementById("channel_input").value
    if (channel_name === "") {
      this.setState({button_type: "Random"})
    } else {
      this.setState({button_type: "Connect"})
    }
  }

  return_value(){
    let channel_name = document.getElementById("channel_input").value
    if (channel_name === "") {
      channel_name = String(parseInt(Math.random()*10000))
      document.getElementById("channel_input").value = channel_name
    } 
    this.props.try_to_connect(channel_name)
    this.setState({button_type: "Connected on:"})
  }
  

  render() {
    return (
      <span className="panel">
        <button onClick={() => this.handel_button_click()}>
          {this.state.button_type}
        </button>
        <input id="channel_input" onChange={() => this.handel_input_change()} />
      </span>
    )
  }
}

class Controller extends React.Component {
  constructor(props) {
    super(props);
    this.update_back_number = this.update_back_number.bind(this);
    this.try_to_connect = this.try_to_connect.bind(this);
    this.state = {
      domin: "fastbreakfast.top:4000",
      ws: null,
      back_number: new Set(),
      name: String(parseInt(Math.random()*100000000)),
      clear: false,
      connected: false
    };
  }

  try_to_connect(channel){
    let path = "ws://" + this.state.domin + "/ws/chat/" + channel + "/"
    try {this.state.ws.close();} catch (error) {}
    let ws = new WebSocket(path)

    ws.onopen = () => {
      this.setState({ ws: ws });
      console.log('connected on:' + path)
    }

    ws.onmessage = evt => {
      let data = JSON.parse(evt.data)
      console.log(data)
      if (data.name !== this.state.name) {
        if (data.message === 'clear') {
          this.setState({clear: true})
        } else if (data.message.startsWith('number ')) {
          let number = data.message.split(' ')[1]
          if (parseInt(number) > 2 && !this.state.connected) {
            console.log('FULL')
            ws.close()
            this.setState({connected: false})
          } else if (parseInt(number) == 2 && !this.state.connected){
            this.setState({clear: true, connected: true})
          } else {
            this.setState({connected: true})
          }
        } else {
          let message = data.message
          message = new Set(message)
          message = to_int(message)
          this.setState({back_number: message})
        }
      }
    }

    ws.onclose = () => {
      this.setState({connected: false})
      console.log('disconnected')
    }
  }
  
  update_back_number(gone){
    this.setState({back_number: gone});
  }

  render() {
    return (
      <React.Fragment>
        <Panel 
          try_to_connect={this.try_to_connect}
        />
        <Deck 
          data={this.state.back_number} 
          ws={this.state.ws} 
          name={this.state.name}
          clear={this.state.clear}
        />
      </React.Fragment>
    )
  }
}

render(<Controller />, document.getElementById('root'))
