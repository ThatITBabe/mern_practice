import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'


import Username from './components/Username'
import Profile from './components/Profile'
import Password from './components/Password'
import Register from './components/Register'
import Recovery from './components/Recovery'
import Reset from './components/Reset'
import PageNotFound from './components/PageNotFound'


const router = createBrowserRouter([
  {
    path: '/',
    element: <Username/>
  },
  {
    path: '/register',
    element: <Register/>
  },
  {
    path: '/profile',
    element: <Profile/>
  },
  {
    path: '/password',
    element: <Password/>
  },
  {
    path: '/recovery',
    element: <Recovery/>
  },
  {
    path: '/reset',
    element: <Reset/>
  },
  {
    path: '*',
    element: <PageNotFound/>
  },
])
const App = () => {
  return (
    <main>
        <RouterProvider router={router}>

        </RouterProvider>
    </main>
  )
}

export default App