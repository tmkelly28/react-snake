import './index.scss'

import React, {Component} from 'react'
import {render} from 'react-dom'

// UTILITY CLASSES //

const rand = (min, max) => Math.floor(Math.random() * (max - min)) + min;

class Vector {

  constructor (
    left = rand(10, window.innerWidth - 10),
    top = rand(10, window.innerHeight - 10)
  ) {
    this.left = left
    this.top = top
  }

  add (vect)  {
    return new Vector(this.left + vect.left, this.top + vect.top)
  }

  collision (vect, scalar) {
    return Math.abs(this.left - vect.left) <= scalar && Math.abs(this.top - vect.top) <= scalar
  }

  px () {
    return {left: `${this.left}px`, top: `${this.top}px`}
  }
}

// GAME PIECES //

const Piece = className => ({style}) => <div className={className} style={style}></div>
const Apple = Piece('apple')
const Snake = Piece('snake')

// CONSTANTS //

const DIRECTIONS = ['L', 'U', 'R', 'D']
const [L, U, R, D] = DIRECTIONS
const DIR_MAP = {
  L: new Vector(-3, 0),
  U: new Vector(0, -3),
  R: new Vector(3, 0),
  D: new Vector(0, 3),
}
const DOMNODE = document.getElementById('app')

// INITIAL STATE //

const getInitialState = () => ({
  snake: [new Vector(10, 10)],
  apple: new Vector(),
  direction: R,
  alive: true,
  board: {
    x: {
      min: 0,
      max: window.innerWidth
    },
    y: {
      min: 0,
      max: window.innerHeight
    }
  }
})

const Game = class extends Component {

  state = getInitialState()

  componentDidMount () {
    this.req = window.requestAnimationFrame(this.update)
    window.addEventListener('keydown', this.changeDirection)
  }

  update = () => {
    const {direction} = this.state
    return this.move(DIR_MAP[direction])
  }

  move = (vect) => {
    const {snake,apple,board} = this.state
    const {x,y} = board
    const [oldHead] = snake
    const newHead = oldHead.add(vect)
    const {left, top} = newHead

    // collision with apple
    if (newHead.collision(apple, 10)) {
      this.setState({
        snake: [newHead, ...snake],
        apple: new Vector()
      })
    }
    // collision with wall or self
    else if (
      left <= x.min ||
      left >= x.max ||
      top <= y.min ||
      top >= y.max ||
      snake.slice(1).find(v => newHead.collision(v, 0))
    ) {
      this.setState({alive: false})
      return window.cancelAnimationFrame(this.req)
    }
    else {
      this.setState({snake: [newHead, ...snake.slice(0, -1)]})
    }
    this.req = window.requestAnimationFrame(this.update)
  }

  changeDirection = (evt) => {
    switch (evt.keyCode) {
      case 37: return this.setState({direction: L})
      case 38: return this.setState({direction: U})
      case 39: return this.setState({direction: R})
      case 40: return this.setState({direction: D})
    }
  }

  reset = () => this.setState(getInitialState())

  render () {
    const {snake, apple, alive} = this.state

    if (alive) {
      return (
        <div className="game">
          {snake.map((v, idx) => <Snake style={v.px()} key={idx}/>)}
          <Apple style={apple.px()} />
        </div>
      )
    } else {
      return (
        <div onClick={this.reset}>
          <h1>You are dead</h1>
        </div>
      )
    }
  }
}

render(<Game />, DOMNODE)
