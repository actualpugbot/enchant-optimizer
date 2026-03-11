const ENCHANTMENT_LIMIT_INCLUSIVE = 10;

let worker;
let enchants_list;
let itemDropdownElements = null;
let solutionPanelAnimation = null;
let isSolutionPanelExiting = false;
let finalPreviewAnimation = null;
let isFinalPreviewExiting = false;
let itemSelectorIdleTimer = null;
let itemSelectorIdleAnimations = [];
let itemSelectorIdleRunToken = 0;
let itemSelectorIdleCurrentIndex = 0;
let pugsChoiceCascadeTimer = null;
let pugsChoiceCascadeRunToken = 0;
let pugsChoiceCascadeCalculationCallback = null;

const ITEM_ICON_VARIANTS = {
    sword: {
        base: "./images/sword_netherite.png",
        enchanted: "./images/sword_netherite_enchanted.gif",
    },
    axe: {
        base: "./images/axe_netherite.png",
        enchanted: "./images/axe_netherite_enchanted.gif",
    },
    pickaxe: {
        base: "./images/pickaxe_netherite.png",
        enchanted: "./images/pickaxe_netherite_enchanted.gif",
    },
    shovel: {
        base: "./images/shovel_netherite.png",
        enchanted: "./images/shovel_netherite_enchanted.gif",
    },
    hoe: {
        base: "./images/hoe_netherite.png",
        enchanted: "./images/hoe_netherite_enchanted.gif",
    },
    helmet: {
        base: "./images/helmet_netherite_unenchanted_3d.png",
        enchanted: "./images/helmet_netherite_enchanted.gif",
    },
    chestplate: {
        base: "./images/chestplate_netherite_unenchanted_3d.png",
        enchanted: "./images/chestplate_netherite_enchanted.gif",
    },
    leggings: {
        base: "./images/leggings_netherite_unenchanted_3d.png",
        enchanted: "./images/leggings_netherite_enchanted.gif",
    },
    boots: {
        base: "./images/boots_netherite_unenchanted_3d.png",
        enchanted: "./images/boots_netherite_enchanted.gif",
    },
    turtle_shell: {
        base: "./images/turtle_shell.gif",
        enchanted: "./images/turtle_shell_enchanted.gif",
    },
    elytra: {
        base: "./images/elytra.gif",
        enchanted: "./images/elytra_enchanted.gif",
    },
    mace: {
        base: "./images/mace.gif",
        enchanted: "./images/mace_enchanted.gif",
    },
    spear: {
        base: "./images/spear_netherite.png",
        enchanted: "./images/spear_netherite_enchanted.gif",
    },
    trident: {
        base: "./images/trident.gif",
        enchanted: "./images/trident_enchanted.gif",
    },
    bow: {
        base: "./images/bow.gif",
        enchanted: "./images/bow_enchanted.gif",
    },
    crossbow: {
        base: "./images/crossbow.gif",
        enchanted: "./images/crossbow_enchanted.gif",
    },
    shield: {
        base: "./images/shield.gif",
        enchanted: "./images/shield_enchanted.gif",
    },
    fishing_rod: {
        base: "./images/fishing_rod.gif",
        enchanted: "./images/fishing_rod_enchanted.gif",
    },
    shears: {
        base: "./images/shears.gif",
        enchanted: "./images/shears_enchanted.gif",
    },
    flint_and_steel: {
        base: "./images/flint_and_steel.gif",
        enchanted: "./images/flint_and_steel.gif",
    },
    carrot_on_a_stick: {
        base: "./images/carrot_on_a_stick.gif",
        enchanted: "./images/carrot_on_a_stick_enchanted.gif",
    },
    warped_fungus_on_a_stick: {
        base: "./images/warped_fungus_on_a_stick.gif",
    },
    pumpkin: {
        base: "./images/pumpkin.gif",
    },
    brush: {
        base: "./images/brush.gif",
    },
    book: {
        base: "./images/book.gif",
        enchanted: "./images/book_enchanted.gif",
    },
};

const ITEM_DROPDOWN_GROUPS = [
    {
        id: "armor",
        label: "Armor",
        items: ["helmet", "chestplate", "leggings", "boots", "turtle_shell", "elytra"],
    },
    {
        id: "melee",
        label: "Melee",
        items: ["sword", "axe", "mace", "spear"],
    },
    {
        id: "ranged",
        label: "Ranged",
        items: ["trident", "bow", "crossbow"],
    },
    {
        id: "tools",
        label: "Tools",
        items: ["pickaxe", "shovel", "hoe", "shield", "brush"],
    },
    {
        id: "utility",
        label: "Utility",
        items: ["fishing_rod", "shears", "flint_and_steel", "carrot_on_a_stick", "warped_fungus_on_a_stick", "pumpkin"],
    },
];

const ITEM_DROPDOWN_GROUP_MAP = ITEM_DROPDOWN_GROUPS.reduce((lookup, group) => {
    group.items.forEach(item_namespace => {
        lookup[item_namespace] = group.id;
    });
    return lookup;
}, {});
const DEFAULT_PREVIEW_ITEM_NAMESPACE = data.items[0] || "sword";
const ITEM_SELECTOR_IDLE_ITEM_NAMESPACES = Array.from(new Set(data.items));
const ITEM_SELECTOR_IDLE_PAUSE_MS = 1500;
const ITEM_SELECTOR_IDLE_TRANSITION_MS = 460;
const ITEM_SELECTOR_IDLE_TRANSITION_DISTANCE_PX = 58;
const ITEM_SELECTOR_IDLE_TRANSITION_EASING = "cubic-bezier(0.42, 0, 0.22, 1)";
const PUGS_CHOICE_CASCADE_STEP_MS = 110;

const PUGS_CHOICE_ENCHANTMENTS = {
    helmet: [
        ["protection", 4],
        ["aqua_affinity", 1],
        ["mending", 1],
        ["respiration", 3],
        ["unbreaking", 3],
    ],
    chestplate: [
        ["protection", 4],
        ["mending", 1],
        ["unbreaking", 3],
    ],
    leggings: [
        ["protection", 4],
        ["mending", 1],
        ["swift_sneak", 3],
        ["unbreaking", 3],
    ],
    boots: [
        ["protection", 4],
        ["depth_strider", 3],
        ["feather_falling", 4],
        ["mending", 1],
        ["soul_speed", 3],
        ["unbreaking", 3],
    ],
    turtle_shell: [
        ["protection", 4],
        ["aqua_affinity", 1],
        ["mending", 1],
        ["respiration", 3],
        ["unbreaking", 3],
    ],
    elytra: [
        ["mending", 1],
        ["unbreaking", 3],
    ],
    sword: [
        ["sharpness", 5],
        ["knockback", 2],
        ["looting", 3],
        ["mending", 1],
        ["sweeping", 3],
        ["unbreaking", 3],
    ],
    axe: [
        ["smite", 5],
        ["efficiency", 5],
        ["silk_touch", 1],
        ["mending", 1],
        ["unbreaking", 3],
    ],
    trident: [
        ["channeling", 1],
        ["loyalty", 3],
        ["mending", 1],
        ["unbreaking", 3],
    ],
    bow: [
        ["infinity", 1],
        ["power", 5],
        ["punch", 2],
        ["unbreaking", 3],
    ],
    pickaxe: [
        ["efficiency", 5],
        ["silk_touch", 1],
        ["mending", 1],
        ["unbreaking", 3],
    ],
    shovel: [
        ["efficiency", 5],
        ["silk_touch", 1],
        ["mending", 1],
        ["unbreaking", 3],
    ],
    hoe: [
        ["efficiency", 5],
        ["silk_touch", 1],
        ["mending", 1],
        ["unbreaking", 3],
    ],
    shield: [
        ["mending", 1],
        ["unbreaking", 3],
    ],
    brush: [
        ["mending", 1],
        ["unbreaking", 3],
    ],
    fishing_rod: [
        ["luck_of_the_sea", 3],
        ["lure", 3],
        ["mending", 1],
        ["unbreaking", 3],
    ],
    shears: [
        ["efficiency", 5],
        ["mending", 1],
        ["unbreaking", 3],
    ],
    flint_and_steel: [
        ["mending", 1],
        ["unbreaking", 3],
    ],
    pumpkin: [
        ["binding_curse", 1],
    ],
};

