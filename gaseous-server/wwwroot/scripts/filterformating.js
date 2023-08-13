﻿function formatFilterPanel(targetElement, result) {
    var panel = document.createElement('div');
    panel.id = 'filter_panel_box';

    panel.appendChild(buildFilterPanelHeader('filter', 'Filter'));

    var containerPanelSearch = document.createElement('div');
    containerPanelSearch.className = 'filter_panel_box';
    var containerPanelSearchField = document.createElement('input');
    containerPanelSearchField.id = 'filter_panel_search';
    containerPanelSearchField.type = 'text';
    containerPanelSearchField.placeholder = 'Search';
    containerPanelSearchField.setAttribute('onkeydown', 'executeFilterDelayed();');
    containerPanelSearch.appendChild(containerPanelSearchField);

    panel.appendChild(containerPanelSearch);

    panel.appendChild(buildFilterPanelHeader('userrating', 'User Rating'));
    var containerPanelUserRating = document.createElement('div');
    containerPanelUserRating.className = 'filter_panel_box';
    var containerPanelUserRatingMinField = document.createElement('input');
    containerPanelUserRatingMinField.id = 'filter_panel_userrating_min';
    containerPanelUserRatingMinField.type = 'number';
    containerPanelUserRatingMinField.placeholder = '0';
    containerPanelUserRatingMinField.setAttribute('onchange', 'executeFilterDelayed();');
    containerPanelUserRatingMinField.setAttribute('onkeydown', 'executeFilterDelayed();');
    containerPanelUserRatingMinField.setAttribute('min', '0');
    containerPanelUserRatingMinField.setAttribute('max', '100');
    containerPanelUserRating.appendChild(containerPanelUserRatingMinField);

    var containerPanelUserRatingMaxField = document.createElement('input');
    containerPanelUserRatingMaxField.id = 'filter_panel_userrating_max';
    containerPanelUserRatingMaxField.type = 'number';
    containerPanelUserRatingMaxField.placeholder = '100';
    containerPanelUserRatingMaxField.setAttribute('onchange', 'executeFilterDelayed();');
    containerPanelUserRatingMaxField.setAttribute('onkeydown', 'executeFilterDelayed();');
    containerPanelUserRatingMaxField.setAttribute('min', '0');
    containerPanelUserRatingMaxField.setAttribute('max', '100');
    containerPanelUserRating.appendChild(containerPanelUserRatingMaxField);

    panel.appendChild(containerPanelUserRating);

    if (result.platforms) {
        buildFilterPanel(panel, 'platform', 'Platforms', result.platforms, true, true);
    }

    if (result.genres) {
        buildFilterPanel(panel, 'genre', 'Genres', result.genres, true, false);
    }

    if (result.gamemodes) {
        buildFilterPanel(panel, 'gamemode', 'Players', result.gamemodes, true, false);
    }

    if (result.playerperspectives) {
        buildFilterPanel(panel, 'playerperspective', 'Player Perspectives', result.playerperspectives, true, false);
    }

    if (result.themes) {
        buildFilterPanel(panel, 'theme', 'Themes', result.themes, true, false);
    }

    targetElement.appendChild(panel);
}

function buildFilterPanel(targetElement, headerString, friendlyHeaderString, valueList, showToggle, initialDisplay) {
    if (showToggle == false) { initialDisplay = true; }
    targetElement.appendChild(buildFilterPanelHeader(headerString, friendlyHeaderString, showToggle, initialDisplay));

    var containerPanel = document.createElement('div');
    containerPanel.className = 'filter_panel_box';
    containerPanel.id = 'filter_panel_box_' + headerString;
    if (initialDisplay == false) {
        containerPanel.setAttribute('style', 'display: none;');
    }
    for (var i = 0; i < valueList.length; i++) {
        containerPanel.appendChild(buildFilterPanelItem(headerString, valueList[i].id, valueList[i].name));
    }
    targetElement.appendChild(containerPanel);
}

function buildFilterPanelHeader(headerString, friendlyHeaderString, showVisibleToggle, toggleInitialValue) {
    var headerToggle = document.createElement('div');
    headerToggle.setAttribute('style', 'float: right;');
    headerToggle.id = 'filter_panel_header_toggle_' + headerString;
    if (toggleInitialValue == true) {
        headerToggle.innerHTML = '-';
    } else {
        headerToggle.innerHTML = '+';
    }
    
    var headerLabel = document.createElement('span');
    headerLabel.innerHTML = friendlyHeaderString;

    var header = document.createElement('div');
    header.id = 'filter_panel_header_' + headerString;
    header.className = 'filter_header';

    if (showVisibleToggle == true) {
        header.appendChild(headerToggle);
        header.setAttribute('onclick', 'toggleFilterPanel("' + headerString + '");');
        header.style.cursor = 'pointer';
    }

    header.appendChild(headerLabel);

    return header;
}

