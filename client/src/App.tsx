import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Home } from './components/Home';
import { ViewCode } from './components/ViewCode';


const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: "/view/:tag",
    element: <ViewCode />,
  }
]);

export const App = () => {
  return <RouterProvider router={router} />
}
