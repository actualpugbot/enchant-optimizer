const ENCHANTMENT_LIMIT_INCLUSIVE = 10;

let worker;
let start_time;
let total_steps;
let total_tries;
let languageJson;
let languageId;
let enchants_list;

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
        base: "./images/helmet.gif",
        enchanted: "./images/helmet_enchanted.gif",
    },
    chestplate: {
        base: "./images/chestplate.gif",
        enchanted: "./images/chestplate_enchanted.gif",
    },
    leggings: {
        base: "./images/leggings.gif",
        enchanted: "./images/leggings_enchanted.gif",
    },
    boots: {
        base: "./images/boots.gif",
        enchanted: "./images/boots_enchanted.gif",
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
        base: "./images/spear.gif",
        enchanted: "./images/spear_enchanted.gif",
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
        enchanted: "./images/flint_and_steel_enchanted.png",
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

const languages = {
    'en'    : 'English',

    // in alphabetical order
    'de'    : 'Deutsch',
    'es-ES' : 'Español',
    'fr-FR' : 'Français',
    'it-IT' : 'Italiano',
    'id'    : 'Indonesia',
    'hu-HU' : 'Magyar',
    'nl'    : 'Nederlands',
    'pl-PL' : 'Polski',
    'pt-BR' : 'Português',
    'vi-VN' : 'Tiếng Việt',
    'tr-TR' : 'Türkçe',
    'be-BY' : 'Беларуская',
    'ru-RU' : 'Русский',
    'ua-UA' : 'Українська',
    'th-TH' : 'ภาษาไทย',
    'zh-CN' : '简体中文',
    'zh-TW' : '繁體中文',
    'ja-JP' : '日本語',
    'ko-KR' : '한국어',
    'ar'    : 'اَلْعَرَبِيَّةُ',
};

const languages_cache_key = 6;

const prefers_color_scheme = window.matchMedia("(prefers-color-scheme: dark)");
if (prefers_color_scheme.matches) {
    document.documentElement.dataset.theme = 'dark';
    localStorage.setItem("tswitch-theme", 'dark');
} else {
    document.documentElement.dataset.theme = 'light';
    localStorage.setItem("tswitch-theme", 'light');
}

window.onload = function() {

    resetWorker();

    buildItemSelection();
    buildEnchantmentSelection();
    buildFilters();
    setupLanguage();
};

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

function buildFilters() {
    $("#allow_incompatible").change(allowIncompatibleChanged);
    $("#allow_many").change(allowManyChanged);
    $('input[name="cheapness-mode"]').change(runAutoCalculation);
}

function buildItemSelection() {
    data.items.forEach(item_namespace => {
        const item_listbox_metadata = { value: item_namespace };
        const item_listbox = $("<option/>", item_listbox_metadata);
        item_listbox.text(item_namespace).appendTo("select#item");
    });
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

        let allow_enchantment = false;
        if (item_namespace_chosen === "book") {
            allow_enchantment = true;
        } else {
            item_namespaces.forEach(item_namespace => {
                if (item_namespace === item_namespace_chosen) {
                    allow_enchantment = true;
                }
            });
        }

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
        enchantment_group.forEach(enchantment_namespace => {
            const enchantment_metadata = enchantments_metadata[enchantment_namespace];
            const enchantment_max_level = enchantment_metadata.levelMax;
            const enchantment_name = languageJson.enchants[enchantment_namespace];

            const enchantment_row = $("<tr>");
            enchantment_row.addClass(group_toggle_color ? "group1" : "group2");
            enchantment_row.append($("<td>").append(enchantment_name));
            const enchantment_levels = $("<div>").addClass("level-buttons");
            const enchantment_levels_cell = $("<td>").addClass("level-buttons-cell");
            for (let enchantment_level = 1; enchantment_level <= enchantment_level_maxmax; enchantment_level++) {
                if (enchantment_max_level >= enchantment_level) {
                    const enchantment_button_data = {
                        level: enchantment_level,
                        enchant: enchantment_name
                    };
                    const enchantment_button = $("<button>");
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

function doAllowIncompatibleEnchantments() {
    const allow_incompatible_checkbox = $("#allow_incompatible");
    return allow_incompatible_checkbox.is(":checked");
}

function doAllowManyEnchantments() {
    const allow_many_checkbox = $("#allow_many");
    return allow_many_checkbox.is(":checked");
}

function allowIncompatibleChanged() {
    const allow_incompatible = doAllowIncompatibleEnchantments();
    if (!allow_incompatible) {
        turnOffLevelButtons();
    }
}

function allowManyChanged() {
    const allow_many = doAllowManyEnchantments();
    if (!allow_many) {
        turnOffLevelButtons();
    }
}

function turnOffLevelButtons() {
    const enchantment_buttons = $(".level-button");
    turnOffButtons(enchantment_buttons);
    runAutoCalculation();
}

function buildEnchantmentSelection() {
    $("select#item").change(function() {
        const item_namespace_selected = $("select#item option:selected").val();
        if (item_namespace_selected) {
            buildEnchantList(item_namespace_selected);
            $("#overrides").show();
        } else {
            $("#enchants").hide();
            $("#overrides").hide();
            $("#final-preview").hide();
            $("#phone-warn").hide();
            $("#solution").hide();
            $("#error").hide();
        }
    });

    $("#enchants table").on("click", "button", function() {
        levelButtonClicked($(this));
    });
}

function displayTime(time_milliseconds) {
    let time_text;

    if (time_milliseconds < 1) {
        const time_microseconds = Math.round(time_milliseconds * 1000);
        time_text = Math.round(time_microseconds) + languageJson.microseconds;
    } else if (time_milliseconds < 1000) {
        const time_round = Math.round(time_milliseconds);
        time_text = pluralize(time_round, 'millisecond');
    } else {
        const time_seconds = Math.round(time_milliseconds / 1000);
        time_text = pluralize(time_seconds, 'second');
    }

    return time_text;
}

function displayLevelsText(levels) {
    let level_text;
    level_text = pluralize(levels, 'level');
    return level_text;
}

function pluralize(num, key_root) {

    if (languageJson.use_russian_plurals) {
      if ((num % 10 === 1) && (num < 10 || num > 15)) {
        return String(num) + languageJson[key_root];
      } else if ((num % 10 === 2 || num % 10 === 3 || num % 10 === 4) && (num < 10 || num > 15)) {
        return String(num) + languageJson[key_root + '_low'];
      } else {
        return String(num) + languageJson[key_root + '_high'];
      }
    }

    if (num === 1) {
      return String(num) + languageJson[key_root];
    } else {
      return String(num) + languageJson[key_root + '_s'];
    }
}

function displayXpText(xp, minimum_xp = -1) {
    let xp_text = "";
    if (minimum_xp >= 0) {
        xp_text += commaify(minimum_xp) + "-";
    }
    xp_text += commaify(xp) + languageJson.xp;
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
    const enchantment_name = languageJson.enchants[enchantment_namespace] || enchantment_namespace;
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
        if (languageJson.enchants.hasOwnProperty(item_obj.I)) {
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
        return languageJson.enchants.hasOwnProperty(enchantment_namespace);
    });
    return {
        item_namespace: item_namespace,
        enchantments: enchantments_unique,
    };
}

function iconPathForItem(item_namespace, is_enchanted = false) {
    const icon_variant = ITEM_ICON_VARIANTS[item_namespace];
    if (icon_variant) {
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
    const item_name = languageJson.items[item_data.item_namespace] || item_data.item_namespace;
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

    const cost_text = languageJson.cost + displayLevelXpText(levels, xp);
    const prior_work_text = languageJson.prior_work_penalty + displayLevelsText(work);

    return {
        left: buildStepItemElement(left_item_obj),
        right: buildStepItemElement(right_item_obj),
        meta: cost_text + " | " + prior_work_text,
    };
}

function displayEnchantmentsText(enchants) {
    const enchantment_labels = [];
    enchants.forEach(enchantment_namespace => {
        if (!languageJson.enchants.hasOwnProperty(enchantment_namespace)) return;
        enchantment_labels.push(displayEnchantmentLine(enchantment_namespace));
    });
    return enchantment_labels.join(", ");
}

function displayItemText(item_obj) {
    const item_data = extractItemDisplayData(item_obj);
    const item_namespace = item_data.item_namespace;
    const icon_src = iconPathForItem(item_namespace, item_data.enchantments.length > 0);
    const icon_text = '<img src="' + icon_src + '" class="icon" alt="">';
    const items_metadata = languageJson.items;
    const item_name = items_metadata[item_namespace];
    const enchantments_text = displayEnchantmentsText(item_data.enchantments);

    if (!enchantments_text) {
        return icon_text + " " + item_name;
    }

    return icon_text + " " + item_name + " (" + enchantments_text + ")";
}

function findItemNamespace(item) {
    if (!item) {
        return undefined;
    }

    if (typeof item.I === "string") {
        return languageJson.enchants.hasOwnProperty(item.I) ? "book" : item.I;
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

function updateTime(time_milliseconds) {
    const timing_text = languageJson.completed_in + displayTime(time_milliseconds);
    $("#timings").text(timing_text);
    $("#timings").show();
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

function updateSolutionIdentity(item_namespace, selected_enchantments) {
    const solution_header = $("#solution-header");
    const item_name = languageJson.items[item_namespace] || item_namespace;
    solution_header.text(item_name);

    const pickaxe_priority = ["silk_touch", "fortune"];
    let signature_enchant = "";

    if (item_namespace === "pickaxe") {
        pickaxe_priority.forEach(enchantment_namespace => {
            if (!signature_enchant && selected_enchantments.includes(enchantment_namespace)) {
                signature_enchant = enchantment_namespace;
            }
        });
    }

    if (!signature_enchant && selected_enchantments.length === 1) {
        signature_enchant = selected_enchantments[0];
    }

    if (signature_enchant) {
        const signature_text = "[" + displayEnchantmentLine(signature_enchant) + "]";
        $("#solution-subheader").text(signature_text);
    } else {
        $("#solution-subheader").text("");
    }
}


function afterFoundOptimalSolution(msg) {
    $("#phone-warn").hide();
    $("#timings").hide();
    const instructions = msg.instructions;
    const instructions_count = instructions.length;
    enchants_list = msg.enchants

    const solution_section = $("#solution");
    const solution_header = $("#solution-header");
    const solution_steps = $("#steps");
    const steps_header = $("#solution h3");

    solution_steps.html("");
    solution_section.show();

    if (instructions_count === 0) {
        solution_header.html(languageJson.no_solution_found);
        $("#solution-subheader").text("");
        steps_header.html("");
        updateCumulativeCost(0, 0);
    } else {
        const item_namespace = retrieveSelectedItem();
        const selected_enchantments = msg.enchants.map(([enchantment_namespace]) => enchantment_namespace);
        updateSolutionIdentity(item_namespace, selected_enchantments);

        steps_header.html(languageJson.steps);

        const item = msg.item_obj;
        const cumulative_levels = msg.extra[0];
        const minimum_xp = item.x;
        const maximum_xp = msg.extra[1]; // UNUSED
        updateCumulativeCost(cumulative_levels, maximum_xp, minimum_xp);

        instructions.forEach((instruction, index) => {
            addInstructionDisplay(instruction, index + 1);
        });
    }
}

function enchantmentNamespaceFromStylized(enchantment_name) {
    const enchantments_metadata = data.enchants;
    const enchantment_namespaces = Object.keys(enchantments_metadata);

    let namespace_match = "";
    enchantment_namespaces.forEach(enchantment_namespace => {
        const enchantment_name_check = languageJson.enchants[enchantment_namespace];
        if (enchantment_name_check === enchantment_name) namespace_match = enchantment_namespace;
    });

    return namespace_match;
}

function buttonMatchesName(button, enchantment_name) {
    const button_name = button.data("enchant");
    return button_name === enchantment_name;
}

function buttonMatchesLevel(button, enchantment_level) {
    const button_level = button.data("level");
    return button_level === enchantment_level;
}

function filterButton(button, enchantment_name, enchantment_level = -1) {
    const button_matches_name = buttonMatchesName(button, enchantment_name);
    const button_matches_level = buttonMatchesLevel(button, enchantment_level);
    return button_matches_name && !button_matches_level;
}

function turnOffButtons(buttons) {
    buttons.addClass("off");
    buttons.removeClass("on");
}

function turnOnButtons(buttons) {
    buttons.addClass("on");
    buttons.removeClass("off");
}

function filterEnchantmentButtons(incompatible_namespaces) {
    const enchantments_metadata = data.enchants;
    const enchantment_buttons = $("#enchants button");

    incompatible_namespaces.forEach(incompatible_namespace => {
        const incompatible_name = languageJson.enchants[incompatible_namespace];

        const matching_buttons = enchantment_buttons.filter(function () {
            const this_button = $(this);
            return filterButton(this_button, incompatible_name);
        });
        turnOffButtons(matching_buttons);
    });
}

function updateLevelButtonForOnState(level_button) {
    const button_data = level_button.data();
    const enchantments_metadata = data.enchants;
    const enchantment_buttons = $("#enchants button");

    turnOnButtons(level_button);

    const enchantment_name = button_data.enchant;
    const enchantment_level = button_data.level;

    const matching_buttons = enchantment_buttons.filter(function () {
        const this_button = $(this);
        return filterButton(this_button, enchantment_name, enchantment_level);
    });
    turnOffButtons(matching_buttons);

    const allow_incompatible = doAllowIncompatibleEnchantments();
    if (!allow_incompatible) {
        const enchantment_namespace = enchantmentNamespaceFromStylized(enchantment_name);
        const enchantment_metadata = enchantments_metadata[enchantment_namespace];
        const incompatible_namespaces = enchantment_metadata.incompatible;
        filterEnchantmentButtons(incompatible_namespaces);
    }
}

function isTooManyEnchantments(enchantment_count) {
    const allow_many = doAllowManyEnchantments();
    const many_selected = enchantment_count > ENCHANTMENT_LIMIT_INCLUSIVE;
    return !allow_many && many_selected;
}

function levelButtonClicked(button_clicked) {
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
            alert_text += languageJson.too_many_enchantments;
            alert_text += languageJson.more_than + ENCHANTMENT_LIMIT_INCLUSIVE + languageJson.enchantments_are_not_recommended;
            alert_text += languageJson.please_select_enchantments;
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

function retrieveEnchantmentFoundation() {
    const enchantment_foundation = [];
    const buttons_on = $("#enchants button.on");

    buttons_on.each(function(button_index, button) {
        const enchantment_name = $(button).data("enchant");
        const enchantment_level = $(button).data("level");
        const enchantment_namespace = enchantmentNamespaceFromStylized(enchantment_name);
        enchantment_foundation.push([enchantment_namespace, enchantment_level]);
    });

    return enchantment_foundation;
}

function retrieveCheapnessMode() {
    return $('input[name="cheapness-mode"]:checked').val();
}

function retrieveSelectedItem() {
    return $("select#item option:selected").val();
}

function updateFinalPreview() {
    if (!languageJson) return;

    const preview = $("#final-preview");
    const item_namespace = retrieveSelectedItem();

    if (!item_namespace) {
        preview.hide();
        return;
    }

    const enchantment_foundation = retrieveEnchantmentFoundation();
    const has_enchantments = enchantment_foundation.length > 0;
    const item_name = languageJson.items[item_namespace] || item_namespace;

    $("#final-preview-icon")
        .attr("src", iconPathForItem(item_namespace, has_enchantments))
        .attr("alt", item_name)
        .toggleClass("final-preview-icon-enchanted", has_enchantments);

    const enchantment_list = $("#final-preview-enchants");
    enchantment_list.html("");

    if (!has_enchantments) {
        $("<li>")
            .addClass("final-preview-empty")
            .text("Select enchantments to preview the final result.")
            .appendTo(enchantment_list);
    } else {
        enchantment_foundation.forEach(([enchantment_namespace, enchantment_level]) => {
            const enchantment_text = displayEnchantmentLine(enchantment_namespace, enchantment_level);
            $("<li>").text(enchantment_text).appendTo(enchantment_list);
        });
    }

    preview.show();
}

function runAutoCalculation() {
    if (!languageJson) return;
    updateFinalPreview();

    const enchantment_foundation = retrieveEnchantmentFoundation();
    if (enchantment_foundation.length > 0) {
        calculate();
        return;
    }

    $("#phone-warn").hide();
    $("#solution").hide();
    $("#error").hide();
    updateSolutionHeader(retrieveCheapnessMode());
}

function calculate() {
    const enchantment_foundation = retrieveEnchantmentFoundation();
    if (enchantment_foundation.length === 0) return;

    const cheapness_mode = retrieveCheapnessMode();
    const item_namespace = retrieveSelectedItem();
    if (!item_namespace) return;

    startCalculating(item_namespace, enchantment_foundation, cheapness_mode);
}

function solutionHeaderTextFromMode(mode) {
    let solution_header_text;
    if (mode === "levels") {
        solution_header_text = languageJson.optimal_solution_cumulative_levels;
    } else if (mode === "prior_work") {
        solution_header_text = languageJson.optimal_solution_prior_work;
    }
    return solution_header_text;
}

function updateSolutionHeader(mode) {
    const selected_item_namespace = retrieveSelectedItem();
    if (selected_item_namespace && languageJson.items[selected_item_namespace]) {
        $("#solution-header").text(languageJson.items[selected_item_namespace]);
        $("#solution-subheader").text("");
        return;
    }

    const solution_header_text = solutionHeaderTextFromMode(mode);
    const solution_header = $("#solution-header");
    solution_header.text(solution_header_text);
    $("#solution-subheader").text("");
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

    total_steps = enchantment_foundation.length;
    total_tries = 0;
    start_time = performance.now();

    $("#error").hide();
    resetWorker();

    worker.postMessage({
        msg: "process",
        item: item_namespace,
        enchants: enchantment_foundation,
        mode: mode
    });
}

function languageChangeListener(){
    const selectLanguage = document.getElementById('language');
    selectLanguage.addEventListener('change', function() {
        const selectedValue = selectLanguage.value;
        changePageLanguage(selectedValue);
    });
}

async function setupLanguage(){
    for (const i in languages){
        $("<option/>", {'value': i}).text(languages[i]).appendTo('#language');
    }
    defineBrowserLanguage();
    languageChangeListener();
}

function defineBrowserLanguage(){
    if (!localStorage.getItem("savedlanguage")) {
        // language isn't saved and has to be detected
        const browserLanguage = navigator.language || navigator.userLanguage;
        if (languages[browserLanguage]){
            changePageLanguage(browserLanguage);
        } else {
            changePageLanguage('en');
        }
    } else {
        // language is saved, load from save
        changePageLanguage(localStorage.getItem("savedlanguage"));
    }
}

async function changePageLanguage(language){
    if (!languages[language]){
        console.error("Trying to switch to unknown language:", language);
        return;
    }

    languageId = language;
    if (language == 'en'){
      languageJson = await loadJsonLanguage(language).then(languageData => { return languageData});
    }else{
      var languageJsonEn = await loadJsonLanguage('en').then(languageData => { return languageData});
      languageJson = await loadJsonLanguage(language).then(languageData => { return languageData});
      languageJson = mergeKeys(languageJson, languageJsonEn);
    }
    if (languageJson){
        changeLanguageByJson(languageJson);
        localStorage.setItem("savedlanguage", language);
        // ^ Save language choice to localstorage
    }
}

function mergeKeys(a, b){
  var o = {};
  for (var i in b){
    if (typeof b[i] === 'object'){
      o[i] = mergeKeys(a.hasOwnProperty(i) ? a[i] : {}, b[i]);
    }else{
      if (a.hasOwnProperty(i)){
        o[i] = a[i]
      }else{
        o[i] = b[i];
      }
    }
  }
  return o;
}

function loadJsonLanguage(language) {
    return fetch('languages/'+language+'.json?'+languages_cache_key)
      .then(response => {
        if (!response.ok) {
          throw new Error('Can\'t load language file');
        }
        return response.json();
      })
      .then(data => {
        return data;
      })
      .catch(error => {
        console.error('Language file error:', error);
        return null;
      });
}


function changeLanguageByJson(languageJson){
    /* check for duplicate names */
    const map = {};
    for (let i in languageJson.enchants){
        if (map[languageJson.enchants[i]]){
            console.error("Duplicate string for enchant names (must be unique)", languageId, i, map[languageJson.enchants[i]]);
        }
        map[languageJson.enchants[i]] = i;
    }

    const h1Element = document.getElementsByTagName('h1')[0];
    h1Element.textContent = languageJson.h1_title;


    /* selection */
    const options = document.getElementById("item").getElementsByTagName("option");
    let i = 1;

    options[0].textContent = languageJson.choose_an_item_to_enchant;
    data.items.forEach(item_namespace => {
        options[i].textContent = languageJson.items[item_namespace];
        i++;
    });

    /* other UI */
    document.getElementById("override-incompatible").textContent = languageJson.checkbox_label_incompatible;
    document.getElementById("override-max-number").textContent = languageJson.checkbox_label_max_number;

    document.getElementById("optimize-label").textContent = languageJson.optimize_for;
    document.getElementById("optimize-xp").textContent = languageJson.radio_label_optimize_xp;
    document.getElementById("optimize-pwp").textContent = languageJson.radio_label_optimize_pwp;

    document.getElementById("total-cost-label").textContent = languageJson.total_cost;

    $("select#item").change();
    $("#solution").hide();
    $("#error").hide();
}
