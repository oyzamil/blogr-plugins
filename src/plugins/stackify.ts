import { type ElementInput, type PluginInstance } from '../types'
import { resolveElements } from '../utils/dom'

/** Which way the auto-cycle rotates the stack. */
export type StackDirection = 'forward' | 'backward'

/** Which axis a layout peeks/scrolls along, and which axis dragging works on. */
export type StackOrientation = 'vertical' | 'horizontal'

/** Container size override. Number -> px, string used as-is. */
export interface StackifySize {
  height?: number | string
  width?: number | string
}

/** Per-layout size override — only the block matching current `layout` applies. */
export interface StackifySizeByLayout {
  stack?: StackifySize
  marquee?: StackifySize
}

/** Detail object passed to `onBeforeChange`/`onAfterChange`. */
export interface StackifyChangeDetail {
  /** Original index (in DOM order) of the card that was in front. */
  fromIndex: number
  /** Original index (in DOM order) of the card that is now in front. */
  toIndex: number
  /** The card element that was in front. */
  fromCard: HTMLElement
  /** The card element that is now in front. */
  toCard: HTMLElement
}

/** Configuration options for {@link stackify}. */
export interface StackifyOptions {
  /**
   * Gap in px between cards. In `"stack"` layout this is how far a card
   * peeks past the one in front of it. In `"marquee"` layout it's the
   * gap between cards along the scroll axis — same option, both
   * layouts read it. Default `20`.
   */
  offset?: number
  /**
   * Shrinks each card behind the front one by this fraction (e.g. `0.05`
   * = each card 5% smaller than the one in front of it) for a subtle
   * depth/fan effect. `0` keeps every card full size, matching a flat
   * peeking stack. Default `0`.
   */
  scaleStep?: number
  /**
   * How many cards (counting the front one) stay visible at once; any
   * further back are faded to `opacity: 0` (still present, just hidden)
   * so a stack of 8 doesn't visually pile up. Default: every card.
   */
  visibleCards?: number
  /** Milliseconds between automatic cycles. `0` disables the timer (still cyclable via `next()`/`prev()`/`goTo()`). Default `3000`. */
  interval?: number
  /** Whether the auto-cycle timer starts immediately. Default `true`. */
  autoplay?: boolean
  /** Transition duration, in ms, for a card moving between stack positions. Default `500`. */
  duration?: number
  /** CSS timing function for that transition. Default `"ease"`. */
  easing?: string
  /** `"forward"` sends the front card to the back; `"backward"` brings the back card to the front. Applies to the auto-cycle timer. Default `"forward"`. */
  direction?: StackDirection
  /**
   * Which axis the layout runs on, and which axis dragging works on.
   * `"vertical"` peeks/drags top-to-bottom, `"horizontal"`
   * peeks/drags left-to-right. Default: `"vertical"` for
   * `layout: "stack"`, `"horizontal"` for `layout: "marquee"`.
   */
  orientation?: StackOrientation
  /** Pause the auto-cycle timer while the pointer is over the stack, resuming on pointer-leave. Default `true`. */
  pauseOnHover?: boolean
  /** Clicking a non-front card brings it to the front. Default `true`. */
  clickToActivate?: boolean
  /**
   * Lets the front card be dragged/swiped to advance/go back — along
   * whichever axis {@link orientation} sets (top/bottom for vertical,
   * left/right for horizontal). Default `false`.
   */
  draggable?: boolean
  /** Original index of the card that starts in front. Default `0`. */
  startIndex?: number
  /** Class toggled on whichever card is currently in front. Default `"stackify-active"`. */
  activeClass?: string
  /** Class added to every card. Default `"stackify-card"`. */
  cardClass?: string
  /** Class added to the container. Default `"stackify-stack"`. */
  stackClass?: string
  /**
   * Stack layout: `"stack"` is the peeking-card-deck effect (default).
   * `"marquee"` lays cards out in a row (or column, see
   * {@link orientation}) that scrolls continuously (speed set by
   * {@link marqueeSpeed}), like a ticker.
   */
  layout?: 'stack' | 'marquee'
  /**
   * `"stack"` layout only. Whether cards behind the front one grow
   * (`"expand"`) or shrink (`"shrink"`) in cross-axis size relative to
   * it, for a fanned-out peek effect. `"none"` keeps every card the
   * same size. Default `"none"`.
   */
  peekWidth?: 'expand' | 'shrink' | 'none'
  /** Size change, as a fraction per card, applied when {@link peekWidth} is set. Default `0.05`. */
  peekWidthStep?: number
  /** `"marquee"` layout only. Scroll speed in px/second. Default `60`. */
  marqueeSpeed?: number
  /**
   * Container height/width — purely opt-in. Plugin never measures
   * cards or auto-calcs a size; whichever axis you don't give stays
   * untouched (normal CSS/parent sizing applies). Number -> px,
   * string used as-is (e.g. `"20rem"`, `"100%"`).
   *
   * Two shapes:
   * - Flat, applies regardless of {@link layout}:
   *   `size: { height: "400px" }`
   * - Per-layout, only the block matching current `layout` applies:
   *   `size: { stack: { height: "400px" }, marquee: { width: "50%" } }`
   */
  size?: StackifySize | StackifySizeByLayout
  /** Called right before a cycle starts (right as the transition begins). */
  onBeforeChange?: (detail: StackifyChangeDetail) => void
  /** Called once a cycle's transition has finished. */
  onAfterChange?: (detail: StackifyChangeDetail) => void
}