const ENGLISH_STRINGS = {
    choose_an_item_to_enchant: "Choose an item to enchant",
    item_groups: {
        armor: "Armor",
        melee: "Melee",
        ranged: "Ranged",
        tools: "Tools",
        utility: "Utility",
        ungrouped: "Other",
    },
    optimal_solution_cumulative_levels: "Optimal solution found (by lowest cumulative levels)!",
    optimal_solution_prior_work: "Optimal solution found (by lowest prior work)!",
    total_cost: "Total cost: ",
    completed_in: "Completed in ",
    microseconds: " microseconds",
    millisecond: " millisecond",
    millisecond_s: " milliseconds",
    second: " second",
    second_s: " seconds",
    level: " level",
    level_s: " levels",
    xp: " xp",
    steps: " Steps:",
    cost: "Cost: ",
    prior_work_penalty: "Prior Work Penalty: ",
    no_solution_found: "No solution found!",
    too_many_enchantments: "Too many enchantments!",
    more_than: " More than ",
    enchantments_are_not_recommended: " enchantments are not recommended.",
    please_select_enchantments: " Please deselect some enchantments or check the override near the bottom of the page.",
    apply_pugs_choice: "Apply Pug's Choice enchantments",
    pugs_choice_not_available: "Pug's Choice enchantments are not available for this item",
    items: {
        helmet: "Helmet",
        chestplate: "Chestplate",
        leggings: "Leggings",
        boots: "Boots",
        turtle_shell: "Turtle Shell",
        elytra: "Elytra",
        sword: "Sword",
        axe: "Axe",
        mace: "Mace",
        spear: "Spear",
        trident: "Trident",
        bow: "Bow",
        crossbow: "Crossbow",
        pickaxe: "Pickaxe",
        shovel: "Shovel",
        hoe: "Hoe",
        shield: "Shield",
        brush: "Brush",
        fishing_rod: "Fishing Rod",
        shears: "Shears",
        flint_and_steel: "Flint and Steel",
        carrot_on_a_stick: "Carrot on a Stick",
        warped_fungus_on_a_stick: "Warped Fungus on a Stick",
        pumpkin: "Carved Pumpkin",
        book: "Book",
    },
    enchants: {
        protection: "Protection",
        aqua_affinity: "Aqua Affinity",
        bane_of_arthropods: "Bane of Arthropods",
        blast_protection: "Blast Protection",
        channeling: "Channeling",
        depth_strider: "Depth Strider",
        efficiency: "Efficiency",
        feather_falling: "Feather Falling",
        fire_aspect: "Fire Aspect",
        fire_protection: "Fire Protection",
        flame: "Flame",
        fortune: "Fortune",
        frost_walker: "Frost Walker",
        impaling: "Impaling",
        infinity: "Infinity",
        knockback: "Knockback",
        looting: "Looting",
        loyalty: "Loyalty",
        luck_of_the_sea: "Luck of the Sea",
        lunge: "Lunge",
        lure: "Lure",
        mending: "Mending",
        multishot: "Multishot",
        piercing: "Piercing",
        power: "Power",
        projectile_protection: "Projectile Protection",
        punch: "Punch",
        quick_charge: "Quick Charge",
        respiration: "Respiration",
        riptide: "Riptide",
        sharpness: "Sharpness",
        silk_touch: "Silk Touch",
        smite: "Smite",
        soul_speed: "Soul Speed",
        sweeping: "Sweeping",
        swift_sneak: "Swift Sneak",
        thorns: "Thorns",
        unbreaking: "Unbreaking",
        binding_curse: "Curse of Binding",
        vanishing_curse: "Curse of Vanishing",
        density: "Density",
        breach: "Breach",
        wind_burst: "Wind Burst",
    },
};
const UI_STRINGS = ENGLISH_STRINGS;
const DEFAULT_CHEAPNESS_MODE = "levels";
const APP_TITLE = "Enchant Optimizer";
const APP_TAGLINE = "Get the optimal enchant order";
const THEME_STORAGE_KEY = "enchant_optimizer_theme";
const DARK_THEME = "dark";
const LIGHT_THEME = "light";

applyInitialTheme();

window.onload = function() {
    setupThemeToggle();

    resetWorker();

    buildItemSelection();
    setupItemCustomDropdown();
    buildEnchantmentSelection();
    applyUiStrings();
};

function normalizeTheme(theme) {
    return theme === LIGHT_THEME ? LIGHT_THEME : DARK_THEME;
}

function readStoredTheme() {
    let stored_theme = null;
    try {
        stored_theme = localStorage.getItem(THEME_STORAGE_KEY);
    } catch (_error) {
        stored_theme = null;
    }
    return normalizeTheme(stored_theme);
}

function persistTheme(theme) {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, normalizeTheme(theme));
    } catch (_error) {
        // Ignore storage failures (private mode, blocked storage, etc.).
    }
}

function applyTheme(theme) {
    const normalized_theme = normalizeTheme(theme);
    document.documentElement.setAttribute("data-theme", normalized_theme);
    return normalized_theme;
}

function updateThemeToggle(theme) {
    const toggle_button = document.getElementById("theme-toggle");
    if (!toggle_button) return;

    const normalized_theme = normalizeTheme(theme);
    const next_theme = normalized_theme === DARK_THEME ? LIGHT_THEME : DARK_THEME;
    const next_theme_text = next_theme === LIGHT_THEME ? "light" : "dark";
    const current_theme_text = normalized_theme === LIGHT_THEME ? "light" : "dark";

    toggle_button.setAttribute("aria-label", "Switch to " + next_theme_text + " mode");
    toggle_button.setAttribute("title", "Theme: " + current_theme_text + ". Switch to " + next_theme_text + " mode");
    toggle_button.setAttribute("aria-pressed", normalized_theme === LIGHT_THEME ? "true" : "false");
}

function applyInitialTheme() {
    const initial_theme = readStoredTheme();
    applyTheme(initial_theme);
}

function setupThemeToggle() {
    const toggle_button = document.getElementById("theme-toggle");
    if (!toggle_button) return;

    const current_theme = applyTheme(readStoredTheme());
    updateThemeToggle(current_theme);

    toggle_button.addEventListener("click", function() {
        const active_theme = normalizeTheme(document.documentElement.getAttribute("data-theme"));
        const next_theme = active_theme === DARK_THEME ? LIGHT_THEME : DARK_THEME;
        const applied_theme = applyTheme(next_theme);
        persistTheme(applied_theme);
        updateThemeToggle(applied_theme);
    });
}

function resetWorker() {
    if (worker) {
        worker.terminate();
    }

    worker = new Worker("work.js?6");
    worker.onmessage = function(event) {
        if (event.data.msg === "complete") {
            afterFoundOptimalSolution(event.data);
        }
    };
    worker.postMessage({
        msg: "set_data",
        data: data
    });
}

function buildItemSelection() {
    data.items.forEach(item_namespace => {
        const item_listbox_metadata = { value: item_namespace };
        const item_listbox = $("<option/>", item_listbox_metadata);
        item_listbox.text(item_namespace).appendTo("select#item");
    });

    rebuildItemCustomDropdown();
}

function setupItemCustomDropdown() {
    const native_select = document.getElementById("item");
    const dropdown_root = document.getElementById("item-custom-select");
    if (!native_select || !dropdown_root) return;

    dropdown_root.hidden = false;
    dropdown_root.innerHTML =
        '<button type="button" class="custom-select-trigger" aria-haspopup="listbox" aria-expanded="false">' +
            '<span class="custom-select-trigger-main">' +
                '<span class="custom-select-trigger-icon-wrap" aria-hidden="true">' +
                    '<span id="item-custom-select-glow-primary" class="custom-select-trigger-glow"></span>' +
                    '<span id="item-custom-select-glow-secondary" class="custom-select-trigger-glow custom-select-trigger-glow-secondary"></span>' +
                    '<img id="item-custom-select-icon-primary" class="custom-select-trigger-icon item-select-icon-unenchanted" src="' + iconPathForItem(DEFAULT_PREVIEW_ITEM_NAMESPACE, false) + '" alt="">' +
                    '<img id="item-custom-select-icon-secondary" class="custom-select-trigger-icon custom-select-trigger-icon-secondary item-select-icon-unenchanted" src="' + iconPathForItem(DEFAULT_PREVIEW_ITEM_NAMESPACE, false) + '" alt="">' +
                '</span>' +
                '<span class="custom-select-value"></span>' +
            "</span>" +
            '<span class="custom-select-caret" aria-hidden="true"></span>' +
        "</button>" +
        '<div class="custom-select-menu" role="listbox" tabindex="-1" hidden></div>';

    native_select.classList.add("selectItem-native-hidden");
    native_select.tabIndex = -1;
    native_select.setAttribute("aria-hidden", "true");

    const trigger = dropdown_root.querySelector(".custom-select-trigger");
    const trigger_glow_primary = dropdown_root.querySelector("#item-custom-select-glow-primary");
    const trigger_glow_secondary = dropdown_root.querySelector("#item-custom-select-glow-secondary");
    const trigger_icon_primary = dropdown_root.querySelector("#item-custom-select-icon-primary");
    const trigger_icon_secondary = dropdown_root.querySelector("#item-custom-select-icon-secondary");
    const value_label = dropdown_root.querySelector(".custom-select-value");
    const menu = dropdown_root.querySelector(".custom-select-menu");

    itemDropdownElements = {
        native_select,
        dropdown_root,
        trigger,
        trigger_glow_primary,
        trigger_glow_secondary,
        trigger_icon_primary,
        trigger_icon_secondary,
        value_label,
        menu,
    };

    trigger.addEventListener("click", function() {
        const is_open = dropdown_root.classList.contains("is-open");
        if (is_open) {
            closeItemCustomDropdown();
        } else {
            openItemCustomDropdown();
        }
    });

    trigger.addEventListener("keydown", function(event) {
        const open_keys = ["ArrowDown", "ArrowUp", "Enter", " "];
        if (!open_keys.includes(event.key)) return;
        event.preventDefault();
        openItemCustomDropdown();
    });

    menu.addEventListener("click", function(event) {
        const option_button = event.target.closest("button.custom-select-option");
        if (!option_button) return;
        selectItemCustomDropdownValue(option_button.dataset.value);
    });

    menu.addEventListener("keydown", function(event) {
        const option_buttons = getItemCustomOptionButtons();
        if (option_buttons.length === 0) return;

        const focused_index = option_buttons.findIndex(button => button === document.activeElement);
        let target_index = focused_index;

        if (event.key === "ArrowDown") {
            event.preventDefault();
            target_index = focused_index < 0 ? 0 : Math.min(option_buttons.length - 1, focused_index + 1);
            option_buttons[target_index].focus();
            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            target_index = focused_index < 0 ? option_buttons.length - 1 : Math.max(0, focused_index - 1);
            option_buttons[target_index].focus();
            return;
        }

        if (event.key === "Home") {
            event.preventDefault();
            option_buttons[0].focus();
            return;
        }

        if (event.key === "End") {
            event.preventDefault();
            option_buttons[option_buttons.length - 1].focus();
            return;
        }

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            const selected_button = event.target.closest("button.custom-select-option");
            if (!selected_button) return;
            selectItemCustomDropdownValue(selected_button.dataset.value);
            return;
        }

        if (event.key === "Escape") {
            event.preventDefault();
            closeItemCustomDropdown(true);
            return;
        }

        if (event.key === "Tab") {
            closeItemCustomDropdown(false);
        }
    });

    document.addEventListener("mousedown", function(event) {
        if (!itemDropdownElements) return;
        const inside_dropdown = dropdown_root.contains(event.target);
        if (!inside_dropdown) {
            closeItemCustomDropdown(false);
        }
    });

    document.addEventListener("keydown", function(event) {
        if (event.key !== "Escape") return;
        closeItemCustomDropdown(false);
    });

    native_select.addEventListener("change", function() {
        syncItemCustomDropdownFromNative();
    });

    rebuildItemCustomDropdown();
    updateItemSelectorPreview();
}

