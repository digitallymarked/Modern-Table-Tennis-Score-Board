import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap'

// Deploy at digitallymarked.com/ttscore – change to '/' if using a subdomain (e.g. ttscore.digitallymarked.com)
const base = '/ttscore/';

export default defineConfig(({ command }) => {
    if (command === 'serve') { // dev
        return {
            base,
            plugins: [
                react()
            ],
            build: {
                sourcemap: false,
            }
        }
    } else {
        // command === 'build'

        const dynamicRoutes = [
            "/",
            "/multi"
        ]
        
        return {
            base,
            plugins: [
                Sitemap({ hostname: 'https://digitallymarked.com', dynamicRoutes: dynamicRoutes.map(p => base.replace(/\/$/, '') + p) }),
                react(),
                VitePWA({
                    registerType: 'autoUpdate',
                    includeAssets: ['favicon.ico'],
                    manifest: {
                        name: 'Modern Table Tennis Score Board',
                        short_name: 'TT Score Board',
                        description: 'Nice Modern Table Tennis Score Board',
                        theme_color: '#ffffff',
                        start_url: base,
                        icons: [
                        {
                            src: `${base}favicon.ico`,
                            sizes: '192x192',
                            type: 'image/x-icon'
                        },
                        {
                            src: `${base}favicon.ico`,
                            sizes: '512x512',
                            type: 'image/x-icon'
                        }
                        ]
                    }
                })
            ],
            esbuild: {
                drop: ['console', 'debugger'],
            },
            build: {
                sourcemap: false,
            }
        }
    }
})

