import { createBrowserRouter, Navigate, Outlet } from "react-router";
// import NotFoundPage from "../pages/NotFoundPage";
import { useAuth } from "../hooks/useAuth";
import SplashPage from "../pages/SplashPage";
import LandingPage from "../pages/landing/LandingPage";
import MainPage from "../pages/main/MainPage";
import SignupPage from "../pages/signup/SignupPage";

export const Paths = {
	login: "/login",
	signup: "/signup",
	main: "/app",
};

function RootPage() {
	const { init } = useAuth();

	if (init.state.status === "loading") return <SplashPage />;

	return <Outlet />;
}

function PublicRoute() {
	const { init } = useAuth();

	if (init.state.data) return <Navigate to={Paths.main} replace />;

	return <Outlet />;
}

function AuthRoute() {
	const { init } = useAuth();

	if (!init.state.data) return <Navigate to={Paths.login} replace />;

	return <Outlet />;
}

function FallbackRoute() {
	const { init } = useAuth();

	return init.state.data ? (
		<Navigate to={Paths.main} replace />
	) : (
		<Navigate to={Paths.login} replace />
	);
}

export const routes = createBrowserRouter([
	{
		Component: RootPage,
		// errorElement: <NotFoundPage />,
		children: [
			{
				element: <PublicRoute />,
				children: [
					{
						path: Paths.login,
						element: <LandingPage />,
					},
					{
						path: Paths.signup,
						element: <SignupPage />,
					},
				],
			},
			{
				element: <AuthRoute />,
				children: [
					{
						path: Paths.main,
						element: <MainPage />,
					},
				],
			},
			{
				path: "*",
				element: <FallbackRoute />,
			},
		],
	},
]);