function toggleFilterPanel(panelName) {
    var filterPanel = document.getElementById('filter_panel_box_' + panelName);
    var filterPanelToggle = document.getElementById('filter_panel_header_toggle_' + panelName);

    if (filterPanel.style.display == 'none') {
        filterPanelToggle.innerHTML = '-';
        filterPanel.style.display = '';
    } else {
        filterPanelToggle.innerHTML = '+';
        filterPanel.style.display = 'none';
    }
}

function buildFilterPanelItem(filterType, itemString, friendlyItemString) {
    var filterPanelItem = document.createElement('div');
    filterPanelItem.id = 'filter_panel_item_' + itemString;
    filterPanelItem.className = 'filter_panel_item';

    var filterPanelItemCheckBox = document.createElement('div');

    var filterPanelItemCheckBoxItem = document.createElement('input');
    filterPanelItemCheckBoxItem.id = 'filter_panel_item_' + filterType + '_checkbox_' + itemString;
    filterPanelItemCheckBoxItem.type = 'checkbox';
    filterPanelItemCheckBoxItem.className = 'filter_panel_item_checkbox';
    filterPanelItemCheckBoxItem.name = 'filter_' + filterType;
    filterPanelItemCheckBoxItem.setAttribute('filter_id', itemString);
    filterPanelItemCheckBoxItem.setAttribute('oninput' , 'executeFilter();');
    filterPanelItemCheckBox.appendChild(filterPanelItemCheckBoxItem);

    var filterPanelItemLabel = document.createElement('label');
    filterPanelItemLabel.id = 'filter_panel_item_label_' + itemString;
    filterPanelItemLabel.className = 'filter_panel_item_label';
    filterPanelItemLabel.setAttribute('for', filterPanelItemCheckBoxItem.id);
    filterPanelItemLabel.innerHTML = friendlyItemString;

    filterPanelItem.appendChild(filterPanelItemCheckBox);
    filterPanelItem.appendChild(filterPanelItemLabel);

    return filterPanelItem;
}

var filterExecutor = null;
function executeFilterDelayed() {
    if (filterExecutor) {
        filterExecutor = null;
    }

    filterExecutor = setTimeout(executeFilter, 1000);
}

function executeFilter() {
    // build filter lists
    var queries = [];

    var platforms = '';
    var genres = '';

    var searchString = document.getElementById('filter_panel_search').value;
    if (searchString.length > 0) {
        queries.push('name=' + searchString);
    }

    var minUserRating = 0;
    var minUserRatingInput = document.getElementById('filter_panel_userrating_min').value;
    if (minUserRatingInput) {
        minUserRating = minUserRatingInput;
        queries.push('minrating=' + minUserRating);
    }

    var maxUserRating = 100;
    var maxUserRatingInput = document.getElementById('filter_panel_userrating_max').value;
    if (maxUserRatingInput) {
        maxUserRating = maxUserRatingInput;
        queries.push('maxrating=' + maxUserRating);
    }

    queries.push(GetFilterQuery('platform'));
    queries.push(GetFilterQuery('genre'));
    queries.push(GetFilterQuery('gamemode'));
    queries.push(GetFilterQuery('playerperspective'));
    queries.push(GetFilterQuery('theme'));

    var queryString = '';
    for (var i = 0; i < queries.length; i++) {
        if (queries[i].length > 0) {
            if (queryString.length == 0) {
                queryString = '?';
            } else {
                queryString += '&';
            }

            queryString += queries[i];
        }
    }

    console.log('Query string = ' + queryString);

    ajaxCall('/api/v1/Games' + queryString, 'GET', function (result) {
        var gameElement = document.getElementById('games_library');
        formatGamesPanel(gameElement, result);
    });
}

function GetFilterQuery(filterName) {
    var Filters = document.getElementsByName('filter_' + filterName);
    var queryString = '';

    for (var i = 0; i < Filters.length; i++) {
        if (Filters[i].checked) {
            if (queryString.length > 0) {
                queryString += ',';
            }
            queryString += Filters[i].getAttribute('filter_id');
        }
    }

    if (queryString.length > 0) {
        queryString = filterName + '=' + queryString;
    }

    return queryString;
}