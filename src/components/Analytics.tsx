import { useEffect } from 'react'

/**
 * Loads Google Tag Manager and Microsoft Clarity when env vars are set.
 */
export default function Analytics() {
  useEffect(() => {
    const gtmId = import.meta.env.VITE_GTM_ID
    const clarityId = import.meta.env.VITE_CLARITY_ID

    if (gtmId) {
      const script = document.createElement('script')
      script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`
      document.head.appendChild(script)
    }

    if (clarityId) {
      const script = document.createElement('script')
      script.innerHTML = `(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window,document,"clarity","script","${clarityId}");`
      document.head.appendChild(script)
    }
  }, [])

  return null
}
