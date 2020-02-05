// Initialize map
xSROMap.init('map');

// sidebar dropdown menu lv.1
$(".sidebar-dropdown > a").click(function()
{
	$(".sidebar-submenu").slideUp(200);
	if ( $(this).parent().hasClass("active") )
	{
		$(".sidebar-dropdown").removeClass("active");
		$(this).parent().removeClass("active");
	} 
	else
	{
		$(".sidebar-dropdown").removeClass("active");
		$(this).next(".sidebar-submenu").slideDown(200);
		$(this).parent().addClass("active");
	}
});
// sidebar dropdown menu lv.1
$(".sidebar-submenu-dropdown > a").click(function()
{
	$(".sidebar-submenu-submenu").slideUp(200);
	if ( $(this).parent().hasClass("active") )
	{
		$(".sidebar-submenu-dropdown").removeClass("active");
		$(this).parent().removeClass("active");
	} 
	else
	{
		$(".sidebar-submenu-dropdown").removeClass("active");
		$(this).next(".sidebar-submenu-submenu").slideDown(200);
		$(this).parent().addClass("active");
	}
});
// sidebar toggle
$("#close-sidebar").click(function() {
	$(".page-wrapper").removeClass("toggled");
});
$("#show-sidebar").click(function() {
	$(".page-wrapper").addClass("toggled");
});
// Quick filter
$('#search input[type="text"]').keyup(function()
{
	var searchText = $(this).val();

	// check if value are coordinates type
	if(searchText.split(',').length > 1)
		searchText = "";
	else
		searchText = searchText.toLowerCase();

	// Navigate through every category and all his items
	$("#navigation li.sidebar-dropdown").each(function(index){
		var showCounter = 0;
		$(this).find(".sidebar-submenu>ul>li").each(function(index){
			if($(this).text().toLowerCase().indexOf(searchText) > -1)
			{
				$(this).show();
				showCounter++;
			}
			else
			{
				$(this).hide();
			}
		});

		// hide category if has no match
		if(showCounter > 0)
			$(this).show();
		else
			$(this).hide();
	});	
});
// Coordinate search on click/enter
$('#search .input-group-append').click(function()
{
	var searchCoordinates = $('#search input[type="text"]').val().split(',');
	// check if value are coordinates type
	if(searchCoordinates.length > 1){
		var x = parseFloat(searchCoordinates[0]);
		var y = parseFloat(searchCoordinates[1]);
		// x and y correctly parsed?
		if(x != NaN && y != NaN){
			// check if is a region coordinate
			if(searchCoordinates.length == 4){
				var z = parseFloat(searchCoordinates[2]);
				var region = parseFloat(searchCoordinates[3]);
				if(z != NaN && region != NaN){
					xSROMap.SetView(x,y,z,region);
				}
			}else{
				xSROMap.SetView(x,y);
			}
		}
	}
});
$('#search input[type="text"]').keypress(function(e) {
	if(e.which == 13) {
		$("#search .input-group-append").click();
	}
});