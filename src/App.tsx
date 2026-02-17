import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { lazy, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import ErrorComp from "./components/common/ErrorComp";
import LoadingPage from "./components/common/LoadingPage";
import Layout from "./components/common/Layout";

const BigScoreOnePages = lazy(() => import('./pages/BigScoreOnePages'));
const BigScoreMultiPages = lazy(() => import('./pages/BigScoreMultiPages'));

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "/",
                element: <BigScoreOnePages />,
            },
            {
                path: "/multi",
                element: <BigScoreMultiPages />,
            },
        ]
    }
]);

function App() {
    return (
        <>
            <HelmetProvider>
                <ErrorBoundary fallback={<ErrorComp />}>
                    <Suspense fallback={<LoadingPage />}>
                        <RouterProvider router={router} />
                    </Suspense>
                </ErrorBoundary>
            </HelmetProvider>
        </>
    )
}

export default App
