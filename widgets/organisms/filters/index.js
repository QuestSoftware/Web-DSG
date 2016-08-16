if (typeof RootPath == 'undefined') {
    RootPath = '/';
}

// Global variable value
var ajaxArr = [],
    page = 1,
    filterMap = [
        {
            targetID: 'country',
            url: '/widgets/filters/DocumentCountryList.php',
            callback: function () {
                $(this).multipleSelect({
                    placeholder: "Country",
                    multiple: false,
                    selectAll: false,
                    single: true,
                    onClick: function (view) {
                        if (view.value != '') {
                            //TODO: update state data accordingly
                            $('#state_province').next().removeClass('hide');
                        }
                    }
                });
                $(this).multipleSelect("uncheckAll");
            }
        },
        /* {
         targetID: 'event_Type',
         url: '',
         callback: function () {
         $(this).multipleSelect({
         placeholder: $('#event_type').data('selected'),
         minimumCountSelected: 0,
         countSelected: $('#event_type').data('selected') + '&nbsp;(#)',
         selectAllText: 'Select All Events',
         allSelected: 'All Events Selected'
         });
         $(this).multipleSelect("checkAll");
         }
         }, */
        {
            targetID: 'event_date',
            url: '/widgets/filters/EventDateIntervalGet.php',
            callback: function () {
                $(this).multipleSelect({
                    placeholder: "All Event Dates",
                    multiple: false,
                    selectAll: false,
                    single: true
                });
                $(this).multipleSelect("uncheckAll");
            }
        },
        {
            targetID: 'brand',
            url: '/widgets/filters/EventBrandListGet.php',
            callback: function () {
                $(this).multipleSelect({
                    placeholder: "Product Line",
                    multiple: false,
                    selectAll: false,
                    single: true,
                    onClick: function (view) {
                        var obj = {brand: view.value};
                        console.log('product line clicked');

                        ajaxArr.push(populateDropdowns(filterMap[3].targetID, filterMap[3].url, obj, filterMap[3].callback));
                        ajaxArr.push(populateDropdowns(filterMap[4].targetID, filterMap[4].url, obj, filterMap[4].callback));

                    }
                });
                $(this).multipleSelect("uncheckAll");
            }
        },
        {
            targetID: 'product',
            url: '/widgets/filters/EventProductListGet.php',
            callback: function (prevValue) {
                if (this.data('multipleSelect')) {
                    $(this).next().find('ul').remove();
                    $(this).multipleSelect('refresh');
                    $(this).multipleSelect('setSelects', [prevValue]);
                }
                else {
                    $(this).multipleSelect({
                        placeholder: "Product",
                        multiple: false,
                        selectAll: false,
                        single: true,
                        onClick: function (view) {
                            if (view.value != '') {
                                $('#solution').multipleSelect('setSelects', []);
                            }
                        }
                    });
                    $(this).multipleSelect("uncheckAll");
                }
            }
        },
        {
            targetID: 'solution',
            url: '/widgets/filters/EventSolutionListGet.php',
            callback: function (prevValue) {
                if ($(this).data('multipleSelect')) {
                    $(this).next().find('ul').remove();
                    $(this).multipleSelect('refresh');
                    $(this).multipleSelect('setSelects', [prevValue]);
                }
                else {
                    $(this).multipleSelect({
                        placeholder: "Solution",
                        multiple: false,
                        selectAll: false,
                        single: true,
                        onClick: function (view) {
                            if (view.value != '') {
                                $('#product').multipleSelect('setSelects', []);
                            }
                        }
                    });
                    $(this).multipleSelect("uncheckAll");
                }
            }
        },
        {
            targetID: 'language',
            url: '/widgets/filters/EventLanguageListGet.php',
            callback: function () {
                var initlangval = '';

                $(this).multipleSelect({
                    placeholder: "Language",
                    multiple: false,
                    selectAll: false,
                    single: true
                });

                /*
                 if (typeof RootPath == 'string') {
                 switch (RootPath) {
                 case '/br-pt/':
                 initlangval = 139;
                 break;
                 case '/mx-es/':
                 initlangval = 156;
                 break;
                 case '/cn-zh/':
                 initlangval = 202;
                 break;
                 case '/jp-ja/':
                 initlangval = 109;
                 break;
                 case '/fr-fr/':
                 initlangval = 75;
                 break;
                 case '/de-de/':
                 initlangval = 86;
                 break;
                 default:
                 initlangval = 53;
                 break;
                 }

                 if (location.host == 'stage-software-dell-com') {
                 switch (RootPath) {
                 case '/br-pt/':
                 initlangval = 139;
                 break;
                 case '/mx-es/':
                 initlangval = 156;
                 break;
                 case '/cn-zh/':
                 initlangval = 202;
                 break;
                 case '/jp-ja/':
                 initlangval = 109;
                 break;
                 case '/fr-fr/':
                 initlangval = 75;
                 break;
                 case '/de-de/':
                 initlangval = 86;
                 break;
                 default:
                 initlangval = 53;
                 break;
                 }
                 }
                 }
                 */
                initlangval = getLanguageCode();
                $(this).multipleSelect('setSelects', [initlangval]);
            }
        }
    ],
    teaserWidth = 0,