/** Returned by {@link stackify}. */
export interface StackifyInstance extends PluginInstance {
  /** Sends the current front card to the back; the next one becomes front. */
  next(): void
  /** Brings the back-most card to the front. */
  prev(): void
  /** Brings the card at `originalIndex` (its position in the initial DOM order) to the front. */
  goTo(originalIndex: number): void
  /** Resumes the auto-cycle timer. */
  play(): void
  /** Pauses the auto-cycle timer. */
  pause(): void
  /** Original index of the card currently in front, per matched stack (usually one). */
  getActiveIndex(): number[]
}

const defaults: Required<Omit<StackifyOptions, 'onBeforeChange' | 'onAfterChange' | 'orientation' | 'size'>> &
  Pick<StackifyOptions, 'orientation' | 'size'> = {
  offset: 20,
  scaleStep: 0,
  visibleCards: Number.POSITIVE_INFINITY,
  interval: 3000,
  autoplay: true,
  duration: 500,
  easing: 'ease',
  direction: 'forward',
  orientation: undefined,
  size: undefined,
  pauseOnHover: true,
  clickToActivate: true,
  draggable: false,
  startIndex: 0,
  activeClass: 'stackify-active',
  cardClass: 'stackify-card',
  stackClass: 'stackify-stack',
  layout: 'stack',
  peekWidth: 'shrink',
  peekWidthStep: 0.05,
  marqueeSpeed: 60,
}

/**
 * Drops keys whose value is explicitly `undefined` before merging with
 * defaults. Without this, `{ ...defaults, ...options }` lets a stray
 * `someOption: undefined` in caller-built option objects (e.g. reading an
 * empty form field with `Number(x) : undefined`) silently wipe out a
 * valid default — that's what was making every card go `opacity: 0` on
 * init, since `visibleCards` was arriving as `undefined` and
 * `Math.min(undefined, n)` is `NaN`.
 */
function stripUndefined<T extends object>(obj: T): Partial<T> {
  const out: Partial<T> = {}
  for (const key in obj) {
    if (obj[key] !== undefined) out[key] = obj[key]
  }
  return out
}

/**
 * Mirrors relevant config onto `container.dataset` so CSS/JS outside the
 * plugin can hook into current state (e.g. `[data-layout="marquee"]`).
 * Called on init and re-applied on `destroy()` cleanup (removed there).
 */
function applyDatasetOptions(container: HTMLElement, opts: ResolvedOpts): void {
  container.dataset.layout = opts.layout
  container.dataset.orientation = opts.orientation ?? (opts.layout === 'marquee' ? 'horizontal' : 'vertical')
  container.dataset.direction = opts.direction
  container.dataset.autoplay = String(opts.autoplay)
  container.dataset.draggable = String(opts.draggable)
  container.dataset.clickToActivate = String(opts.clickToActivate)
  container.dataset.pauseOnHover = String(opts.pauseOnHover)
  if (opts.layout === 'stack') container.dataset.peekWidth = opts.peekWidth
}

