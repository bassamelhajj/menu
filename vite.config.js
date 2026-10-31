import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    // نستمع على كل الواجهات حتى يقدر التلفون يفتح الموقع من نفس الشبكة
    host: true,
    port: 5173,

    /**
     * ⚠️ لازم هالأسطر (من Vite 6 وفوق):
     * Vite بيحمي نفسه وبيمنع أي طلب بييجي من نطاق ما يعرفه، وبيرجّع 403.
     * لأنو احنا بنفتح الموقع عبر نفق (Tunnel) أو من IP الجهاز على الشبكة،
     * الـ Host بيكون مش localhost — فبدون هالإعداد بيظهر خطأ 403 للزبون.
     *
     * 'true' = اسمح لأي نطاق (مناسب لموقع ما عنده سيرفر خلفي).
     * لو بدك تضيّقها، حطّ الدومين تبعك مثل: ['my-site.pages.dev']
     */
    allowedHosts: true,
  },

  preview: {
    host: true,
    port: 4173,
    allowedHosts: true,
  },
})