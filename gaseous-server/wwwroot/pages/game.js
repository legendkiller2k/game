var gameId = getQueryString('id', 'int');
var gameData;
var artworks = null;
var artworksPosition = 0;
var artworksTimer = null;
var selectedScreenshot = 0;
var remapCallCounter = 0;
var remapCallCounterMax = 0;

function SetupPage() {
    ajaxCall('/api/v1.1/Games/' + gameId, 'GET', function (result) {
        // populate games page
        gameData = result;

        // get name
        var gameTitleLabel = document.getElementById('gametitle_label');
        gameTitleLabel.innerHTML = result.name;

        // get critic rating
        if (gameData.totalRating) {
            var criticscoreval = document.getElementById('gametitle_criticrating_value');
            criticscoreval.innerHTML = Math.floor(gameData.totalRating) + '%';

            if (gameData.totalRatingCount) {
                var criticscorelabel = document.getElementById('gametitle_criticrating_label');
                criticscorelabel.innerHTML = '<img src="/images/IGDB_logo.svg" style="filter: invert(100%); height: 13px; margin-bottom: -5px;" /><span style="font-size: 10px;"> User Rating<br />' + "based on " + gameData.totalRatingCount + " votes</span>"
            }
        }

        // get alt name
        var gameTitleAltLabel = document.getElementById('gametitle_alts');
        if (result.alternativeNames) {
            ajaxCall('/api/v1.1/Games/' + gameId + '/alternativename', 'GET', function (result) {
                var altNames = '';
                for (var i = 0; i < result.length; i++) {
                    if (altNames.length > 0) {
                        altNames += ', ';
                    }
                    altNames += result[i].name;
                }
                var gameTitleAltLabelText = document.getElementById('gametitle_alts_label');
                gameTitleAltLabelText.innerHTML = altNames;
            });
        } else {
            gameTitleAltLabel.setAttribute('style', 'display: none;');
        }

        // get summary
        var gameSummaryLabel = document.getElementById('gamesummarytext_label');
        if (result.summary || result.storyline) {
            if (result.summary) {
                gameSummaryLabel.innerHTML = result.summary.replaceAll("\n", "<br />");
            } else {
                gameSummaryLabel.innerHTML = result.storyline.replaceAll("\n", "<br />");
            }

            if (gameSummaryLabel.offsetHeight < gameSummaryLabel.scrollHeight ||
                gameSummaryLabel.offsetWidth < gameSummaryLabel.scrollWidth) {
                // your element has overflow and truncated
                // show read more / read less button
                document.querySelector('#gamesummarytext_label_button_expand').setAttribute('style', '');
            } else {
                // your element doesn't overflow (not truncated)
            }
        } else {
            gameSummaryLabel.setAttribute('style', 'display: none;');
        }

        // load cover
        var gameSummaryCover = document.getElementById('gamesummary_cover');
        var gameImage = document.createElement('img');
        gameImage.className = 'game_cover_image';
        if (result.cover) {
            ajaxCall('/api/v1.1/Games/' + gameId + '/cover', 'GET', function (coverResult) {
                if (coverResult) {
                    gameImage.src = '/api/v1.1/Games/' + gameId + '/cover/image/cover_big/' + coverResult.imageId + '.jpg';

                    loadArtwork(result, coverResult);
                } else {
                    gameImage.src = '/images/unknowngame.png';
                    gameImage.className = 'game_cover_image unknown';

                    loadArtwork(result);
                }
            });
        } else {
            gameImage.src = '/images/unknowngame.png';
            gameImage.className = 'game_cover_image unknown';

            loadArtwork(result);
        }
        gameSummaryCover.appendChild(gameImage);

        // load companies
        var gameHeaderDeveloperLabel = document.getElementById('gamedeveloper_label');
        var gameDeveloperLabel = document.getElementById('gamesummary_developer');
        var gameDeveloperContent = document.getElementById('gamesummary_developer_content');
        var gamePublisherLabel = document.getElementById('gamesummary_publishers');
        var gamePublisherContent = document.getElementById('gamesummary_publishers_content');
        var gameDeveloperLoaded = false;
        var gamePublisherLoaded = false;
        if (result.involvedCompanies) {
            ajaxCall('/api/v1.1/Games/' + gameId + '/companies', 'GET', function (result) {
                var lstDevelopers = [];
                var lstPublishers = [];

                for (var i = 0; i < result.length; i++) {
                    var companyLabel = document.createElement('span');
                    companyLabel.className = 'gamegenrelabel';
                    companyLabel.innerHTML = result[i].company.name;

                    if (result[i].involvement.developer == true) {
                        if (!lstDevelopers.includes(result[i].company.name)) {
                            if (gameHeaderDeveloperLabel.innerHTML.length > 0) {
                                gameHeaderDeveloperLabel += ", ";
                            }
                            gameHeaderDeveloperLabel.innerHTML += result[i].company.name;

                            gameDeveloperContent.appendChild(companyLabel);

                            lstDevelopers.push(result[i].company.name);

                            gameDeveloperLoaded = true;
                        }
                    } else {
                        if (result[i].involvement.publisher == true) {
                            if (!lstPublishers.includes(result[i].company.name)) {
                                lstPublishers.push(result[i].company.name);
                                gamePublisherContent.appendChild(companyLabel);
                                gamePublisherLoaded = true;
                            }
                        }
                    }
                }

                if (gameDeveloperLoaded == false) {
                    gameHeaderDeveloperLabel.setAttribute('style', 'display: none;');
                    gameDeveloperLabel.setAttribute('style', 'display: none;');
                }
                if (gamePublisherLoaded == false) {
                    gamePublisherLabel.setAttribute('style', 'display: none;');
                }
            });
        } else {
            gameHeaderDeveloperLabel.setAttribute('style', 'display: none;');
            gameDeveloperLabel.setAttribute('style', 'display: none;');
            gamePublisherLabel.setAttribute('style', 'display: none;');
        }

        // load statistics
        ajaxCall('/api/v1.1/Statistics/Games/' + gameId, 'GET', function (result) {
            var gameStat_lastPlayed = document.getElementById('gamestatistics_lastplayed_value');
            var gameStat_timePlayed = document.getElementById('gamestatistics_timeplayed_value');
            if (result) {
                // gameStat_lastPlayed.innerHTML = moment(result.sessionEnd).format("YYYY-MM-DD h:mm:ss a");
                const dateOptions = {
                    //weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                };
                gameStat_lastPlayed.innerHTML = new Date(result.sessionEnd).toLocaleDateString(undefined, dateOptions);
                if (result.sessionLength >= 60) {
                    gameStat_timePlayed.innerHTML = Number(result.sessionLength / 60) + " hours";
                } else {
                    gameStat_timePlayed.innerHTML = Number(result.sessionLength) + " minutes";
                }
            } else {
                gameStat_lastPlayed.innerHTML = '-';
                gameStat_timePlayed.innerHTML = '-';
            }
        });

        // load favourites
        ajaxCall('/api/v1.1/Games/' + gameId + '/favourite', 'GET', function (result) {
            var gameFavButton = document.getElementById('gamestatistics_favourite_button');
            var gameFavIcon = document.createElement('img');
            gameFavIcon.id = "gamestatistics_favourite";
            gameFavIcon.className = "favouriteicon";
            gameFavIcon.title = "Favourite";
            gameFavIcon.alt = "Favourite";

            if (result == true) {
                gameFavIcon.setAttribute("src", '/images/favourite-filled.svg');
                gameFavIcon.setAttribute('onclick', "SetGameFavourite(false);");
            } else {
                gameFavIcon.setAttribute("src", '/images/favourite-empty.svg');
                gameFavIcon.setAttribute('onclick', "SetGameFavourite(true);");
            }

            gameFavButton.innerHTML = '';
            gameFavButton.appendChild(gameFavIcon);
        });

        // load release date
        var gameSummaryRelease = document.getElementById('gamesummary_firstrelease');
        var gameSummaryReleaseContent = document.getElementById('gamesummary_firstrelease_content');
        if (result.firstReleaseDate) {
            var firstRelease = document.createElement('span');
            firstRelease.innerHTML = moment(result.firstReleaseDate).format('LL') + ' (' + moment(result.firstReleaseDate).fromNow() + ')';
            gameSummaryReleaseContent.appendChild(firstRelease);
        } else {
            gameSummaryRelease.setAttribute('style', 'display: none;');
        }

        // load ratings
        let gameSummaryRatings = document.getElementById('gamesummary_ratings');
        let gameSummaryRatingsContent = document.getElementById('gamesummary_ratings_content');
        if (result.ageRatings) {
            ajaxCall('/api/v1.1/Games/' + gameId + '/agerating', 'GET', function (result) {
                let classTable = document.createElement('table');

                let SpotlightClassifications = GetRatingsBoards();

                let ratingSelected = false;
                for (let r = 0; r < SpotlightClassifications.length; r++) {
                    for (let i = 0; i < result.length; i++) {
                        if (result[i].ratingBoard == SpotlightClassifications[r]) {
                            let ratingImage = document.createElement('img');
                            ratingImage.src = '/images/Ratings/' + result[i].ratingBoard + '/' + result[i].ratingTitle + '.svg';
                            let ratingString = ClassificationBoards[result[i].ratingBoard] + "\nRating: " + ClassificationRatings[result[i].ratingTitle];
                            if (result[i].descriptions.length > 0) {
                                ratingString += '\nContains: ' + result[i].descriptions.join(', ');
                            }
                            ratingImage.title = ratingString;

                            ratingImage.className = 'rating_image';

                            let classTableRow = document.createElement('tr');
                            let classTableLogo = document.createElement('td');
                            classTableLogo.className = 'rating_image_logo_table';
                            classTableLogo.appendChild(ratingImage);
                            classTableRow.appendChild(classTableLogo);
                            let classTableDescription = document.createElement('td');
                            if (result[i].descriptions.length > 0) {
                                classTableDescription.innerHTML = result[i].descriptions.join('<br />');
                            } else {
                                classTableDescription.innerHTML = ClassificationRatings[result[i].ratingTitle];
                            }
                            classTableRow.appendChild(classTableDescription);
                            classTable.appendChild(classTableRow);

                            gameSummaryRatingsContent.appendChild(classTable);
                            ratingSelected = true;
                            break;
                        }
                    }
                    if (ratingSelected == true) { break; }
                }

                if (ratingSelected == false) {
                    gameSummaryRatings.setAttribute('style', 'display: none;');
                }
            });
        } else {
            gameSummaryRatings.setAttribute('style', 'display: none;');
        }

        // load genres
        var gameSummaryGenres = document.getElementById('gamesumarry_genres');
        var gameSummaryGenresContent = document.getElementById('gamesumarry_genres_content');
        if (result.genres) {
            ajaxCall('/api/v1.1/Games/' + gameId + '/genre', 'GET', function (result) {
                for (var i = 0; i < result.length; i++) {
                    var genreLabel = document.createElement('span');
                    genreLabel.className = 'gamegenrelabel';
                    genreLabel.innerHTML = result[i].name;

                    gameSummaryGenresContent.appendChild(genreLabel);
                }
            });
        } else {
            gameSummaryGenres.setAttribute('style', 'display: none;');
        }

        // get platforms
        var platformFilter = document.getElementById('platform_filter');
        platformFilter.style.width = "200px";
        $(platformFilter).select2({
            minimumResultsForSearch: Infinity
        });
        ajaxCall('/api/v1.1/Games/' + gameId + '/platforms', 'GET', function (result) {
            // add default option
            var platformFilter_default = document.createElement('option');
            platformFilter_default.value = "-1";
            platformFilter_default.innerHTML = "All Platforms";
            platformFilter_default.selected = "selected";
            platformFilter.appendChild(platformFilter_default);

            for (var i = 0; i < result.length; i++) {
                var platformFilter_opt = document.createElement('option');
                platformFilter_opt.value = result[i].key;
                platformFilter_opt.innerHTML = result[i].value;
                platformFilter.appendChild(platformFilter_opt);
            }

            // load media groups
            loadMediaGroups();

            // load roms
            loadRoms(false, 1);
        });

        // load screenshots
        var gameScreenshots = document.getElementById('gamescreenshots');
        if (result.screenshots || result.videos) {
            var gameScreenshots_Main = document.getElementById('gamescreenshots_main');

            // load static screenshots
            var gameScreenshots_Gallery = document.getElementById('gamescreenshots_gallery_panel');
            var imageIndex = 0;
            if (result.videos) {
                imageIndex = result.videos.ids.length;
            }
            if (result.screenshots) {
                ajaxCall('/api/v1.1/Games/' + gameId + '/screenshots', 'GET', function (screenshotsItem) {
                    for (var i = 0; i < screenshotsItem.length; i++) {
                        var screenshotItem = document.createElement('li');
                        screenshotItem.id = 'gamescreenshots_gallery_' + imageIndex;
                        screenshotItem.setAttribute('name', 'gamescreenshots_gallery_item');
                        screenshotItem.setAttribute('style', 'background-image: url("/api/v1.1/Games/' + gameId + '/screenshots/' + screenshotsItem[i].id + '/image/screenshot_thumb/' + screenshotsItem[i].imageId + '.jpg"); background-position: center; background-repeat: no-repeat; background-size: contain;)');
                        screenshotItem.setAttribute('imageid', imageIndex);
                        screenshotItem.setAttribute('imagetype', 0);
                        screenshotItem.className = 'gamescreenshots_gallery_item';
                        screenshotItem.setAttribute('onclick', 'selectScreenshot(' + imageIndex + ');');
                        gameScreenshots_Gallery.appendChild(screenshotItem);
                        imageIndex += 1;
                    }

                    selectScreenshot(0);
                });
            }

            // load videos
            if (result.videos) {
                ajaxCall('/api/v1.1/Games/' + gameId + '/videos', 'GET', function (result) {
                    var gameScreenshots_vGallery = document.getElementById('gamescreenshots_gallery_panel');
                    for (var i = 0; i < result.length; i++) {
                        var vScreenshotItem = document.createElement('li');
                        vScreenshotItem.id = 'gamescreenshots_gallery_' + i;
                        vScreenshotItem.setAttribute('name', 'gamescreenshots_gallery_item');
                        vScreenshotItem.setAttribute('style', 'background-image: url("https://i.ytimg.com/vi/' + result[i].videoId + '/hqdefault.jpg"); background-position: center; background-repeat: no-repeat; background-size: contain;)');
                        vScreenshotItem.setAttribute('imageid', i);
                        vScreenshotItem.setAttribute('imagetype', 1);
                        vScreenshotItem.setAttribute('imageref', result[i].videoId);
                        vScreenshotItem.className = 'gamescreenshots_gallery_item';
                        vScreenshotItem.setAttribute('onclick', 'selectScreenshot(' + i + ');');

                        var youtubeIcon = document.createElement('img');
                        youtubeIcon.src = '/images/YouTube.svg';
                        youtubeIcon.className = 'gamescreenshosts_gallery_item_youtube';
                        vScreenshotItem.appendChild(youtubeIcon);

                        gameScreenshots_vGallery.insertBefore(vScreenshotItem, gameScreenshots_vGallery.firstChild);
                    }

                    // sort items
                    var items = gameScreenshots_vGallery.childNodes;
                    var itemsArr = [];
                    for (var i in items) {
                        if (items[i].nodeType == 1) { // get rid of the whitespace text nodes
                            itemsArr.push(items[i]);
                        }
                    }

                    itemsArr.sort(function (a, b) {
                        return Number(a.getAttribute('imageid')) == Number(b.getAttribute('imageid'))
                            ? 0
                            : (Number(a.getAttribute('imageid')) > Number(b.getAttribute('imageid')) ? 1 : -1);
                    });

                    for (i = 0; i < itemsArr.length; ++i) {
                        gameScreenshots_vGallery.appendChild(itemsArr[i]);
                    }

                    selectScreenshot(0);
                }, function (error) {
                    selectScreenshot(0);
                });
            } else {
                //selectScreenshot(0);
            }
        } else {
            gamescreenshots.setAttribute('style', 'display: none;');
        }

        // load similar
        var gameSummarySimilar = document.getElementById('gamesummarysimilar');
        ajaxCall('/api/v1.1/Games/' + gameId + '/Related', 'GET', function (result) {
            console.log(result);
            if (result.games.length > 0) {
                gameSummarySimilar.removeAttribute('style');

                var gameSummarySimilarContent = document.getElementById('gamesummarysimilarcontent');
                for (var i = 0; i < result.games.length; i++) {
                    var similarObject = renderGameIcon(result.games[i], true, true, true, GetRatingsBoards(), false, true);
                    gameSummarySimilarContent.appendChild(similarObject);
                }

                $('.lazy').Lazy({
                    scrollDirection: 'vertical',
                    effect: 'fadeIn',
                    visibleOnly: true
                });
            } else {
                gameSummarySimilar.setAttribute('style', 'display: none;');
            }
        });
    });

    $('#rom_edit_fixplatform').select2({
        minimumInputLength: 3,
        placeholder: "Platform",
        ajax: {
            url: '/api/v1.1/Search/Platform',
            data: function (params) {
                var query = {
                    SearchString: params.term
                }

                // Query parameters will be ?SearchString=[term]
                return query;
            },
            processResults: function (data) {
                var arr = [];

                for (var i = 0; i < data.length; i++) {
                    arr.push({
                        id: data[i].id,
                        text: data[i].name
                    });
                }

                return {
                    results: arr
                };

            }
        }
    });

    $('#rom_edit_fixplatform').on('select2:select', function (e) {
        var platformData = e.params.data;

        var gameValue = $('#rom_edit_fixgame').select2('data');
        if (gameValue) {
            setRomFixGameDropDown();
        }
    });

    setRomFixGameDropDown();
};

function loadMediaGroups() {
    ajaxCall('/api/v1.1/Games/' + gameId + '/romgroup', 'GET', function (result) {
        // display media groups
        var mediaGroup = document.getElementById('gamesummarymediagroups');
        var mediaGroupDiv = document.getElementById('gamesummarymediagroupscontent');
        if (result.length == 0) {
            mediaGroup.style.display = 'none';
        } else {
            mediaGroup.style.display = '';
            mediaGroupDiv.innerHTML = '';
            var mgTable = document.createElement('table');
            mgTable.id = 'mediagrouptable';
            mgTable.className = 'romtable';
            mgTable.setAttribute('cellspacing', 0);
            mgTable.appendChild(createTableRow(true, ['Platform', 'Images', 'Size', '', '', '', '']));

            lastPlatform = '';
            for (var i = 0; i < result.length; i++) {
                var mediaGroup = result[i];

                // get rom details including emulator and friendly platform name
                var launchButton = '';
                var saveStatesButton = '';
                if (mediaGroup.emulator) {
                    if (mediaGroup.emulator.type.length > 0) {
                        var romPath = encodeURIComponent('/api/v1.1/Games/' + gameId + '/romgroup/' + mediaGroup.id + '/' + gameData.name + '.zip');

                        if (mediaGroup.hasSaveStates == true) {
                            var modalVariables = {
                                "romId": mediaGroup.id,
                                "IsMediaGroup": true,
                                "engine": mediaGroup.emulator.type,
                                "core": mediaGroup.emulator.core,
                                "platformid": mediaGroup.platformId,
                                "gameid": gameId,
                                "mediagroup": 1,
                                "rompath": romPath
                            };
                            saveStatesButton = document.createElement('div');
                            saveStatesButton.setAttribute('onclick', 'showDialog("emulatorloadstate", ' + JSON.stringify(modalVariables) + ');');
                            saveStatesButton.innerHTML = '<img src="/images/SaveStates.png" class="savedstateicon" />';
                        }

                        launchButton = '<a href="/index.html?page=emulator&engine=' + mediaGroup.emulator.type + '&core=' + mediaGroup.emulator.core + '&platformid=' + mediaGroup.platformId + '&gameid=' + gameId + '&romid=' + mediaGroup.id + '&mediagroup=1&rompath=' + romPath + '" class="romstart">Launch</a>';
                    }
                }

                var statusText = mediaGroup.status;
                var downloadLink = '';
                var packageSize = '-';
                var launchButtonContent = '';
                var inProgress = false;
                switch (mediaGroup.status) {
                    case 'NoStatus':
                        statusText = '-';
                        break;
                    case "WaitingForBuild":
                        statusText = 'Build pending';
                        inProgress = true;
                        break;
                    case "Building":
                        statusText = 'Building';
                        inProgress = true;
                        break;
                    case "Completed":
                        statusText = 'Available';
                        downloadLink = '<a href="/api/v1.1/Games/' + gameId + '/romgroup/' + mediaGroup.id + '/' + gameData.name + '.zip" class="romlink"><img src="/images/download.svg" class="banner_button_image" alt="Download" title="Download" /></a>';
                        packageSize = formatBytes(mediaGroup.size);
                        launchButtonContent = launchButton;
                        break;
                    case "Failed":
                        statusText = 'Build error';
                        break;
                    default:
                        statusText = result[i].buildStatus;
                        break;
                }

                if (inProgress == true) {
                    setTimeout(loadMediaGroups, 10000);
                }

                var deleteButton = '<a href="#" onclick="showSubDialog(\'mediagroupdelete\', ' + mediaGroup.id + ');" class="romlink"><img src="/images/delete.svg" class="banner_button_image" alt="Delete" title="Delete" /></a>';

                var newRow = [
                    mediaGroup.platform,
                    mediaGroup.romIds.length,
                    packageSize,
                    statusText,
                    saveStatesButton,
                    launchButtonContent,
                    '<div style="text-align: right;">' + downloadLink + deleteButton + '</div>'
                ]

                var mgRowBody = document.createElement('tbody');
                mgRowBody.className = 'romrow';

                mgRowBody.appendChild(createTableRow(false, newRow, '', 'romcell'));

                var mgRomRow = document.createElement('tr');
                var mgRomCell = document.createElement('td');
                mgRomCell.setAttribute('colspan', 7);
                mgRomCell.className = 'romGroupTitles';


                // iterate the group members
                var groupMembers = [];
                for (var r = 0; r < mediaGroup.roms.length; r++) {
                    groupMembers.push(mediaGroup.roms[r]);
                }

                groupMembers.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
                var groupMemberNames = [];
                for (var r = 0; r < groupMembers.length; r++) {
                    groupMemberNames.push(groupMembers[r].name);
                }
                mgRomCell.innerHTML = groupMemberNames.join("<br />");
                mgRomRow.appendChild(mgRomCell);
                mgRowBody.appendChild(mgRomRow);

                mgTable.appendChild(mgRowBody);
            }

            mediaGroupDiv.appendChild(mgTable);
        }
    });
}

function loadRoms(displayCheckboxes, pageNumber) {
    if (!pageNumber) {
        pageNumber = 1;
    }

    selectedPlatform = $('#platform_filter').select2('data')[0].id;

    var nameSearchQuery = '';
    var nameSearch = document.getElementById('name_filter').value;
    if (nameSearch != undefined && nameSearch != "") {
        nameSearchQuery = '&NameSearch=' + encodeURIComponent(nameSearch);
    }

    var existingTable = document.getElementById('romtable');
    if (existingTable) {
        existingTable.remove();
    }

    var romPager = document.getElementById('romPaginator');
    if (romPager) {
        romPager.remove();
    }

    if (displayCheckboxes == undefined) {
        if (document.getElementById('rom_edit_panel').style.display == 'none') {
            displayCheckboxes = false;
        } else {
            displayCheckboxes = true;
        }
    }

    var gameRomsSection = document.getElementById('gamesummaryroms');
    var gameRoms = document.getElementById('gamesummaryromscontent');
    var pageSize = 20;
    ajaxCall('/api/v1.1/Games/' + gameId + '/roms?pageNumber=' + pageNumber + '&pageSize=' + pageSize + '&platformId=' + selectedPlatform + nameSearchQuery, 'GET', function (result) {
        var romCount = document.getElementById('games_roms_count');
        if (result.count != 1) {
            romCount.innerHTML = result.count + ' ROMs';
        } else {
            romCount.innerHTML = result.count + ' ROM';
        }

        if (result.gameRomItems) {
            var gameRomItems = result.gameRomItems;

            // display roms
            var newTable = document.createElement('table');
            newTable.id = 'romtable';
            newTable.className = 'romtable';
            newTable.setAttribute('cellspacing', 0);
            newTable.appendChild(createTableRow(true, [['<input id="rom_mastercheck" type="checkbox" onclick="selectAllChecks(); handleChecks();"/>', 'rom_checkbox_box_hidden', 'rom_edit_checkbox'], 'Name', 'Size', 'Media', '', '', '', '']));

            var lastPlatform = '';
            for (var i = 0; i < gameRomItems.length; i++) {
                if (gameRomItems[i].platform != lastPlatform) {
                    lastPlatform = gameRomItems[i].platform;
                    var platformRow = document.createElement('tr');
                    var platformHeader = document.createElement('th');
                    platformHeader.setAttribute('colspan', 8);
                    platformHeader.innerHTML = '<a href="#" onclick="ShowPlatformMappingDialog(' + gameRomItems[i].platformId + ');" style="float: right; text-decoration: none;" class="romlink"><img src="/images/map.svg" class="banner_button_image banner_button_image_smaller" alt="Edit platform mapping" title="Edit platform mapping" /></a><a href="#" onclick="ShowCollectionDialog(' + gameRomItems[i].platformId + ');" style="float: right; text-decoration: none;" class="romlink"><img src="/images/collections.svg" class="banner_button_image banner_button_image_smaller" alt="Add to collection" title="Add to collection" /></a>' + gameRomItems[i].platform;
                    platformRow.appendChild(platformHeader);
                    newTable.appendChild(platformRow);
                }

                var saveStatesButton = '';
                var launchButton = '';
                if (result.gameRomItems[i].emulator) {
                    if (gameRomItems[i].emulator.type) {
                        if (gameRomItems[i].emulator.type.length > 0) {
                            var romPath = encodeURIComponent('/api/v1.1/Games/' + gameId + '/roms/' + gameRomItems[i].id + '/' + gameRomItems[i].name);
                            if (gameRomItems[i].hasSaveStates == true) {
                                var modalVariables = {
                                    "romId": gameRomItems[i].id,
                                    "IsMediaGroup": false,
                                    "engine": gameRomItems[i].emulator.type,
                                    "core": gameRomItems[i].emulator.core,
                                    "platformid": gameRomItems[i].platformId,
                                    "gameid": gameId,
                                    "mediagroup": 0,
                                    "rompath": romPath
                                };
                                saveStatesButton = document.createElement('div');
                                saveStatesButton.setAttribute('onclick', 'showDialog("emulatorloadstate", ' + JSON.stringify(modalVariables) + ');');
                                saveStatesButton.innerHTML = '<img src="/images/SaveStates.png" class="savedstateicon" />';
                            }
                            launchButton = '<a href="/index.html?page=emulator&engine=' + gameRomItems[i].emulator.type + '&core=' + gameRomItems[i].emulator.core + '&platformid=' + gameRomItems[i].platformId + '&gameid=' + gameId + '&romid=' + gameRomItems[i].id + '&mediagroup=0&rompath=' + romPath + '" class="romstart">Launch</a>';
                        }
                    }
                }

                let romInfoButton = document.createElement('div');
                romInfoButton.className = 'properties_button';
                //romInfoButton.setAttribute('onclick', 'showDialog(\'rominfo\', ' + gameRomItems[i].id + ');');
                romInfoButton.setAttribute('data-romid', gameRomItems[i].id);
                romInfoButton.addEventListener('click', function () {
                    const romInfoDialog = new rominfodialog(gameId, this.getAttribute('data-romid'));
                    romInfoDialog.open();
                });
                romInfoButton.innerHTML = 'i';


                var newRow = [
                    ['<input type="checkbox" name="rom_checkbox" data-gameid="' + gameData.id + '" data-platformid="' + gameRomItems[i].platformId + '" data-romid="' + gameRomItems[i].id + '" onclick="handleChecks();" />', 'rom_checkbox_box_hidden', 'rom_edit_checkbox'],
                    '<a href="/api/v1.1/Games/' + gameId + '/roms/' + gameRomItems[i].id + '/' + encodeURIComponent(gameRomItems[i].name) + '" class="romlink">' + gameRomItems[i].name + '</a>',
                    formatBytes(gameRomItems[i].size, 2),
                    gameRomItems[i].romTypeMedia,
                    gameRomItems[i].mediaLabel,
                    saveStatesButton,
                    launchButton,
                    romInfoButton
                ];
                newTable.appendChild(createTableRow(false, newRow, 'romrow romrowgamepage', 'romcell'));
            }

            gameRoms.appendChild(newTable);

            if (displayCheckboxes == true) {
                DisplayROMCheckboxes(true);
            }

            if (result.count > pageSize) {
                // draw pagination
                var numOfPages = Math.ceil(result.count / pageSize);

                var romPaginator = document.createElement('div');
                romPaginator.id = 'romPaginator';
                romPaginator.className = 'rom_pager';

                // draw previous page button
                var prevPage = document.createElement('span');
                prevPage.className = 'rom_pager_number_disabled';
                prevPage.innerHTML = '&lt;';
                if (pageNumber != 1) {
                    prevPage.setAttribute('onclick', 'loadRoms(' + undefined + ', ' + (pageNumber - 1) + ', ' + selectedPlatform + ');');
                    prevPage.className = 'rom_pager_number';
                }
                romPaginator.appendChild(prevPage);

                // draw page numbers
                for (var i = 0; i < numOfPages; i++) {
                    var romPaginatorPage = document.createElement('span');
                    romPaginatorPage.className = 'rom_pager_number_disabled';
                    romPaginatorPage.innerHTML = (i + 1);
                    if ((i + 1) != pageNumber) {
                        romPaginatorPage.setAttribute('onclick', 'loadRoms(' + undefined + ', ' + (i + 1) + ', ' + selectedPlatform + ');');
                        romPaginatorPage.className = 'rom_pager_number';
                    }

                    romPaginator.appendChild(romPaginatorPage);
                }

                // draw next page button
                var nextPage = document.createElement('span');
                nextPage.className = 'rom_pager_number_disabled';
                nextPage.innerHTML = '&gt;';
                if (pageNumber != numOfPages) {
                    nextPage.setAttribute('onclick', 'loadRoms(' + undefined + ', ' + (pageNumber + 1) + ', ' + selectedPlatform + ');');
                    nextPage.className = 'rom_pager_number';
                }
                romPaginator.appendChild(nextPage);

                gameRoms.appendChild(romPaginator);

                gameRomsSection.appendChild(gameRoms);
            }
        } else {
            gameRomsSection.setAttribute('style', 'display: none;');
        }
    },
        function (error) {

        });
}

function loadArtwork(game, cover) {
    // show default background
    let bg = document.getElementById('bgImage');
    let bgPath;
    if (cover) {
        bgPath = "/api/v1.1/Games/" + gameId + "/cover/image/original/" + cover.imageId + ".jpg";
    } else {
        var randomInt = randomIntFromInterval(1, 3);
        bgPath = "/images/gamebg" + randomInt + ".jpg";
    }
    bg.setAttribute('style', 'background-image: url(' + bgPath + ');');

    // load artwork
    if (!artworks) {
        if (game.artworks) {
            ajaxCall('/api/v1.1/Games/' + gameId + '/artwork', 'GET', function (result) {
                artworks = result;
                var startPos = randomIntFromInterval(0, result.length);
                artworksPosition = startPos;
                rotateBackground();
            });
        }
    }
}

function rotateBackground() {
    if (artworks) {
        artworksPosition += 1;
        if (artworks[artworksPosition] == null) {
            artworksPosition = 0;
        }
        var bg = document.getElementById('bgImage');
        bg.setAttribute('style', 'background-image: url("/api/v1.1/Games/' + gameId + '/artwork/' + artworks[artworksPosition].id + '/image/original/' + artworks[artworksPosition].imageId + '.jpg");');
        artworksTimer = setTimeout(rotateBackground, 60000);
    }
}

function selectScreenshot(index) {
    var gameScreenshots_Main = document.getElementById('gamescreenshots_main');
    var gameScreenshots_Selected = document.getElementById('gamescreenshots_gallery_' + index);
    var gameScreenshots_Items = document.getElementsByName('gamescreenshots_gallery_item');

    // set the selction class
    for (var i = 0; i < gameScreenshots_Items.length; i++) {
        if (gameScreenshots_Items[i].id == gameScreenshots_Selected.id) {
            gameScreenshots_Items[i].classList.add('gamescreenshosts_gallery_item_selected');
            gameScreenshots_Selected.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
        } else {
            gameScreenshots_Items[i].classList.remove('gamescreenshosts_gallery_item_selected');
        }
    }

    // set the screenshot
    gameScreenshots_Main.innerHTML = '';
    switch (gameScreenshots_Selected.getAttribute('imagetype')) {
        case "0":
        default:
            // screenshot
            gameScreenshots_Main.setAttribute('style', gameScreenshots_Selected.getAttribute('style').replace("/image/screenshot_thumb", "/image/original"));
            break;
        case "1":
            // video
            gameScreenshots_Main.setAttribute('style', '');

            var videoIFrame = document.createElement('iframe');
            videoIFrame.setAttribute('height', '290');
            videoIFrame.setAttribute('width', '515');
            videoIFrame.setAttribute('frameBorder', '0');
            videoIFrame.setAttribute('src', 'https://www.youtube.com/embed/' + gameScreenshots_Selected.getAttribute('imageref') + '?autoplay=1&mute=1');

            gameScreenshots_Main.appendChild(videoIFrame);

            break;
    }

    selectedScreenshot = index;
}

function selectScreenshot_Next() {
    var gameScreenshots_Items = document.getElementsByName('gamescreenshots_gallery_item');

    selectedScreenshot += 1;

    if (selectedScreenshot >= gameScreenshots_Items.length) {
        selectedScreenshot = 0;
    }

    selectScreenshot(selectedScreenshot);
}

function selectScreenshot_Prev() {
    var gameScreenshots_Items = document.getElementsByName('gamescreenshots_gallery_item');

    selectedScreenshot = selectedScreenshot - 1;

    if (selectedScreenshot < 0) {
        selectedScreenshot = gameScreenshots_Items.length - 1;
    }

    selectScreenshot(selectedScreenshot);
}

function DisplayROMCheckboxes(visible) {
    var checkbox_boxes = document.getElementsByName('rom_edit_checkbox');

    for (var i = 0; i < checkbox_boxes.length; i++) {
        if (visible == true) {
            checkbox_boxes[i].className = 'rom_checkbox_box';
        } else {
            checkbox_boxes[i].className = 'rom_checkbox_box_hidden';
        }
    }

    var editButton = document.getElementById('rom_edit');
    var deleteButton = document.getElementById('rom_edit_panel');
    if (visible == true) {
        editButton.innerHTML = 'Cancel';
        deleteButton.style.display = '';
    } else {
        editButton.innerHTML = 'Edit';
        document.getElementById('rom_mastercheck').checked = false;
        deleteButton.style.display = 'none';
        selectAllChecks(false);
    }
    editButton.setAttribute('onclick', 'DisplayROMCheckboxes(' + !visible + ');');
}

function selectAllChecks(value) {
    var mastercheckbox = document.getElementById('rom_mastercheck');
    var checkboxes = document.getElementsByName('rom_checkbox');
    for (var i = 0; i < checkboxes.length; i++) {
        if (value) {
            checkboxes[i].checked = value;
        } else {
            checkboxes[i].checked = mastercheckbox.checked;
        }
    }
}

function handleChecks() {
    var masterCheck = document.getElementById('rom_mastercheck');

    var checkboxes = document.getElementsByName('rom_checkbox');

    var firstPlatformId = undefined;
    var includesDifferentPlatforms = false;
    var checkCount = 0;
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked == true) {
            checkCount += 1;
            if (firstPlatformId == undefined) {
                // set our comparison platform
                firstPlatformId = checkboxes[i].getAttribute('data-platformid');
            } else if (firstPlatformId != checkboxes[i].getAttribute('data-platformid')) {
                includesDifferentPlatforms = true;
            }
        }
    }

    if (checkCount == checkboxes.length) {
        masterCheck.checked = true;
    } else {
        masterCheck.checked = false;
    }

    if (firstPlatformId == undefined) {
        includesDifferentPlatforms = true;
    }

    if (checkCount < 2) {
        includesDifferentPlatforms = true;
    }

    var creategroupButton = document.getElementById('rom_edit_creategroup');
    if (includesDifferentPlatforms == false) {
        creategroupButton.removeAttribute('disabled');
    } else {
        creategroupButton.setAttribute('disabled', 'disabled');
    }
}