function clearDatasetOptions(container: HTMLElement): void {
  delete container.dataset.layout
  delete container.dataset.orientation
  delete container.dataset.direction
  delete container.dataset.autoplay
  delete container.dataset.draggable
  delete container.dataset.clickToActivate
  delete container.dataset.pauseOnHover
  delete container.dataset.peekWidth
}

/**
 * Resolves `opts.size` against current layout. Flat shape (`height`/`width`
 * at top level) applies regardless of layout; per-layout shape (`stack`/
 * `marquee` keys) only yields the block matching `layout`. Detects shape by
 * presence of `stack`/`marquee` keys, not `height`/`width`.
 */
function resolveSize(size: StackifyOptions['size'], layout: 'stack' | 'marquee'): StackifySize {
  if (!size) return {}
  if ('stack' in size || 'marquee' in size) {
    return (size as StackifySizeByLayout)[layout] ?? {}
  }
  return size as StackifySize
}

/**
 * Applies container height/width from `opts.size`, if given — purely
 * opt-in. Plugin never measures card size to auto-calc a container size,
 * so cards stay untouched by this and the container's own box just does
 * whatever normal CSS/parent sizing would do when left alone.
 */
function applySize(container: HTMLElement, opts: ResolvedOpts): void {
  const { height, width } = resolveSize(opts.size, opts.layout)
  if (height !== undefined) {
    container.style.height = typeof height === 'number' ? `${height}px` : height
  }
  if (width !== undefined) {
    container.style.width = typeof width === 'number' ? `${width}px` : width
  }
}

interface Engine {
  next(): void
  prev(): void
  goTo(originalIndex: number): void
  play(): void
  pause(): void
  getActiveIndex(): number
  destroy(): void
}

const DRAG_THRESHOLD_PX = 60

type ResolvedOpts = Required<Omit<StackifyOptions, 'onBeforeChange' | 'onAfterChange' | 'orientation' | 'size'>> &
  Pick<StackifyOptions, 'onBeforeChange' | 'onAfterChange' | 'orientation' | 'size'>

function createEngine(container: HTMLElement, opts: ResolvedOpts): Engine | null {
  return opts.layout === 'marquee' ? createMarqueeEngine(container, opts) : createStackEngine(container, opts)
}