/*
 * beforeEllipsis object collects long filter selection names that would be trimmed by ellipsis script:
 * need to keep original for Hash reuse when building. has two layers top layer for [product, solution and platform]
 * and second level for [industy] a distinction need to be done
 * as two filters can have ellipsis applied [product or solution or platform] + [industry]
 */
    beforEllipsis = {
        val: null,
        text: null,
        industry: {
            val: null,
            text: null
        }
    };

$(document).ready(function () {
    //location.hash
    location.hash = "";

    //Populate all "filter by" dropdowns
    $.each(filterMap, function (i, entry) {
        ajaxArr.push(populateDropdowns(entry.targetID, entry.url, {}, entry.callback));
    });

    //When filters are loaded, execute function 'hashchange'
    $.when.apply(this, ajaxArr).done(function () {
        parseHashTag();

        $('#event_type').multipleSelect({
            placeholder: $('#event_type').data('selected'),
            minimumCountSelected: 0,
            countSelected: $('#event_type').data('selected') + '&nbsp;(#)',
            selectAllText: 'Select All Events',
            allSelected: 'All Events Selected'
        });

        $('#state_province').multipleSelect({
            placeholder: "State",
            multiple: false,
            selectAll: false,
            single: true
        });

        $('#event_type').multipleSelect("checkAll");
        $('#state_province').multipleSelect("uncheckAll");

        $('.filters').data('init-loaded', true);


        ajaxArr = [];
    });

    /*
     $('.filters').on('change', 'select', function() {
     var id = $(this).attr('id');

     if(id == 'brand' && ($(this).val() != '' && $(this).val() != null)) {
     var obj = {brand: $(this).val()};

     populateDropdowns(filterMap[3].targetID, filterMap[3].url, obj, filterMap[3].callback);
     populateDropdowns(filterMap[4].targetID, filterMap[4].url, obj, filterMap[4].callback);
     }
     });
     */


    // to reset drop down selected
    $('body').on('click', '.resetfilter', function (e) {
        e.preventDefault();

        if ($('.filters').hasClass('disabled')) {
            return false;
        }

        // changed to radio button select
        //$('.filters').find('select').each(function () {
        //  $(this).val('');
        //});

        if (location.hash == '') {
            parseHashTag();
        }
        else {
            location.hash = '';
        }

        // multiselect uncheckall
        $("select").multipleSelect("uncheckAll");
        // multiselect checkall default
        $('#event_type').multipleSelect('checkAll');

        // language reset
        $('#language').multipleSelect("setSelects", [getLanguageCode()]);

        // clear location hash
        location.hash = "";
    });

    // filters event handler
    var filterInterval = null;

    $('.filters').on('change', 'select', function () {
        var elem = this;

        // minimum one event selected
        if (elem.name == 'event_type'){
            var eventtype_val = $("#event_type").multipleSelect("getSelects");
            if  ( ! eventtype_val.length > 0 ) {
                $("#event_type").multipleSelect("setSelects", [1]);
            }
        }

        if ($('.filters').data('init-loaded') && filterInterval === null) {
            filterInterval = setInterval(function() {
                if(ajaxArr.length) {
                    $.when(ajaxArr).done(function() {
                        populateListing();
                        ajaxArr = [];
                    });
                }
                else {
                    populateListing();
                }

                clearInterval(filterInterval);
                filterInterval = null;
            }, 100);
        }

        buildAHashTag();
    });

    $('#view-more').on('click', function() {
        populateListing(false);
    });

});

function parseHashTag() {
    var hash = location.hash.substr(1),
        hashArr = hash.split('_'),
        dropdown = {
            product: 'byproduct',
            solution: 'bysolution',
            brand: 'bybrand',
            language: 'bylang'
        },

        promise = null;

    // If no language selected set english as default.
    if ($('#language').val() == 0) {
        $('#language').val('53');
    }

    if (promise == null) {
        promise = $.Deferred().resolve();
    }

    promise.done(function () {
        populateListing();
    });

    return false;
}

