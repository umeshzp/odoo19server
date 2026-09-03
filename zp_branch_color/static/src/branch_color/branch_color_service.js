import { browser } from "@web/core/browser/browser";
import { cookie } from "@web/core/browser/cookie";
import { registry } from "@web/core/registry";
import { user, userBus } from "@web/core/user";

/**
 * Paints the main menu (navbar) with the colour of the branch being worked in.
 *
 * The colour comes from the session (see ir.http.session_info), so it is known
 * before the first frame. Everything is driven by CSS custom properties set on
 * <html>, which keeps the styling in the stylesheet and this file about *which*
 * colours apply.
 */

const CLASS_NAME = "zp_branch_color";

// Foregrounds for the bar. Dark text is only ever picked for a background
// light enough to make white unreadable.
const LIGHT_TEXT = "#ffffff";
const DARK_TEXT = "#1a1a1a";

// In dark mode the rest of the interface is dark, so a fully saturated branch
// colour glares. Mixing it towards the dark surface keeps the branch
// recognisable while letting the bar sit in the theme.
const DARK_SURFACE = [26, 31, 39];
const DARK_MIX = 0.25;

// The bar is a diagonal gradient rather than a flat fill: the branch colour is
// the light end and a darkened version of it opens the bar on the left, e.g.
// #44CCE7 gives linear-gradient(45deg, #226674, #44CCE7).
const GRADIENT_ANGLE = "45deg";
const GRADIENT_SHADE = 0.5;

// Hover/active states are overlays on the branch colour rather than fixed
// greys, so they stay subtle whatever colour a branch picked.
const OVERLAY_ON_DARK = "rgba(255, 255, 255, 0.14)";
const OVERLAY_ON_DARK_STRONG = "rgba(255, 255, 255, 0.22)";
const OVERLAY_ON_LIGHT = "rgba(0, 0, 0, 0.10)";
const OVERLAY_ON_LIGHT_STRONG = "rgba(0, 0, 0, 0.16)";

function parseHexColor(color) {
    if (typeof color !== "string") {
        return null;
    }
    const hex = color.trim().replace(/^#/, "");
    const full =
        hex.length === 3
            ? hex
                  .split("")
                  .map((c) => c + c)
                  .join("")
            : hex;
    if (!/^[0-9a-fA-F]{6}$/.test(full)) {
        return null;
    }
    return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
}

function toHex(rgb) {
    return "#" + rgb.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("");
}

/**
 * Relative luminance, per WCAG. Used to choose between the two foregrounds and
 * between a light and a dark overlay, so no branch colour ends up unreadable.
 */
function luminance([r, g, b]) {
    const [rs, gs, bs] = [r, g, b].map((channel) => {
        const c = channel / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function mix(from, to, ratio) {
    return from.map((channel, i) => channel + (to[i] - channel) * ratio);
}

function shade(rgb, ratio) {
    return mix(rgb, [0, 0, 0], ratio);
}

/**
 * The colour scheme the backend assets were built for. Odoo stores the resolved
 * scheme in a cookie and reloads the page when it changes, so reading it here
 * is enough - no need to watch for a switch.
 */
export function isDarkMode() {
    const scheme = cookie.get("color_scheme");
    if (scheme) {
        return scheme === "dark";
    }
    return browser.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyBranchColor(company = user.activeCompany) {
    const root = document.documentElement;
    const configured = parseHexColor(company?.navbar_color);
    if (!configured) {
        // No usable colour: leave Odoo's own navbar styling alone.
        root.classList.remove(CLASS_NAME);
        return;
    }

    const light = isDarkMode() ? mix(configured, DARK_SURFACE, DARK_MIX) : configured;
    const dark = shade(light, GRADIENT_SHADE);
    // Contrast is decided on the middle of the gradient: that is what most of
    // the navbar content actually sits on.
    const background = mix(dark, light, 0.5);
    const isLightBackground = luminance(background) > 0.45;
    const text = isLightBackground ? DARK_TEXT : LIGHT_TEXT;

    root.style.setProperty("--zpBranchColor", toHex(background));
    root.style.setProperty(
        "--zpBranchColorGradient",
        `linear-gradient(${GRADIENT_ANGLE}, ${toHex(dark)}, ${toHex(light)})`
    );
    // The border reads as a shadow under the bar rather than a second colour.
    root.style.setProperty("--zpBranchColorShade", toHex(shade(dark, 0.15)));
    root.style.setProperty("--zpBranchColorText", text);
    root.style.setProperty(
        "--zpBranchColorHover",
        isLightBackground ? OVERLAY_ON_LIGHT : OVERLAY_ON_DARK
    );
    root.style.setProperty(
        "--zpBranchColorActive",
        isLightBackground ? OVERLAY_ON_LIGHT_STRONG : OVERLAY_ON_DARK_STRONG
    );
    root.classList.add(CLASS_NAME);
}

export const branchColorService = {
    start() {
        applyBranchColor();
        // Switching branch does not reload the page, so follow the switch.
        userBus.addEventListener("ACTIVE_COMPANIES_CHANGED", () => applyBranchColor());
    },
};

registry.category("services").add("zp_branch_color", branchColorService);