function createStackEngine(container: HTMLElement, opts: ResolvedOpts): Engine | null {
  const original = Array.from(container.children) as HTMLElement[]

  const gap = opts.offset
  const vertical = (opts.orientation ?? 'vertical') === 'vertical'
  const posProp = vertical ? 'top' : 'left'
  let visibleCount = Math.max(1, Math.min(opts.visibleCards, original.length))
  let order = [...original]
  let timer: ReturnType<typeof setInterval> | null = null
  let wasPlayingBeforeHover = false
  let destroyed = false
  let initialized = original.length > 0

  const containerRestore = container.style.cssText
  const cardRestore = new Map<HTMLElement, string>(original.map(card => [card, card.style.cssText]))

  container.classList.add(opts.stackClass)
  applyDatasetOptions(container, opts)
  if (getComputedStyle(container).position === 'static') {
    container.style.position = 'relative'
  }
  applySize(container, opts)

  function setupCard(card: HTMLElement): void {
    if (!cardRestore.has(card)) {
      cardRestore.set(card, card.style.cssText)
    }
    card.classList.add(opts.cardClass)
    card.style.position = 'absolute'
    if (vertical) {
      card.style.top = '0'
    } else {
      card.style.top = '0'
      card.style.bottom = '0'
    }
    card.style.transformOrigin = vertical ? 'top center' : 'center left'
    card.style.transition = `${posProp} ${opts.duration}ms ${opts.easing}, transform ${opts.duration}ms ${opts.easing}, opacity ${opts.duration}ms ${opts.easing}`
  }

  for (const card of original) {
    setupCard(card)
  }

  function applyPositions(): void {
    if (order.length === 0) return
    const n = order.length
    order.forEach((card, i) => {
      const pos = (n - 1 - i) * gap
      const scale = 1 - i * opts.scaleStep
      const peekDelta =
        opts.peekWidth === 'expand' ? i * opts.peekWidthStep : opts.peekWidth === 'shrink' ? -i * opts.peekWidthStep : 0
      const peekScale = Math.max(0.1, 1 + peekDelta)
      const transformParts: string[] = []
      if (scale !== 1) transformParts.push(`scale(${scale})`)
      if (peekScale !== 1) {
        transformParts.push(vertical ? `scaleX(${peekScale})` : `scaleY(${peekScale})`)
      }
      card.style.zIndex = String(n - i)
      card.style[posProp] = `${pos}px`
      card.style.transform = transformParts.join(' ')
      card.style.opacity = i < visibleCount ? '1' : '0'
      card.style.pointerEvents = i === 0 ? 'auto' : 'none'
      card.classList.toggle(opts.activeClass, i === 0)
    })
  }

  if (original.length > 0) {
    applyPositions()
  }

  function fire(
    hook: ((detail: StackifyChangeDetail) => void) | undefined,
    fromCard: HTMLElement,
    toCard: HTMLElement
  ): void {
    hook?.({
      fromIndex: original.indexOf(fromCard),
      toIndex: original.indexOf(toCard),
      fromCard,
      toCard,
    })
  }

  function rotate(newOrder: HTMLElement[]): void {
    if (destroyed || newOrder[0] === order[0]) {
      order = newOrder
      applyPositions()
      return
    }
    const fromCard = order[0]
    order = newOrder
    const toCard = order[0]
    fire(opts.onBeforeChange, fromCard, toCard)
    applyPositions()
    setTimeout(() => {
      if (!destroyed) fire(opts.onAfterChange, fromCard, toCard)
    }, opts.duration)
  }

  function next(): void {
    const [front, ...rest] = order
    rotate([...rest, front])
  }

  function prev(): void {
    const back = order[order.length - 1]
    rotate([back, ...order.slice(0, -1)])
  }

  function goTo(originalIndex: number): void {
    const target = original[originalIndex]
    if (!target) return
    const pos = order.indexOf(target)
    if (pos <= 0) return
    rotate([...order.slice(pos), ...order.slice(0, pos)])
  }

  function tick(): void {
    if (opts.direction === 'backward') prev()
    else next()
  }

  function play(): void {
    if (timer || opts.interval <= 0 || destroyed) return
    timer = setInterval(tick, opts.interval)
  }

  function pause(): void {
    if (timer) clearInterval(timer)
    timer = null
  }

  function restartIfPlaying(): void {
    if (timer) {
      pause()
      play()
    }
  }

  // --- pause on hover ---
  const onMouseEnter = () => {
    wasPlayingBeforeHover = timer !== null
    pause()
  }
  const onMouseLeave = () => {
    if (wasPlayingBeforeHover) play()
  }
  if (opts.pauseOnHover) {
    container.addEventListener('mouseenter', onMouseEnter)
    container.addEventListener('mouseleave', onMouseLeave)
  }

  // --- click to activate ---
  let justDragged = false
  const onClick = (e: MouseEvent) => {
    if (justDragged) return
    const clicked = original.find(card => card.contains(e.target as Node))
    if (!clicked) return
    const pos = order.indexOf(clicked)
    if (pos > 0) {
      goTo(original.indexOf(clicked))
      restartIfPlaying()
    }
  }
  if (opts.clickToActivate) {
    container.addEventListener('click', onClick)
  }

  // --- drag/swipe the front card ---
  function coord(e: PointerEvent): number {
    return vertical ? e.clientY : e.clientX
  }
  let dragStart = 0
  let dragging = false
  let wasPlayingBeforeDrag = false
  const onPointerDown = (e: PointerEvent) => {
    if (order[0] !== e.currentTarget && !order[0].contains(e.target as Node)) return
    dragging = true
    dragStart = coord(e)
    wasPlayingBeforeDrag = timer !== null
    pause()
    order[0].style.transition = 'none'
  }
  const onPointerMove = (e: PointerEvent) => {
    if (!dragging) return
    const d = coord(e) - dragStart
    order[0].style.transform = vertical ? `translateY(${d}px)` : `translateX(${d}px)`
  }
  const endDrag = (e: PointerEvent) => {
    if (!dragging) return
    dragging = false
    const d = coord(e) - dragStart
    order[0].style.transition = `${posProp} ${opts.duration}ms ${opts.easing}, transform ${opts.duration}ms ${opts.easing}, opacity ${opts.duration}ms ${opts.easing}`
    if (Math.abs(d) > DRAG_THRESHOLD_PX) {
      d < 0 ? next() : prev()
      justDragged = true
      setTimeout(() => {
        justDragged = false
      }, 0)
    } else {
      applyPositions()
    }
    if (wasPlayingBeforeDrag) play()
  }
  if (opts.draggable) {
    container.addEventListener('pointerdown', onPointerDown)
    container.addEventListener('pointermove', onPointerMove)
    container.addEventListener('pointerup', endDrag)
    container.addEventListener('pointercancel', endDrag)
  }

  // --- dynamic card detection ---
  const observer = new MutationObserver(mutations => {
    if (destroyed) return

    let changed = false

    for (const mutation of mutations) {
      if (mutation.type !== 'childList') continue

      for (const node of mutation.addedNodes) {
        if (node.nodeType !== 1) continue

        const card = node as HTMLElement

        if (original.includes(card)) continue

        original.push(card)
        order.push(card)
        setupCard(card)
        changed = true
      }

      for (const node of mutation.removedNodes) {
        if (node.nodeType !== 1) continue

        const card = node as HTMLElement

        const originalIndex = original.indexOf(card)
        if (originalIndex === -1) continue

        original.splice(originalIndex, 1)

        const orderIndex = order.indexOf(card)
        if (orderIndex !== -1) {
          order.splice(orderIndex, 1)
        }

        changed = true
      }
    }

    if (!changed) return

    visibleCount = Math.max(1, Math.min(opts.visibleCards, original.length))

    for (const card of order) {
      card.style.transition = 'none'
    }

    applyPositions()
    void container.offsetHeight

    for (const card of order) {
      card.style.transition = `${posProp} ${opts.duration}ms ${opts.easing}, transform ${opts.duration}ms ${opts.easing}, opacity ${opts.duration}ms ${opts.easing}`
    }

    applyPositions()

    if (!initialized && original.length > 0) {
      initialized = true

      if (opts.startIndex > 0) {
        goTo(opts.startIndex)
      }

      if (opts.autoplay) {
        play()
      }
    }
  })
  observer.observe(container, { childList: true, subtree: true })

  if (original.length > 0) {
    if (opts.startIndex > 0) goTo(opts.startIndex)
    if (opts.autoplay) play()
  }

  return {
    next() {
      next()
      restartIfPlaying()
    },
    prev() {
      prev()
      restartIfPlaying()
    },
    goTo(originalIndex) {
      goTo(originalIndex)
      restartIfPlaying()
    },
    play,
    pause,
    getActiveIndex() {
      return original.indexOf(order[0])
    },
    destroy() {
      destroyed = true
      pause()
      observer.disconnect()
      if (opts.pauseOnHover) {
        container.removeEventListener('mouseenter', onMouseEnter)
        container.removeEventListener('mouseleave', onMouseLeave)
      }
      if (opts.clickToActivate) container.removeEventListener('click', onClick)
      if (opts.draggable) {
        container.removeEventListener('pointerdown', onPointerDown)
        container.removeEventListener('pointermove', onPointerMove)
        container.removeEventListener('pointerup', endDrag)
        container.removeEventListener('pointercancel', endDrag)
      }
      container.classList.remove(opts.stackClass)
      clearDatasetOptions(container)
      container.style.cssText = containerRestore
      for (const card of original) {
        card.classList.remove(opts.cardClass, opts.activeClass)
        card.style.cssText = cardRestore.get(card) ?? ''
      }
    },
  }
}

