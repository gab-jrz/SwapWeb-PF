import { defineConfig } from 'cypress'
import { spawn } from 'child_process'
import http from 'http'
import path from 'path'
import codeCoverageTask from '@cypress/code-coverage/task'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: false,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 30000,
    retries: { runMode: 1, openMode: 0 },
    chromeWebSecurity: false,
    setupNodeEvents(on, config) {
      // Habilitar code coverage tasks
      codeCoverageTask(on, config)

      let serverProcess // backend
      let frontendProcess // vite dev

      const waitForServer = (url, { timeout = 60000, interval = 500 } = {}) => {
        const start = Date.now()
        return new Promise((resolve, reject) => {
          const check = () => {
            const req = http.get(url, (res) => {
              res.resume()
              resolve()
            })
            req.on('error', () => {
              if (Date.now() - start > timeout) return reject(new Error(`Timeout esperando ${url}`))
              setTimeout(check, interval)
            })
          }
          check()
        })
      }

      const startBackendIfNeeded = async () => {
        if (!serverProcess || serverProcess.killed) {
          console.log('[cypress] Iniciando backend de pruebas...')
          // Ejecutar backend con cwd apuntando a la carpeta backend para que dotenv encuentre backend/.env.test
          const backendCwd = path.join(config.projectRoot, '../backend')
          serverProcess = spawn('node', ['./src/index.js'], {
            env: { ...process.env, NODE_ENV: 'e2e', ENV_FILE: 'test', PORT: '3001' },
            stdio: 'inherit',
            shell: true,
            cwd: backendCwd,
          })
          serverProcess.on('exit', (code, signal) => console.log(`[cypress] backend salió code=${code} signal=${signal}`))
          serverProcess.on('error', (err) => console.error('[cypress] backend error', err))
        }
        await waitForServer('http://localhost:3001/api/health', { timeout: 60000 })
        console.log('[cypress] Backend listo en http://localhost:3001')
      }

      const stopBackend = () => {
        if (serverProcess && !serverProcess.killed) {
          try { console.log('[cypress] Deteniendo backend...'); serverProcess.kill('SIGTERM') } catch {}
        }
      }

      const startFrontendIfNeeded = async () => {
        if (!frontendProcess || frontendProcess.killed) {
          console.log('[cypress] Iniciando Vite dev server (binario local)...')
          // Usar el binario local de vite para evitar depender de PATH/npm wrapper
          const viteBin = './node_modules/vite/bin/vite.js'
          frontendProcess = spawn('node', [viteBin, '--port', '5173', '--strictPort', '--host'], {
            env: { ...process.env, BROWSER: 'none' },
            stdio: 'inherit',
            shell: true,
            cwd: config.projectRoot,
          })
          frontendProcess.on('exit', (code, signal) => console.log(`[cypress] frontend salió code=${code} signal=${signal}`))
          frontendProcess.on('error', (err) => console.error('[cypress] frontend error', err))
        }
        await waitForServer('http://localhost:5173', { timeout: 60000 })
        console.log('[cypress] Frontend listo en http://localhost:5173')
      }

      const stopFrontend = () => {
        if (frontendProcess && !frontendProcess.killed) {
          try { console.log('[cypress] Deteniendo frontend...'); frontendProcess.kill('SIGTERM') } catch {}
        }
      }

      on('before:run', async () => { await startFrontendIfNeeded(); await startBackendIfNeeded() })
      on('before:spec', async () => { await startFrontendIfNeeded(); stopBackend(); await startBackendIfNeeded() })
      on('after:spec', stopBackend)
      on('after:run', () => { stopBackend(); stopFrontend() })

      return config
    }
  },
})