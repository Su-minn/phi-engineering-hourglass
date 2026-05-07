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

  // 조건 2: RUNNING 상태 + 매 tick 경과 → 양 이동
  // 조건 4: startAmount === 0 도달 → DONE 자율 종료 (추상화 1)
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

  // 조건 1, 3, 5: 트리거 입력 처리
  const handleTrigger = () => {
    if (state === 'IDLE') {
      // 조건 1: IDLE → RUNNING
      setState('RUNNING')
    } else if (state === 'DONE') {
      // 조건 5: DONE → IDLE (재충전, 멱등 반복 — 추상화 5)
      setStartAmount(TOTAL)
      setState('IDLE')
    }
    // 조건 3: RUNNING + 트리거 → 무시 (button disabled가 1차 방어)
  }

  // 추상화 4 — 단방향 전이 + 작동 중 개입 차단
  const isLocked = state === 'RUNNING'

  const stateLabel = { IDLE: '대기', RUNNING: '작동 중', DONE: '완료' }[state]

  const buttonLabel = {
    IDLE: '🔄  뒤집기 (작동 시작)',
    RUNNING: '🔒  작동 중 — 개입 차단',
    DONE: '🔁  뒤집기 (재시작)',
  }[state]

  return (
    <div className="app">
      <header>
        <h1>모래시계</h1>
        <p className="subtitle">
          Phi Engineering 1주차 · 컴퓨팅 사고력 4단계 프로토타입 · v0 MVP
        </p>
      </header>

      <div className={`state-badge state-${state.toLowerCase()}`}>
        STATE: {state} · {stateLabel}
      </div>

      <div className={`hourglass ${state.toLowerCase()}`}>
        <div className="container start">
          <div className="container-label">시작 영역</div>
          <div className="bar-wrap">
            <div
              className="bar"
              style={{ height: `${(startAmount / TOTAL) * 100}%` }}
            />
          </div>
          <div className="amount">{startAmount.toFixed(0)}</div>
        </div>

        <div className="neck" />

        <div className="container end">
          <div className="container-label">도착 영역</div>
          <div className="bar-wrap">
            <div
              className="bar"
              style={{ height: `${(endAmount / TOTAL) * 100}%` }}
            />
          </div>
          <div className="amount">{endAmount.toFixed(0)}</div>
        </div>
      </div>

      <div className="progress">
        <div className="progress-label">진행률</div>
        <div className="progress-value">{(progress * 100).toFixed(1)}%</div>
      </div>

      <button
        onClick={handleTrigger}
        disabled={isLocked}
        className="trigger-btn"
        aria-label="모래시계 트리거"
      >
        {buttonLabel}
      </button>

      <footer>
        <details>
          <summary>구현된 추상화 (4단계 분석 매핑)</summary>
          <ul>
            <li>✅ 추상화 1 — 트리거 기반 자율 종료 (startAmount=0 시 자동 DONE)</li>
            <li>⏳ 추상화 2 — 상태 경계 시각 신호 (v3에서 펄스/글로우 보강)</li>
            <li>✅ 추상화 3 — 양 보존 (시작 + 도착 = TOTAL, derive)</li>
            <li>✅ 추상화 4 — 단방향 전이 + 작동 중 개입 차단 (button disabled)</li>
            <li>✅ 추상화 5 — 멱등 반복 (DONE→IDLE swap, 재시작)</li>
          </ul>
        </details>
      </footer>
    </div>
  )
}

export default App