function setRomFixGameDropDown() {
    $('#rom_edit_fixgame').empty().select2({
        minimumInputLength: 3,
        templateResult: DropDownRenderGameOption,
        placeholder: "Game",
        ajax: {
            url: '/api/v1.1/Search/Game',
            data: function (params) {
                fixplatform = $('#rom_edit_fixplatform').select2('data');

                var query = {
                    PlatformId: fixplatform[0].id,
                    SearchString: params.term
                }

                // Query parameters will be ?SearchString=[term]
                return query;
            },
            processResults: function (data) {
                var arr = [];

                for (var i = 0; i < data.length; i++) {
                    arr.push({
                        id: data[i].id,
                        text: data[i].name,
                        cover: data[i].cover,
                        releaseDate: data[i].firstReleaseDate
                    });
                }

                return {
                    results: arr
                };
            }
        }
    });
}

function remapTitles() {
    var fixplatform = $('#rom_edit_fixplatform').select2('data');
    var fixgame = $('#rom_edit_fixgame').select2('data');

    if (fixplatform[0] && fixgame[0]) {
        var rom_checks = document.getElementsByName('rom_checkbox');

        for (var i = 0; i < rom_checks.length; i++) {
            if (rom_checks[i].checked == true) {
                remapCallCounterMax += 1;
            }
        }

        if (remapCallCounterMax > 0) {
            showProgress();

            for (var i = 0; i < rom_checks.length; i++) {
                if (rom_checks[i].checked == true) {
                    var romId = rom_checks[i].getAttribute('data-romid');
                    remapCallCounter += 1;
                    ajaxCall('/api/v1.1/Games/' + gameId + '/roms/' + romId + '?NewPlatformId=' + fixplatform[0].id + '&NewGameId=' + fixgame[0].id, 'PATCH', function (result) {
                        remapTitlesCallback();
                    }, function (result) {
                        remapTitlesCallback();
                    });
                }
            }
        }
    }
}

