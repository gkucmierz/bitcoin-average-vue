import { test, expect, vi, describe, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import App from './App.vue'

// Mock Home component
vi.mock('./components/Home.vue', () => {
  return {
    default: {
      template: '<div class="home-mock"></div>'
    }
  }
})

// Mock Trianglify since it's a 3rd party visual library
vi.mock('trianglify/dist/trianglify.bundle.js', () => {
  return {
    default: vi.fn(() => ({
      toSVG: vi.fn(() => {
        const svg = document.createElement('svg')
        svg.setAttribute('data-testid', 'mock-svg')
        return svg
      })
    }))
  }
})

import Trianglify from 'trianglify/dist/trianglify.bundle.js'

describe('App.vue', () => {
  let originalInnerWidth
  let originalInnerHeight

  beforeEach(() => {
    originalInnerWidth = window.innerWidth
    originalInnerHeight = window.innerHeight
    vi.clearAllMocks()
  })

  afterEach(() => {
    window.innerWidth = originalInnerWidth
    window.innerHeight = originalInnerHeight
  })

  test('renders background and calls Trianglify on mount', () => {
    const wrapper = mount(App)

    // Check background div is rendered
    const backgroundDiv = wrapper.find('.background')
    expect(backgroundDiv.exists()).toBe(true)

    // Check Trianglify was called and SVG appended
    expect(Trianglify).toHaveBeenCalledTimes(1)
    expect(backgroundDiv.element.children.length).toBe(1)
    expect(backgroundDiv.element.children[0].tagName.toLowerCase()).toBe('svg')
  })

  test('updates background on window resize when dimensions change by rounding step', async () => {
    // Spy on addEventListener so we can access the mock.calls
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    const wrapper = mount(App)

    // Initial call on mount
    expect(Trianglify).toHaveBeenCalledTimes(1)

    // Extract the resize handler
    const resizeCall = addEventListenerSpy.mock.calls.find(call => call[0] === 'resize')
    const handleResize = resizeCall[1]

    const mockEvent = {
      target: {
        innerWidth: 1400,
        innerHeight: 1000
      }
    }
    handleResize(mockEvent)

    // Should be called again due to resize
    expect(Trianglify).toHaveBeenCalledTimes(2)

    addEventListenerSpy.mockRestore()
  })

  test('does not update background if rounded dimensions are same', async () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    const wrapper = mount(App)

    // Initial call on mount
    expect(Trianglify).toHaveBeenCalledTimes(1)

    // Inner width / height are initially 1024x768 (jsdom defaults)
    // Rounding step is 200, so width=1200, height=800

    const resizeCall = addEventListenerSpy.mock.calls.find(call => call[0] === 'resize')
    const handleResize = resizeCall[1]

    // Resize to something that rounds to same dimensions
    const mockEvent = {
      target: {
        innerWidth: 1001,
        innerHeight: 799
      }
    }
    handleResize(mockEvent)

    // Should NOT be called again
    expect(Trianglify).toHaveBeenCalledTimes(1)

    addEventListenerSpy.mockRestore()
  })

  test('removes event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    const wrapper = mount(App)

    wrapper.unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
  })
})
