/**
 * Copyright (c) 2008-2011 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

/** api: example[wms-tree]
 *  WMS Capabilities Tree
 *  ---------------------
 *  Create a tree loader from WMS capabilities documents.
 */

/**
 *
 * Also src from http://dev.openlayers.org/sandbox/camptocamp/canvas/openlayers/examples/raster-reprojection.html
 *
 */

var tree, mapPanel, legendPanel;

var wgs84 = new OpenLayers.Projection("EPSG:4326");

var layers = {

    // Old time favorite, but this won't render when zoomed way into NM
    blueMarble: new OpenLayers.Layer.WMS("Global Imagery",
          "http://maps.opengeo.org/geowebcache/service/wms", 
          {layers: "bluemarble"},
          {buffer: 0, isBaseLayer: true}
    ),

    // OpenStreetMaps MapNik layer.
    OSM : new OpenLayers.Layer.OSM(),

    EDAC_BASE: new OpenLayers.Layer.ArcGIS93Rest(
        'EDAC NM Base Map',
        'http://edacarc10.unm.edu//ArcGIS/rest/services/NM_MapService/MapServer/export',
         { layers: "0,1,9,16,24" }
    )
};

var bounds = new OpenLayers.Bounds(-12161400,3644500, -11452100, 4466368);

Ext.onReady(function() {

    var root = new Ext.tree.AsyncTreeNode({
        text: 'GeoServer Demo WMS',
        loader: new GeoExt.tree.WMSCapabilitiesLoader({
            // Scraped http://neowms.sci.gsfc.nasa.gov/wms/wms?request=getCapabilities
            //  in order to avoid hounding the NASA server in demo
            // Lock to 1.1.1 so it will talk to us in 4326
            url: '../data/neo_capabilities_1_1_1.xml',
            layerOptions: {
                buffer: 0, 
                ratio: 1,
                opacity: 0.6
            },
            layerParams: {
                'TRANSPARENT': 'TRUE',
                'VERSION' : '1.1.1'
            },
            projection: wgs84,
            // customize the createNode method to add a checkbox to nodes
            createNode: function(attr) {
                attr.checked = attr.leaf ? false : undefined;
                attr.canvasAsync = true;
                return GeoExt.tree.WMSCapabilitiesLoader.prototype.createNode.apply(this, [attr]);
            }
        })
    });

    legendPanel = new GeoExt.LegendPanel({
        defaults: {
          style: 'padding:5px'
        },
        bodyStyle: 'padding:5px',
        width: '200',
        autoscroll: true,
        region: 'south',
        title: 'Dynamic Legend'
    });

    tree = new Ext.tree.TreePanel({
        autoScroll: true,
        root: root,
        region: 'west',
        width: 250,
        listeners: {
            // Add layers to the map when ckecked, remove when unchecked.
            // Note that this does not take care of maintaining the layer
            // order on the map.
            'checkchange': function(node, checked) { 
                if (checked === true) {
                    mapPanel.map.addLayer(node.attributes.layer); 
                } else {
                    mapPanel.map.removeLayer(node.attributes.layer);
                }
            }
        }
    });

    mapPanel = new GeoExt.MapPanel({
        // Accepts GeoExt.data.{LayerStore,GroupingStore} or [OpenLayers.Layer]
        layers: [
          layers.OSM
        ] ,
        region: 'center',
        map: {
          // Borks on them
          projection: new OpenLayers.Projection("EPSG:900913"),  // Explicit
          displayProjection: wgs84,
          units: "m",
          maxExtent: bounds,
          restrictedExtent: bounds
        }
    });

    
    mapPanel.map.addControl (new OpenLayers.Control.MousePosition({
      numDigits: 2
    }));

    new Ext.Viewport({
        layout: "fit",
        hideBorders: true,
        items: {
            layout: "border",
            deferredRender: false,
            items: [mapPanel, tree, {
                region: "east",
                collapsible: true,
                collapseMode: "mini",
                width: 200,
                items: [
                    legendPanel, {
                    contentEl: "desc",
                    bodyStyle: {"padding": "5px"},
                    split: true,
                    title: "Description"
                }]
            }]
        }
    });

});
