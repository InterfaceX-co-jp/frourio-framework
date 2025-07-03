import '@/styles/globals.css'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Fragment, type FC } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

type NextPageWithLayout = NextPage & {
  title?: string
  Layout?: FC
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const title = Component.title ?? ''
  const Layout = Component.Layout || Fragment

  return (
    <>
      <Head>
        <title>{title ? `${title} | frourio-framework` : `frourio-framework`}</title>
      </Head>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  )
}
