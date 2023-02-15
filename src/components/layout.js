import React from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import styled from '@emotion/styled'

import SiteHeader from './site-header'
import SiteFooter from './site-footer'

import '../styles/global.css'

const Layout = (props) => {
  const { className, children } = props
  return (
    <>
      <div className="siteContainer">
        <Helmet>
          <title>george.czabania</title>
        </Helmet>

        <SiteHeader siteTitle="george.czabania" />

        <div className="siteContent">
          <main className={className}>{children}</main>
        </div>

        <SiteFooter />
      </div>
    </>
  )
}

Layout.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
}

export default Layout
