// Increase performance with too many markers
L.Marker.addInitHook(function(){
	if(this.options.virtual){
		// setup virtualization after marker was added
		this.on('add',function(){
			this._updateIconVisibility = function() {
				if(this._map == null)
					return;
				var map = this._map,
				isVisible = map.getBounds().contains(this.getLatLng()),
				wasVisible = this._wasVisible,
				icon = this._icon,
				iconParent = this._iconParent,
				shadow = this._shadow,
				shadowParent = this._shadowParent;
				// remember parent of icon 
				if (!iconParent) {
					iconParent = this._iconParent = icon.parentNode;
				}
				if (shadow && !shadowParent) {
					shadowParent = this._shadowParent = shadow.parentNode;
				}
				// add/remove from DOM on change
				if (isVisible != wasVisible) {
					if (isVisible) {
						iconParent.appendChild(icon);
						if (shadow) {
							shadowParent.appendChild(shadow);
						}
					}else{
						iconParent.removeChild(icon);
						if (shadow) {
							shadowParent.removeChild(shadow);
						}
					}
					this._wasVisible = isVisible;
				}
			};
			// on map size change, remove/add icon from/to DOM
			this._map.on('resize moveend zoomend', this._updateIconVisibility, this);
			this._updateIconVisibility();
		}, this);
	}
});

