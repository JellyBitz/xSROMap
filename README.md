# xSROMap
The easy way to explore the [**Silkroad Online**](http://www.joymax.com/silkroad/) world map.

### Features
- Navigate through towns, areas, and other popular locations
- Search filter by locations or NPC's
- Search by coordinates (both supported: PosX,PosY or X,Y,Z,Region)
- Teleport actions with NPC's included
- Show coordinates by click
- Zoom levels
- Script editor (Create, Export, Import working even with bots)
- Works on mobile devices

> Are you looking for a [**DEMO**](http://JellyBitz.github.io/xSROMap)?

---
### Getting Started

**xSROMap.js** library contains the following methods, basic to create fully functional map.

| Method | Return | Description
| :---- | :---: | :--- |
| init(`TagID`) | - | Initialize the silkroad map at the specified html tag with viewpoint at Hotan
| init(`TagID,PosX,PosY`) | - | Overload, with view at **in game** (**IG**) coords
| init(`TagID,X,Y,Z,Region`) | - | Overload, with view at **internal client** (**IC**) coords
| SetZoomLimit(`MinZoom,MaxZoom`) | - | Limit the zoom min. and max. Values [0-9]
| SetView(`PosX,PosY`) | - | Set the view instantly using IG coords
| SetView(`X,Y,Z,Region`) | - | Overload, using IC coords
| FlyView(`PosX,PosY`) | - | Set the view flying using IG coords
| FlyView(`X,Y,Z,Region`) | - | Overload, using IC coords
| AddNPC(`NpcID,HTMLPopup,PosX,PosY`) | - | Add NPC marker
| AddNPC(`NpcID,HTMLPopup,X,Y,Z,Region`) | - | Overload, using IC coords
| GoToNPC(`NpcID`) | `Boolean` | Set the view on NPC and highlight him, return `True` if the ID exists
| AddTeleport(`HTMLPopup,Type,PosX,PosY`) | - | Add Teleport marker, `Type` is a number (0-6) which specify the icon shown
| AddTeleport(`HTMLPopup,Type,X,Y,Z,Region`) | - | Overload, using IC coords
| AddPlayer(`PlayerID,HTMLPopup,PosX,PosY`) | - | Add Player marker
| MovePlayer(`PlayerID,PosX,PosY`) | - | Moves a player by his ID, to the IC coords even through differents areas
| MovePlayer(`PlayerID,X,Y,Z,Region`) | - | Overload, using IC coords
| GoToPlayer(`PlayerID`) | `Boolean` | Set the view on Player and highlight him, return `True` if the ID exists
| RemovePlayer(`PlayerID`) | - | Removes the Player marker

**Note:** The map accepts **GET** parameters, to share shortcut/link locations between users. Both coordinate types are supported and the link will be pointing the current map site.

> The methods and functionalities not mentioned here are focused at user features. Explore the code for more info.

---
### Generating Game Data (Any server)

**1.)** To implement NPC's and Teleports for specific server, you should count with these essential files that can be extracted from **media.pk2** client file:

- **characterdata_all.txt**
- **textdata_equip&skill_all.txt**
- **textdata_object_all.txt**
- **textzonename_all.txt**
- **npcpos.txt**
- **teleportdata.txt**
- **teleportbuilding.txt**
- **teleportlink.txt**

`characterdata_all.txt` is a compilation of multiples files, like:  
`characterdata_100.txt`  
`characterdata_200.txt`  
`characterdata_300.txt`  
`...`

You should join them all into one big file to fill our requirements.  
Please, keep in mind the files needs to be **lowercased** to get it work in the next step.

Recommended to use _**CMD.exe**_ with `copy` command which merge multiple files automagically.
> `copy characterdata*.txt characterdata_all.txt`

**2.)** Go to the following repository at **Repl.it**
> https://repl.it/@JellyBitz/xSROMap-Gen

.. and choose whatever option you think easier:
 
> **1.-** Download **main.exe**  
> **2.-** Locate the program at the folder with all mentioned required files  
> **3.-** Execute the program


> **1.-** Fork the repository  
> **2.-** Upload and replace the required files  
> **3.-** Click at RUN (green) button

**3.)** If everything is right, you'll get new **.js** files, which has a *Copy&Paste* javascript variable.

- **NPCs.js :**  
Contains an object array. The object has as attributes:  
`name` of NPC  
`x, z, y, region` from internal client coords position

- **TP.js :**  
Contains an object array. The object has as attributes:  
`name` of the Gate  
`x, z, y, region` from internal client coords position  
`type` number [0-6] linked to the gate icon  
`teleport` object array to the teleporting areas with `name` of the Area and `x, z, y, region` from the spawn position

- **NPCsLinked.js :**  
Same as **NPCs.js** but the objects also contains the attribute `teleport` explained above

**4.)** Iterate the variable you need and add to the map.
> Check [main.js](https://github.com/JellyBitz/xSROMap/blob/master/assets/js/main.js) for more code references.

### Upcoming
- Show/hide NPC's or Teleports

---
> ### Do you like this project ?  
> ### Support me! [Buy me a coffee <img src="https://twemoji.maxcdn.com/2/72x72/2615.png" width="18" height="18">](https://www.buymeacoffee.com/JellyBitz "Coffee <3")
> 
> ### Made with [<img title="Yes, Code!" src="https://twemoji.maxcdn.com/2/72x72/1f499.png" width="18" height="18">](#) .. Pull if you want! [<img title="I'm JellyBitz" src="https://twemoji.maxcdn.com/2/72x72/1f575.png" width="18" height="18">](#)