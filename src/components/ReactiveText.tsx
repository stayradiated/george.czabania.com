import { useState, useRef, useEffect } from 'react'

const BUTTON_SIZE = 15

type Props = {
  text: string
}

const Button = () => {
  const [level,setLevel] = useState(0)

  const bumpColor = () => {
    setLevel((l) => l + 1)
  }

  const loop = () => {
    bumpColor()
    setTimeout(loop, 16)
  }

  useEffect(() => {
    loop()
  }, [])

  return (
    <div style={{
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
      borderRadius: BUTTON_SIZE,
      backgroundColor: `rgba(255, 255, 255, ${(100 % level)/100})`
    }} />
  )
}

const ReactiveText = (props: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size,setSize] = useState({width: 0, height: 0})

  useEffect(() => {
    const height = containerRef.current?.clientHeight ?? 0
    const width = containerRef.current?.clientWidth ?? 0
    setSize({ width, height })
  }, [])

  return (
    <canvas width={size.width} height={size.height} />
  )
}

export default ReactiveText