function getItemCustomOptionButtons() {
    if (!itemDropdownElements) return [];
    return Array.from(itemDropdownElements.menu.querySelectorAll("button.custom-select-option"));
}

function rebuildItemCustomDropdown() {
    if (!itemDropdownElements) return;

    const { native_select, menu } = itemDropdownElements;
    const selected_value = native_select.value;
    const grouped_options = {};
    ITEM_DROPDOWN_GROUPS.forEach(group => {
        grouped_options[group.id] = [];
    });
    grouped_options.ungrouped = [];

    const visible_options = Array.from(native_select.options).filter(option => {
        return !option.hidden && option.value !== "";
    });
    visible_options.forEach(option => {
        const group_id = ITEM_DROPDOWN_GROUP_MAP[option.value] || "ungrouped";
        grouped_options[group_id].push(option);
    });

    const menu_fragment = document.createDocumentFragment();
    menu.innerHTML = "";
    ITEM_DROPDOWN_GROUPS.forEach(group => {
        if (grouped_options[group.id].length === 0) return;
        const section = buildItemDropdownSection(group, grouped_options[group.id], selected_value);
        menu_fragment.appendChild(section);
    });
    if (grouped_options.ungrouped.length > 0) {
        const fallback_group = { id: "ungrouped", label: "Other" };
        const fallback_section = buildItemDropdownSection(fallback_group, grouped_options.ungrouped, selected_value);
        menu_fragment.appendChild(fallback_section);
    }
    menu.appendChild(menu_fragment);

    syncItemCustomDropdownFromNative();
}

function buildItemDropdownSection(group, options, selected_value) {
    const section = document.createElement("div");
    section.className = "custom-select-section";
    section.role = "group";
    section.setAttribute("aria-label", itemDropdownGroupLabel(group.id));

    const group_label = document.createElement("div");
    group_label.className = "custom-select-group-label";
    group_label.textContent = itemDropdownGroupLabel(group.id);
    section.appendChild(group_label);

    options.forEach(option => {
        const option_button = document.createElement("button");
        option_button.type = "button";
        option_button.className = "custom-select-option";
        option_button.role = "option";
        option_button.dataset.value = option.value;

        const option_main = document.createElement("span");
        option_main.className = "custom-select-option-main";

        const option_icon = document.createElement("img");
        option_icon.className = "custom-select-option-icon";
        option_icon.src = iconPathForItem(option.value, false);
        option_icon.alt = "";
        option_icon.setAttribute("aria-hidden", "true");

        const option_label = document.createElement("span");
        option_label.className = "custom-select-option-label";
        option_label.textContent = option.textContent;

        option_main.appendChild(option_icon);
        option_main.appendChild(option_label);
        option_button.appendChild(option_main);

        const is_selected = option.value === selected_value;
        option_button.setAttribute("aria-selected", is_selected ? "true" : "false");
        if (is_selected) {
            option_button.classList.add("is-selected");
        }

        section.appendChild(option_button);
    });

    return section;
}

function itemDropdownGroupLabel(group_id) {
    const group = ITEM_DROPDOWN_GROUPS.find(entry => entry.id === group_id);
    const fallback = group ? group.label : "Other";
    return UI_STRINGS.item_groups[group_id] || fallback;
}

function syncItemCustomDropdownFromNative() {
    if (!itemDropdownElements) return;

    const { native_select, trigger, value_label, menu } = itemDropdownElements;
    const selected_option = native_select.options[native_select.selectedIndex];
    const has_selected_value = !!native_select.value;
    const placeholder_text = native_select.options.length ? native_select.options[0].textContent : "";
    const display_text = has_selected_value && selected_option ? selected_option.textContent : placeholder_text;

    value_label.textContent = display_text;
    trigger.classList.toggle("is-placeholder", !has_selected_value);

    const option_buttons = menu.querySelectorAll("button.custom-select-option");
    option_buttons.forEach(option_button => {
        const is_selected = option_button.dataset.value === native_select.value;
        option_button.classList.toggle("is-selected", is_selected);
        option_button.setAttribute("aria-selected", is_selected ? "true" : "false");
    });
}

function openItemCustomDropdown() {
    if (!itemDropdownElements) return;
    const { dropdown_root, trigger, menu, native_select } = itemDropdownElements;

    dropdown_root.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    menu.hidden = false;

    const option_buttons = getItemCustomOptionButtons();
    if (option_buttons.length === 0) return;

    const selected_index = option_buttons.findIndex(button => button.dataset.value === native_select.value);
    const focus_index = selected_index >= 0 ? selected_index : 0;
    const focus_target = option_buttons[focus_index];
    focus_target.focus();
    focus_target.scrollIntoView({ block: "nearest" });
    syncItemSelectorIdleCarouselState();
}

function closeItemCustomDropdown(return_focus_to_trigger = false) {
    if (!itemDropdownElements) return;
    const { dropdown_root, trigger, menu } = itemDropdownElements;

    const is_open = dropdown_root.classList.contains("is-open");
    if (!is_open) return;

    dropdown_root.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    menu.hidden = true;

    if (return_focus_to_trigger) {
        trigger.focus();
    }

    syncItemSelectorIdleCarouselState();
}

function selectItemCustomDropdownValue(item_namespace) {
    if (!itemDropdownElements) return;
    const { native_select } = itemDropdownElements;

    const option_exists = Array.from(native_select.options).some(option => option.value === item_namespace);
    if (!option_exists) return;

    if (native_select.value !== item_namespace) {
        native_select.value = item_namespace;
        native_select.dispatchEvent(new Event("change", { bubbles: true }));
    }

    closeItemCustomDropdown(true);
}

function cancelItemSelectorIdleAnimations() {
    if (itemSelectorIdleAnimations.length === 0) return;
    itemSelectorIdleAnimations.forEach(animation => {
        if (animation && typeof animation.cancel === "function") {
            animation.cancel();
        }
    });
    itemSelectorIdleAnimations = [];
}

function setItemSelectorPreviewIcon(item_namespace) {
    if (!itemDropdownElements) return;
    const glow_primary = itemDropdownElements.trigger_glow_primary;
    const glow_secondary = itemDropdownElements.trigger_glow_secondary;
    const icon_primary = itemDropdownElements.trigger_icon_primary;
    const icon_secondary = itemDropdownElements.trigger_icon_secondary;
    if (!glow_primary || !glow_secondary || !icon_primary || !icon_secondary) return;

    const icon_src = iconPathForItem(item_namespace, false);
    icon_primary.src = icon_src;
    icon_primary.alt = "";
    icon_secondary.alt = "";

    glow_primary.style.opacity = "1";
    glow_primary.style.visibility = "visible";
    glow_primary.style.transform = "translate(-50%, -50%) translateY(0px)";

    glow_secondary.style.opacity = "0";
    glow_secondary.style.visibility = "hidden";
    glow_secondary.style.transform = "translate(-50%, -50%) translateY(" + ITEM_SELECTOR_IDLE_TRANSITION_DISTANCE_PX + "px)";

    icon_primary.style.opacity = "1";
    icon_primary.style.visibility = "visible";
    icon_primary.style.transform = "translate(-50%, -50%) translateY(0px)";

    icon_secondary.style.opacity = "0";
    icon_secondary.style.visibility = "hidden";
    icon_secondary.style.transform = "translate(-50%, -50%) translateY(" + ITEM_SELECTOR_IDLE_TRANSITION_DISTANCE_PX + "px)";
}

function indexForItemSelectorIdleNamespace(item_namespace) {
    const index = ITEM_SELECTOR_IDLE_ITEM_NAMESPACES.indexOf(item_namespace);
    return index >= 0 ? index : 0;
}