function createMarqueeEngine(container: HTMLElement, opts: ResolvedOpts): Engine | null {
  const original = Array.from(container.children) as HTMLElement[]

  const gap = opts.offset
  const vertical = (opts.orientation ?? 'horizontal') === 'vertical'
  let destroyed = false

  let playing = false
  let rafId: number | null = null
  let offsetPx = 0
  let lastTs = 0
  let dragging = false
  let wasPlayingBeforeInterrupt = false

  const containerRestore = container.style.cssText
  const cardRestore = new Map<HTMLElement, string>(original.map(card => [card, card.style.cssText]))

  container.classList.add(opts.stackClass)
  applyDatasetOptions(container, opts)
  if (getComputedStyle(container).position === 'static') {
    container.style.position = 'relative'
  }
  container.style.overflow = 'hidden'
  container.style.display = 'flex'
  applySize(container, opts)

  const track = document.createElement('div')
  track.style.display = 'flex'
  track.style.flexDirection = vertical ? 'column' : 'row'
  track.style.gap = `${gap}px`
  track.style.willChange = 'transform'
  container.appendChild(track)

  let clones: HTMLElement[] = []

  function rebuildTrack(): void {
    // Clear track, re-add originals + clones
    track.innerHTML = ''
    clones = []
    for (const card of original) {
      card.classList.add(opts.cardClass)
      card.style.flexShrink = '0'
      track.appendChild(card)
    }
    const newClones = original.map(card => card.cloneNode(true) as HTMLElement)
    for (const clone of newClones) {
      clone.classList.add(opts.cardClass)
      clone.style.flexShrink = '0'
      track.appendChild(clone)
    }
    clones = newClones
  }

  if (original.length > 0) {
    rebuildTrack()
  }

  function cardSize(card: HTMLElement): number {
    return vertical ? card.offsetHeight : card.offsetWidth
  }

  function setWidth(): number {
    let w = 0
    for (const card of original) w += cardSize(card) + gap
    return w
  }

  function applyTransform(): void {
    track.style.transform = vertical ? `translateY(${-offsetPx}px)` : `translateX(${-offsetPx}px)`
  }

  function activeOriginalIndex(): number {
    let acc = 0
    for (let i = 0; i < original.length; i++) {
      const cw = cardSize(original[i]) + gap
      if (offsetPx < acc + cw / 2) return i
      acc += cw
    }
    return 0
  }

  function setActiveClass(): void {
    const idx = activeOriginalIndex()
    original.forEach((card, i) => card.classList.toggle(opts.activeClass, i === idx))
    clones.forEach((card, i) => card.classList.toggle(opts.activeClass, i === idx))
  }

  function fire(hook: ((detail: StackifyChangeDetail) => void) | undefined, fromIndex: number, toIndex: number): void {
    hook?.({
      fromIndex,
      toIndex,
      fromCard: original[fromIndex],
      toCard: original[toIndex],
    })
  }

  function frame(ts: number): void {
    if (!playing || destroyed || original.length === 0) return
    if (lastTs === 0) lastTs = ts
    const dt = (ts - lastTs) / 1000
    lastTs = ts
    const dir = opts.direction === 'backward' ? -1 : 1
    const w = setWidth()
    if (w > 0) {
      offsetPx = (((offsetPx + dir * opts.marqueeSpeed * dt) % w) + w) % w
    }
    applyTransform()
    rafId = requestAnimationFrame(frame)
  }

  function play(): void {
    if (playing || opts.marqueeSpeed <= 0 || destroyed) return
    playing = true
    lastTs = 0
    rafId = requestAnimationFrame(frame)
  }

  function pause(): void {
    playing = false
    if (rafId !== null) cancelAnimationFrame(rafId)
    rafId = null
  }

  function step(dir: 1 | -1): void {
    const fromIndex = activeOriginalIndex()
    const w = setWidth()
    if (w === 0) return
    const cardStep = cardSize(original[fromIndex]) + gap
    offsetPx = (((offsetPx + dir * cardStep) % w) + w) % w
    applyTransform()
    const toIndex = activeOriginalIndex()
    fire(opts.onBeforeChange, fromIndex, toIndex)
    setActiveClass()
    setTimeout(() => {
      if (!destroyed) fire(opts.onAfterChange, fromIndex, toIndex)
    }, opts.duration)
  }

  function goTo(originalIndex: number): void {
    const target = original[originalIndex]
    if (!target) return
    const fromIndex = activeOriginalIndex()
    let acc = 0
    for (let i = 0; i < originalIndex; i++) acc += cardSize(original[i]) + gap
    offsetPx = acc
    applyTransform()
    setActiveClass()
    fire(opts.onBeforeChange, fromIndex, originalIndex)
    setTimeout(() => {
      if (!destroyed) fire(opts.onAfterChange, fromIndex, originalIndex)
    }, opts.duration)
  }

  const onMouseEnter = () => {
    wasPlayingBeforeInterrupt = playing
    pause()
  }
  const onMouseLeave = () => {
    if (wasPlayingBeforeInterrupt) play()
  }
  if (opts.pauseOnHover) {
    container.addEventListener('mouseenter', onMouseEnter)
    container.addEventListener('mouseleave', onMouseLeave)
  }

  const onClick = (e: MouseEvent) => {
    const clicked = original.find(card => card.contains(e.target as Node))
    if (!clicked) return
    goTo(original.indexOf(clicked))
  }
  if (opts.clickToActivate) container.addEventListener('click', onClick)

  // --- drag/scrub the track ---
  function coord(e: PointerEvent): number {
    return vertical ? e.clientY : e.clientX
  }
  let dragStartCoord = 0
  let dragStartOffset = 0
  const onPointerDown = (e: PointerEvent) => {
    dragging = true
    dragStartCoord = coord(e)
    dragStartOffset = offsetPx
    wasPlayingBeforeInterrupt = playing
    pause()
  }
  const onPointerMove = (e: PointerEvent) => {
    if (!dragging) return
    const d = coord(e) - dragStartCoord
    const w = setWidth()
    if (w === 0) return
    offsetPx = (((dragStartOffset - d) % w) + w) % w
    applyTransform()
  }
  const endDrag = () => {
    if (!dragging) return
    dragging = false
    setActiveClass()
    if (wasPlayingBeforeInterrupt) play()
  }
  if (opts.draggable) {
    container.addEventListener('pointerdown', onPointerDown)
    container.addEventListener('pointermove', onPointerMove)
    container.addEventListener('pointerup', endDrag)
    container.addEventListener('pointercancel', endDrag)
  }

  // --- dynamic card detection ---
  const observer = new MutationObserver(mutations => {
    if (destroyed) return
    let changed = false
    for (const mutation of mutations) {
      if (mutation.type !== 'childList') continue
      for (const node of mutation.addedNodes) {
        if (node.nodeType === 1 && !original.includes(node as HTMLElement) && node !== track) {
          original.push(node as HTMLElement)
          changed = true
        }
      }
      for (const node of mutation.removedNodes) {
        if (node.nodeType === 1) {
          const idx = original.indexOf(node as HTMLElement)
          if (idx !== -1) {
            original.splice(idx, 1)
            changed = true
          }
        }
      }
    }
    if (changed && original.length > 0) {
      rebuildTrack()
      for (const card of [...original, ...clones]) {
        card.style.transition = 'none'
      }
      requestAnimationFrame(() => {
        setActiveClass()
        for (const card of [...original, ...clones]) {
          card.style.transition = `transform ${opts.duration}ms ${opts.easing}`
        }
      })
    }
  })
  observer.observe(container, { childList: true, subtree: true })

  if (original.length > 0) {
    if (opts.startIndex > 0) goTo(opts.startIndex)
    else setActiveClass()
    if (opts.autoplay) play()
  }

  return {
    next() {
      step(1)
    },
    prev() {
      step(-1)
    },
    goTo,
    play,
    pause,
    getActiveIndex() {
      return activeOriginalIndex()
    },
    destroy() {
      destroyed = true
      pause()
      observer.disconnect()
      if (opts.pauseOnHover) {
        container.removeEventListener('mouseenter', onMouseEnter)
        container.removeEventListener('mouseleave', onMouseLeave)
      }
      if (opts.clickToActivate) container.removeEventListener('click', onClick)
      if (opts.draggable) {
        container.removeEventListener('pointerdown', onPointerDown)
        container.removeEventListener('pointermove', onPointerMove)
        container.removeEventListener('pointerup', endDrag)
        container.removeEventListener('pointercancel', endDrag)
      }
      for (const clone of clones) clone.remove()
      container.classList.remove(opts.stackClass)
      clearDatasetOptions(container)
      container.style.cssText = containerRestore
      for (const card of original) {
        card.classList.remove(opts.cardClass, opts.activeClass)
        card.style.cssText = cardRestore.get(card) ?? ''
        container.appendChild(card)
      }
      track.remove()
    },
  }
}