function remapTitlesCallback() {
    remapCallCounter = remapCallCounter - 1;

    if (remapCallCounter <= 0) {
        closeProgress();
        loadRoms(true);
        remapCallCounter = 0;
        remapCallCounterMax = 0;
    }
}

function deleteGameRoms() {
    var rom_checks = document.getElementsByName('rom_checkbox');
    var itemsChecked = false;
    for (var i = 0; i < rom_checks.length; i++) {
        if (rom_checks[i].checked == true) {
            itemsChecked = true;
            break;
        }
    }
    if (itemsChecked == true) {
        showSubDialog('romsdelete');
    }
}

function deleteGameRomsCallback() {
    var rom_checks = document.getElementsByName('rom_checkbox');
    for (var i = 0; i < rom_checks.length; i++) {
        if (rom_checks[i].checked == true) {
            var romId = rom_checks[i].getAttribute('data-romid');
            remapCallCounter += 1;
            ajaxCall('/api/v1.1/Games/' + gameId + '/roms/' + romId, 'DELETE', function (result) {
                remapTitlesCallback();
            });
        }
    }
}

function showProgress() {
    // Get the modal
    var submodal = document.getElementById("myModalProgress");

    // When the user clicks on the button, open the modal 
    submodal.style.display = "block";
}

function closeProgress() {
    // Get the modal
    var submodal = document.getElementById("myModalProgress");

    submodal.style.display = "none";
}