function shouldRunItemSelectorIdleCarousel() {
    if (!itemDropdownElements) return false;
    if (shouldReduceMotion()) return false;

    const has_selected_item = !!retrieveSelectedItem();
    if (has_selected_item) return false;

    const dropdown_open = itemDropdownElements.dropdown_root.classList.contains("is-open");
    if (dropdown_open) return false;

    return ITEM_SELECTOR_IDLE_ITEM_NAMESPACES.length > 1;
}

function stopItemSelectorIdleCarousel() {
    if (itemSelectorIdleTimer) {
        clearTimeout(itemSelectorIdleTimer);
        itemSelectorIdleTimer = null;
    }

    itemSelectorIdleRunToken += 1;
    cancelItemSelectorIdleAnimations();

    if (itemDropdownElements) {
        const selected_item = retrieveSelectedItem();
        const stable_namespace = selected_item || ITEM_SELECTOR_IDLE_ITEM_NAMESPACES[itemSelectorIdleCurrentIndex] || DEFAULT_PREVIEW_ITEM_NAMESPACE;
        setItemSelectorPreviewIcon(stable_namespace);
    }
}

function queueItemSelectorIdleStep(run_token, delay_ms) {
    if (itemSelectorIdleTimer) {
        clearTimeout(itemSelectorIdleTimer);
    }

    itemSelectorIdleTimer = window.setTimeout(function() {
        runItemSelectorIdleStep(run_token);
    }, delay_ms);
}

function runItemSelectorIdleStep(run_token) {
    itemSelectorIdleTimer = null;
    if (run_token !== itemSelectorIdleRunToken) return;
    if (!shouldRunItemSelectorIdleCarousel()) {
        stopItemSelectorIdleCarousel();
        return;
    }
    if (!itemDropdownElements) return;

    const glow_primary = itemDropdownElements.trigger_glow_primary;
    const glow_secondary = itemDropdownElements.trigger_glow_secondary;
    const icon_primary = itemDropdownElements.trigger_icon_primary;
    const icon_secondary = itemDropdownElements.trigger_icon_secondary;
    if (!glow_primary || !glow_secondary || !icon_primary || !icon_secondary) return;

    const icon_count = ITEM_SELECTOR_IDLE_ITEM_NAMESPACES.length;
    const next_index = (itemSelectorIdleCurrentIndex + 1) % icon_count;
    const next_namespace = ITEM_SELECTOR_IDLE_ITEM_NAMESPACES[next_index];
    const next_icon_src = iconPathForItem(next_namespace, false);

    runAfterImageLoad(next_icon_src, function() {
        if (run_token !== itemSelectorIdleRunToken || !shouldRunItemSelectorIdleCarousel()) {
            return;
        }

        glow_secondary.style.visibility = "visible";
        glow_secondary.style.opacity = "1";
        glow_secondary.style.transform = "translate(-50%, -50%) translateY(" + ITEM_SELECTOR_IDLE_TRANSITION_DISTANCE_PX + "px)";

        icon_secondary.src = next_icon_src;
        icon_secondary.alt = "";
        icon_secondary.style.visibility = "visible";
        icon_secondary.style.opacity = "1";
        icon_secondary.style.transform = "translate(-50%, -50%) translateY(" + ITEM_SELECTOR_IDLE_TRANSITION_DISTANCE_PX + "px)";

        if (
            typeof glow_primary.animate !== "function" ||
            typeof glow_secondary.animate !== "function" ||
            typeof icon_primary.animate !== "function" ||
            typeof icon_secondary.animate !== "function"
        ) {
            itemSelectorIdleCurrentIndex = next_index;
            setItemSelectorPreviewIcon(next_namespace);
            queueItemSelectorIdleStep(run_token, ITEM_SELECTOR_IDLE_PAUSE_MS);
            return;
        }

        cancelItemSelectorIdleAnimations();

        const animation_options = {
            duration: ITEM_SELECTOR_IDLE_TRANSITION_MS,
            easing: ITEM_SELECTOR_IDLE_TRANSITION_EASING,
            fill: "forwards",
        };

        const outgoing_glow_animation = glow_primary.animate(
            [
                { transform: "translate(-50%, -50%) translateY(0px)", opacity: 1 },
                { transform: "translate(-50%, -50%) translateY(-" + ITEM_SELECTOR_IDLE_TRANSITION_DISTANCE_PX + "px)", opacity: 0 },
            ],
            animation_options
        );
        const incoming_glow_animation = glow_secondary.animate(
            [
                { transform: "translate(-50%, -50%) translateY(" + ITEM_SELECTOR_IDLE_TRANSITION_DISTANCE_PX + "px)", opacity: 0 },
                { transform: "translate(-50%, -50%) translateY(0px)", opacity: 1 },
            ],
            animation_options
        );
        const outgoing_animation = icon_primary.animate(
            [
                { transform: "translate(-50%, -50%) translateY(0px)", opacity: 1 },
                { transform: "translate(-50%, -50%) translateY(-" + ITEM_SELECTOR_IDLE_TRANSITION_DISTANCE_PX + "px)", opacity: 0 },
            ],
            animation_options
        );
        const incoming_animation = icon_secondary.animate(
            [
                { transform: "translate(-50%, -50%) translateY(" + ITEM_SELECTOR_IDLE_TRANSITION_DISTANCE_PX + "px)", opacity: 0 },
                { transform: "translate(-50%, -50%) translateY(0px)", opacity: 1 },
            ],
            animation_options
        );

        itemSelectorIdleAnimations = [
            outgoing_glow_animation,
            incoming_glow_animation,
            outgoing_animation,
            incoming_animation,
        ];

        const completeTransition = function() {
            cancelItemSelectorIdleAnimations();
            if (run_token !== itemSelectorIdleRunToken || !shouldRunItemSelectorIdleCarousel()) {
                return;
            }

            itemSelectorIdleCurrentIndex = next_index;
            setItemSelectorPreviewIcon(next_namespace);
            queueItemSelectorIdleStep(run_token, ITEM_SELECTOR_IDLE_PAUSE_MS);
        };

        let completed_count = 0;
        const onAnimationDone = function() {
            completed_count += 1;
            if (completed_count === 4) {
                completeTransition();
            }
        };

        outgoing_glow_animation.addEventListener("finish", onAnimationDone, { once: true });
        outgoing_glow_animation.addEventListener("cancel", onAnimationDone, { once: true });
        incoming_glow_animation.addEventListener("finish", onAnimationDone, { once: true });
        incoming_glow_animation.addEventListener("cancel", onAnimationDone, { once: true });
        outgoing_animation.addEventListener("finish", onAnimationDone, { once: true });
        outgoing_animation.addEventListener("cancel", onAnimationDone, { once: true });
        incoming_animation.addEventListener("finish", onAnimationDone, { once: true });
        incoming_animation.addEventListener("cancel", onAnimationDone, { once: true });
    });
}

function syncItemSelectorIdleCarouselState() {
    if (!itemDropdownElements) return;

    if (!shouldRunItemSelectorIdleCarousel()) {
        stopItemSelectorIdleCarousel();
        return;
    }

    const selected_item = retrieveSelectedItem();
    const initial_namespace = selected_item || ITEM_SELECTOR_IDLE_ITEM_NAMESPACES[itemSelectorIdleCurrentIndex] || DEFAULT_PREVIEW_ITEM_NAMESPACE;
    itemSelectorIdleCurrentIndex = indexForItemSelectorIdleNamespace(initial_namespace);
    setItemSelectorPreviewIcon(initial_namespace);

    const is_running = itemSelectorIdleTimer || itemSelectorIdleAnimations.length > 0;
    if (is_running) {
        return;
    }

    itemSelectorIdleRunToken += 1;
    const run_token = itemSelectorIdleRunToken;
    queueItemSelectorIdleStep(run_token, ITEM_SELECTOR_IDLE_PAUSE_MS);
}

function updateItemSelectorPreview() {
    const item_namespace = retrieveSelectedItem();
    if (!itemDropdownElements) return;

    if (!item_namespace) {
        setItemSelectorPreviewIcon(
            ITEM_SELECTOR_IDLE_ITEM_NAMESPACES[itemSelectorIdleCurrentIndex] || DEFAULT_PREVIEW_ITEM_NAMESPACE
        );
        syncItemSelectorIdleCarouselState();
        return;
    }

    stopItemSelectorIdleCarousel();
    itemSelectorIdleCurrentIndex = indexForItemSelectorIdleNamespace(item_namespace);
    setItemSelectorPreviewIcon(item_namespace);
}

function incompatibleGroupFromNamespace(enchantment_namespace) {
    const enchantments_metadata = data.enchants;

    const incompatible_namespaces_queue = [enchantment_namespace];
    const incompatible_namespaces = [];

    while (incompatible_namespaces_queue.length) {
        const incompatible_namespace = incompatible_namespaces_queue.shift();
        const incompatible_already_grouped = incompatible_namespaces.includes(incompatible_namespace);

        if (!incompatible_already_grouped) {
            incompatible_namespaces.push(incompatible_namespace);
            const enchantment_metadata = enchantments_metadata[incompatible_namespace];
            const new_incompatible_namespaces = enchantment_metadata.incompatible;

            new_incompatible_namespaces.forEach(new_incompatible_namespace => {
                const new_incompatible_already_grouped = incompatible_namespaces.includes(new_incompatible_namespace);
                const new_incompatible_in_queue = incompatible_namespaces_queue.includes(new_incompatible_namespace);
                const push_new_incompatible = !new_incompatible_already_grouped && !new_incompatible_in_queue;
                if (push_new_incompatible) {
                    incompatible_namespaces_queue.push(new_incompatible_namespace);
                }
            });
        }
    }

    incompatible_namespaces.sort();
    return incompatible_namespaces;
}

