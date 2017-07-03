# Creating a NavMesh in Tiled

[Tiled](http://www.mapeditor.org/) is an open source tile map editor. If you are already using it to design your levels, then you can also use it to create your nav meshes.

Tiled allows you to design a map by creating [layers](http://doc.mapeditor.org/manual/layers/) of tiles & objects. A tile layer allows you to place your graphics (images from a tileset) into the world. An object layer allows you to store other kinds of information. Phaser can read both tile layers and object layers, so we can use the object layer to represent a nav mesh. In the image below, there is a layer of tiles (called "walls") and a layer of gray rectangles that represents the nav mesh (called "navmesh"):

<img src="./doc-source/tiled-guide/tiled-final.png">

This guide assumes you have some familiarity with Tiled. If you don't know Tiled, check out gamefromscratch's video [tutorial series](http://www.gamefromscratch.com/post/2015/10/14/Tiled-Map-Editor-Tutorial-Series.aspx).

## Goal

The idea is that we want to create an object layer in Tiled that represents where an "agent" (the player, an enemy, an npc, etc.) can move. We will describe those walkable area by placing individual shapes (mainly rectangles). An agent can then "walk" from one shape to another as long as they are connected (i.e. their edges overlap).

Note: We will also want to take the agent's size into account when building the shapes. If you have an agent that is 20px wide, then it shouldn't be allowed to get within 10px of a wall.

## Snapping Setup

In order to place shapes in the nav mesh accurately and ensure that neighboring shapes are "connected," you'll want to enable snapping. Open up your map or create a new one, and go to preferences (`Edit ⟶ Preferences`):

<img src="./doc-source/tiled-guide/tiled-preferences.png">

Set the fine grid divisions. This allows you to snap objects "in-between" the grid. E.g. on a 25px x 25px tile map with 5 grid divisions, the fine grid would be every 5px.

<img src="./doc-source/tiled-guide/tiled-preferences-2.png">

Enable snapping (`View ⟶ Snapping`):

<img src="./doc-source/tiled-guide/tiled-snapping.png">

## Creating the Mesh

Create a new object layer and name it "navmesh." Then start adding in rectangles to define your nav mesh. (Note: rectangles are the only Tiled shape currently supported by this plugin.)

<img src="./doc-source/tiled-guide/tiled-navmesh-layer.gif">

See the Tiled manual for more information on [objects](http://doc.mapeditor.org/manual/objects/#working-with-objects).

## Agent Size (Gaps)

Notice the 10px space left around the walls? That gap is because the agent is 20px wide circle. It would get stuck on corners of walls without that gap. Make sure the gaps you leave are a consistent size - you'll need to pass in the size as the third parameter to `navMeshPlugin.buildMeshFromTiled`.

If you wanted, you _could_ leave that gap out and write more complicated path following logic for your agents that avoids getting stuck. "Baking" the agent size into nav mesh with these gaps makes the path following logic pretty simple.