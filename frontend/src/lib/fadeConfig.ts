export const APP_FADE_DURATION_MS = 250;
export const APP_FADE_CSS_VAR = "--app-fade-duration";

export const applyFadeDurationCssVar = () => {
	document.documentElement.style.setProperty(APP_FADE_CSS_VAR, `${APP_FADE_DURATION_MS}ms`);
};