function buildEnchantList(item_namespace_chosen) {
    const enchantments_metadata = data.enchants;
    const protection_variant_namespaces = ["protection", "blast_protection", "fire_protection", "projectile_protection"];

    $("#enchants table").html("");

    //
    // first, filter out which enchants apply to this item
    //

    const item_enchantment_namespaces = [];
    let enchantment_level_maxmax = 0;

    const enchantment_namespaces = Object.keys(enchantments_metadata);
    enchantment_namespaces.forEach(enchantment_namespace => {

        const enchantment_metadata = enchantments_metadata[enchantment_namespace];
        const item_namespaces = enchantment_metadata.items;
        const allow_enchantment = item_namespaces.includes(item_namespace_chosen);

        if (allow_enchantment) {
            const enchantment_max_level = enchantment_metadata.levelMax;
            enchantment_level_maxmax = Math.max(enchantment_level_maxmax, enchantment_max_level);
            item_enchantment_namespaces.push(enchantment_namespace);
        }
    });

    //
    // next, group them by incompatible enchants
    //

    const enchantment_groups = [];
    const enchantments_grouped = [];

    function filterEnchantmentGroup(enchantment_namespace) {
        return item_enchantment_namespaces.includes(enchantment_namespace);
    }

    item_enchantment_namespaces.forEach(enchantment_namespace => {
        const namespace_already_grouped = enchantments_grouped.includes(enchantment_namespace);
        if (namespace_already_grouped) return;

        let enchantment_group = incompatibleGroupFromNamespace(enchantment_namespace);
        enchantment_group = enchantment_group.filter(filterEnchantmentGroup);

        enchantment_group.forEach(enchantment_namespace => {
            const enchantment_already_grouped = enchantments_grouped.includes(enchantment_namespace);
            if (!enchantment_already_grouped) {
                enchantments_grouped.push(enchantment_namespace);
            }
        });

        enchantment_groups.push(enchantment_group);
    });

    let group_toggle_color = true;

    enchantment_groups.forEach(enchantment_group => {
        enchantment_group.sort((left_namespace, right_namespace) => {
            const left_is_protection_variant = protection_variant_namespaces.includes(left_namespace);
            const right_is_protection_variant = protection_variant_namespaces.includes(right_namespace);

            if (!left_is_protection_variant || !right_is_protection_variant) {
                return 0;
            }

            if (left_namespace === "protection") return -1;
            if (right_namespace === "protection") return 1;
            return 0;
        });

        enchantment_group.forEach(enchantment_namespace => {
            const enchantment_metadata = enchantments_metadata[enchantment_namespace];
            const enchantment_max_level = enchantment_metadata.levelMax;
            const enchantment_name = UI_STRINGS.enchants[enchantment_namespace];

            const enchantment_row = $("<tr>");
            enchantment_row.addClass("enchant-row");
            enchantment_row.addClass(group_toggle_color ? "group1" : "group2");
            enchantment_row.data("namespace", enchantment_namespace);

            enchantment_row.append($("<td>").append($("<span>").addClass("enchant-name").text(enchantment_name)));

            const enchantment_levels = $("<div>").addClass("level-buttons");
            const enchantment_levels_cell = $("<td>").addClass("level-buttons-cell");
            for (let enchantment_level = 1; enchantment_level <= enchantment_level_maxmax; enchantment_level++) {
                if (enchantment_max_level >= enchantment_level) {
                    const enchantment_button_data = {
                        level: enchantment_level,
                        namespace: enchantment_namespace,
                    };
                    const enchantment_button = $("<button>", { type: "button" });
                    enchantment_button.append(enchantment_level);
                    enchantment_button.addClass("off");
                    enchantment_button.addClass("level-button");
                    enchantment_button.data(enchantment_button_data);
                    enchantment_levels.append(enchantment_button);
                }
            }
            enchantment_levels_cell.append(enchantment_levels);
            enchantment_row.append(enchantment_levels_cell);

            $("#enchants table").append(enchantment_row);
        });

        group_toggle_color = !group_toggle_color;
    });

    $("#enchants").show();
    runAutoCalculation();
}

function pugsChoiceEnchantmentsForItem(item_namespace) {
    if (!item_namespace) return null;
    return PUGS_CHOICE_ENCHANTMENTS[item_namespace] || null;
}

function syncPugsChoiceButtonState() {
    const pugs_choice_button = $("#pugs-choice-button");
    if (pugs_choice_button.length === 0) return;

    const item_namespace = retrieveSelectedItem();
    const has_preset = !!pugsChoiceEnchantmentsForItem(item_namespace);
    const button_label = has_preset
        ? UI_STRINGS.apply_pugs_choice
        : UI_STRINGS.pugs_choice_not_available;

    pugs_choice_button.prop("disabled", !has_preset);
    pugs_choice_button.attr("title", button_label);
    pugs_choice_button.attr("aria-label", button_label);
}

function buildEnchantmentSelection() {
    $("select#item").change(function() {
        cancelPugsChoiceCascade();

        const item_namespace_selected = $("select#item option:selected").val();
        if (item_namespace_selected) {
            buildEnchantList(item_namespace_selected);
        } else {
            $("#enchants").hide();
            animateFinalPreviewExit($("#final-preview"));
            $("#phone-warn").hide();
            animateSolutionPanelExit($("#solution"));
            $("#error").hide();
        }

        updateItemSelectorPreview();
        syncPugsChoiceButtonState();
    });

    $("#enchants table").on("click", "button.level-button", function() {
        levelButtonClicked($(this));
    });

    $("#pugs-choice-button").on("click", function() {
        applyPugsChoiceSelection();
    });

    syncPugsChoiceButtonState();
}

function displayLevelsText(levels) {
    let level_text;
    level_text = pluralize(levels, 'level');
    return level_text;
}

function pluralize(num, key_root) {
    if (num === 1) {
      return String(num) + UI_STRINGS[key_root];
    } else {
      return String(num) + UI_STRINGS[key_root + '_s'];
    }
}

function displayXpText(xp, minimum_xp = -1) {
    let xp_text = "";
    if (minimum_xp >= 0) {
        xp_text += commaify(minimum_xp) + "-";
    }
    xp_text += commaify(xp) + UI_STRINGS.xp;
    return xp_text;
}

function commaify(n) {
    let out = "";
    let nstr = "" + n;
    while (nstr.length > 3) {
        out = "," + nstr.substr(nstr.length - 3) + out;
        nstr = nstr.substr(0, nstr.length - 3);
    }
    return nstr + out;
}

function displayLevelXpText(levels, xp, minimum_xp = -1) {
    const level_text = displayLevelsText(levels);
    const xp_text = displayXpText(xp, minimum_xp);
    return level_text + " (" + xp_text + ")";
}

