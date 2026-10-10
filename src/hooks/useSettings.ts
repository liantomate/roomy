import { useEffect, useState } from "react";
import {
	type ThemeValues,
	type ResolvedThemeValues,
} from "../types/settingsTypes";
import settingsApp from "../apps/settingsApp";
import { createHookOperation } from "../types/responseTypes";

/**
 * Handles proper matching of system theme to light or dark theme
 *
 * @returns matching {@linkcode ResolvedThemeValues}
 */
function getSystemTheme(): ResolvedThemeValues {
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

type SettingsTheme = {
	preferredTheme: ThemeValues;
	actualTheme: ResolvedThemeValues;
};

/**
 * Returns settings-related actions and data
 *
 * @returns hooks operations {@linkcode HookOperation} for: theme
 */
function useSettings() {
	const [preferredTheme, setPreferredTheme] = useState<ThemeValues>(
		settingsApp.getTheme(),
	);
	const [resolvedTheme, setResolvedTheme] =
		useState<ResolvedThemeValues>(getSystemTheme());

	useEffect(() => {
		const media = window.matchMedia("(prefers-color-scheme: dark)");

		const handleThemeChange = (event: MediaQueryListEvent) => {
			setResolvedTheme(event.matches ? "dark" : "light");
		};

		media.addEventListener("change", handleThemeChange);

		return () => {
			media.removeEventListener("change", handleThemeChange);
		};
	}, []);

	const actualTheme =
		preferredTheme === "system" ? resolvedTheme : preferredTheme;

	return {
		theme: createHookOperation<SettingsTheme, [newTheme: ThemeValues]>(
			async (newTheme: ThemeValues) => {
				setPreferredTheme(newTheme);
				settingsApp.setTheme(newTheme);
			},
			false,
			null,
			{
				preferredTheme: preferredTheme,
				actualTheme: actualTheme,
			},
		),
	};
}

export default useSettings;