function ShowCollectionDialog(platformId) {
    modalVariables = platformId;
    showSubDialog("collectionaddgame");
}

function createMgGroup() {
    var checkboxes = document.getElementsByName('rom_checkbox');

    var platformId = undefined;
    var romIds = [];
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked == true) {
            if (platformId == undefined) {
                platformId = checkboxes[i].getAttribute('data-platformid');
            }
            romIds.push(checkboxes[i].getAttribute('data-romid'));
        }
    }

    ajaxCall(
        '/api/v1.1/Games/' + gameId + '/romgroup?PlatformId=' + platformId,
        'POST',
        function (result) {
            DisplayROMCheckboxes(false);
            loadRoms();
            loadMediaGroups();
        },
        function (error) {
            DisplayROMCheckboxes(false);
            loadRoms();
            loadMediaGroups();
        },
        JSON.stringify(romIds)
    );
}

function SetGameFavourite(status) {
    ajaxCall(
        '/api/v1.1/Games/' + gameId + '/favourite?favourite=' + status,
        'POST',
        function (result) {
            var gameFavButton = document.getElementById('gamestatistics_favourite_button');
            var gameFavIcon = document.createElement('img');
            gameFavIcon.id = "gamestatistics_favourite";
            gameFavIcon.className = "favouriteicon";
            gameFavIcon.title = "Favourite";
            gameFavIcon.alt = "Favourite";

            if (result == true) {
                gameFavIcon.setAttribute("src", '/images/favourite-filled.svg');
                gameFavIcon.setAttribute('onclick', "SetGameFavourite(false);");
            } else {
                gameFavIcon.setAttribute("src", '/images/favourite-empty.svg');
                gameFavIcon.setAttribute('onclick', "SetGameFavourite(true);");
            }

            gameFavButton.innerHTML = '';
            gameFavButton.appendChild(gameFavIcon);
        }
    );
}