function toTitleCase(text) {
    return text
        .replace(/[_-]+/g, " ")
        .split(/\s+/)
        .filter(word => word.length > 0)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function displayItemName(item_namespace, force_title_case = false) {
    const items_metadata = UI_STRINGS.items;
    const localized_item_name = items_metadata[item_namespace];
    const item_name = localized_item_name || item_namespace;
    return force_title_case ? toTitleCase(item_name) : item_name;
}

function toRomanNumeral(value) {
    const roman_map = [
        [1000, "M"],
        [900, "CM"],
        [500, "D"],
        [400, "CD"],
        [100, "C"],
        [90, "XC"],
        [50, "L"],
        [40, "XL"],
        [10, "X"],
        [9, "IX"],
        [5, "V"],
        [4, "IV"],
        [1, "I"],
    ];

    let remaining = Math.max(1, Math.floor(value));
    let output = "";

    roman_map.forEach(([integer, numeral]) => {
        while (remaining >= integer) {
            output += numeral;
            remaining -= integer;
        }
    });

    return output;
}

function enchantmentLevelFromNamespace(enchantment_namespace) {
    if (!Array.isArray(enchants_list)) return 1;
    const match = enchants_list.find(([entry]) => entry === enchantment_namespace);
    return match ? match[1] : 1;
}

function displayEnchantmentLine(enchantment_namespace, level_override = undefined) {
    const enchantment_name = UI_STRINGS.enchants[enchantment_namespace] || enchantment_namespace;
    const enchantment_data = data.enchants[enchantment_namespace];
    if (!enchantment_data || enchantment_data.levelMax <= 1) {
        return enchantment_name;
    }

    const enchantment_level = (typeof level_override === "number")
        ? level_override
        : enchantmentLevelFromNamespace(enchantment_namespace);
    return enchantment_name + " " + toRomanNumeral(enchantment_level);
}

function extractItemDisplayData(item_obj) {
    let item_namespace;
    let enchantments_obj = [];

    if (item_obj && typeof item_obj.I === "string") {
        if (UI_STRINGS.enchants.hasOwnProperty(item_obj.I)) {
            item_namespace = "book";
            enchantments_obj.push(item_obj.I);
        } else {
            item_namespace = item_obj.I;
        }
    } else if (item_obj) {
        item_namespace = findItemNamespace(item_obj);
        enchantments_obj = findEnchantments(item_obj);
    }

    if (typeof item_namespace === "undefined") {
        item_namespace = findItemNamespace(item_obj);
    }

    if (typeof item_namespace === "undefined") {
        item_namespace = "book";
    }

    const enchantments_unique = [...new Set(enchantments_obj)].filter(enchantment_namespace => {
        return UI_STRINGS.enchants.hasOwnProperty(enchantment_namespace);
    });
    return {
        item_namespace: item_namespace,
        enchantments: enchantments_unique,
    };
}

function iconPathForItem(item_namespace, is_enchanted = false) {
    const icon_variant = ITEM_ICON_VARIANTS[item_namespace];
    if (icon_variant) {
        // Prefer dedicated enchanted icon assets when enchantments are present.
        if (is_enchanted && icon_variant.enchanted) {
            return icon_variant.enchanted;
        }
        if (icon_variant.base) {
            return icon_variant.base;
        }
    }

    return "./images/" + item_namespace + ".gif";
}

function buildStepItemElement(item_obj) {
    const item_data = extractItemDisplayData(item_obj);
    const item_name = displayItemName(item_data.item_namespace, true);
    const has_enchantments = item_data.enchantments.length > 0;
    const icon_src = iconPathForItem(item_data.item_namespace, has_enchantments);

    const item_element = $("<div>").addClass("step-item");
    const item_icon = $("<img>", {
        src: icon_src,
        alt: item_name,
        class: "step-item-icon",
    });
    if (has_enchantments) {
        item_icon.addClass("step-item-icon-enchanted");
    } else {
        item_icon.addClass("step-item-icon-unenchanted");
    }
    item_icon.appendTo(item_element);

    if (has_enchantments) {
        const item_lines = $("<div>").addClass("step-item-lines");
        item_data.enchantments.forEach(enchantment_namespace => {
            const enchantment_text = displayEnchantmentLine(enchantment_namespace);
            $("<span>").addClass("step-item-line").text(enchantment_text).appendTo(item_lines);
        });
        item_element.append(item_lines);
    }

    return item_element;
}

function displayInstructionText(instruction) {
    const left_item_obj = instruction[0];
    const right_item_obj = instruction[1];
    const levels = instruction[2];
    const xp = instruction[3];
    const work = instruction[4];

    const cost_text = UI_STRINGS.cost + displayLevelXpText(levels, xp);
    const prior_work_text = UI_STRINGS.prior_work_penalty + displayLevelsText(work);

    return {
        left: buildStepItemElement(left_item_obj),
        right: buildStepItemElement(right_item_obj),
        meta: cost_text + " | " + prior_work_text,
    };
}

function findItemNamespace(item) {
    if (!item) {
        return undefined;
    }

    if (typeof item.I === "string") {
        return UI_STRINGS.enchants.hasOwnProperty(item.I) ? "book" : item.I;
    }

    const left_namespace = findItemNamespace(item.L);
    if (left_namespace && left_namespace !== "book") {
        return left_namespace;
    }

    const right_namespace = findItemNamespace(item.R);
    if (right_namespace && right_namespace !== "book") {
        return right_namespace;
    }

    if (item.L) {
        return left_namespace;
    }

    return right_namespace;
}

function findEnchantments(item) {
    let enchants = [];
    let child_enchants;

    if (!item) return enchants;

    for (const key in item) {
        if (key === "L" || key === "R") {
            if (!item[key].I) {
                child_enchants = findEnchantments(item[key]);
                child_enchants.forEach(enchant => {
                    enchants.push(enchant);
                });
            } else {
                enchants.push(item[key].I);
            }
        }
    }
    return enchants;
}

function updateCumulativeCost(cumulative_levels, cumulative_xp, minimum_xp = -1) {
    const cost_text = displayLevelsText(cumulative_levels);
    const detailed_cost_text = displayLevelXpText(cumulative_levels, cumulative_xp, minimum_xp);
    const cost_header = $("#level-cost");
    cost_header.text(cost_text);
    cost_header.attr("title", detailed_cost_text);
}

function addInstructionDisplay(instruction, step_number) {
    const display_data = displayInstructionText(instruction);
    const step_element = $("<li>").addClass("step-card");

    $("<div>")
        .addClass("step-number")
        .text(step_number + ".")
        .appendTo(step_element);

    const combine_element = $("<div>").addClass("step-combine");
    combine_element.append(display_data.left);
    $("<div>").addClass("step-plus").text("+").appendTo(combine_element);
    combine_element.append(display_data.right);
    step_element.append(combine_element);

    $("<div>")
        .addClass("step-meta")
        .text(display_data.meta)
        .appendTo(step_element);

    $("#steps").append(step_element);
}

function updateSolutionIdentity(item_namespace) {
    const solution_header = $("#solution-header");
    const item_name = displayItemName(item_namespace, true);
    solution_header.text(item_name);
}

function shouldReduceMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function cancelSolutionPanelAnimation() {
    if (solutionPanelAnimation) {
        solutionPanelAnimation.cancel();
        solutionPanelAnimation = null;
    }
}

function cancelFinalPreviewAnimation() {
    if (finalPreviewAnimation) {
        finalPreviewAnimation.cancel();
        finalPreviewAnimation = null;
    }
}

function animateSolutionPanelEntry(solution_section) {
    const solution_node = solution_section && solution_section.length ? solution_section.get(0) : null;
    const panel_node = document.getElementById("right");
    if (!solution_node || !panel_node) return;

    if (shouldReduceMotion()) {
        return;
    }

    isSolutionPanelExiting = false;
    cancelSolutionPanelAnimation();

    const panel_rect = panel_node.getBoundingClientRect();
    const solution_rect = solution_node.getBoundingClientRect();
    const panel_has_size = panel_rect.width > 0 && panel_rect.height > 0;
    const solution_has_size = solution_rect.width > 0 && solution_rect.height > 0;
    if (!panel_has_size || !solution_has_size || typeof solution_node.animate !== "function") {
        return;
    }

    const panel_center_x = panel_rect.left + panel_rect.width / 2;
    const panel_center_y = panel_rect.top + panel_rect.height / 2;
    const solution_center_x = solution_rect.left + solution_rect.width / 2;
    const solution_center_y = solution_rect.top + solution_rect.height / 2;

    const offset_x = panel_center_x - solution_center_x;
    const offset_y = panel_center_y - solution_center_y;

    solution_node.style.transformOrigin = "center center";
    solution_node.style.willChange = "transform, opacity";

    solutionPanelAnimation = solution_node.animate(
        [
            {
                transform: "translate(" + offset_x + "px, " + offset_y + "px) scale(0.04)",
                opacity: 0,
            },
            {
                transform: "translate(0px, 0px) scale(1)",
                opacity: 1,
            },
        ],
        {
            duration: 360,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        }
    );

    const clearAnimationState = function() {
        solution_node.style.willChange = "";
        solutionPanelAnimation = null;
    };

    solutionPanelAnimation.addEventListener("finish", clearAnimationState, { once: true });
    solutionPanelAnimation.addEventListener("cancel", clearAnimationState, { once: true });
}

function animateSolutionPanelExit(solution_section) {
    const solution_node = solution_section && solution_section.length ? solution_section.get(0) : null;
    const panel_node = document.getElementById("right");
    if (!solution_node || !panel_node) return;

    const solution_visible = solution_section.is(":visible");
    if (!solution_visible) {
        isSolutionPanelExiting = false;
        cancelSolutionPanelAnimation();
        return;
    }

    if (shouldReduceMotion()) {
        isSolutionPanelExiting = false;
        cancelSolutionPanelAnimation();
        solution_section.hide();
        return;
    }

    cancelSolutionPanelAnimation();

    const panel_rect = panel_node.getBoundingClientRect();
    const solution_rect = solution_node.getBoundingClientRect();
    const panel_has_size = panel_rect.width > 0 && panel_rect.height > 0;
    const solution_has_size = solution_rect.width > 0 && solution_rect.height > 0;
    if (!panel_has_size || !solution_has_size || typeof solution_node.animate !== "function") {
        isSolutionPanelExiting = false;
        cancelSolutionPanelAnimation();
        solution_section.hide();
        return;
    }

    const panel_center_x = panel_rect.left + panel_rect.width / 2;
    const panel_center_y = panel_rect.top + panel_rect.height / 2;
    const solution_center_x = solution_rect.left + solution_rect.width / 2;
    const solution_center_y = solution_rect.top + solution_rect.height / 2;
    const offset_x = panel_center_x - solution_center_x;
    const offset_y = panel_center_y - solution_center_y;

    isSolutionPanelExiting = true;

    solution_node.style.transformOrigin = "center center";
    solution_node.style.willChange = "transform, opacity";

    solutionPanelAnimation = solution_node.animate(
        [
            {
                transform: "translate(0px, 0px) scale(1)",
                opacity: 1,
            },
            {
                transform: "translate(" + offset_x + "px, " + offset_y + "px) scale(0.04)",
                opacity: 0,
            },
        ],
        {
            duration: 300,
            easing: "cubic-bezier(0.7, 0, 0.84, 0)",
        }
    );

    const resetAnimationState = function() {
        solution_node.style.willChange = "";
        solutionPanelAnimation = null;
    };

    const completeExit = function() {
        solution_section.hide();
        isSolutionPanelExiting = false;
        resetAnimationState();
    };

    const cancelExit = function() {
        isSolutionPanelExiting = false;
        resetAnimationState();
    };

    solutionPanelAnimation.addEventListener("finish", completeExit, { once: true });
    solutionPanelAnimation.addEventListener("cancel", cancelExit, { once: true });
}

function finalPreviewOffsetFromTable(preview_node) {
    const table_node = document.querySelector("#enchants .table-wrap");
    if (!table_node) return null;

    const table_rect = table_node.getBoundingClientRect();
    const preview_rect = preview_node.getBoundingClientRect();
    const table_has_size = table_rect.width > 0 && table_rect.height > 0;
    const preview_has_size = preview_rect.width > 0 && preview_rect.height > 0;
    if (!table_has_size || !preview_has_size) return null;

    const preview_center_x = preview_rect.left + preview_rect.width / 2;
    const preview_center_y = preview_rect.top + preview_rect.height / 2;

    // Start from the bottom middle just below the enchants table.
    const source_x = table_rect.left + table_rect.width / 2;
    const source_y = table_rect.bottom + Math.min(44, Math.max(12, table_rect.height * 0.07));

    return {
        offset_x: source_x - preview_center_x,
        offset_y: source_y - preview_center_y,
    };
}

function animateFinalPreviewEntry(preview_section) {
    const preview_node = preview_section && preview_section.length
        ? preview_section.find(".final-preview-card").get(0)
        : null;
    if (!preview_node) return;

    if (shouldReduceMotion()) {
        return;
    }

    isFinalPreviewExiting = false;
    cancelFinalPreviewAnimation();

    const offset = finalPreviewOffsetFromTable(preview_node);
    if (!offset || typeof preview_node.animate !== "function") {
        return;
    }

    preview_node.style.transformOrigin = "center center";
    preview_node.style.willChange = "transform, opacity";

    finalPreviewAnimation = preview_node.animate(
        [
            {
                transform: "translate(" + offset.offset_x + "px, " + offset.offset_y + "px) scale(0.04)",
                opacity: 0,
            },
            {
                transform: "translate(0px, 0px) scale(1)",
                opacity: 1,
            },
        ],
        {
            duration: 320,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        }
    );

    const clearAnimationState = function() {
        preview_node.style.willChange = "";
        finalPreviewAnimation = null;
    };

    finalPreviewAnimation.addEventListener("finish", clearAnimationState, { once: true });
    finalPreviewAnimation.addEventListener("cancel", clearAnimationState, { once: true });
}

function animateFinalPreviewExit(preview_section) {
    const preview_node = preview_section && preview_section.length
        ? preview_section.find(".final-preview-card").get(0)
        : null;
    if (!preview_node) return;

    const preview_visible = preview_section.is(":visible");
    if (!preview_visible) {
        isFinalPreviewExiting = false;
        cancelFinalPreviewAnimation();
        return;
    }

    if (isFinalPreviewExiting) {
        return;
    }

    if (shouldReduceMotion()) {
        isFinalPreviewExiting = false;
        cancelFinalPreviewAnimation();
        preview_section.hide();
        return;
    }

    cancelFinalPreviewAnimation();

    const offset = finalPreviewOffsetFromTable(preview_node);
    if (!offset || typeof preview_node.animate !== "function") {
        isFinalPreviewExiting = false;
        cancelFinalPreviewAnimation();
        preview_section.hide();
        return;
    }

    isFinalPreviewExiting = true;

    preview_node.style.transformOrigin = "center center";
    preview_node.style.willChange = "transform, opacity";

    finalPreviewAnimation = preview_node.animate(
        [
            {
                transform: "translate(0px, 0px) scale(1)",
                opacity: 1,
            },
            {
                transform: "translate(" + offset.offset_x + "px, " + offset.offset_y + "px) scale(0.04)",
                opacity: 0,
            },
        ],
        {
            duration: 260,
            easing: "cubic-bezier(0.7, 0, 0.84, 0)",
        }
    );

    const resetAnimationState = function() {
        preview_node.style.willChange = "";
        finalPreviewAnimation = null;
    };

    const completeExit = function() {
        preview_section.hide();
        isFinalPreviewExiting = false;
        resetAnimationState();
    };

    const cancelExit = function() {
        isFinalPreviewExiting = false;
        resetAnimationState();
    };

    finalPreviewAnimation.addEventListener("finish", completeExit, { once: true });
    finalPreviewAnimation.addEventListener("cancel", cancelExit, { once: true });
}

function runAfterImageLoad(src, callback) {
    const image_loader = new Image();
    let is_complete = false;

    const complete = function() {
        if (is_complete) return;
        is_complete = true;
        callback();
    };

    image_loader.addEventListener("load", complete, { once: true });
    image_loader.addEventListener("error", complete, { once: true });
    image_loader.src = src;

    if (image_loader.complete) {
        complete();
    }
}


function afterFoundOptimalSolution(msg) {
    $("#phone-warn").hide();
    const instructions = msg.instructions;
    const instructions_count = instructions.length;
    enchants_list = msg.enchants

    const solution_section = $("#solution");
    const solution_header = $("#solution-header");
    const solution_steps = $("#steps");
    const steps_header = $("#solution h3");
    const should_animate_entry = !solution_section.is(":visible") || isSolutionPanelExiting;

    solution_steps.html("");
    solution_section.show();
    if (should_animate_entry) {
        animateSolutionPanelEntry(solution_section);
    }

    if (instructions_count === 0) {
        solution_header.html(UI_STRINGS.no_solution_found);
        steps_header.html("");
        updateCumulativeCost(0, 0);
    } else {
        const item_namespace = retrieveSelectedItem();
        updateSolutionIdentity(item_namespace);

        steps_header.html(UI_STRINGS.steps);

        const item = msg.item_obj;
        const cumulative_levels = msg.extra[0];
        const minimum_xp = item.x;
        const maximum_xp = msg.extra[1];
        updateCumulativeCost(cumulative_levels, maximum_xp, minimum_xp);

        instructions.forEach((instruction, index) => {
            addInstructionDisplay(instruction, index + 1);
        });
    }

    if (typeof pugsChoiceCascadeCalculationCallback === "function") {
        const callback = pugsChoiceCascadeCalculationCallback;
        pugsChoiceCascadeCalculationCallback = null;
        callback();
    }
}

function buttonMatchesNamespace(button, enchantment_namespace) {
    const button_namespace = button.data("namespace");
    return button_namespace === enchantment_namespace;
}

function buttonMatchesLevel(button, enchantment_level) {
    const button_level = button.data("level");
    return button_level === enchantment_level;
}

function filterButton(button, enchantment_namespace, enchantment_level = -1) {
    const button_matches_name = buttonMatchesNamespace(button, enchantment_namespace);
    const button_matches_level = buttonMatchesLevel(button, enchantment_level);
    return button_matches_name && !button_matches_level;
}

function levelButtonForNamespaceAndLevel(enchantment_namespace, enchantment_level) {
    const enchantment_buttons = $("#enchants button.level-button");
    const level_button = enchantment_buttons.filter(function() {
        const this_button = $(this);
        return buttonMatchesNamespace(this_button, enchantment_namespace) && buttonMatchesLevel(this_button, enchantment_level);
    });
    return level_button.first();
}

function cancelPugsChoiceCascade() {
    pugsChoiceCascadeRunToken += 1;
    pugsChoiceCascadeCalculationCallback = null;
    if (pugsChoiceCascadeTimer) {
        clearTimeout(pugsChoiceCascadeTimer);
        pugsChoiceCascadeTimer = null;
    }
}

function turnOffButtons(buttons) {
    buttons.addClass("off");
    buttons.removeClass("on");
}

function turnOnButtons(buttons) {
    buttons.addClass("on");
    buttons.removeClass("off");
}

function selectedEnchantmentNamespacesSet() {
    const selected_enchantments = new Set();
    const selected_buttons = $("#enchants button.level-button.on");

    selected_buttons.each(function(_button_index, button) {
        const selected_button = $(button);
        const namespace = selected_button.data("namespace");
        if (namespace) {
            selected_enchantments.add(namespace);
        }
    });

    return selected_enchantments;
}

function rowForEnchantmentNamespace(enchantment_namespace) {
    return $("#enchants tr.enchant-row").filter(function() {
        return $(this).data("namespace") === enchantment_namespace;
    });
}

function refreshMutualExclusionRowStates() {
    const selected_namespaces = selectedEnchantmentNamespacesSet();
    const conflicting_namespaces = new Set();
    const enchantment_rows = $("#enchants tr.enchant-row");

    enchantment_rows.removeClass("is-selected is-conflicting");

    if (selected_namespaces.size === 0) return;

    selected_namespaces.forEach(selected_namespace => {
        rowForEnchantmentNamespace(selected_namespace).addClass("is-selected");

        const metadata = data.enchants[selected_namespace];
        if (!metadata || !Array.isArray(metadata.incompatible)) return;

        metadata.incompatible.forEach(incompatible_namespace => {
            if (!selected_namespaces.has(incompatible_namespace)) {
                conflicting_namespaces.add(incompatible_namespace);
            }
        });
    });

    conflicting_namespaces.forEach(conflicting_namespace => {
        rowForEnchantmentNamespace(conflicting_namespace).addClass("is-conflicting");
    });
}

function filterEnchantmentButtons(incompatible_namespaces) {
    const enchantment_buttons = $("#enchants button.level-button");

    incompatible_namespaces.forEach(incompatible_namespace => {
        const matching_buttons = enchantment_buttons.filter(function () {
            const this_button = $(this);
            return filterButton(this_button, incompatible_namespace);
        });
        turnOffButtons(matching_buttons);
    });
}

function updateLevelButtonForOnState(level_button) {
    const button_data = level_button.data();
    const enchantments_metadata = data.enchants;
    const enchantment_buttons = $("#enchants button.level-button");

    turnOnButtons(level_button);

    const enchantment_namespace = button_data.namespace;
    const enchantment_level = button_data.level;

    const matching_buttons = enchantment_buttons.filter(function () {
        const this_button = $(this);
        return filterButton(this_button, enchantment_namespace, enchantment_level);
    });
    turnOffButtons(matching_buttons);

    const enchantment_metadata = enchantments_metadata[enchantment_namespace];
    const incompatible_namespaces = enchantment_metadata.incompatible;
    filterEnchantmentButtons(incompatible_namespaces);
}

function isTooManyEnchantments(enchantment_count) {
    return enchantment_count > ENCHANTMENT_LIMIT_INCLUSIVE;
}

function levelButtonClicked(button_clicked) {
    cancelPugsChoiceCascade();

    const button_is_on = button_clicked.hasClass("on");
    let selection_changed = false;

    if (button_is_on) {
        turnOffButtons(button_clicked);
        selection_changed = true;
    } else {
        const enchantment_foundation = retrieveEnchantmentFoundation();
        const enchantment_count = enchantment_foundation.length;
        const is_too_many = isTooManyEnchantments(enchantment_count + 1);

        if (is_too_many) {
            let alert_text = "";
            alert_text += UI_STRINGS.too_many_enchantments;
            alert_text += UI_STRINGS.more_than + ENCHANTMENT_LIMIT_INCLUSIVE + UI_STRINGS.enchantments_are_not_recommended;
            alert_text += UI_STRINGS.please_select_enchantments;
            alert(alert_text);
        } else {
            updateLevelButtonForOnState(button_clicked);
            selection_changed = true;
        }
    }

    if (selection_changed) {
        runAutoCalculation();
    }
}

function applyPugsChoiceSelection() {
    cancelPugsChoiceCascade();

    const item_namespace = retrieveSelectedItem();
    const pugs_choice_enchantments = pugsChoiceEnchantmentsForItem(item_namespace);
    if (!pugs_choice_enchantments) return;

    const enchantment_buttons = $("#enchants button.level-button");
    if (enchantment_buttons.length === 0) return;

    turnOffButtons(enchantment_buttons);
    refreshMutualExclusionRowStates();
    updateFinalPreview();

    const applyInstantly = shouldReduceMotion();
    if (applyInstantly) {
        pugs_choice_enchantments.forEach(([enchantment_namespace, enchantment_level]) => {
            const level_button = levelButtonForNamespaceAndLevel(enchantment_namespace, enchantment_level);
            if (level_button.length === 0) return;
            updateLevelButtonForOnState(level_button);
        });
        runAutoCalculation();
        return;
    }

    pugsChoiceCascadeRunToken += 1;
    const run_token = pugsChoiceCascadeRunToken;
    let enchantment_index = 0;

    const applyNextEnchantment = function() {
        if (run_token !== pugsChoiceCascadeRunToken) return;

        if (enchantment_index >= pugs_choice_enchantments.length) {
            pugsChoiceCascadeTimer = null;
            return;
        }

        const [enchantment_namespace, enchantment_level] = pugs_choice_enchantments[enchantment_index];
        enchantment_index += 1;

        const level_button = levelButtonForNamespaceAndLevel(enchantment_namespace, enchantment_level);
        if (level_button.length === 0) {
            pugsChoiceCascadeTimer = window.setTimeout(applyNextEnchantment, PUGS_CHOICE_CASCADE_STEP_MS);
            return;
        }

        updateLevelButtonForOnState(level_button);

        pugsChoiceCascadeCalculationCallback = function() {
            if (run_token !== pugsChoiceCascadeRunToken) return;
            pugsChoiceCascadeTimer = window.setTimeout(applyNextEnchantment, PUGS_CHOICE_CASCADE_STEP_MS);
        };

        runAutoCalculation();
    };

    applyNextEnchantment();
}

function retrieveEnchantmentFoundation() {
    const enchantment_foundation = [];
    const buttons_on = $("#enchants button.level-button.on");

    buttons_on.each(function(button_index, button) {
        const enchantment_level = $(button).data("level");
        const enchantment_namespace = $(button).data("namespace");
        enchantment_foundation.push([enchantment_namespace, enchantment_level]);
    });

    return enchantment_foundation;
}

function retrieveSelectedItem() {
    return $("select#item option:selected").val();
}

function updateFinalPreview() {
    const preview = $("#final-preview");
    const item_namespace = retrieveSelectedItem();

    if (!item_namespace) {
        animateFinalPreviewExit(preview);
        return;
    }

    const enchantment_foundation = retrieveEnchantmentFoundation();
    const has_enchantments = enchantment_foundation.length > 0;
    if (!has_enchantments) {
        animateFinalPreviewExit(preview);
        return;
    }

    const item_name = displayItemName(item_namespace, true);
    const icon_src = iconPathForItem(item_namespace, has_enchantments);

    const enchantment_list = $("#final-preview-enchants");
    enchantment_list.html("");

    enchantment_foundation.forEach(([enchantment_namespace, enchantment_level]) => {
        const enchantment_text = displayEnchantmentLine(enchantment_namespace, enchantment_level);
        $("<li>").text(enchantment_text).appendTo(enchantment_list);
    });

    $("#final-preview-icon")
        .attr("src", icon_src)
        .attr("alt", item_name)
        .toggleClass("final-preview-icon-enchanted", has_enchantments)
        .toggleClass("final-preview-icon-unenchanted", !has_enchantments);

    const should_animate_entry = !preview.is(":visible") || isFinalPreviewExiting;
    preview.show();
    if (should_animate_entry) {
        animateFinalPreviewEntry(preview);
    }
}

function runAutoCalculation() {
    updateItemSelectorPreview();
    refreshMutualExclusionRowStates();
    updateFinalPreview();

    const enchantment_foundation = retrieveEnchantmentFoundation();
    if (enchantment_foundation.length > 0) {
        calculate();
        return;
    }

    $("#phone-warn").hide();
    animateSolutionPanelExit($("#solution"));
    $("#error").hide();
    updateSolutionHeader(DEFAULT_CHEAPNESS_MODE);
}

function calculate() {
    const enchantment_foundation = retrieveEnchantmentFoundation();
    if (enchantment_foundation.length === 0) return;

    const item_namespace = retrieveSelectedItem();
    if (!item_namespace) return;

    startCalculating(item_namespace, enchantment_foundation, DEFAULT_CHEAPNESS_MODE);
}

function solutionHeaderTextFromMode(mode) {
    let solution_header_text;
    if (mode === "levels") {
        solution_header_text = UI_STRINGS.optimal_solution_cumulative_levels;
    } else if (mode === "prior_work") {
        solution_header_text = UI_STRINGS.optimal_solution_prior_work;
    }
    return solution_header_text;
}

function updateSolutionHeader(mode) {
    const solution_panel = $("#solution");
    const solution_is_animating_out = isSolutionPanelExiting && solution_panel.is(":visible");
    if (solution_is_animating_out) {
        return;
    }

    const selected_item_namespace = retrieveSelectedItem();
    if (selected_item_namespace) {
        $("#solution-header").text(displayItemName(selected_item_namespace, true));
        return;
    }

    const solution_header_text = solutionHeaderTextFromMode(mode);
    const solution_header = $("#solution-header");
    solution_header.text(solution_header_text);
}

function startCalculating(item_namespace, enchantment_foundation, mode) {
    if (enchantment_foundation.length >= 6) {
        if (
            navigator.userAgent.match(/Android/i) ||
            navigator.userAgent.match(/iPhone/i) ||
            navigator.userAgent.match(/iPad/i)
        ) {
            $("#phone-warn").show();
        }
    }

    $("#error").hide();
    resetWorker();

    worker.postMessage({
        msg: "process",
        item: item_namespace,
        enchants: enchantment_foundation,
        mode: mode
    });
}

function applyUiStrings() {
    const h1Element = document.getElementsByTagName('h1')[0];
    h1Element.textContent = APP_TITLE;
    document.title = APP_TITLE;

    const subtitleElement = document.getElementById("app-tagline");
    if (subtitleElement) {
        subtitleElement.textContent = APP_TAGLINE;
    }

    /* selection */
    const options = document.getElementById("item").getElementsByTagName("option");
    let i = 1;

    options[0].textContent = UI_STRINGS.choose_an_item_to_enchant;
    data.items.forEach(item_namespace => {
        options[i].textContent = UI_STRINGS.items[item_namespace];
        i++;
    });

    rebuildItemCustomDropdown();

    /* other UI */
    document.getElementById("total-cost-label").textContent = UI_STRINGS.total_cost;

    $("select#item").change();
    syncPugsChoiceButtonState();
    $("#solution").hide();
    $("#error").hide();
}
