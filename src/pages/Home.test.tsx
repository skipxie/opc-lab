import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'

import Home from '@/pages/Home'

test('renders hero heading', () => {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  )

  expect(screen.getByRole('heading', { name: /从目标到行动清单/ })).toBeInTheDocument()
})
