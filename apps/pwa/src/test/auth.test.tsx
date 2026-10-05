import { describe, expect, it, beforeEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react'
import { App } from '../App'
import { generateSalt, hashPassword } from '../utils/crypto'
import { getStoredUsers } from '../services/authService'

describe('Autenticación y Perfiles Universitarios (Opción A)', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.pushState({}, '', '/')
    document.documentElement.lang = 'es'
  })

  it('criptografía: genera salt aleatorio y realiza hash SHA-256 seguro y determinista', async () => {
    const salt1 = generateSalt()
    const salt2 = generateSalt()
    expect(salt1).not.toBe(salt2)
    expect(salt1.length).toBeGreaterThan(10)

    const hashA = await hashPassword('miContraseñaSecreta', salt1)
    const hashB = await hashPassword('miContraseñaSecreta', salt1)
    const hashDiff = await hashPassword('miContraseñaSecreta', salt2)

    expect(hashA).toBe(hashB)
    expect(hashA).not.toBe(hashDiff)
  })

  it('redirige a la página de login si el usuario no tiene una sesión activa', async () => {
    await act(async () => {
      render(<App />)
    })

    // Debe mostrar elementos distintivos de la pantalla de Login y Proyecto Universitario
    expect(screen.getByText(/Proyecto Académico Universitario/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Entrar como Evaluador Demo/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Entrar a la Plataforma/i })).toBeInTheDocument()
  })

  it('permite acceso 1-clic inmediato a Evaluadores Académicos con datos precargados', async () => {
    await act(async () => {
      render(<App />)
    })

    const demoBtn = screen.getByRole('button', { name: /Entrar como Evaluador Demo/i })
    expect(demoBtn).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(demoBtn)
    })

    // Al autenticarse, debe redirigir al Dashboard y mostrar el nombre o rol del Evaluador
    await waitFor(() => {
      expect(screen.getByText(/Saldo Total Neto/i)).toBeInTheDocument()
    })

    // Debe mostrar el perfil en el Sidebar
    expect(screen.getByText(/Prof. Evaluador Académico/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Evaluador Académico/i).length).toBeGreaterThan(0)
  })

  it('permite registrar una cuenta nueva con contraseña cifrada y nombre de universidad', async () => {
    await act(async () => {
      render(<App />)
    })

    // Cambiar a pestaña Registrarse
    const registerTab = screen.getByRole('button', { name: /Registrarse/i })
    await act(async () => {
      fireEvent.click(registerTab)
    })

    const nameInput = screen.getByLabelText(/Nombre Completo/i)
    const emailInput = screen.getByLabelText(/Correo Electrónico/i)
    const passInput = screen.getByLabelText(/^Contraseña/i, { selector: 'input' })
    const uniInput = screen.getByLabelText(/Universidad \/ Facultad/i)
    const submitBtn = screen.getByRole('button', { name: /Registrarme y Entrar/i })

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Laura Martínez' } })
      fireEvent.change(emailInput, { target: { value: 'laura@universidad.edu' } })
      fireEvent.change(passInput, { target: { value: 'segura123' } })
      fireEvent.change(uniInput, { target: { value: 'Universidad de los Andes' } })
      fireEvent.click(submitBtn)
    })

    // Debe haber ingresado a la app con la nueva cuenta
    await waitFor(() => {
      expect(screen.getByText(/Saldo Total Neto/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/Laura Martínez/i)).toBeInTheDocument()

    // El perfil nuevo debe aparecer completamente en cero sin movimientos precargados
    expect(screen.getByText(/Aún no tienes movimientos registrados en tu gestor/i)).toBeInTheDocument()
    const zeroBalances = screen.getAllByText(/\$ 0/i)
    expect(zeroBalances.length).toBeGreaterThan(0)

    // Comprobar que en localStorage la contraseña esté hasheada con salt y no en texto plano
    const stored = getStoredUsers()
    const found = stored.find((u) => u.email === 'laura@universidad.edu')
    expect(found).toBeDefined()
    expect(found?.passwordHash).toBeDefined()
    expect(found?.passwordHash).not.toBe('segura123')
    expect(found?.salt).toBeDefined()
  })

  it('muestra mensaje de error cuando las credenciales de inicio de sesión son incorrectas', async () => {
    await act(async () => {
      render(<App />)
    })

    const emailInput = screen.getByLabelText(/Correo Electrónico/i)
    const passInput = screen.getByLabelText(/^Contraseña/i, { selector: 'input' })
    const submitBtn = screen.getByRole('button', { name: /Entrar a la Plataforma/i })

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'desconocido@universidad.edu' } })
      fireEvent.change(passInput, { target: { value: 'erronea123' } })
      fireEvent.click(submitBtn)
    })

    await waitFor(() => {
      expect(
        screen.getByText(/El correo electrónico o la contraseña ingresada son incorrectos/i)
      ).toBeInTheDocument()
    })
  })

  it('permite cerrar sesión y redirige nuevamente al login', async () => {
    // Iniciar como demo evaluador
    await act(async () => {
      render(<App />)
    })

    const demoBtn = screen.getByRole('button', { name: /Entrar como Evaluador Demo/i })
    await act(async () => {
      fireEvent.click(demoBtn)
    })

    await waitFor(() => {
      expect(screen.getByText(/Saldo Total Neto/i)).toBeInTheDocument()
    })

    // Hacer clic en Cerrar Sesión
    const logoutButtons = screen.getAllByRole('button', { name: /Cerrar Sesión/i })
    expect(logoutButtons.length).toBeGreaterThan(0)

    await act(async () => {
      fireEvent.click(logoutButtons[0])
    })

    // Debe regresar a la página de login
    await waitFor(() => {
      expect(screen.getByText(/Proyecto Académico Universitario/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Entrar como Evaluador Demo/i })).toBeInTheDocument()
    })
  })

  it('aislamiento completo: evaluador demo ve datos precargados y nuevo perfil creado comienza en cero', async () => {
    // 1. Ingresar como Evaluador Demo
    await act(async () => {
      render(<App />)
    })

    const demoBtn = screen.getByRole('button', { name: /Entrar como Evaluador Demo/i })
    await act(async () => {
      fireEvent.click(demoBtn)
    })

    await waitFor(() => {
      expect(screen.getByText(/Saldo Total Neto/i)).toBeInTheDocument()
    })

    // El evaluador demo ve saldo precargado (no $0)
    expect(screen.queryByText(/Aún no tienes movimientos registrados en tu gestor/i)).not.toBeInTheDocument()

    // 2. Cerrar sesión
    const logoutBtn = screen.getAllByRole('button', { name: /Cerrar Sesión/i })[0]
    await act(async () => {
      fireEvent.click(logoutBtn)
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Registrarse/i })).toBeInTheDocument()
    })

    // 3. Registrar un perfil totalmente nuevo
    const regTab = screen.getByRole('button', { name: /Registrarse/i })
    await act(async () => {
      fireEvent.click(regTab)
    })

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Nombre Completo/i), { target: { value: 'Mateo Morales' } })
      fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'mateo@universidad.edu' } })
      fireEvent.change(screen.getByLabelText(/^Contraseña/i, { selector: 'input' }), { target: { value: 'mateoPass1' } })
      fireEvent.change(screen.getByLabelText(/Universidad \/ Facultad/i), { target: { value: 'Ingeniería' } })
      fireEvent.click(screen.getByRole('button', { name: /Registrarme y Entrar/i }))
    })

    // 4. El nuevo perfil debe estar completamente en CERO
    await waitFor(() => {
      expect(screen.getByText(/Mateo Morales/i)).toBeInTheDocument()
    })

    // Mensaje de movimientos vacíos
    expect(screen.getByText(/Aún no tienes movimientos registrados en tu gestor/i)).toBeInTheDocument()
    // Saldos en cero
    const zeroBalances = screen.getAllByText(/\$ 0/i)
    expect(zeroBalances.length).toBeGreaterThan(0)
  })
})

