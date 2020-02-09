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
	'use strict';
	// image host url location
	var imgHost = 'assets/img/silkroad/minimap/';
	// map handler
	var map;
	// mapping
	var mappingLayers = {};
	var mappingMarkers = {
		'npc':{},
		'tp':{},
		'player':{}
	};
	var lastMarkerSelected;
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
		// map base
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
			attribution: '<a href="#">World Map</a>'
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
		var jobPath = imgHost+'d/{z}/rn_sd_egypt1_01_{x}x{y}.jpg';
		mappingLayers['32784'] = new SRLayer(jobPath,{
			attribution: '<a href="#">Temple</a>'
		});
		mappingLayers['32783'] = new SRLayer(imgHost+'d/{z}/rn_sd_egypt1_02_{x}x{y}.jpg', {
			attribution: '<a href="#">Sanctum of Seth</a>'
		});
		mappingLayers['32782'] = new SRLayer(jobPath,{
			attribution: '<a href="#">Sanctum of Haroeris</a>'
		});
		mappingLayers['32781'] = new SRLayer(jobPath,{
			attribution: '<a href="#">Sanctum of Isis</a>'
		});
		mappingLayers['32780'] = new SRLayer(jobPath,{
			attribution: '<a href="#">Sanctum of Anubis</a>'
		});
		mappingLayers['32779'] = new SRLayer(jobPath,{
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
			var content = '[<b> X:'+coord.x+" , Y:"+coord.y+" , Z:"+coord.z+" , Region: "+coord.region+' </b>]';
			if(coord.region <= 32767)
				content = "(<b> PosX:"+coord.posX+" , PosY:"+coord.posY+" </b>)<br>"+content;
			// Show popup
			L.popup().setLatLng(e.latlng).setContent('<a class="leaflet-popup-copy-button" title="Copy Link" href="#" onClick="xSROMap.LinkToClipboard('+coord.x+','+coord.y+','+coord.z+','+coord.region+')"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 576" style="vertical-align:middle"><path d="M320 448v40c0 13.255-10.745 24-24 24H24c-13.255 0-24-10.745-24-24V120c0-13.255 10.745-24 24-24h72v296c0 30.879 25.121 56 56 56h168zm0-344V0H152c-13.255 0-24 10.745-24 24v368c0 13.255 10.745 24 24 24h272c13.255 0 24-10.745 24-24V128H344c-13.2 0-24-10.8-24-24zm120.971-31.029L375.029 7.029A24 24 0 0 0 358.059 0H352v96h96v-6.059a24 24 0 0 0-7.029-16.97z"/></svg></a>'+content).openOn(map);
		});
	};
	var initOnLoad = function(coord) {
		// Reading GET inputs
		var findGetParameter = function(parameter) {
			var tmp = [];
			var items = location.search.substr(1).split("&");
			for (var i = 0; i < items.length; i++) {
				tmp = items[i].split("=");
				if (tmp[0] === parameter)
					return decodeURIComponent(tmp[1]);
			}
			return null;
		};
		// Reading coords type
		var x = findGetParameter("x");
		var y = findGetParameter("y");
		if(x && y){
			var z = findGetParameter("z");
			var r = findGetParameter("region");
			// Try to search inmediatly
			if(z && r)
				setView(fixCoords(x,y,z,r));
			else
				setView(fixCoords(x,y,0,0));
		}
		else
		{
			// parameters not found, set initial view
			setView(coord);
		}
	};
	// Set the map layer
	var setMapLayer = function (tileLayer){
		// Do nothing
		if(tileLayer == null) return;
		// Different from current layer?
		if(mapLayer != tileLayer)
		{
			// Clear map
			map.eachLayer(function(layer){
				map.removeLayer(layer);
			});
			// Set the new layer
			mapLayer = tileLayer;
			map.addLayer(mapLayer);

			// init highlight
			lastMarkerSelected = null;
			// Add markers from the new layer
			for (var type in mappingMarkers){
				for (var id in mappingMarkers[type]){
					var marker = mappingMarkers[type][id];
					if(marker.options.xMap.layer == mapLayer){
						marker.addTo(map);
					}
				}
			}
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
						if (coord.z < layers[i].options.posZ)
							break;
						layer = layers[i];
					}
				}
				else
				{
					layer.options['posZ'] = 0;
				}
				// add/override layer region
				layer.options['region'] = coord.region;
			}
			return layer;
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
		if(region < 0)
			region += 65536;
		// Check coord type
		if(region == 0){
			// using x,y as game coords
			return CoordsGameToSRO({'posX':x,'posY':y});
		}
		// using x,y,z,region internal silkroad coords
		return {'x':x,'y':y,'z':z,'region':region};
	};
	var toClipboard = function(text){
		var e = document.createElement('textarea');
		e.value = text;
		document.body.appendChild(e);
		e.select();
		document.execCommand('copy');
		document.body.removeChild(e);
	};
	return{
		// Initialize silkroad world map
		init:function(id,x=114,y=47.25,z=0,region=0){
			// init stuffs
			initLayers(id);
			initControls();
			window.onload = initOnLoad(fixCoords(x,y,z,region));
		},
		SetView:function(x,y,z=0,region=0){
			// Remove highlight if exists
			if(lastMarkerSelected){
				L.DomUtil.removeClass(lastMarkerSelected._icon, 'leaflet-marker-selected');
				lastMarkerSelected = null;
			}
			// view
			setView(fixCoords(x,y,z,region));
		},
		FlyView:function(x,y,z=0,region=0){
			// Remove highlight if exists
			if(lastMarkerSelected){
				L.DomUtil.removeClass(lastMarkerSelected._icon, 'leaflet-marker-selected');
				lastMarkerSelected = null;
			}
			// view
			flyView(fixCoords(x,y,z,region));
		},
		AddNPC(id,html,x,y,z=0,region=0){
			// Add only new ones
			if(!mappingMarkers['npc'][id]){
				var coord = fixCoords(x,y,z,region);
				// create dimensions
				var iconNPC = new L.Icon({
					iconUrl: imgHost+'icon/mm_sign_npc.png',
					iconSize:	[6,6], // (w,h)
					iconAnchor:	[3,3], // (w/2,h/2)
					popupAnchor:[0,-3] // (0,-h/2)
				});
				// create marker virtualized
				var marker = L.marker(CoordSROToMap(coord),{icon:iconNPC,pmIgnore:true,virtual:true}).bindPopup(html);
				// Check if is from the current layer
				var layer = getLayer(coord);
				if(layer == mapLayer)
					marker.addTo(map);
				marker.options['xMap'] = {"layer":layer,'coordinates':coord};
				// keep register to not get lost on changing layers
				mappingMarkers['npc'][id] = marker;
			}
		},
		GoToNPC(id){
			var marker = mappingMarkers['npc'][id];
			// check if exists and has a valid layer
			if(marker && marker.options.xMap.layer){
				setView(marker.options.xMap.coordinates);
				// Add/remove highlight
				if(lastMarkerSelected)
				{
					// reset
					lastMarkerSelected._icon.style.zIndex =  lastMarkerSelected._icon._leaflet_pos.y;
					L.DomUtil.removeClass(lastMarkerSelected._icon, 'leaflet-marker-selected');
				}
				lastMarkerSelected = marker;
				marker._icon.style.zIndex = Object.keys(mappingMarkers['npc']).length;
				L.DomUtil.addClass(marker._icon, 'leaflet-marker-selected');
			}
		},
		AddTeleport(html,type,x,y,z=0,region=0){
			var coord = fixCoords(x,y,z,region);
			// create icon
			var iconNPC;
			switch(type){
				case 1: // fortress 
					iconNPC = new L.Icon({ iconUrl: imgHost+'icon/fort_worldmap.png', iconSize: [23,45], iconAnchor: [12,17], popupAnchor:[0,-17] });
					break;
				case 2: // gate of ress
					iconNPC = new L.Icon({ iconUrl: imgHost+'icon/strut_revival_gate.png', iconSize: [24,24], iconAnchor: [12,12], popupAnchor:[0,-12] });
					break;
				case 3: // gate of glory
					iconNPC = new L.Icon({ iconUrl: imgHost+'icon/strut_glory_gate.png', iconSize: [24,24], iconAnchor: [12,12], popupAnchor:[0,-12] });
					break;
				case 4: // fortress small
					iconNPC = new L.Icon({ iconUrl: imgHost+'icon/fort_small_worldmap.png', iconSize: [20,31], iconAnchor: [10,15], popupAnchor:[0,-15] });
					break;
				case 5: // ground teleport
					iconNPC = new L.Icon({ iconUrl: imgHost+'icon/map_world_icontel.png', iconSize: [22,23], iconAnchor: [11,12], popupAnchor:[0,-12] });
					break;
				case 6: // tahomet
					iconNPC = new L.Icon({ iconUrl: imgHost+'icon/tahomet_gate.png', iconSize: [26,28], iconAnchor: [13,14], popupAnchor:[0,-14] });
					break;
				case 0: // gate
				default:
					iconNPC = new L.Icon({ iconUrl: imgHost+'icon/xy_gate.png', iconSize: [24,24], iconAnchor: [12,12], popupAnchor:[0,-12] });
					break;
			}
			// create marker virtualized
			var marker = L.marker(CoordSROToMap(coord),{icon:iconNPC,pmIgnore:true,virtual:true}).bindPopup(html);
			// Check if is from the current layer
			var layer = getLayer(coord);
			if(layer == mapLayer)
				marker.addTo(map);
			marker.options['xMap'] = {"layer":layer,'coordinates':coord};
			// keep register to not get lost on changing layers
			var id = Object.keys(mappingMarkers['tp']).length;
			mappingMarkers['tp'][id] = marker;
		},
		AddPlayer(id,html,x,y,z=0,region=0){
			// Add only new ones
			if(!mappingMarkers['player'][id]){
				var coord = fixCoords(x,y,z,region);
				// create dimensions
				var iconNPC = new L.Icon({
					iconUrl: imgHost+'icon/mm_sign_otherplayer.png',
					iconSize:	[6,6],
					iconAnchor:	[3,3],
					popupAnchor:[0,-3]
				});
				// create marker virtualized
				var marker = L.marker(CoordSROToMap(coord),{icon:iconNPC,pmIgnore:true,virtual:true}).bindPopup(html);
				// Check if is from the current layer
				var layer = getLayer(coord);
				if(layer == mapLayer)
					marker.addTo(map);
				marker.options['xMap'] = {"layer":layer,'coordinates':coord};
				// keep register to not get lost on changing layers
				mappingMarkers['player'][id] = marker;
			}
		},
		MovePlayer(id,x,y,z=0,region=0){
			var marker = mappingMarkers['player'][id];
			// check if exists and has a valid layer
			if(marker && marker.options.xMap.layer){
				// ...
			}
		},
		RemovePlayer(id){
			// ...
		},
		LinkToClipboard(x,y,z=0,region=0){
			var coord = fixCoords(x,y,z,region);
			toClipboard(window.location.href.split(/\?|#/)[0]+'?x='+coord.x+'&y='+coord.y+'&z='+coord.z+'&region='+coord.region);
		}
	};
}();