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
$('input[type="text"]').keyup(function()
{
	var searchText = $(this).val().toLowerCase();
	var navCategories = $("#navigation li.sidebar-dropdown");
	navCategories.each(function(index){

		var category = $(this);
		var showCounter = 0;

		console.log(navCategories[index]);

		var items = category.find(".sidebar-submenu>ul>li");
		$(items).each(function(index){
			if($(this).text().toLowerCase().indexOf(searchText) > -1){
				$(this).show();
				showCounter++;
			}
			else
			{
				$(this).hide();
			}
		});

		if(showCounter > 0){ $(this).show(); }
		else{ $(this).hide(); }
		
		console.log("- - - - "+showCounter);



		//console.log($(allListItems[index]));

		//$(allListItems[index]).parent().hide();
		// var filteredItems = allListItems.filter(function(index) {
		// 	console.log($(this).text());
		// 	return $(this).text().indexOf(searchText) > -1;
		// });
		// console.log($(this).val());
		// if(filteredItems.len() == 0){

		// 	$(this).hide();
		// }
		// allListItems.hide();
		// filteredItems.show();
	});	
});

// Initialize map
xSROMap.init('map');