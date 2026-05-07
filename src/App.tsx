import { useState, useEffect } from 'react'
import './App.css'

type State = 'IDLE' | 'RUNNING' | 'DONE'

const TOTAL = 100
const TICK_MS = 100
const RATE = 1
// 총 작동 시간 = (TOTAL / RATE) * TICK_MS = 10,000ms = 10초

function App() {
  const [state, setState] = useState<State>('IDLE')
  const [startAmount, setStartAmount] = useState<number>(TOTAL)

  // 추상화 3 — 양 보존: 도착량은 시작량에서 derive (시작 + 도착 = TOTAL)
  const endAmount = TOTAL - startAmount
  const progress = endAmount / TOTAL

  // 조건 2: RUNNING + tick → 양 이동
  // 조건 4: startAmount === 0 → DONE 자율 종료 (추상화 1)
  useEffect(() => {
    if (state !== 'RUNNING') return
    const id = setInterval(() => {
      setStartAmount((prev) => {
        const next = Math.max(0, prev - RATE)
        if (next === 0) {
          setState('DONE')
        }
        return next
      })
    }, TICK_MS)
    return () => clearInterval(id)
  }, [state])

  // 조건 1, 3, 5
  const handleTrigger = () => {
    if (state === 'IDLE') {
      setState('RUNNING')
    } else if (state === 'DONE') {
      setStartAmount(TOTAL)
      setState('IDLE')
    }
  }

  // 추상화 4 — 작동 중 개입 차단
  const isLocked = state === 'RUNNING'

  const buttonLabel = {
    IDLE: '↻  뒤집기',
    RUNNING: '작동 중',
    DONE: '↻  재시작',
  }[state]

  return (
    <div className="app">
      <header>
        <p className="meta">Phi · Engineering · Week 1</p>
        <h1>Sand-Glass</h1>
        <p className="subtitle">컴퓨팅 사고력 4단계 적용 프로토타입 — v1</p>
        <hr className="divider" />
      </header>

      <section className="status">
        <span className="status-label">STATE</span>
        <span className={`status-value status-${state.toLowerCase()}`}>
          <span className="status-dot" />
          {state}
        </span>
      </section>

      <section className="bars">
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
