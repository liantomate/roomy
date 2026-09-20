import { createBrowserRouter } from "react-router";
import LandingPage from "../pages/landing/LandingPage";
import NotFoundPage from "../pages/NotFoundPage";
import SignupPage from "../pages/signup/SignupPage";
import MainPage from "../pages/main/MainPage";

export const Links = {
	LANDING_PAGE: "/",
	SIGNUP_PAGE: "/signup",
	MAIN_PAGE: "/index",
};

export const routes = createBrowserRouter([
	{
		path: Links.LANDING_PAGE,
		element: <LandingPage />,
		errorElement: <NotFoundPage />,
	},
	{
		path: Links.SIGNUP_PAGE,
		element: <SignupPage />,
	},
	{
		path: Links.MAIN_PAGE,
		element: <MainPage />,
	},
]);
