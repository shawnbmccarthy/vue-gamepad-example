import { shallowMount } from '@vue/test-utils'
import GamepadComponent from '@/components/gamepad/GamepadComponent.vue'

describe('GamepadComponent.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message'
    const wrapper = shallowMount(GamepadComponent, {
      props: { msg }
    })
    expect(wrapper.text()).toMatch(msg)
  })
})
