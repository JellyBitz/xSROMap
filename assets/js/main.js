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


$("#close-sidebar").click(function() {
	$(".page-wrapper").removeClass("toggled");
});
$("#show-sidebar").click(function() {
	$(".page-wrapper").addClass("toggled");
});

xSROMap.init('map');