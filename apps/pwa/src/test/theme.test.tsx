import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../context/ThemeContext'

const TestThemeComponent = () => {
  const { theme, resolvedTheme, toggleTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved-theme">{resolvedTheme}</span>
      <button onClick={toggleTheme}>Alternar Tema</button>
    </div>
  )
}

describe('ThemeContext', () => {
  it('garantiza el modo oscuro Midnight Vault y aplica el atributo en HTML', () => {
    render(
      <ThemeProvider>
        <TestThemeComponent />
      </ThemeProvider>
    )

    const resolvedElem = screen.getByTestId('resolved-theme')
    expect(resolvedElem.textContent).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
