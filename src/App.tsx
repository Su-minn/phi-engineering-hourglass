import { useState, useEffect } from 'react'
import './App.css'

type State = 'STILL' | 'FLOWING'

const TOTAL = 100
const TICK_MS = 100
const RATE = 1
const FLIP_DURATION_MS = 600
// 총 작동 시간 = (TOTAL / RATE) * TICK_MS = 10,000ms = 10초

function App() {
  const [state, setState] = useState<State>('STILL')
  const [startAmount, setStartAmount] = useState<number>(TOTAL)
  const [cycleCount, setCycleCount] = useState<number>(0)
  const [isFlipping, setIsFlipping] = useState<boolean>(false)

  // 추상화 3 — 양 보존: 도착량은 시작량에서 derive (시작 + 도착 = TOTAL)
  const endAmount = TOTAL - startAmount
  const progress = endAmount / TOTAL

  // 조건 2: FLOWING + tick → 양 이동
  // 조건 4: FLOWING + 양==0 → STILL 자율 종료 (추상화 1)
  useEffect(() => {
    if (state !== 'FLOWING') return
    const id = setInterval(() => {
      setStartAmount((prev) => {
        const next = Math.max(0, prev - RATE)
        if (next === 0) {
          setState('STILL')
        }
        return next
      })
    }, TICK_MS)
    return () => clearInterval(id)
  }, [state])

  // 조건 1: STILL + 트리거 → FLOWING (양 swap + 시각적 회전, 추상화 5 멱등 반복)
  // 조건 3: FLOWING + 트리거 → 무시 (추상화 4 흐름 중 개입 차단)
  const handleTrigger = () => {
    if (state !== 'STILL') return // 추상화 4 — 흐름 중 차단

    setIsFlipping(true)
    setCycleCount((c) => c + 1)
    setStartAmount(TOTAL) // 양 swap (새 사이클)
    setState('FLOWING')

    setTimeout(() => setIsFlipping(false), FLIP_DURATION_MS)
  }

  const isLocked = state === 'FLOWING'
  const buttonLabel = state === 'STILL' ? '↻  뒤집기' : '작동 중'

  return (
    <div className="app">
      <header>
        <p className="meta">Phi · Engineering · Week 1</p>
        <h1>Sand-Glass</h1>
        <p className="subtitle">
          컴퓨팅 사고력 4단계 적용 프로토타입 — v2
        </p>
        <hr className="divider" />
      </header>

      <section className="status">
        <span className="status-label">STATE</span>
        <span className={`status-value status-${state.toLowerCase()}`}>
          <span className="status-dot" />
          {state}
        </span>
      </section>

      <section
        className={`bars ${isFlipping ? 'flipping' : ''}`}
        aria-hidden={isFlipping}
      >
        <div className="bar-row">
          <span className="bar-label">START</span>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${(startAmount / TOTAL) * 100}%` }}
            />
          </div>
          <span className="bar-amount">{startAmount.toFixed(0)}</span>
        </div>

        <div className="bar-row">
          <span className="bar-label">END</span>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${(endAmount / TOTAL) * 100}%` }}
            />
          </div>
          <span className="bar-amount">{endAmount.toFixed(0)}</span>
        </div>
      </section>

      <section className="progress">
        <p className="progress-label">PROGRESS</p>
        <p className="progress-value">
          {(progress * 100).toFixed(0)}
          <span className="progress-unit">%</span>
        </p>
      </section>

      <section className="meta-row" aria-label="cycle count">
        <span className="cycle-label">CYCLE</span>
        <span className="cycle-value">{cycleCount.toString().padStart(2, '0')}</span>
      </section>

      <button
        onClick={handleTrigger}
        disabled={isLocked}
        className="trigger-btn"
        aria-label="모래시계 트리거"
      >
        {buttonLabel}
      </button>
    </div>
  )
}

export default App
