import React from 'react'
import classNames from 'classnames'

import './styles.css'

const Barrel = React.memo((props) => {
  const {
    previousValue,
    value,
    rotationsPerSecond,
    withMarkers,
    isFractional,
  } = props

  const safeValue = value % 11

  const animation = `slide-to-${safeValue} linear ${
    1 / rotationsPerSecond / 10
  }s forwards`

  const transform = `translateY(calc(${previousValue} / 11 * -100%))`

  return (
    <div className={classNames('barrel', { isFractional, withMarkers })}>
      <div className="barrel-list" style={{ animation, transform }}>
        <div className="barrel-list-item">0</div>
        <div className="barrel-list-item">1</div>
        <div className="barrel-list-item">2</div>
        <div className="barrel-list-item">3</div>
        <div className="barrel-list-item">4</div>
        <div className="barrel-list-item">5</div>
        <div className="barrel-list-item">6</div>
        <div className="barrel-list-item">7</div>
        <div className="barrel-list-item">8</div>
        <div className="barrel-list-item">9</div>
        <div className="barrel-list-item">0</div>
      </div>
    </div>
  )
})

const Meter = React.memo((props) => {
  const { barrels, value, rotationsPerSecond } = props

  const [integerLength, fractionLength] = barrels
  const [
    unpaddedIntegerValue,
    untrimmedFractionValue = '',
  ] = value.toString().split('.')
  const integerValue = unpaddedIntegerValue.padStart(integerLength, '0')
  const fractionValue = untrimmedFractionValue
    .padEnd(fractionLength, '0')
    .slice(0, fractionLength)

  const barrelValue = (integerValue + fractionValue)
    .split('')
    .map((item) => parseInt(item, 10))

  const children = barrelValue.map((number, index) => {
    const value = number === 0 ? 10 : number
    const previousValue = value - 1

    return (
      <Barrel
        key={index}
        previousValue={previousValue}
        value={value}
        isFractional={index >= integerLength}
        withMarkers={index === barrelValue.length - 1}
        rotationsPerSecond={rotationsPerSecond}
      />
    )
  })

  children.splice(integerLength, 0, <div key="dot" className="meter-dot" />)
  children.push(
    <div key="m3" className="meter-unit">
      <span>
        m<sup>3</sup>
      </span>
    </div>
  )

  return <div className="meter">{children}</div>
})

const Counter = (props) => {
  const { startFrom, step, delayMs, children } = props

  const [value, setValue] = React.useState(startFrom)

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setValue((v) => v + step)
    }, delayMs)
    return () => {
      clearTimeout(timeout)
    }
  })

  return React.createElement(children, {
    value,
  })
}

const App = () => {
  const delayMs = 1000
  const rotationsPerSecond = 1000 / (delayMs * 10)

  const startFrom = 5123.459

  return (
    <Counter startFrom={startFrom} step={0.001} delayMs={delayMs}>
      {({ value }) => (
        <Meter
          barrels={[4, 3]}
          value={value}
          rotationsPerSecond={rotationsPerSecond}
        />
      )}
    </Counter>
  )
}

export default App