/**
 * Parse data-* attributes from container element into StackifyOptions.
 * Supports: data-layout, data-orientation, data-offset, data-scale-step,
 * data-visible-cards, data-interval, data-duration, data-easing, data-direction,
 * data-peek-width, data-peek-width-step, data-marquee-speed, data-autoplay,
 * data-pause-on-hover, data-click-to-activate, data-draggable, data-start-index.
 */
function readDataOptions(container: HTMLElement): Partial<StackifyOptions> {
  const ds = container.dataset
  const opts: Partial<StackifyOptions> = {}

  if (ds.layout) opts.layout = ds.layout as 'stack' | 'marquee'
  if (ds.orientation) opts.orientation = ds.orientation as 'vertical' | 'horizontal'
  if (ds.offset !== undefined) opts.offset = Number(ds.offset)
  if (ds.scaleStep !== undefined) opts.scaleStep = Number(ds.scaleStep)
  if (ds.visibleCards !== undefined) opts.visibleCards = Number(ds.visibleCards)
  if (ds.interval !== undefined) opts.interval = Number(ds.interval)
  if (ds.duration !== undefined) opts.duration = Number(ds.duration)
  if (ds.easing) opts.easing = ds.easing
  if (ds.direction) opts.direction = ds.direction as 'forward' | 'backward'
  if (ds.peekWidth) opts.peekWidth = ds.peekWidth as 'expand' | 'shrink' | 'none'
  if (ds.peekWidthStep !== undefined) opts.peekWidthStep = Number(ds.peekWidthStep)
  if (ds.marqueeSpeed !== undefined) opts.marqueeSpeed = Number(ds.marqueeSpeed)
  if (ds.autoplay !== undefined) opts.autoplay = ds.autoplay === 'true'
  if (ds.pauseOnHover !== undefined) opts.pauseOnHover = ds.pauseOnHover === 'true'
  if (ds.clickToActivate !== undefined) opts.clickToActivate = ds.clickToActivate === 'true'
  if (ds.draggable !== undefined) opts.draggable = ds.draggable === 'true'
  if (ds.startIndex !== undefined) opts.startIndex = Number(ds.startIndex)

  return stripUndefined(opts)
}

