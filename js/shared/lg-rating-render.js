//_________________ RATING RENDER _____________________
//TODO: version load for template
var RatingRender = (function(){
    var _RANK = 'rank', _NAME = 'username';
    var _click = ' rating-table-clickcol ',_grey = ' rating-table-greycol ', _userid = 'data-rating-userid';
    var _imgarrows = ['/img/icons/sort-asc.png','/img/icons/sort-both.png','/img/icons/sort-desc.png'];
    var _online= 'class="rplayer-online"', _active='class="rplayer-active"';
    var _novice = '<span style="color: #C42E21 !important;">новичок</span>';
    var columns = [], tabs = [], subTabs = [], currentTab, currentSubTab, orderedColumn;
    var max = 500, offset = 0;
    var infoUser = null;
    var div = null, oldSearch = '';

    var functions={
        onColumnClick:null, onClose:null, onFilter:null, onTabClicked:null, onUserClick:null,onShowMore:null, autocomplete:null
    };

    function setColumns(cols){
        if (!cols || !cols.length){
            throw new Error('No columns to set!');
        }
        columns = [];
        for (var i = 0; i < cols.length; i++){
            columns.push(new Column(cols[i]));
        }
        infoUser = null;
    }

    function setTabs(newtabs){
        if (!newtabs || !newtabs.length){
            throw new Error('No tabs to set!');
        }
        tabs = newtabs;
        tabs[0].active = true;
        currentTab = tabs[0].id;
    }

    function setSubTabs(newsabtabs){
        if (!newsabtabs || !newsabtabs.length){
            throw new Error('No tabs to set!');
        }
        subTabs = newsabtabs;
        subTabs[0].active = true;
        currentSubTab = subTabs[0].id;
    }

    function render(data){
        var table='', head='', body='', showMoreButton='', stabs='';

        if (isDef(data.tabs) && data.tabs) setColumns(data.tabs);
        if (isDef(data.columns) && data.columns) setColumns(data.columns);
        if (isDef(data.sort) && data.sort) setColumnOrder(getColumn(data.sort.column),data.sort.order);

        stabs = renderTabs();
        stabs +=renderSubTabs();

        head = renderHeaders();
        if (isDef(data.infoUser) && !!data.infoUser) infoUser = data.infoUser;
        if (infoUser) head += renderUserRow(infoUser);

        if (isDef(data.infoAllUsers) && !!data.infoAllUsers) body = renderTBody(data.infoAllUsers);
        table = Template.get("rating/table.html",{ head:head, body:body});

        if (data.infoAllUsers && data.infoAllUsers.length>=max)
            showMoreButton = Template.get("rating/div_show_more.html",{count:max});

        return Template.get("rating/div_main.html",{data:table+showMoreButton, tabs:stabs});
    }

    function append(data){
        unbindEvents();
        if (isDef(data.infoAllUsers) && !!data.infoAllUsers)
            $('.rating-table > tbody:last').append(renderTBody(data.infoAllUsers));
        if (data.infoAllUsers && data.infoAllUsers.length>=max)
            $('#ratingShowMore').show();
        else $('#ratingShowMore').hide();
        bindEvents();
    }

    function renderTabs(){
        var stabs = '', i;
        for (i = 0; i<tabs.length; i++){
            stabs+= Template.get("rating/tab.html",{
                id:'tab_'+tabs[i].id,
                tabid:tabs[i].id,
                title:tabs[i].title,
                cclass:(tabs[i].active?'rating_link_active':'rating_link_unactive')
            });
        }
        return stabs;
    }

    function renderSubTabs(){
        if (subTabs.length == 0) return '';
        var stabs = '<br>', i;
        for (i = 0; i<subTabs.length; i++){
            stabs+= Template.get("rating/tab.html",{
                id:'stab_'+subTabs[i].id,
                tabid:subTabs[i].id,
                title:subTabs[i].title,
                cclass:(subTabs[i].active?'rating_link_active':'rating_link_unactive')
            });
        }
        return stabs;
    }

    function renderHeaders(){
        var tophead='', midhead='', i, col;
        for(i = 0; i<columns.length; i++){
            col = columns[i];
            // заголовки
            tophead+=Template.get(col.isSorted()?"rating/th_sort.html":"rating/th.html",{ title:'', data:col.title, id:null });
            // кнопки сортировок под заголовками и поле поиска
            if (col.id==_RANK) midhead += Template.get("rating/th_rate.html",{});
            else if (col.id==_NAME) midhead += Template.get("rating/th_name.html",{value:oldSearch});
            else {
                midhead += Template.get(col.isSorted()?"rating/th_sort.html":"rating/th.html",
                    {   title:col.toptitle, id:col.id,
                        data:col.order!=null?('<img src="'+_imgarrows[col.order+1]+'">'):''
                    });
            }
        }
        tophead =  Template.get("rating/tr_head.html",{ height:40, data:tophead });
        midhead =  Template.get("rating/tr_head.html",{ height:30, data:midhead });
        return tophead + midhead;
    }

    function renderUserRow(infoUser){
        if (typeof functions.onEach == "function") functions.onEach(infoUser);
        var userrow='', i, col;
        for(i = 0; i<columns.length; i++){
            col = columns[i];
            if (col.id==_RANK) userrow += Template.get("rating/td_user_rate.html?v=1");
            else if (col.id==_NAME) userrow += Template.get("rating/td_user_name.html?v=1",infoUser);
            else {
                userrow += renderColumn(infoUser, col);
            }
        }

        return Template.get("rating/tr_user.html?v=1",{ userid:infoUser.userid, username:'', rank:'', data:userrow});
    }

    function renderColumn(data, column){
        var cclass='', style='',val;
        if (column.isSorted()) orderedColumn = column;
        switch (column.id){

            case _RANK:
                return Template.get("rating/td.html?v=1",{id:column.id,cclass:'',style:'',title:'',other:'', data:data.rank});
                break;
            case _NAME:
                data.username = data.username.substr(0,20);
                var photo = '';
                if (isDef(data.photo) && !!data.photo){
                    if (data.photo.substring(0,4) != "http") data.photo = '/gw/profile/image.php?user_id=' + data.userid;
                    photo =  Template.get("rating/div_phot.html", data);
                }
                return Template.get("rating/td.html?v=1",{id:column.id,cclass:'',style:'',title:'', other:_userid+'="'+data.userid+'"',
                    data:Template.get("rating/div_name.html?v=1", data)+photo
                });
                break;
            default :
                val = data[column.id];
                if (column.isDate){
                    if (typeof val == "string") val = Date.parse(val.substr(0,10));
                    if (new Date() - val<172800000) val = _novice;
                    else val = formatDate(val/1000);
                }
                cclass = (column.isClicked()?_click:'')+(column.isGrey?_grey:'');
                if (column.sup && isDef(data[column.id+'_sup']))
                    val = Template.get("rating/div_sup.html",{data:val, data_sup:(data[column.id+'_sup']?'+'+data[column.id+'_sup']:'')});

                return Template.get("rating/td.html?v=1",{
                    id:column.id,
                    cclass:(cclass!=''?'class = "'+cclass+'"':''),
                    style:(style?'style = "'+style+'"':''),
                    title:(column.tooltip&&isDef(data[column.id+'_tooltip'])?'title="'+data[column.id+'_tooltip']+'"':''),
                    other:'',
                    data:val
                });

        }
    }

    function renderTBody(data){
        var body='';
        for (var i = 0; i<data.length && i<max; i++){
            if (!!data[i])body += renderRow(data[i]);
        }
        return body;
    }

    function renderRow(row){
        if (typeof functions.onEach == "function") functions.onEach(row, {sort:getSort(), filter:getFilter(), tabid:currentTab, subtabid:currentSubTab, limit:getLimit()});
        var srow='', i;
        for (i = 0; i<columns.length; i++){
            srow+=renderColumn(row,columns[i]);
        }
        return Template.get("rating/tr.html",{cclass:(row.online&&row.online!="0")?(row.active!="0"?_active:_online):'',style:'',title:'',other:'', data:srow, userid:row.userid});
    }

    function bindEvents(){
        var col, i;
        $('#rating_close_icon').click(close);
        $('#rating_close_btn').click(close);
        $('#jump-top').click(scrollUp);
        $('#ratingShowMore').click(showMoreClicked);

        $('.rating-profile').click(userClicked);

        for (i = 0; i<columns.length; i++){
            col = columns[i];
            if(col.order!=null){
                $('#'+col.id).click(columnClicked);
            }
            if (col.isClicked()){
                $('.rating-table-clickcol').click(cellClicked)
            }
        }

        for (i = 0; i<tabs.length; i++){
            $('#tab_'+tabs[i].id).click(tabClicked)
        }
        for (i = 0; i<subTabs.length; i++){
            $('#stab_'+subTabs[i].id).click(subTabClicked)
        }

        $("#rating-autocomplete").keydown(function (event) {
            if (event.which == 13) {
                filter(this.value);
                event.preventDefault();
            }
        });

        if (functions.autocomplete){
            $('#rating-autocomplete').autocomplete({ source : functions.autocomplete });
        }
    }

    function columnClicked(e){
        var col = getColumn(e.currentTarget.id);
        if (!col) throw new Error('No column with id: '+ e.currentTarget.id);
        setColumnOrder(col,col.nextSort());
        offset = 0;
        if (typeof functions.onColumnClick == "function")
            functions.onColumnClick({
                sort:getSort(), filter:getFilter(), tabid:currentTab, subtabid:currentSubTab, limit:getLimit(), column:col
            });
    }

    function cellClicked(e){
        console.log(e.currentTarget);
        var id = e.currentTarget.getAttribute('idcol');
        var col = getColumn(id);
        var userid = e.currentTarget.parentNode.getAttribute('userid');
        col.click({userid:userid, columnid:id, tabid:currentTab, subtabid:currentSubTab, filter:getFilter(), column:col});
    }

    function showMoreClicked(e){
        offset+=max;
        if (typeof functions.onShowMore == "function")
            functions.onShowMore({
                sort:getSort(), filter:getFilter(), tabid:currentTab, subtabid:currentSubTab, limit:getLimit()
            });
    }

    function getFilter(){
        oldSearch = $('#rating-autocomplete').val()||"";
        return oldSearch.trim();
    }

    function getSort(){
        if (!orderedColumn || !orderedColumn.isSorted()) return null;
        var sort={};
        sort[orderedColumn.id] = orderedColumn.order<0?'DESC':'ASC';
        return sort;
    }

    function getLimit() {
        return {offset:offset, limit:max};
    }

    function tabClicked(e){
        var id = e.currentTarget.getAttribute('tabid'), tab;
        if (id=="admin") window.location = "/admin";
        for (var i = 0; i < tabs.length; i++)
            if (tabs[i].id == id){
                tab = tabs[i];
                tab.active = true;
                $('#tab_'+tab.id).removeClass('rating_link_unactive').addClass('rating_link_active');
                currentTab = tab.id;
            } else {
                tabs[i].active = false;
                $('#tab_'+tabs[i].id).removeClass('rating_link_active').addClass('rating_link_unactive');
            }
        offset = 0;
        if (typeof functions.onTabClicked == "function")
            functions.onTabClicked({
                sort:getSort(), filter:getFilter(), tabid:currentTab, subtabid:currentSubTab, limit:getLimit()
            });
    }

    function subTabClicked(e){
        var id = e.currentTarget.getAttribute('tabid'), tab;
        for (var i = 0; i < subTabs.length; i++)
            if (subTabs[i].id == id){
                tab = subTabs[i];
                tab.active = true;
                $('#stab_'+tab.id).removeClass('rating_link_unactive').addClass('rating_link_active');
                currentSubTab = tab.id;
            } else {
                subTabs[i].active = false;
                $('#stab_'+subTabs[i].id).removeClass('rating_link_active').addClass('rating_link_unactive');
            }
        offset = 0;
        if (typeof functions.onTabClicked == "function")
            functions.onTabClicked({
                sort:getSort(), filter:getFilter(), tabid:currentTab, subtabid:currentSubTab, limit:getLimit()
            });
    }

    function userClicked(e){
        var userid = e.currentTarget.getAttribute('userid');
        var username = e.currentTarget.getAttribute('username');
        if (typeof functions.onUserClick == "function")
            functions.onUserClick({userid:userid, username:username, tabid:currentTab, subtabid:currentSubTab});
    }

    function setCurrentSubTab(tabId){
        for (var i = 0; i < subTabs.length; i++)
            if (subTabs[i].id == tabId){
                tab = subTabs[i];
                tab.active = true;
                $('#stab_'+tab.id).removeClass('rating_link_unactive').addClass('rating_link_active');
                currentSubTab = tab.id;
            } else {
                subTabs[i].active = false;
                $('#stab_'+subTabs[i].id).removeClass('rating_link_active').addClass('rating_link_unactive');
            }
    }

    function setColumnOrder(col, order){
        for (var i = 0; i < columns.length; i++){
            if (columns[i] == col){
                col.order = order;
                orderedColumn = col;
            } else if (columns[i].order!=null) columns[i].order = 0;
        }
    }

    function getColumn(id){
        if (columns && columns.length>0){
            for (var i = 0; i < columns.length; i++)
                if (columns[i].id == id){
                    return columns[i];
                }
        }
        return null;
    }

    function filter(value){
        offset = 0;
        if (typeof functions.onFilter == "function")
            functions.onFilter({
                sort:getSort(), filter:getFilter(), tabid:currentTab, subtabid:currentSubTab, limit:getLimit()
            });
    }

    function close(){
        if (typeof functions.onClose == "function") functions.onClose();
    }

    function scrollUp(){
        $("html, body").animate({scrollTop : $(".rating-table").offset().top-50});
    }

    function unbindEvents() {
        var col, i;
        $('#rating_close_icon,#rating_close_btn,#jump-top,.rating-profile,.rating-table-clickcol,#ratingShowMore').unbind('click');

        for (i = 0; i<columns.length; i++){
            $('#'+columns[i].id).unbind('click');
        }

        for (i = 0; i<tabs.length; i++){
            $('#tab_'+tabs[i].id).unbind('click');
        }

        for (i = 0; i<subTabs.length; i++){
            $('#stab_'+subTabs[i].id).unbind('click');
        }

        $("#rating-autocomplete").unbind('keydown');
    }



    function Column(data){
        /* order:
         -1 - desc;
         1 asc;
         0 - can be ordered
         null - can't

         onClick(userId, columnId, currentTabId)
         */
        var that = this;

        this.id = data.id;
        this.title = data.title;
        this.toptitle = isDef(data.toptitle)?data.toptitle:this.title;
        this.order = isDef(data.order)?data.order:null;
        this.sup = isDef(data.sup)?data.sup:false;
        this.tooltip = isDef(data.tooltip)?data.tooltip:false;
        this.click = (isDef(data.onClick) && typeof data.onClick == "function")?data.onClick:null;
        this.isDate = isDef(data.isDate)?data.isDate:false;
        this.isGrey = isDef(data.isGrey)?data.isGrey:false;

        this.isSorted = function(){ return that.order!=null && that.order!==0; };
        this.isClicked = function(){ return !!that.click; };
        this.nextSort = function(){
            if (that.order == null) return null;
            switch (that.order){
                case 0: return 1;
                case 1: return -1;
                case -1: return 1;
            }
            return null;
        }
    }



    // ----------------------------------------------------------------------------

    return {

        setDiv:function(_div){
            if (!_div) return;
            if (typeof _div == "string") div = $('#'+_div);
            else div = _div;
        },

        render: function(data){
            if (!div) return render(data);
            if (!$(div)) throw new Error('no div for table!');
            $(div).html(render(data));
            bindEvents();
            return true;
        },

        append:append,

        bindEvents: function(){
            bindEvents();
        },

        setColumns: setColumns,

        setTabs: setTabs,

        setSubTabs:setSubTabs,

        onColumnClick:function(func){
            if (typeof func == "function"){
                functions.onColumnClick = func;
            }
            return this;
        },

        onTabClicked:function(func){
            if (typeof func == "function"){
                functions.onTabClicked = func;
            }
            return this;
        },

        onUserClick:function(func){
            if (typeof func == "function"){
                functions.onUserClick = func;
            }
            return this;
        },

        onClose:function(func){
            if (typeof func == "function"){
                functions.onClose = func;
            }
            return this;
        },

        onFilter:function(func){
            if (typeof func == "function"){
                functions.onFilter = func;
            }
            return this;
        },
        onEach:function(func){
            if (typeof func == "function"){
                functions.onEach = func;
            }
            return this;
        },
        onShowMore:function(func){
            if (typeof func == "function"){
                functions.onShowMore = func;
            }
            return this;
        },
        autocomplete:function(func){
            if (typeof func == "function"){
                functions.autocomplete = func;
            }
            return this;
        },
        unbind:function(){
            unbindEvents();
            return this;
        },
        setCurrentSubTab:setCurrentSubTab
    }

}());