// Silkroad map handler
var xSROMap = function(){
	// map handler
	var map;
	// mapping
	var mappingLayers = {};
	var mappingMarkers = {};
	// current tile layer
	var mapLayer;
	var coordBackToPosition;
	// xSRO Map conversions
	var CoordMapToSRO = function(latlng){
		var coords = {}
		// world map layer
		if(mapLayer == mappingLayers[''])
		{
			return CoordsGameToSRO({'posX':(latlng.lng - 135) * 192,'posY':(latlng.lat - 91) * 192});
		}
		// area layer
		coords['x'] = ( latlng.lng * 192 - 128 * 192) * 10;
		coords['y'] = ( latlng.lat * 192 - 127 * 192) * 10;
		coords['z'] = mapLayer.options.posZ;
		coords['region'] = mapLayer.options.region;
		return coords;
	};
	var CoordSROToMap = function(coords) {
		var lng,lat;
		// dungeon?
		if(coords.region > 32767)
		{
			lng = (128 * 192 + coords.x / 10) / 192;
			lat = (127 * 192 + coords.y / 10) / 192;
			return [lat,lng];
		}
		// world coord type
		if(coords.posY && coords.posX)
		{
			lat = ( coords.posY / 192 ) + 91;
			lng = ( coords.posX / 192 ) + 135;
		}
		else
		{
			lng = (coords.region & 0xFF) + coords.x / 1920;
			lat = ( (coords.region >> 8) & 0xFF) + coords.y / 1920 - 1;
		}
		return [lat,lng];
	};
	var CoordsGameToSRO = function(gameCoords) {
		gameCoords['x'] = Math.round(Math.abs(gameCoords.posX) % 192.0 * 10.0);
		if (gameCoords.posX < 0.0)
			gameCoords.x = 1920 - gameCoords.x;
		gameCoords['y'] = Math.round(Math.abs(gameCoords.posY) % 192.0 * 10.0);
		if (gameCoords.posY < 0.0)
			gameCoords.y = 1920 - gameCoords.y;
		gameCoords['z'] = 0;

		var xSector = Math.round((gameCoords.posX - gameCoords.x / 10.0) / 192.0 + 135);
		var ySector = Math.round((gameCoords.posY - gameCoords.y / 10.0) / 192.0 + 92);

		gameCoords['region'] = (ySector << 8) | xSector;
		return gameCoords;
	};
	// initialize layers setup
	var initLayers = function(id){
		// minimap location
		var imgHost = 'assets/img/silkroad/minimap/';

		// silkroad base setup
		map = L.map('map', {
			crs: L.CRS.Simple,
			minZoom:0,maxZoom:8,zoomControl:false
		});
		new L.Control.Zoom({ position: 'topright' }).addTo(map);
		var SRLayer = L.TileLayer.extend({
			getTileUrl: function(tile) {
				tile.y = -tile.y;
				return L.TileLayer.prototype.getTileUrl.call(this, tile);
			}
		});
		// 192 map units x 256 tiles = 49152 game units (coords)
		var mapSize = 49152;
		map.fitBounds([[0,0],[mapSize,mapSize]]);

		// Default layer
		mapLayer = new SRLayer(imgHost+'{z}/{x}x{y}.jpg', {
			attribution: '<a href="http://silkroadonline.net/">World Map</a>'
		});
		mappingLayers[''] = mapLayer;

		map.addLayer(mapLayer);
		map.setView([91,135], 8);

		// Area layers
		// cave donwhang
		mappingLayers['32769'] = new SRLayer(imgHost+'d/{z}/dh_a01_floor01_{x}x{y}.jpg', {
			attribution: '<a href="#">Donwhang Stone Cave [1F]</a>',
			posZ:0,
			overlap:[
				new SRLayer(imgHost+'d/{z}/dh_a01_floor02_{x}x{y}.jpg', {
				attribution: '<a href="#">Donwhang Stone Cave [2F]</a>',
				posZ:115}),
				new SRLayer(imgHost+'d/{z}/dh_a01_floor03_{x}x{y}.jpg', {
				attribution: '<a href="#">Donwhang Stone Cave [3F]</a>',
				posZ:230}),
				new SRLayer(imgHost+'d/{z}/dh_a01_floor04_{x}x{y}.jpg', {
				attribution: '<a href="#">Donwhang Stone Cave [4F]</a>',
				posZ:345})
			]
		});
		// cave jangan
		mappingLayers['32775'] = new SRLayer(imgHost+'d/{z}/qt_a01_floor01_{x}x{y}.jpg', {
			attribution: '<a href="#">Underground Level 1 of Tomb of Qui-Shin [B1]</a>'
		});
		mappingLayers['32774'] = new SRLayer(imgHost+'d/{z}/qt_a01_floor02_{x}x{y}.jpg', {
			attribution: '<a href="#">Underground Level 2 of Tomb of Qui-Shin [B2]</a>'
		});
		mappingLayers['32773'] = new SRLayer(imgHost+'d/{z}/qt_a01_floor03_{x}x{y}.jpg', {
			attribution: '<a href="#">Underground Level 3 of Tomb of Qui-Shin [B3]</a>'
		});
		mappingLayers['32772'] = new SRLayer(imgHost+'d/{z}/qt_a01_floor04_{x}x{y}.jpg', {
			attribution: '<a href="#">Underground Level 4 of Tomb of Qui-Shin [B4]</a>'
		});
		mappingLayers['32771'] = new SRLayer(imgHost+'d/{z}/qt_a01_floor05_{x}x{y}.jpg', {
			attribution: '<a href="#">Underground Level 5 of Tomb of Qui-Shin [B5]</a>'
		});
		mappingLayers['32770'] = new SRLayer(imgHost+'d/{z}/qt_a01_floor06_{x}x{y}.jpg', {
			attribution: '<a href="#">Underground Level 6 of Tomb of Qui-Shin [B6]</a>'
		});
		// job temple
		ptPath = imgHost+'d/{z}/rn_sd_egypt1_01_{x}x{y}.jpg';
		mappingLayers['32784'] = new SRLayer(ptPath,{
			attribution: '<a href="#">Temple</a>'
		});
		mappingLayers['32783'] = new SRLayer(imgHost+'d/{z}/rn_sd_egypt1_02_{x}x{y}.jpg', {
			attribution: '<a href="#">Sanctum of Seth</a>'
		});
		mappingLayers['32782'] = new SRLayer(ptPath,{
			attribution: '<a href="#">Sanctum of Haroeris</a>'
		});
		mappingLayers['32781'] = new SRLayer(ptPath,{
			attribution: '<a href="#">Sanctum of Isis</a>'
		});
		mappingLayers['32780'] = new SRLayer(ptPath,{
			attribution: '<a href="#">Sanctum of Anubis</a>'
		});
		mappingLayers['32779'] = new SRLayer(ptPath,{
			attribution: '<a href="#">Sanctum of Blue Eye</a>'
		});
		// cave generated by fortress war
		mappingLayers['32785'] = new SRLayer(imgHost+'d/{z}/fort_dungeon01_{x}x{y}.jpg', {
			attribution: '<a href="#">Cave of Meditation [1F]</a>'
		});
		// mountain flame
		mappingLayers['32786'] = new SRLayer(imgHost+'d/{z}/flame_dungeon01_{x}x{y}.jpg', {
			attribution: '<a href="#">Flame Mountain</a>'
		});
		// jupiter rooms
		mappingLayers['32787'] = new SRLayer(imgHost+'d/{z}/rn_jupiter_02_{x}x{y}.jpg', {
			attribution: '<a href="#">The Earth\'s Room</a>'
		});
		mappingLayers['32788'] = new SRLayer(imgHost+'d/{z}/rn_jupiter_03_{x}x{y}.jpg', {
			attribution: '<a href="#">Yuno\'s Room</a>'
		});
		mappingLayers['32789'] = new SRLayer(imgHost+'d/{z}/rn_jupiter_04_{x}x{y}.jpg', {
			attribution: '<a href="#">Jupiter\'s Room</a>'
		});
		mappingLayers['32790'] = new SRLayer(imgHost+'d/{z}/rn_jupiter_01_{x}x{y}.jpg', {
			attribution: '<a href="#">Zealots Hideout</a>'
		});
		// 32791 - GM's Room
		// 32792 - Fortress Prison
		// Bahdag room
		mappingLayers['32793'] = new SRLayer(imgHost+'d/{z}/RN_ARABIA_FIELD_02_BOSS_{x}x{y}.jpg', {
			attribution: '<a href="#">Kalia\'s Hideout</a>'
		});
	};
	// initialize UI controls
	var initControls = function(){
		// move back to the last pointer
		L.easyButton({
			states:[{
				icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 576" style="vertical-align:middle"><path fill="#333" d="M444.52 3.52L28.74 195.42c-47.97 22.39-31.98 92.75 19.19 92.75h175.91v175.91c0 51.17 70.36 67.17 92.75 19.19l191.9-415.78c15.99-38.39-25.59-79.97-63.97-63.97z"/></svg>',
				title: 'Get back',
				onClick: function(){
					setView(coordBackToPosition);
				}
			}]
		}).addTo(map);

		// show SRO coordinates on click
		map.on('click', function (e){
			var coord = CoordMapToSRO(e.latlng);
			var content = "[ X:"+coord.x+" , Y:"+coord.y+" , Z:"+coord.z+" , Region: "+coord.region+" ]";
			if(coord.region <= 32767)
				content = "( PosX:"+coord.posX+" , PosY:"+coord.posY+" )<br>"+content;
			// Show popup
			L.popup().setLatLng(e.latlng).setContent(content).openOn(map);
		});
	};
	// Set the map layer
	var setMapLayer = function (tileLayer){
		if(mapLayer != tileLayer)
		{
			// Clear map
			map.eachLayer(function(layer){
				map.removeLayer(layer);
			});
			// Set the new layer
			mapLayer = tileLayer;
			map.addLayer(mapLayer);

			// Add markers from layer
		}
	};
	// Return the layer from the specified silkroad coordinate
	var getLayer = function (coord){
		if(coord.region > 32767)
		{
			var layer = mappingLayers[''+coord.region];
			if(layer)
			{
				// check if has overlap at same region
				if(layer.options.overlap)
				{
					var layers = layer.options.overlap;
					// check the Z position
					for (var i = 0; i < layers.length; i++) {
						if (coord.z < layers[i].options.posZ){
							break;
						}
						layer = layers[i];
					}
				}
				else
				{
					layer.options['posZ'] = 0;
				}
				// add/override layer region
				layer.options['region'] = coord.region;
				return layer;
			}
		}
		return mappingLayers[''];
	};
	// Set the view using a silkroad coord
	var setView = function (coord){
		// track navigation
		coordBackToPosition = coord;
		// update layer
		setMapLayer(getLayer(coord));
		// center view
		map.panTo(CoordSROToMap(coord),8);
	};
	var flyView = function (coord){
		// track navigation
		coordBackToPosition = coord;
		// update layer
		setMapLayer(getLayer(coord));
		// center view
		map.flyTo(CoordSROToMap(coord),8,{duration: 2.5});
	};
	// Fix coordinates, return internal silkroad coords
	var fixCoords = function(x,y,z,region) {
		// Fix negative region
		if(region < 0){
			region += 65536;
		}
		// Check coord type
		if(region == 0){
			// using x,y as game coords
			return CoordsGameToSRO({'posX':x,'posY':y});
		}
		// using x,y,z,region internal silkroad coords
		return {'x':x,'y':y,'z':z,'region':region};
	};
	return{
		// Initialize silkroad world map
		init:function(id,x=114,y=47.25,z=0,region=0){
			// init stuffs
			initLayers(id);
			initControls();
			// set initial view
			setView(fixCoords(x,y,z,region));
		},
		SetView:function(x,y,z=0,region=0){
			setView(fixCoords(x,y,z,region));
		},
		FlyView:function(x,y,z=0,region=0){
			flyView(fixCoords(x,y,z,region));
		},
		AddNPC(uniqueId,html,x,y,z=0,region=0){
			// ...
		},
		AddTeleport(uniqueId,html,x,y,z,region,toX,toY,toZ,toRegion){
			// ...
		}
	};
}();