/**
 * Turns a container's children into a peeking card stack — like a small
 * deck of index cards — that auto-cycles the front card to the back on a
 * timer, cycling through every card in turn.
 *
 * @param input - Selector, element(s), or jQuery collection for the
 * *stack container* (its children become the cards).
 * @param options - Optional {@link StackifyOptions}. If omitted, reads from
 * container's `data-*` attributes.
 * @returns A {@link StackifyInstance} — `destroy()` restores every card's
 * original styles; `next()`/`prev()`/`goTo()`/`play()`/`pause()` drive the
 * stack programmatically.
 *
 * @example
 * ```html
 * <div id="testimonials"
 *   data-layout="stack"
 *   data-offset="20"
 *   data-interval="4000"
 *   data-duration="500">
 * 	<div class="card">...</div>
 * 	<div class="card">...</div>
 * 	<div class="card">...</div>
 * </div>
 * ```
 * ```ts
 * import { stackify } from "blogr-plugins";
 *
 * // Read all options from data-* attributes
 * const stack = stackify("#testimonials");
 *
 * // Or override specific options
 * const stack2 = stackify("#other", { interval: 2000 });
 *
 * stack.next(); // advance manually
 * stack.destroy();
 * ```
 */
export function stackify(input: ElementInput, options?: StackifyOptions): StackifyInstance {
  const containers = resolveElements(input) as HTMLElement[]
  const engines = containers
    .map(container => {
      const dataOpts = readDataOptions(container)
      const merged = {
        ...defaults,
        ...dataOpts,
        ...stripUndefined(options || {}),
      }
      return createEngine(container, merged as ResolvedOpts)
    })
    .filter((engine): engine is Engine => engine !== null)

  return {
    next() {
      for (const engine of engines) engine.next()
    },
    prev() {
      for (const engine of engines) engine.prev()
    },
    goTo(originalIndex) {
      for (const engine of engines) engine.goTo(originalIndex)
    },
    play() {
      for (const engine of engines) engine.play()
    },
    pause() {
      for (const engine of engines) engine.pause()
    },
    getActiveIndex() {
      return engines.map(engine => engine.getActiveIndex())
    },
    destroy() {
      for (const engine of engines) engine.destroy()
    },
  }
}