function populateDropdowns(dropdown, url, data, callback) {
    //Find previous value
    var elem = $('#' + dropdown), prevValue = elem.val();

    elem.empty();

    //if global variable RootPath is known, prepend it to the url variable
    if (typeof RootPath == 'string') {
        url = RootPath + url;
        url = url.replace('//', '/');
    }

    //Testing only, remove later
    url = 'http://dsg-ryan.codingbyhand.com' + url;

    return $.ajax({
        url: url,
        dataType: 'JSON',
        data: data
    }).done(function (dataopt) {
        $.each(dataopt.data, function (key, val) {
            if (val.id != -1) {
                elem.append('<option value="' + val.ID + '">' + val.DisplayName + '</option>');
            }
        });

        if (typeof callback == 'function') {
            callback.call(elem, prevValue);
        }
    });
}


// iterates selected filters and createsd dataset for ajax call
function updateDataSet(incrementPage) {
    //incrementPage - We assume that if the list is not cleared that we are going to load the next page.

    var dataset = {},
        mapping = {
            event_type: 'event_type',
            event_date: 'event_date',
            prod: 'product',
            sol: 'solution',
            brand: 'brand',
            lg: 'language',
            loc: 'country',
            s_p: 'state_province'
        };

    for (var i in mapping) {
        if ($('#' + mapping[i]).next().is(':visible')) {
            dataset[i] = $('#' + mapping[i]).val();
            if (dataset[i] == -1) {
                dataset[i] = '';
            }
        }
        else {
            dataset[i] = '';
        }
    }

    dataset.interval = 6;

    if (pageType > 2 ){
        dataset.interval = 16;
    } else if (pageType == 1 ){
        dataset.interval = 12;
    }

    dataset.pg = incrementPage ? ++page:1;

    return dataset;
}

function getHashData() {
    var hash = location.hash.substr(1),
        hashArr = hash.split('_'),
        dropdown = {
            product: 'byproduct',
            solution: 'bysolution',
            brand: 'bybrand',
            language: 'bylang'
        },

        promise = null;

    $.each(dropdown, function (filterName, filterMapTo) {
        var hashFound = false,
            regexp = new RegExp('^' + filterMapTo, 'i');
        $.each(hashArr, function (indx, name) {
            if (regexp.test(name)) {
                var selectFilterValue = name.replace(regexp, ''), curFilterValue = $('#' + filterName).val();
                //$('#' + filterName).find('option').each(function () {
                // hash TODO: revisit - ed
                //});
                $('#' + filterName).multipleSelect('setSelects', curFilterValue);
            }
        });

        if (!hashFound) {
            $('#' + filterName).val('');
        }
    });
}

// makes ajax call, result list and index
function populateListing(clear) {
    var url = '/widgets/filters/List.php?', dir = -1;

    // clear equals true, it would clear listings
    if(typeof clear == 'undefined') {
        clear = true;
    }

    if (typeof RootPath == 'string') {
        url = RootPath + url;
        url = url.replace('//', '/');
    }

    $.ajax({
        url: url,
        dataType: 'JSON',
        data: updateDataSet(!clear)
    }).done(function (dataopt) {
        $rowContainer = $('.listing-entries').find('.row');

        if(clear) {
            $rowContainer.empty();
        }

        $.each(dataopt.data, function (key, k) {

            var eventname = k.EventType;

            if (eventname == undefined || eventname == null){
                eventname = 'Web Cast';
            }

            if ( eventname.match(/Online/gi)) {
                console.log('inside online');
                event_bg ='bg-green';
                event_img = 'online-event.jpg';
            } else if ( eventname.match(/In Person/gi)) {
                event_bg ='bg-purple';
                event_img = 'in-person-event.jpg';
            } else if ( eventname.match(/Web Cast/gi)) {
                event_bg = 'bg-orange';
                event_img = 'webcast.jpg';
            }


            $rowContainer.append(
                '<div class="col-md-3 col-sm-4 col-xs-12"> ' +
                '    <a href="#">                          ' +
                '    <div class="border-grey">             ' +
                '    <p class="listing-header ' + event_bg  + ' "> ' + eventname + ' </p>' +
                '<img class="img-responsive" src="../../images/shared/listing-entries/' + event_img +'" ' +
                ' alt="online event info"> ' +
                '    </div> ' +
                '    <h4 class="text-blue">' + k.DisplayName + ' </h4> ' +

                '<p class="teaser"> ' + k.Desc + ' </p> ' +

                ' <p class="dates"> Dates: ' + k.EventDate + ' </p> ' +
                ' </a> ' +
                ' </div> ');

            if (pageType > 2 && ((key+1)%4 == 0) && key != 0 ){
                $rowContainer.append('<div class="clearfix">');
            } else  if (pageType == 1 && ((key+1)%3 == 0) && key != 0 ){
                $rowContainer.append('<div class="clearfix">');
            }
        });

        //TODO: total record counts < pages x 16 or 12 hide View More button
        if (dataopt.count){
            $('#no-results').addClass('hide');
            if (pageType > 2){
                if (dataopt.count > 16 ){
                    $('#view-more').show();
                } else {
                    $('#view-more').hide();
                }
            }else if (pageType == 1){
                if (dataopt.count > 12 ){
                    $('#view-more').show();
                } else {
                    $('#view-more').hide();
                }
            }
        } else {
            $('#no-results').removeClass('hide');
            $('#view-more').hide();
        }
        // add total results number
        $('.total_results').html(dataopt.count);
    });
}

// Generates hash from selected filters and tabs
function buildAHashTag() {

    var hashArr = [], hash = '', map = {
        event_type: 'eventtypename',
        product: 'byproduct',
        solution: 'bysolution',
        productline: 'byproductline',
        brand: 'bybrand',
        language: 'bylang'
    };

    var eventtypename = $('#event_type').multipleSelect('getSelects');

    if (eventtypename.length == 1 || eventtypename.length == 3) {
        if ( eventtypename.length == 1 ){
            var id = '',
                txt = $('#event_type').multipleSelect('getSelects', 'text'),
                txt = new String(txt).toLowerCase().replace(/[\s\W]/g, ''),
                val = $('#event_type').multipleSelect('getSelects');

            if (val != '' && val != '-1' && val != null) {
                hashArr.push(id + txt);
            }
        } else {
            var id = '',
                txt = '',
                val = $('#event_type').multipleSelect('getSelects');

            if (val != '' && val != '-1' && val != null) {
                hashArr.push(id + txt);
            }
        }

        var id = 'byproduct',
            txt = $('#product').multipleSelect('getSelects', 'text'),
            txt = new String(txt).toLowerCase().replace(/[\s\W]/g, ''),
            val = $('#product').multipleSelect('getSelects');

        if (val != '' && val != '-1' && val != null) {
            hashArr.push(id + txt);
        }

        var id = 'bysolution',
            txt = $('#solution').multipleSelect('getSelects', 'text'),
            txt = new String(txt).toLowerCase().replace(/[\s\W]/g, ''),
            val = $('#solution').multipleSelect('getSelects');

        if (val != '' && val != '-1' && val != null) {
            hashArr.push(id + txt);
        }

        // backward compatibility
        var id = 'bybrand',
            txt = $('#brand').multipleSelect('getSelects', 'text'),
            txt = new String(txt).toLowerCase().replace(/[\s\W]/g, ''),
            val = $('#brand').multipleSelect('getSelects');

        if (val != '' && val != '-1' && val != null) {
            hashArr.push(id + txt);
        }

        var id = 'bylang',
            txt = $('#language').multipleSelect('getSelects', 'text'),
            txt = new String(txt).toLowerCase().replace(/[\s\W]/g, ''),
            val = $('#language').multipleSelect('getSelects');

        if (val != '' && val != '-1' && val != null) {
            hashArr.push(id + txt);
        }

        hash = '';
        var cnt = 0;
        hashArr.forEach( function(){
            if (cnt == 0){
                hash = hash +  hashArr[cnt].toString();
            } else {
                hash = hash + '_' +  hashArr[cnt].toString();
            }
            cnt++;
        });

        console.log('location.hash ' + location.hash);

        // If hash is the same as the current hash, trigger hashchange.
        if ('#' + hash == location.hash) {
            parseHashTag();
        }
        else {
            location.hash = hash;
        }
    } else {
        location.hash = '';
    }


}

function getLanguageCode(){
    if (typeof RootPath == 'string') {
        switch (RootPath) {
            case '/br-pt/':
                initlangval = 139;
                break;
            case '/mx-es/':
                initlangval = 156;
                break;
            case '/cn-zh/':
                initlangval = 202;
                break;
            case '/jp-ja/':
                initlangval = 109;
                break;
            case '/fr-fr/':
                initlangval = 75;
                break;
            case '/de-de/':
                initlangval = 86;
                break;
            default:
                initlangval = 53;
                break;
        }

        if (location.host == 'stage-software-dell-com') {
            switch (RootPath) {
                case '/br-pt/':
                    initlangval = 139;
                    break;
                case '/mx-es/':
                    initlangval = 156;
                    break;
                case '/cn-zh/':
                    initlangval = 202;
                    break;
                case '/jp-ja/':
                    initlangval = 109;
                    break;
                case '/fr-fr/':
                    initlangval = 75;
                    break;
                case '/de-de/':
                    initlangval = 86;
                    break;
                default:
                    initlangval = 53;
                    break;
            }
        }
    }

    return initlangval;
}
